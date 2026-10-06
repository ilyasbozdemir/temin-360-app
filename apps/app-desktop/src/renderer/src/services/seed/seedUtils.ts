/**
 * <summary>
 * SQL Çalıştırma ve Veri Temizleme Yardımcı Fonksiyonları
 * </summary>
 */

export async function runSql(sql: string, params: unknown[] = []): Promise<void> {
  try {
    await window.electron.ipcRenderer.invoke('db:run', sql, params)
  } catch (e) {
    console.warn('[devSeedService] SQL execution warning:', sql, e)
  }
}

/**
 * <summary>
 * Önceki test verilerini (hareketler, teklifler, kalemler, dosyalar ve tanımlar) tamamen temizler.
 * </summary>
 */
export async function cleanExistingSeedData(): Promise<void> {
  // 1. DATA (Hareket / Süreç) tablolarını temizle
  await runSql('DELETE FROM DATA_TeminKalemTeklif')
  await runSql('DELETE FROM DATA_TeminKalem')
  await runSql('DELETE FROM DATA_TeminFirma')
  await runSql('DELETE FROM DATA_TeminKomisyon')
  await runSql('DELETE FROM DATA_TeminEkSurec')
  await runSql('DELETE FROM DATA_TeminDosyasi')
  await runSql('DELETE FROM DATA_HakedisKalem')
  await runSql('DELETE FROM DATA_HakedisKesinti')
  await runSql('DELETE FROM DATA_Hakedis')

  // 2. TANIM tablolarını temizle
  await runSql('DELETE FROM TANIM_Kalem')
  await runSql('DELETE FROM TANIM_Firma')
  await runSql('DELETE FROM TANIM_Ambar')
  await runSql('DELETE FROM TANIM_Komisyon')
  await runSql('DELETE FROM TANIM_Birim')
  await runSql('DELETE FROM TANIM_Personel')
  await runSql('DELETE FROM TANIM_KikLimit')

  // 3. SQLite AUTOINCREMENT sayaçlarını sıfırla (ID'ler temiz 1'den başlasın)
  await runSql(
    "DELETE FROM sqlite_sequence WHERE name IN ('DATA_TeminDosyasi', 'DATA_TeminKalem', 'DATA_TeminFirma', 'DATA_TeminKalemTeklif', 'DATA_TeminKomisyon', 'TANIM_Birim', 'TANIM_Personel', 'TANIM_Firma', 'TANIM_Kalem', 'TANIM_Ambar', 'TANIM_Komisyon', 'TANIM_KikLimit')"
  )
}
