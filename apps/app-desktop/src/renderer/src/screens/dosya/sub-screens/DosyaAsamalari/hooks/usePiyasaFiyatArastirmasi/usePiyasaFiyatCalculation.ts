import { useCallback, useMemo } from 'react'
import Decimal from 'decimal.js'
import { BiddingFirm, BiddingKalem } from './types'
import { emitAppEvent } from '../../../../../../utils/appEvents'
import { documentPreloadService } from '../../../../../../services/documentPreloadService'

export function usePiyasaFiyatCalculation(
  activeDosyaId: number | null,
  invitedFirms: BiddingFirm[],
  items: BiddingKalem[],
  bids: Record<string, number>,
  hesaplamaEsasi: string,
  setHesaplamaEsasiState: (val: string) => void,
  setManualWinnerFirmaId: (val: number | null) => void,
  setSetLowestFirmAsWinner: (val: boolean) => void
) {
  const getLowestBidInfo = useCallback(
    (kalemId: number): { price: number; firmaId: number | null } => {
      let minPrice = Infinity
      let minFirmaId: number | null = null

      invitedFirms.forEach((firma) => {
        const price = bids[`${kalemId}_${firma.id}`]
        if (price > 0 && price < minPrice) {
          minPrice = price
          minFirmaId = firma.id
        }
      })

      return {
        price: minPrice === Infinity ? 0 : minPrice,
        firmaId: minFirmaId
      }
    },
    [invitedFirms, bids]
  )

  const getAverageBid = useCallback(
    (kalemId: number): number => {
      let sumDecimal = new Decimal(0)
      let count = 0
      invitedFirms.forEach((firma) => {
        const price = bids[`${kalemId}_${firma.id}`]
        if (price > 0) {
          sumDecimal = sumDecimal.plus(price)
          count++
        }
      })
      return count > 0 ? sumDecimal.div(count).toDecimalPlaces(2).toNumber() : 0
    },
    [invitedFirms, bids]
  )

  const getEstimatedCostTotal = useCallback((): number => {
    const isLowestBasis =
      hesaplamaEsasi?.toLowerCase().includes('en düşük') ||
      hesaplamaEsasi?.toLowerCase().includes('en dusuk')

    let totalDecimal = new Decimal(0)
    items.forEach((item) => {
      const price = isLowestBasis ? getLowestBidInfo(item.id).price : getAverageBid(item.id)
      const miktar = new Decimal(item.miktar || 0)
      totalDecimal = totalDecimal.plus(miktar.times(price))
    })
    return totalDecimal.toDecimalPlaces(2).toNumber()
  }, [items, getAverageBid, getLowestBidInfo, hesaplamaEsasi])

  const handleSetHesaplamaEsasi = useCallback(
    async (newEsas: string): Promise<void> => {
      setHesaplamaEsasiState(newEsas)
      if (!activeDosyaId) return
      try {
        const isLowestBasis =
          newEsas?.toLowerCase().includes('en düşük') || newEsas?.toLowerCase().includes('en dusuk')

        let totalDecimal = new Decimal(0)
        items.forEach((item) => {
          const price = isLowestBasis ? getLowestBidInfo(item.id).price : getAverageBid(item.id)
          const miktar = new Decimal(item.miktar || 0)
          totalDecimal = totalDecimal.plus(miktar.times(price))
        })
        const total = totalDecimal.toDecimalPlaces(2).toNumber()

        await window.electron.ipcRenderer.invoke(
          'db:run',
          'UPDATE DATA_TeminDosyasi SET hesaplama_esasi = ?, yaklasik_maliyet = CASE WHEN ? > 0 THEN ? ELSE yaklasik_maliyet END WHERE id = ?',
          [newEsas, total, total, activeDosyaId]
        )
        emitAppEvent('dossier:updated', { dosyaId: activeDosyaId })
      } catch (err) {
        console.error('Error updating hesaplama esasi:', err)
      }
    },
    [activeDosyaId, items, getLowestBidInfo, getAverageBid, setHesaplamaEsasiState]
  )

  const lowestTotalFirmaId = useMemo(() => {
    let minTotal = Infinity
    let minId: number | null = null
    invitedFirms.forEach((firma) => {
      if (firma.teklif_toplami && firma.teklif_toplami > 0 && firma.teklif_toplami < minTotal) {
        minTotal = firma.teklif_toplami
        minId = firma.id
      }
    })
    return minId
  }, [invitedFirms])

  const handleSetWinnerFirma = useCallback(
    async (firmaMasterId: number | null): Promise<void> => {
      if (!activeDosyaId) return
      try {
        const estTotal = getEstimatedCostTotal()
        await window.electron.ipcRenderer.invoke(
          'db:run',
          'UPDATE DATA_TeminDosyasi SET firma_id = ?, yaklasik_maliyet = CASE WHEN ? > 0 THEN ? ELSE yaklasik_maliyet END WHERE id = ?',
          [firmaMasterId, estTotal, estTotal, activeDosyaId]
        )

        if (firmaMasterId) {
          await window.electron.ipcRenderer.invoke(
            'db:run',
            `UPDATE DATA_TeminFirma 
             SET kazanan_mi = CASE WHEN firma_id = ? OR id = ? THEN 1 ELSE 0 END 
             WHERE temin_dosya_id = ?`,
            [firmaMasterId, firmaMasterId, activeDosyaId]
          )
        } else {
          await window.electron.ipcRenderer.invoke(
            'db:run',
            `UPDATE DATA_TeminFirma SET kazanan_mi = 0 WHERE temin_dosya_id = ?`,
            [activeDosyaId]
          )
        }

        setManualWinnerFirmaId(firmaMasterId)
        if (firmaMasterId) {
          setSetLowestFirmAsWinner(false)
        }

        documentPreloadService.invalidateCache(activeDosyaId)
        emitAppEvent('dossier:updated', { dosyaId: activeDosyaId })
        emitAppEvent('bids:changed', { dosyaId: activeDosyaId })
      } catch (err) {
        console.error('Error setting winner firma:', err)
      }
    },
    [activeDosyaId, getEstimatedCostTotal, setManualWinnerFirmaId, setSetLowestFirmAsWinner]
  )

  return {
    getLowestBidInfo,
    getAverageBid,
    getEstimatedCostTotal,
    handleSetHesaplamaEsasi,
    lowestTotalFirmaId,
    handleSetWinnerFirma
  }
}
