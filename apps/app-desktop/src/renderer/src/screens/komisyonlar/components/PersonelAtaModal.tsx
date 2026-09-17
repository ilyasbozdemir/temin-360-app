import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'
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
}

export function PersonelAtaModal({
  isOpen,
  onClose,
  roleId,
  komisyonId
}: PersonelAtaModalProps): React.JSX.Element | null {
  const queryClient = useQueryClient()
  const [selectedPersonelId, setSelectedPersonelId] = useState<number | null>(null)

  const { data: personeller = [] } = useQuery<PersonelInfo[]>({
    queryKey: ['personel_listesi_komisyon_ata'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Personel WHERE aktif_mi = 1'
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
          sql: 'UPDATE TANIM_KomisyonUye SET personel_id = ? WHERE id = ?',
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
      onClose()
      setSelectedPersonelId(null)
    }
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personel Ata"
      description="Bu komisyon rolüne atamak istediğiniz personeli seçin."
    >
      <div className="space-y-6">
        {saveMutation.isError && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {saveMutation.error?.message}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Personel Seçimi
          </label>
          <PersonelCombobox
            personeller={personeller}
            selectedId={selectedPersonelId}
            onChange={(val) => setSelectedPersonelId(val)}
            placeholder="Personel arayın veya seçin..."
          />
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            İptal
          </Button>
          <Button
            type="button"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
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
