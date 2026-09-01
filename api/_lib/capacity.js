// api/_lib/capacity.js
// Verifica lato server che un ticket non abbia superato il numero massimo
// di partecipanti (ticket.max_participants). Se max_participants è NULL,
// il ticket è considerato illimitato.
//
// Conta le registrazioni "attive" (pending + completed): una registrazione
// pending occupa comunque un posto perché rappresenta un pagamento
// PayPal/Bonifico in corso di verifica.
export async function checkTicketCapacity(supabase, ticket) {
  if (!ticket?.max_participants) {
    return { available: true, sold: null, remaining: null }
  }

  const { data: sold, error } = await supabase.rpc('count_active_registrations', {
    p_ticket_id: ticket.id,
  })

  if (error) {
    // In caso di errore tecnico non blocchiamo la vendita (fail-open),
    // ma logghiamo per poterlo individuare in Vercel → Logs.
    console.error('Errore verifica disponibilità ticket:', error)
    return { available: true, sold: null, remaining: null }
  }

  const soldCount = sold || 0
  const remaining = Math.max(0, ticket.max_participants - soldCount)
  return { available: soldCount < ticket.max_participants, sold: soldCount, remaining }
}
