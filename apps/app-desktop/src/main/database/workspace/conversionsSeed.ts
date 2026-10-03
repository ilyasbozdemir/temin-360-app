import Database from 'better-sqlite3'

export function seedUnitConversions(db: Database.Database): void {
  try {
    const donusumCountRes = db.prepare('SELECT COUNT(*) as cnt FROM TANIM_BirimDonusum').get() as {
      cnt: number
    }
    if (donusumCountRes.cnt > 0) return

    const getBirimId = (ad: string) => {
      const row = db
        .prepare('SELECT id FROM TANIM_OlcuBirimi WHERE ad = ? COLLATE NOCASE')
        .get(ad) as { id: number } | undefined
      return row?.id
    }

    const insertDonusum = db.prepare(`
      INSERT OR IGNORE INTO TANIM_BirimDonusum (kaynak_birim_id, hedef_birim_id, donusum_faktoru, formul, ters_formul, aciklama, aktif_mi)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `)

    const defaultConversions = [
      // Agirlik
      { from: 'Kilogram', to: 'Gram', factor: 1000, formula: 'x * 1000', rev: 'x / 1000', desc: '1 kg = 1000 g' },
      { from: 'Gram', to: 'Kilogram', factor: 0.001, formula: 'x / 1000', rev: 'x * 1000', desc: '1 g = 0.001 kg' },
      { from: 'Ton', to: 'Kilogram', factor: 1000, formula: 'x * 1000', rev: 'x / 1000', desc: '1 ton = 1000 kg' },
      { from: 'Kilogram', to: 'Ton', factor: 0.001, formula: 'x / 1000', rev: 'x * 1000', desc: '1 kg = 0.001 ton' },
      { from: 'Gram', to: 'Miligram', factor: 1000, formula: 'x * 1000', rev: 'x / 1000', desc: '1 g = 1000 mg' },

      // Uzunluk
      { from: 'Kilometre', to: 'Metre', factor: 1000, formula: 'x * 1000', rev: 'x / 1000', desc: '1 km = 1000 m' },
      { from: 'Metre', to: 'Kilometre', factor: 0.001, formula: 'x / 1000', rev: 'x * 1000', desc: '1 m = 0.001 km' },
      { from: 'Metre', to: 'Santimetre', factor: 100, formula: 'x * 100', rev: 'x / 100', desc: '1 m = 100 cm' },
      { from: 'Santimetre', to: 'Metre', factor: 0.01, formula: 'x / 100', rev: 'x * 100', desc: '1 cm = 0.01 m' },
      { from: 'Metre', to: 'Milimetre', factor: 1000, formula: 'x * 1000', rev: 'x / 1000', desc: '1 m = 1000 mm' },
      { from: 'Santimetre', to: 'Milimetre', factor: 10, formula: 'x * 10', rev: 'x / 10', desc: '1 cm = 10 mm' },
      { from: 'İnç', to: 'Santimetre', factor: 2.54, formula: 'x * 2.54', rev: 'x / 2.54', desc: '1 in = 2.54 cm' },

      // Alan
      { from: 'Metrekare', to: 'Santimetrekare', factor: 10000, formula: 'x * 10000', rev: 'x / 10000', desc: '1 m² = 10.000 cm²' },
      { from: 'Hektar', to: 'Metrekare', factor: 10000, formula: 'x * 10000', rev: 'x / 10000', desc: '1 ha = 10.000 m²' },
      { from: 'Dönüm', to: 'Metrekare', factor: 1000, formula: 'x * 1000', rev: 'x / 1000', desc: '1 dönüm = 1000 m²' },

      // Hacim
      { from: 'Litre', to: 'Mililitre', factor: 1000, formula: 'x * 1000', rev: 'x / 1000', desc: '1 L = 1000 ml' },
      { from: 'Mililitre', to: 'Litre', factor: 0.001, formula: 'x / 1000', rev: 'x * 1000', desc: '1 ml = 0.001 L' },
      { from: 'Metreküp', to: 'Litre', factor: 1000, formula: 'x * 1000', rev: 'x / 1000', desc: '1 m³ = 1000 L' },
      { from: 'Galon', to: 'Litre', factor: 3.78541, formula: 'x * 3.78541', rev: 'x / 3.78541', desc: '1 gal ≈ 3.785 L' },

      // Adet
      { from: 'Deste', to: 'Adet', factor: 10, formula: 'x * 10', rev: 'x / 10', desc: '1 deste = 10 adet' },
      { from: 'Düzine', to: 'Adet', factor: 12, formula: 'x * 12', rev: 'x / 12', desc: '1 düzine = 12 adet' },
      { from: 'Çift', to: 'Adet', factor: 2, formula: 'x * 2', rev: 'x / 2', desc: '1 çift = 2 adet' },

      // Zaman
      { from: 'Gün', to: 'Saat', factor: 24, formula: 'x * 24', rev: 'x / 24', desc: '1 gün = 24 saat' },
      { from: 'Saat', to: 'Dakika', factor: 60, formula: 'x * 60', rev: 'x / 60', desc: '1 sa = 60 dk' },
      { from: 'Hafta', to: 'Gün', factor: 7, formula: 'x * 7', rev: 'x / 7', desc: '1 hafta = 7 gün' },
      { from: 'Ay', to: 'Gün', factor: 30, formula: 'x * 30', rev: 'x / 30', desc: '1 ay ≈ 30 gün' },
      { from: 'Yıl', to: 'Gün', factor: 365, formula: 'x * 365', rev: 'x / 365', desc: '1 yıl = 365 gün' },

      // Sicaklik (Formullu)
      { from: 'Santigrat', to: 'Fahrenhayt', factor: 0, formula: '(x * 9/5) + 32', rev: '(x - 32) * 5/9', desc: '°F = (°C × 9/5) + 32' },
      { from: 'Fahrenhayt', to: 'Santigrat', factor: 0, formula: '(x - 32) * 5/9', rev: '(x * 9/5) + 32', desc: '°C = (°F - 32) × 5/9' },
      { from: 'Santigrat', to: 'Kelvin', factor: 0, formula: 'x + 273.15', rev: 'x - 273.15', desc: 'K = °C + 273.15' },
      { from: 'Kelvin', to: 'Santigrat', factor: 0, formula: 'x - 273.15', rev: 'x + 273.15', desc: '°C = K - 273.15' }
    ]

    for (const conv of defaultConversions) {
      const fromId = getBirimId(conv.from)
      const toId = getBirimId(conv.to)
      if (fromId && toId) {
        insertDonusum.run(fromId, toId, conv.factor, conv.formula, conv.rev, conv.desc)
      }
    }
  } catch (err: any) {
    console.warn('[ConversionsSeed] Birim donusumleri eklenirken uyari:', err.message)
  }
}
