import { yiUfeService } from '../../../services/yiUfeService'
import { calculatePriceDifference } from '../../../utils/priceDifference'
import { hesaplaKesinti, getAyarVergiOrani } from '../../../utils/hesaplamalar'
import { paraYaziyaCevir } from '../../../constants/sayiEslesmeleri'

export function calculatePriceDifferenceFields(
  dosyaResData: any,
  grandTotal: number,
  totalKdv: number,
  settings: any,
  formatTR: (val: number) => string
) {
  const fiyatFarkiDayanagi = dosyaResData?.fiyat_farki_dayanagi || 'Fiyat Farkı Ödenmeyecek'
  const isFiyatFarkiVar =
    fiyatFarkiDayanagi &&
    fiyatFarkiDayanagi !== 'Fiyat Farkı Ödenmeyecek' &&
    (fiyatFarkiDayanagi.includes('5215') || fiyatFarkiDayanagi.includes('5216'))

  let temelEndeks = 0
  let guncelEndeks = 0
  let fiyatFarkiPn = 1
  let fiyatFarkiTutari = 0
  let fiyatFarkiKdv = 0
  let fiyatFarkiDahilToplam = grandTotal

  if (isFiyatFarkiVar) {
    const rawTemelTarih =
      dosyaResData?.temin_tarihi || dosyaResData?.dosya_acilis_tarihi || dosyaResData?.tarih
    const rawGuncelTarih = dosyaResData?.teslim_tarihi || new Date().toISOString()

    const d0 = rawTemelTarih ? new Date(rawTemelTarih) : new Date()
    const dn = rawGuncelTarih ? new Date(rawGuncelTarih) : new Date()

    const y0 = !isNaN(d0.getFullYear()) ? d0.getFullYear() : new Date().getFullYear()
    const m0 = !isNaN(d0.getMonth()) ? d0.getMonth() + 1 : 1

    const yn = !isNaN(dn.getFullYear()) ? dn.getFullYear() : new Date().getFullYear()
    const mn = !isNaN(dn.getMonth()) ? dn.getMonth() + 1 : new Date().getMonth() + 1

    temelEndeks = yiUfeService.getIndex(y0, m0) || 0
    guncelEndeks = yiUfeService.getIndex(yn, mn) || 0

    if (temelEndeks > 0 && guncelEndeks > 0) {
      const calc = calculatePriceDifference(fiyatFarkiDayanagi, {
        workAmount: grandTotal,
        baseIndexes: { b1: temelEndeks },
        currentIndexes: { b1: guncelEndeks }
      })
      fiyatFarkiPn = calc.pn
      fiyatFarkiTutari = calc.difference
      const kdvRate = getAyarVergiOrani(settings, 'kdv_20', '20', 'yuzde')
      fiyatFarkiKdv = hesaplaKesinti(fiyatFarkiTutari, kdvRate.oran, kdvRate.tur)
      fiyatFarkiDahilToplam = grandTotal + fiyatFarkiTutari
    }
  }

  return {
    fiyatFarkiDayanagi,
    fiyatFarkiUygulanacakMi: isFiyatFarkiVar ? 'Evet' : 'Hayır',
    fiyatFarkiTemelEndeks: formatTR(temelEndeks),
    fiyatFarkiGuncelEndeks: formatTR(guncelEndeks),
    fiyatFarkiPn: fiyatFarkiPn.toFixed(4),
    fiyatFarkiTutari: formatTR(fiyatFarkiTutari),
    fiyatFarkiTutariYazi: paraYaziyaCevir(fiyatFarkiTutari),
    fiyatFarkiDahilHakedis: formatTR(fiyatFarkiDahilToplam),
    fiyatFarkiDahilHakedisYazi: paraYaziyaCevir(fiyatFarkiDahilToplam),
    fiyatFarkiKdv: formatTR(fiyatFarkiKdv),
    fiyatFarkiDahilGenelToplam: formatTR(
      fiyatFarkiDahilToplam + (isFiyatFarkiVar ? fiyatFarkiKdv + totalKdv : totalKdv)
    )
  }
}
