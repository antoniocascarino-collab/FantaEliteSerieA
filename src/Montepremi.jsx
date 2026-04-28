import React, { useState, useEffect } from 'react'

/* ─────────────────────────────────────────────
   DATI MONTEPREMI — tutti gli 11 scaglioni
───────────────────────────────────────────── */
const DAILY_PRIZES = {
  100: '€20', 200: '€20', 300: '€30', 400: '€40',
  500: '€50', 750: '€50', 1000: '€100', 2000: '€100',
  3000: '€100', 4000: '€100', 5000: '€100',
}

const TIERS = [
  {
    n: 100,
    top: 'iPhone 17 Pro 256GB',
    topIcon: '📱',
    prizes: [
      { pos: '1°',    icon: '📱', name: 'iPhone 17 Pro 256GB',         cat: 'Smartphone' },
      { pos: '2°',    icon: '📱', name: 'iPhone 17e 256GB',            cat: 'Smartphone' },
      { pos: '3°',    icon: '📱', name: 'Samsung Galaxy S24 FE 256GB', cat: 'Smartphone' },
      { pos: '4°',    icon: '🎮', name: 'Xbox Series X Digital 1TB',   cat: 'Gaming' },
      { pos: '5°',    icon: '🎮', name: 'Nintendo Switch 2',           cat: 'Gaming' },
    ],
    bands: [
      { pos: '6°',       prize: '🛒 Voucher Amazon €300' },
      { pos: '7°',       prize: '🛒 Voucher Amazon €280' },
      { pos: '8°',       prize: '🛒 Voucher Amazon €250' },
      { pos: '9°',       prize: '🛒 Voucher Amazon €225' },
      { pos: '10°',      prize: '🛒 Voucher Amazon €200' },
      { pos: '11° – 20°', prize: '🛒 Voucher Amazon €100' },
    ],
    discounts: [
      { pos: '21° – 40°', label: 'Sconto 10% prossima edizione' },
    ],
  },
  {
    n: 200,
    top: 'Voge SR2 200 ADV',
    topIcon: '🛵',
    prizes: [
      { pos: '1°', icon: '🛵', name: 'Voge SR2 200 ADV',               cat: 'Scooter' },
      { pos: '2°', icon: '📱', name: 'iPhone 17 Pro Max 1TB',          cat: 'Smartphone' },
      { pos: '3°', icon: '📱', name: 'iPhone 17 Pro 256GB',            cat: 'Smartphone' },
      { pos: '4°', icon: '📱', name: 'Samsung Galaxy S24 FE 256GB',   cat: 'Smartphone' },
      { pos: '5°', icon: '🎮', name: 'Xbox Series X Digital 1TB',     cat: 'Gaming' },
    ],
    bands: [
      { pos: '6°',         prize: '🎮 Nintendo Switch 2' },
      { pos: '7°',         prize: '🛒 Voucher Amazon €350' },
      { pos: '8°',         prize: '🛒 Voucher Amazon €300' },
      { pos: '9°',         prize: '🛒 Voucher Amazon €250' },
      { pos: '10°',        prize: '🛒 Voucher Amazon €220' },
      { pos: '11° – 20°',  prize: '🛒 Voucher Amazon €150' },
      { pos: '21° – 30°',  prize: '🛒 Voucher Amazon €120' },
      { pos: '31° – 40°',  prize: '🛒 Voucher Amazon €100' },
    ],
    discounts: [
      { pos: '41° – 60°', label: 'Sconto 15% prossima edizione' },
      { pos: '61° – 80°', label: 'Sconto 10% prossima edizione' },
    ],
  },
  {
    n: 300,
    top: 'Zontes 368D',
    topIcon: '🛵',
    prizes: [
      { pos: '1°', icon: '🛵', name: 'Zontes 368D',                    cat: 'Scooter 370cc' },
      { pos: '2°', icon: '🛵', name: 'Voge SR2 200 ADV',               cat: 'Scooter' },
      { pos: '3°', icon: '📱', name: 'iPhone 17 Pro Max 1TB',          cat: 'Smartphone' },
      { pos: '4°', icon: '📱', name: 'iPhone 17e 256GB',               cat: 'Smartphone' },
      { pos: '5°', icon: '📱', name: 'Samsung Galaxy S24 FE 256GB',   cat: 'Smartphone' },
    ],
    bands: [
      { pos: '6°',         prize: '🎮 PS5 Digital 825GB' },
      { pos: '7°',         prize: '🎮 Xbox Series X Digital 1TB' },
      { pos: '8°',         prize: '🎮 Nintendo Switch 2' },
      { pos: '9°',         prize: '🛒 Voucher Amazon €400' },
      { pos: '10°',        prize: '🛒 Voucher Amazon €340' },
      { pos: '11° – 20°',  prize: '🛒 Voucher Amazon €220' },
      { pos: '21° – 40°',  prize: '🛒 Voucher Amazon €120' },
      { pos: '41° – 60°',  prize: '🛒 Voucher Amazon €100' },
    ],
    discounts: [
      { pos: '61° – 80°',   label: 'Sconto 15% prossima edizione' },
      { pos: '81° – 100°',  label: 'Sconto 10% prossima edizione' },
      { pos: '101° – 120°', label: 'Sconto 5% prossima edizione' },
    ],
  },
  {
    n: 400,
    top: 'Honda SH 350i',
    topIcon: '🛵',
    prizes: [
      { pos: '1°', icon: '🛵', name: 'Honda SH 350i',                  cat: 'Scooter' },
      { pos: '2°', icon: '🛵', name: 'Honda SH 125i Sport',            cat: 'Scooter' },
      { pos: '3°', icon: '🛵', name: 'Voge SR2 200 ADV',               cat: 'Scooter' },
      { pos: '4°', icon: '📱', name: 'iPhone 17 Pro 256GB',            cat: 'Smartphone' },
      { pos: '5°', icon: '📱', name: 'iPhone 17e 256GB',               cat: 'Smartphone' },
    ],
    bands: [
      { pos: '6°',         prize: '📱 Samsung Galaxy S24 FE 256GB' },
      { pos: '7°',         prize: '🎮 PS5 Disco 1TB' },
      { pos: '8°',         prize: '🎮 Xbox Series X Digital 1TB' },
      { pos: '9°',         prize: '🎮 Nintendo Switch 2' },
      { pos: '10°',        prize: '🛒 Voucher Amazon €300' },
      { pos: '11° – 25°',  prize: '🛒 Voucher Amazon €180' },
      { pos: '26° – 40°',  prize: '🛒 Voucher Amazon €150' },
      { pos: '41° – 60°',  prize: '🛒 Voucher Amazon €120' },
      { pos: '61° – 80°',  prize: '🛒 Voucher Amazon €100' },
    ],
    discounts: [
      { pos: '81° – 105°',  label: 'Sconto 15% prossima edizione' },
      { pos: '106° – 130°', label: 'Sconto 10% prossima edizione' },
      { pos: '131° – 160°', label: 'Sconto 5% prossima edizione' },
    ],
  },
  {
    n: 500,
    top: 'Honda ADV 350',
    topIcon: '🛵',
    prizes: [
      { pos: '1°', icon: '🛵', name: 'Honda ADV 350',                  cat: 'Maxi Scooter' },
      { pos: '2°', icon: '🛵', name: 'Zontes 368D',                    cat: 'Scooter 370cc' },
      { pos: '3°', icon: '🛵', name: 'Honda SH 125i Sport',            cat: 'Scooter' },
      { pos: '4°', icon: '📱', name: 'Samsung S26 Ultra 1TB/16GB',    cat: 'Smartphone' },
      { pos: '5°', icon: '📱', name: 'iPhone 17 512GB',                cat: 'Smartphone' },
    ],
    bands: [
      { pos: '6°',          prize: '📱 iPhone 17e 256GB' },
      { pos: '7°',          prize: '📱 Samsung Galaxy S24 FE 256GB' },
      { pos: '8°',          prize: '🎮 PS5 Disco 1TB' },
      { pos: '9°',          prize: '🎮 Xbox Series X Digital 1TB' },
      { pos: '10°',         prize: '🛒 Voucher Amazon €350' },
      { pos: '11° – 40°',   prize: '🛒 Voucher Amazon €160' },
      { pos: '41° – 70°',   prize: '🛒 Voucher Amazon €120' },
      { pos: '71° – 100°',  prize: '🛒 Voucher Amazon €100' },
    ],
    discounts: [
      { pos: '101° – 125°', label: 'Sconto 15% prossima edizione' },
      { pos: '126° – 150°', label: 'Sconto 10% prossima edizione' },
      { pos: '151° – 200°', label: 'Sconto 5% prossima edizione' },
    ],
  },
  {
    n: 750,
    top: 'Kymco AK 550',
    topIcon: '🛵',
    prizes: [
      { pos: '1°', icon: '🛵', name: 'Kymco AK 550',                   cat: 'Maxi Scooter 550cc' },
      { pos: '2°', icon: '🛵', name: 'Honda ADV 350',                  cat: 'Maxi Scooter' },
      { pos: '3°', icon: '🛵', name: 'Zontes 368D',                    cat: 'Scooter 370cc' },
      { pos: '4°', icon: '📱', name: 'Samsung Galaxy Z Fold 7 512GB', cat: 'Smartphone Pieghevole' },
      { pos: '5°', icon: '📱', name: 'iPhone 17 512GB',                cat: 'Smartphone' },
    ],
    bands: [
      { pos: '6°',          prize: '📱 iPhone 17e 256GB' },
      { pos: '7°',          prize: '📱 Samsung Galaxy S24 FE 256GB' },
      { pos: '8°',          prize: '🎮 PS5 Disco 1TB' },
      { pos: '9°',          prize: '🎮 Xbox Series X Digital 1TB' },
      { pos: '10°',         prize: '🛒 Voucher Amazon €350' },
      { pos: '11° – 56°',   prize: '🛒 Voucher Amazon €200' },
      { pos: '57° – 102°',  prize: '🛒 Voucher Amazon €140' },
      { pos: '103° – 150°', prize: '🛒 Voucher Amazon €100' },
    ],
    discounts: [
      { pos: '151° – 200°', label: 'Sconto 15% prossima edizione' },
      { pos: '201° – 250°', label: 'Sconto 10% prossima edizione' },
      { pos: '251° – 300°', label: 'Sconto 5% prossima edizione' },
    ],
  },
  {
    n: 1000,
    top: 'Yamaha T-MAX 560',
    topIcon: '🛵',
    prizes: [
      { pos: '1°', icon: '🛵', name: 'Yamaha T-MAX 560',               cat: 'Maxi Scooter Premium' },
      { pos: '2°', icon: '🛵', name: 'Kymco AK 550',                   cat: 'Maxi Scooter 550cc' },
      { pos: '3°', icon: '🛵', name: 'Honda Forza 350',                cat: 'Scooter' },
      { pos: '4°', icon: '🛵', name: 'Voge SR2 200 ADV',               cat: 'Scooter' },
      { pos: '5°', icon: '📱', name: 'iPhone 17 Pro 256GB',            cat: 'Smartphone' },
    ],
    bands: [
      { pos: '6°',          prize: '📱 iPhone 17 Pro 256GB' },
      { pos: '7°',          prize: '📱 iPhone 17e 256GB' },
      { pos: '8°',          prize: '🎮 PS5 Digital 825GB' },
      { pos: '9°',          prize: '🎮 Nintendo Switch 2' },
      { pos: '10°',         prize: '🛒 Voucher Amazon €350' },
      { pos: '11° – 73°',   prize: '🛒 Voucher Amazon €200' },
      { pos: '74° – 137°',  prize: '🛒 Voucher Amazon €140' },
      { pos: '138° – 200°', prize: '🛒 Voucher Amazon €100' },
    ],
    discounts: [
      { pos: '201° – 266°', label: 'Sconto 15% prossima edizione' },
      { pos: '267° – 332°', label: 'Sconto 10% prossima edizione' },
      { pos: '333° – 400°', label: 'Sconto 5% prossima edizione' },
    ],
  },
  {
    n: 2000,
    top: 'Ford Puma Hybrid 125CV',
    topIcon: '🚗',
    prizes: [
      { pos: '1°', icon: '🚗', name: 'Ford Puma Titanium 1.0 EcoBoost Hybrid 125CV',         cat: 'Automobile' },
      { pos: '2°', icon: '🚗', name: 'Dacia Sandero Stepway Extreme+ 1.0 TCe 100CV GPL',    cat: 'Automobile' },
      { pos: '3°', icon: '🛵', name: 'Yamaha T-MAX 560',               cat: 'Maxi Scooter' },
      { pos: '4°', icon: '🛵', name: 'Honda Forza 350',                cat: 'Scooter' },
      { pos: '5°', icon: '🛵', name: 'Voge SR2 200 ADV',               cat: 'Scooter' },
    ],
    bands: [
      { pos: '6°',           prize: '🛵 Kymco People S 200i' },
      { pos: '7°',           prize: '📱 iPhone 17 Pro Max 1TB' },
      { pos: '8°',           prize: '📱 iPhone 17 Pro 256GB' },
      { pos: '9°',           prize: '🎮 PS5 Digital 825GB' },
      { pos: '10°',          prize: '🛒 Voucher Amazon €350' },
      { pos: '11° – 75°',    prize: '🛒 Voucher Amazon €250' },
      { pos: '76° – 140°',   prize: '🛒 Voucher Amazon €200' },
      { pos: '141° – 205°',  prize: '🛒 Voucher Amazon €170' },
      { pos: '206° – 270°',  prize: '🛒 Voucher Amazon €140' },
      { pos: '271° – 335°',  prize: '🛒 Voucher Amazon €120' },
      { pos: '336° – 400°',  prize: '🛒 Voucher Amazon €100' },
    ],
    discounts: [
      { pos: '401° – 533°',  label: 'Sconto 15% prossima edizione' },
      { pos: '534° – 666°',  label: 'Sconto 10% prossima edizione' },
      { pos: '667° – 800°',  label: 'Sconto 5% prossima edizione' },
    ],
  },
  {
    n: 3000,
    top: 'Audi Q3 Business TFSI',
    topIcon: '🚗',
    prizes: [
      { pos: '1°', icon: '🚗', name: 'Audi Q3 Business TFSI 110kW S tronic',               cat: 'SUV Premium' },
      { pos: '2°', icon: '🚗', name: 'Ford Puma St-Line X 1.0 EcoBoost Hybrid 125CV',     cat: 'Automobile' },
      { pos: '3°', icon: '🚗', name: 'Dacia Sandero Stepway Extreme+ 1.0 TCe 100CV GPL',  cat: 'Automobile' },
      { pos: '4°', icon: '🛵', name: 'Kymco AK 550',                   cat: 'Maxi Scooter' },
      { pos: '5°', icon: '🛵', name: 'Zontes 368D',                    cat: 'Scooter 370cc' },
    ],
    bands: [
      { pos: '6°',           prize: '🛵 Honda SH 125i Sport' },
      { pos: '7°',           prize: '🛵 Voge SR2 200 ADV' },
      { pos: '8°',           prize: '📱 iPhone 17 Pro Max 1TB' },
      { pos: '9°',           prize: '📱 iPhone 17e 256GB' },
      { pos: '10°',          prize: '🎮 Xbox Series X Digital 1TB' },
      { pos: '11° – 108°',   prize: '🛒 Voucher Amazon €250' },
      { pos: '109° – 206°',  prize: '🛒 Voucher Amazon €200' },
      { pos: '207° – 304°',  prize: '🛒 Voucher Amazon €170' },
      { pos: '305° – 402°',  prize: '🛒 Voucher Amazon €140' },
      { pos: '403° – 500°',  prize: '🛒 Voucher Amazon €120' },
      { pos: '501° – 600°',  prize: '🛒 Voucher Amazon €100' },
    ],
    discounts: [
      { pos: '601° – 800°',    label: 'Sconto 15% prossima edizione' },
      { pos: '801° – 1.000°',  label: 'Sconto 10% prossima edizione' },
      { pos: '1.001° – 1.200°', label: 'Sconto 5% prossima edizione' },
    ],
  },
  {
    n: 4000,
    top: 'Alfa Romeo Stelvio 210CV',
    topIcon: '🚗',
    prizes: [
      { pos: '1°', icon: '🚗', name: 'Alfa Romeo Stelvio 2.2 Diesel Q4 154kW (210CV) Auto', cat: 'SUV Sportivo' },
      { pos: '2°', icon: '🚗', name: 'Audi Q3 Business TFSI 110kW S tronic',                cat: 'SUV Premium' },
      { pos: '3°', icon: '🚗', name: 'Ford Puma Titanium 1.0 EcoBoost Hybrid 125CV',        cat: 'Automobile' },
      { pos: '4°', icon: '🛵', name: 'Yamaha T-MAX 560',               cat: 'Maxi Scooter Premium' },
      { pos: '5°', icon: '🛵', name: 'Honda Forza 350',                cat: 'Scooter' },
    ],
    bands: [
      { pos: '6°',           prize: '🛵 Honda SH 350i' },
      { pos: '7°',           prize: '🛵 Honda SH 125i Sport' },
      { pos: '8°',           prize: '🛵 Kymco People S 200i' },
      { pos: '9°',           prize: '📱 iPhone 17 512GB' },
      { pos: '10°',          prize: '🎮 PS5 Digital 825GB' },
      { pos: '11° – 140°',   prize: '🛒 Voucher Amazon €250' },
      { pos: '141° – 272°',  prize: '🛒 Voucher Amazon €200' },
      { pos: '273° – 404°',  prize: '🛒 Voucher Amazon €170' },
      { pos: '405° – 536°',  prize: '🛒 Voucher Amazon €140' },
      { pos: '537° – 668°',  prize: '🛒 Voucher Amazon €120' },
      { pos: '669° – 800°',  prize: '🛒 Voucher Amazon €100' },
    ],
    discounts: [
      { pos: '801° – 1.066°',   label: 'Sconto 15% prossima edizione' },
      { pos: '1.067° – 1.332°', label: 'Sconto 10% prossima edizione' },
      { pos: '1.333° – 1.600°', label: 'Sconto 5% prossima edizione' },
    ],
  },
  {
    n: 5000,
    top: 'Range Rover Evoque',
    topIcon: '🚗',
    prizes: [
      { pos: '1°', icon: '🚗', name: 'Range Rover Evoque Dynamic SE D165 Diesel Mild Hybrid', cat: 'SUV di Lusso' },
      { pos: '2°', icon: '🚗', name: 'Alfa Romeo Stelvio 2.2 Diesel 118kW (160CV) Auto',    cat: 'SUV Sportivo' },
      { pos: '3°', icon: '🚗', name: 'Ford Puma St-Line X 1.0 EcoBoost Hybrid 125CV',       cat: 'Automobile' },
      { pos: '4°', icon: '🛵', name: 'Yamaha T-MAX 560 Tech MAX',       cat: 'Maxi Scooter Premium' },
      { pos: '5°', icon: '🛵', name: 'Honda ADV 350',                   cat: 'Maxi Scooter' },
    ],
    bands: [
      { pos: '6°',           prize: '🛵 Honda Forza 350' },
      { pos: '7°',           prize: '🛵 Zontes 368D' },
      { pos: '8°',           prize: '🛵 Voge SR2 200 ADV' },
      { pos: '9°',           prize: '📱 iPhone 17 Pro 256GB' },
      { pos: '10°',          prize: '🎮 PS5 Pro Digital 2TB' },
      { pos: '11° – 175°',   prize: '🛒 Voucher Amazon €250' },
      { pos: '175° – 340°',  prize: '🛒 Voucher Amazon €200' },
      { pos: '341° – 505°',  prize: '🛒 Voucher Amazon €170' },
      { pos: '506° – 670°',  prize: '🛒 Voucher Amazon €140' },
      { pos: '671° – 835°',  prize: '🛒 Voucher Amazon €120' },
      { pos: '836° – 1.000°', prize: '🛒 Voucher Amazon €100' },
    ],
    discounts: [
      { pos: '1.001° – 1.333°', label: 'Sconto 15% prossima edizione' },
      { pos: '1.334° – 1.666°', label: 'Sconto 10% prossima edizione' },
      { pos: '1.667° – 2.000°', label: 'Sconto 5% prossima edizione' },
    ],
  },
]

/* ─────────────────────────────────────────────
   MEDAL STYLES per top 3
───────────────────────────────────────────── */
const MEDALS = [
  { bg: 'linear-gradient(135deg,#c8952a,#f0b429,#c8952a)', color: '#08090d', label: '🥇 1° Posto' },
  { bg: 'linear-gradient(135deg,#8a9ab0,#bcc8d8,#8a9ab0)', color: '#08090d', label: '🥈 2° Posto' },
  { bg: 'linear-gradient(135deg,#7a4e1a,#b87333,#7a4e1a)', color: '#fff',    label: '🥉 3° Posto' },
]

/* ─────────────────────────────────────────────
   TIER PANEL COMPONENT
───────────────────────────────────────────── */
function TierPanel({ tier }) {
  const top3     = tier.prizes.slice(0, 3)
  const rest     = tier.prizes.slice(3)
  const daily    = DAILY_PRIZES[tier.n]

  return (
    <div>
      {/* ── TIER HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(240,180,41,0.07) 0%, rgba(17,18,32,0) 60%)',
        border: '1px solid var(--border)',
        borderRadius: '16px 16px 0 0',
        padding: '2rem 2.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
            Scaglione
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', letterSpacing: '0.05em', lineHeight: 1, color: 'var(--gold)' }}>
            {tier.n.toLocaleString('it-IT')}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
            partecipanti minimi · 1° premio: {tier.topIcon} {tier.top}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>
            Premio miglior punteggio giornata
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4rem 1rem',
            background: 'rgba(240,180,41,0.1)',
            border: '1px solid var(--border)',
            borderRadius: '100px',
            color: 'var(--gold)',
            fontWeight: 700,
            fontSize: '0.85rem',
            letterSpacing: '0.05em',
          }}>
            ⚡ Voucher {daily} / giornata
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{
        background: '#0d0f1a',
        border: '1px solid var(--border)',
        borderTop: 'none',
        borderRadius: '0 0 16px 16px',
        padding: '2rem 2.5rem 2.5rem',
      }}>

        {/* TOP 3 — grandi card */}
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ width: 20, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
          Podio · Premi Classifica Finale
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.875rem', marginBottom: '1.75rem' }}>
          {top3.map((p, i) => (
            <div key={i} style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'transform 0.2s, border-color 0.2s',
              cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(240,180,41,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              {/* Medal bar */}
              <div style={{ background: MEDALS[i].bg, padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: MEDALS[i].color, textTransform: 'uppercase' }}>
                {MEDALS[i].label}
              </div>
              {/* Content */}
              <div style={{ padding: '1.25rem 1.25rem 1.25rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', lineHeight: 1 }}>{p.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--white)', lineHeight: 1.3, marginBottom: '0.3rem' }}>{p.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: '0.05em' }}>{p.cat}</div>
              </div>
            </div>
          ))}
        </div>

        {/* POSIZIONI 4-5 */}
        {rest.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.625rem', marginBottom: '1.5rem' }}>
            {rest.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.875rem',
                padding: '0.875rem 1.125rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '10px',
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: 'rgba(240,180,41,0.6)', minWidth: 28 }}>{p.pos}</div>
                <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{p.icon}</div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--white)', lineHeight: 1.25 }}>{p.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 2 }}>{p.cat}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DIVIDER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0 1.25rem' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: 'var(--muted)', textTransform: 'uppercase' }}>Altre posizioni a premio</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* BANDS — voucher */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {tier.bands.map((b, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.5rem 0.875rem',
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'rgba(240,180,41,0.55)', minWidth: 30 }}>{b.pos}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.72)' }}>{b.prize}</span>
            </div>
          ))}
        </div>

        {/* DISCOUNTS */}
        {tier.discounts.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {tier.discounts.map((d, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.5rem 0.875rem',
                background: 'rgba(110,231,183,0.04)',
                border: '1px solid rgba(110,231,183,0.15)',
                borderRadius: '8px',
              }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'rgba(110,231,183,0.5)', minWidth: 30 }}>{d.pos}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(110,231,183,0.7)' }}>🔄 {d.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* DISCLAIMER */}
        <div style={{
          padding: '0.875rem 1rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '8px',
          fontSize: '0.75rem',
          color: 'var(--muted)',
          lineHeight: 1.6,
        }}>
          <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Nota:</strong> Le immagini e le descrizioni dei premi hanno scopo puramente illustrativo. I premi fisici potranno subire variazioni di modello o colore in base alla disponibilità al momento dell'assegnazione, mantenendo invariata la categoria del premio. FantaElite si riserva il diritto di sostituire premi equivalenti in caso di indisponibilità.
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN MONTEPREMI COMPONENT
───────────────────────────────────────────── */
export default function Montepremi({ onBack, settings }) {
  const [activeTier, setActiveTier] = useState(0)

  // Scroll to top on mount
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [])

  const tier = TIERS[activeTier]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', paddingTop: '5rem' }}>

      {/* ── BACK BUTTON ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 2rem 0' }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '100px',
            color: 'var(--muted)',
            fontSize: '0.85rem',
            padding: '0.5rem 1.25rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            letterSpacing: '0.03em',
            transition: 'color 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--white)'; e.currentTarget.style.borderColor = 'rgba(240,180,41,0.4)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          ← Home
        </button>
      </div>

      {/* ── HERO ── */}
      <section style={{
        padding: '3rem 2rem 2.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(240,180,41,0.1) 0%, transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(240,180,41,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(240,180,41,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.35em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Stagione {settings?.season || '2026/27'}
          </div>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem', filter: 'drop-shadow(0 0 20px rgba(240,180,41,0.6))' }}>👑</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            lineHeight: 0.95,
            letterSpacing: '0.04em',
            marginBottom: '1.25rem',
          }}>
            <span style={{
              display: 'block',
              background: 'linear-gradient(135deg, #f0b429 0%, #fff8e7 50%, #f0b429 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 4s linear infinite',
            }}>MONTEPREMI</span>
            <span style={{ display: 'block', color: 'var(--white)', fontSize: '0.6em' }}>UFFICIALE</span>
          </h1>
          <p style={{ maxWidth: 560, margin: '0 auto 2rem', fontSize: '1rem', color: 'var(--muted)', fontWeight: 300, lineHeight: 1.7 }}>
            Premi fisici reali per ogni scaglione di partecipanti. Più siamo, più i premi crescono — da smartphone a scooter, fino alle auto di lusso.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {['🏆 Premi fisici', '🛒 Voucher Amazon', '⚡ Premio di giornata', '11 scaglioni'].map((chip, i) => (
              <span key={i} style={{
                padding: '0.375rem 1rem',
                border: '1px solid var(--border)',
                borderRadius: '100px',
                fontSize: '0.8rem',
                color: i < 3 ? 'var(--gold)' : 'var(--muted)',
                letterSpacing: '0.03em',
              }}>
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── DAILY PRIZE BANNER ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem 2rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(240,180,41,0.07), rgba(17,18,32,0.5))',
          border: '1px solid var(--border)',
          borderLeft: '4px solid var(--gold)',
          borderRadius: '12px',
          padding: '1.5rem 2rem',
          display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: '2.25rem', filter: 'drop-shadow(0 0 10px rgba(240,180,41,0.5))' }}>⚡</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '0.05em', color: 'var(--gold)', marginBottom: '0.2rem' }}>
              PREMIO MIGLIOR PUNTEGGIO DI GIORNATA
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--muted)', fontWeight: 300 }}>
              Ogni giornata di Serie A premia il fantallenatore col punteggio più alto · Voucher Amazon cumulabili per tutta la stagione
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { t: '100–200', v: '€20' }, { t: '300', v: '€30' }, { t: '400', v: '€40' },
              { t: '500–750', v: '€50' }, { t: '1.000+', v: '€100' }
            ].map((d, i) => (
              <div key={i} style={{
                background: 'rgba(240,180,41,0.08)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '0.5rem 0.875rem', textAlign: 'center', minWidth: 72,
              }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 2 }}>{d.t}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', letterSpacing: '0.05em', color: 'var(--gold)' }}>{d.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TIER SELECTOR ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem 2rem' }}>

        {/* Label */}
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ width: 20, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
          Seleziona lo scaglione
        </div>

        {/* Tab buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.75rem' }}>
          {TIERS.map((t, i) => (
            <button
              key={t.n}
              onClick={() => setActiveTier(i)}
              style={{
                padding: '0.5rem 1.125rem',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: activeTier === i ? 'var(--gold)' : 'rgba(255,255,255,0.08)',
                background: activeTier === i ? 'rgba(240,180,41,0.12)' : 'rgba(255,255,255,0.025)',
                color: activeTier === i ? 'var(--gold)' : 'var(--muted)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                fontWeight: activeTier === i ? 700 : 400,
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}
              onMouseEnter={e => { if (activeTier !== i) { e.currentTarget.style.borderColor = 'rgba(240,180,41,0.3)'; e.currentTarget.style.color = 'rgba(240,180,41,0.7)' } }}
              onMouseLeave={e => { if (activeTier !== i) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--muted)' } }}
            >
              <span>{t.n.toLocaleString('it-IT')}</span>
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>{t.topIcon}</span>
            </button>
          ))}
        </div>

        {/* Active tier panel */}
        <TierPanel tier={tier} />
      </div>

      {/* ── FOOTER NOTE ── */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '2.5rem 2rem', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '0.1em', color: 'var(--gold)', marginBottom: '0.5rem' }}>
          FANTALITE
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
          Montepremi Ufficiale · Stagione {settings?.season || '2026/27'} · Leghe FC · Serie A<br />
          Le immagini dei premi hanno scopo puramente illustrativo.
        </div>
      </div>
    </div>
  )
}
