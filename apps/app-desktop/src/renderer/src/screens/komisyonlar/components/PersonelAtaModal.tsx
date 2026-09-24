import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, UserPlus, Users, Shield, User, X } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { PersonelCombobox } from '../../../components/ui/PersonelCombobox'

interface PersonelAtaModalProps {
  isOpen: boolean
  onClose: () => void
  roleId: number | null
  komisyonId: number | null
}

interface PersonelInfo {
  id: number
  ad_soyad: string
  unvan: string | null
  birim?: string | null
}

export function PersonelAtaModal({
  isOpen,
  onClose,
  roleId,
  komisyonId
}: PersonelAtaModalProps): React.JSX.Element | null {
  const queryClient = useQueryClient()
  const [selectedPersonelId, setSelectedPersonelId] = useState<number | null>(null)
  const [lastRoleId, setLastRoleId] = useState<number | null>(null)

  const { data: roleDetail } = useQuery({
    queryKey: ['komisyon_role_detail', roleId],
    queryFn: async () => {
      if (!roleId) return null
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT u.id, u.komisyon_id, u.gorev_id, u.asil_mi, u.sira, u.personel_id,
                g.ad as gorev_adi, k.ad as komisyon_adi,
                p.ad_soyad as mevcut_personel, p.unvan as mevcut_unvan
         FROM TANIM_KomisyonUye u
         LEFT JOIN TANIM_KomisyonGorevi g ON u.gorev_id = g.id
         LEFT JOIN TANIM_Komisyon k ON u.komisyon_id = k.id
         LEFT JOIN TANIM_Personel p ON u.personel_id = p.id
         WHERE u.id = ?`,
        [roleId]
      )
      if (res.success && res.data && res.data.length > 0) {
        return res.data[0]
      }
      return null
    },
    enabled: isOpen && !!roleId
  })

  if (roleId !== lastRoleId) {
    setLastRoleId(roleId)
    setSelectedPersonelId(roleDetail?.personel_id || null)
  }

  const { data: personeller = [] } = useQuery<PersonelInfo[]>({
    queryKey: ['personel_listesi_komisyon_ata'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Personel WHERE aktif_mi = 1 ORDER BY ad_soyad ASC'
      )
      if (!res.success) throw new Error(res.error)
      return res.data as PersonelInfo[]
    },
    enabled: isOpen
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPersonelId) throw new Error('Lütfen atanacak personeli seçin.')
      if (!roleId || !komisyonId) throw new Error('Rol veya Komisyon ID eksik.')

      const updateRes = await window.electron.ipcRenderer.invoke('db:transaction', [
        {
          sql: 'UPDATE TANIM_KomisyonUye SET personel_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          params: [selectedPersonelId, roleId]
        }
      ])
      if (!updateRes.success) throw new Error(updateRes.error)
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['komisyonlar'] })
      if (komisyonId) {
        queryClient.invalidateQueries({ queryKey: ['komisyon_detay', komisyonId] })
      }
      queryClient.invalidateQueries({ queryKey: ['komisyon_role_detail', roleId] })
      onClose()
      setSelectedPersonelId(null)
    }
  })

  const selectedPerson = personeller.find((p) => p.id === selectedPersonelId)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Komisyona Personel Ata"
      description="Bu komisyon görev ve rolüne atanacak personeli seçin."
      className="max-w-xl overflow-visible"
    >
      <div className="space-y-5">
        {saveMutation.isError && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {saveMutation.error?.message}
          </div>
        )}

        {/* Görev ve Komisyon Bilgi Kartı */}
        {roleDetail && (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {roleDetail.komisyon_adi || 'Komisyon'}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  roleDetail.asil_mi === 1 || roleDetail.asil_mi === true
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                }`}
              >
                {roleDetail.asil_mi === 1 || roleDetail.asil_mi === true ? 'Asil Üye' : 'Yedek Üye'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-600 dark:text-slate-300">
                Görev:{' '}
                <strong className="text-slate-900 dark:text-slate-100">
                  {roleDetail.gorev_adi || 'Üye'}
                </strong>
              </span>
            </div>
          </div>
        )}

        {/* Personel Seçimi */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Atanacak Personel
          </label>
          <PersonelCombobox
            personeller={personeller}
            selectedId={selectedPersonelId}
            onChange={(val) => setSelectedPersonelId(val)}
            placeholder="Personel arayın veya listeden seçin..."
          />
        </div>

        {/* Seçilen Personel Önizleme Kartı */}
        {selectedPerson && (
          <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                {selectedPerson.ad_soyad ? (
                  selectedPerson.ad_soyad.substring(0, 2).toLocaleUpperCase('tr-TR')
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-2">
                  {selectedPerson.ad_soyad}
                  <span className="text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    Seçildi
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {selectedPerson.unvan || 'Unvan Belirtilmedi'}
                  {selectedPerson.birim ? ` • ${selectedPerson.birim}` : ''}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPersonelId(null)}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Seçimi Kaldır"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Butonlar */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            İptal
          </Button>
          <Button
            type="button"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !selectedPersonelId}
          >
            {saveMutation.isPending ? 'Atanıyor...' : 'Personeli Ata'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
