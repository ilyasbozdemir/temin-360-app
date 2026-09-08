import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ClipboardCheck, Search, Plus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { ExcelActions } from '../../components/ui/ExcelActions'

export default function KomisyonGorevleriScreen({
  isSubComponent = false
}: {
  isSubComponent?: boolean
}): React.JSX.Element {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ ad: '', aciklama: '' })

  const { data: gorevler = [], isLoading } = useQuery({
    queryKey: ['komisyon_gorevleri'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT 
          kg.*,
          (SELECT COUNT(*) FROM TANIM_KomisyonUye ku WHERE ku.gorev_id = kg.id) as kullanim_sayisi,
          (SELECT GROUP_CONCAT(DISTINCT k.ad) FROM TANIM_Komisyon k INNER JOIN TANIM_KomisyonUye ku ON ku.komisyon_id = k.id WHERE ku.gorev_id = kg.id) as kullanilan_komisyonlar
         FROM TANIM_KomisyonGorevi kg 
         WHERE kg.aktif_mi = 1 
         ORDER BY kg.id ASC`
      )
      if (!res.success) throw new Error(res.error)
      return res.data
    }
  })

  const filteredGorevler = gorevler.filter(
    (g: any) =>
      g.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.aciklama && g.aciklama.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!formData.ad.trim()) throw new Error('Görev adı boş olamaz.')

      if (editingId) {
        const res = await window.electron.ipcRenderer.invoke('db:transaction', [
          {
            sql: 'UPDATE TANIM_KomisyonGorevi SET ad = ?, aciklama = ? WHERE id = ?',
            params: [formData.ad, formData.aciklama, editingId]
          }
        ])
        if (!res.success) throw new Error(res.error)
      } else {
        const res = await window.electron.ipcRenderer.invoke('db:transaction', [
          {
            sql: 'INSERT INTO TANIM_KomisyonGorevi (ad, aciklama) VALUES (?, ?)',
            params: [formData.ad, formData.aciklama]
          }
        ])
        if (!res.success) throw new Error(res.error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['komisyon_gorevleri'] })
      setIsModalOpen(false)
      setEditingId(null)
      setFormData({ ad: '', aciklama: '' })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await window.electron.ipcRenderer.invoke('db:transaction', [
        {
          sql: 'DELETE FROM TANIM_KomisyonGorevi WHERE id = ?',
          params: [id]
        }
      ])
      if (!res.success) throw new Error(res.error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['komisyon_gorevleri'] })
    }
  })

  const handleEdit = (gorev: any) => {
    setFormData({ ad: gorev.ad, aciklama: gorev.aciklama || '' })
    setEditingId(gorev.id)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setFormData({ ad: '', aciklama: '' })
    setEditingId(null)
    setIsModalOpen(true)
  }

  return (
    <div
      className={
        isSubComponent
          ? 'flex flex-col h-full space-y-6 w-full animate-in fade-in duration-200'
          : 'flex flex-col h-full space-y-6'
      }
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-indigo-500" />
            Komisyon Görev Tanımları
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Komisyonlarda personellere atanabilecek unvan ve görevleri yönetin.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExcelActions
            tableName="TANIM_KomisyonGorevi"
            title="Komisyon Görevleri"
            uniqueCol="id"
            onImportSuccess={() => queryClient.invalidateQueries({ queryKey: ['komisyon_gorevleri'] })}
          />
          <Button
            onClick={handleAdd}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
          >
            <Plus className="w-4 h-4" /> Yeni Görev Ekle
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 items-start flex-1 min-h-0">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm min-h-[450px] flex flex-col overflow-hidden relative">
          <div className="p-6 h-full flex flex-col min-h-0">
            <div className="relative mb-6 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Görev adı veya açıklama ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-sm"
              />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                  <div className="col-span-full py-12 text-center text-slate-500">
                    Yükleniyor...
                  </div>
                ) : filteredGorevler.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                    Görev bulunamadı.
                  </div>
                ) : (
                  filteredGorevler.map((gorev: any) => (
                    <div
                      key={gorev.id}
                      className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg shrink-0">
                          {gorev.ad.charAt(0)}
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base line-clamp-2">
                          {gorev.ad}
                        </h3>
                      </div>

                      <div className="flex-1">
                        {gorev.aciklama ? (
                          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                            {gorev.aciklama}
                          </p>
                        ) : (
                          <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                            Açıklama girilmemiş
                          </p>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                        <div>
                          {gorev.kullanim_sayisi > 0 ? (
                            <div className="group/tooltip relative flex items-center">
                              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/20 dark:text-blue-400 cursor-help">
                                Aktif kullanım: {gorev.kullanim_sayisi}
                              </span>
                              {gorev.kullanilan_komisyonlar && (
                                <div className="absolute bottom-full left-0 mb-2 hidden w-max max-w-[250px] flex-col gap-1 rounded-lg bg-slate-800 dark:bg-slate-700 p-2.5 text-xs text-white shadow-xl group-hover/tooltip:flex z-50">
                                  <span className="font-semibold text-slate-300 border-b border-slate-600 pb-1.5 mb-1">
                                    Bulunduğu Komisyonlar
                                  </span>
                                  {gorev.kullanilan_komisyonlar
                                    .split(',')
                                    .map((k: string, i: number) => (
                                      <span key={i} className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                                        <span className="truncate" title={k.trim()}>
                                          {k.trim()}
                                        </span>
                                      </span>
                                    ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 dark:bg-slate-800/50 dark:text-slate-400">
                              Kullanılmıyor
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="text-xs py-1.5 h-auto rounded-lg"
                            onClick={() => handleEdit(gorev)}
                          >
                            Düzenle
                          </Button>
                          <Button
                            variant="outline"
                            className="text-xs py-1.5 h-auto rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                              if (gorev.kullanim_sayisi > 0) {
                                alert(
                                  `Bu görev aktif olarak ${gorev.kullanim_sayisi} komisyon üyesine atanmış durumda. Silmek için önce o komisyonlardan bu görevi kaldırmalısınız.`
                                )
                                return
                              }
                              if (confirm('Bu görevi silmek istediğinize emin misiniz?')) {
                                deleteMutation.mutate(gorev.id)
                              }
                            }}
                          >
                            Sil
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingId(null)
        }}
        title={editingId ? 'Görevi Düzenle' : 'Yeni Görev Ekle'}
        description="Komisyonda yer alacak yeni bir unvan veya görev tanımı oluşturun."
      >
        <div className="space-y-4">
          {saveMutation.isError && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
              {saveMutation.error?.message}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Görev Adı <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Örn: Başkan, Üye, Raportör"
                value={formData.ad}
                onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Açıklama
              </label>
              <textarea
                placeholder="Görevin yetki ve sorumlulukları..."
                value={formData.aciklama}
                onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                className="flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false)
                setEditingId(null)
              }}
              disabled={saveMutation.isPending}
            >
              İptal
            </Button>
            <Button
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !formData.ad.trim()}
            >
              {saveMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
