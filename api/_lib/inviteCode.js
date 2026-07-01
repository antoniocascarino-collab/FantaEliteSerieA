// api/_lib/inviteCode.js
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // esclude 0,O,1,I per leggibilità

function randomSegment(len) {
  let out = ''
  for (let i = 0; i < len; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return out
}

export function generateInviteCode() {
  return `FE-${randomSegment(6)}`
}

// Assegna un codice invito univoco alla registrazione, riprovando in caso di collisione.
// Idempotente: se la registrazione ha già un codice, non lo sovrascrive.
export async function assignInviteCode(supabase, registrationId) {
  const { data: existing } = await supabase
    .from('registrations')
    .select('invite_code')
    .eq('id', registrationId)
    .maybeSingle()

  if (existing?.invite_code) return existing.invite_code

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateInviteCode()
    const { error } = await supabase
      .from('registrations')
      .update({ invite_code: code })
      .eq('id', registrationId)
      .is('invite_code', null)

    if (!error) return code
    if (error.code !== '23505') {
      console.error('Errore assegnazione invite_code:', error)
      return null
    }
    // 23505 = collisione sul codice generato, riprova
  }
  console.error('Impossibile generare un invite_code univoco dopo 5 tentativi')
  return null
}

// Accredita il rimborso di 5€ al proprietario del codice, se non ha ancora raggiunto
// il tetto di 100€ (20 rimborsi). Lo sconto al nuovo iscritto è SEMPRE applicato a monte,
// indipendentemente da questo controllo.
export async function creditReferralReward(supabase, { code, ownerRegistrationId, redeemedRegistrationId }) {
  if (!code || !ownerRegistrationId) return { credited: false, reason: 'no_code' }

  const { count, error: countError } = await supabase
    .from('invite_rewards')
    .select('id', { count: 'exact', head: true })
    .eq('owner_registration_id', ownerRegistrationId)

  if (countError) {
    console.error('Errore conteggio invite_rewards:', countError)
    return { credited: false, reason: 'count_error' }
  }

  if (count >= 20) {
    return { credited: false, reason: 'cap_reached' }
  }

  const { error: insertError } = await supabase
    .from('invite_rewards')
    .insert({
      code,
      owner_registration_id: ownerRegistrationId,
      redeemed_registration_id: redeemedRegistrationId,
      amount: 5.00,
    })

  if (insertError) {
    if (insertError.code === '23505') return { credited: false, reason: 'already_credited' }
    console.error('Errore inserimento invite_rewards:', insertError)
    return { credited: false, reason: 'insert_error' }
  }

  return { credited: true }
}

// Rivalida il codice lato server (mai fidarsi del client) e recupera l'id del proprietario
export async function revalidateInviteCode(supabase, code, email) {
  if (!code) return { valid: false, discount: 0 }
  const { data, error } = await supabase.rpc('validate_invite_code', {
    p_code: code,
    p_email: email || null,
  })
  const result = data && data[0]
  if (error || !result || !result.valid) {
    return { valid: false, discount: 0 }
  }
  return { valid: true, discount: Number(result.discount) || 5 }
}
