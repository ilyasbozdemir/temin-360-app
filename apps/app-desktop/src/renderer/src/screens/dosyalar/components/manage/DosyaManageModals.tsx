import React from 'react'
import { AIFormFillModal } from '../../../../components/ui/AIFormFillModal'
import { AITextGeneratorModal } from '../../../../components/ui/AITextGeneratorModal'
import { EskiDosyaKopyalaModal } from '../EskiDosyaKopyalaModal'

export interface DosyaManageModalsProps {
  showAIModal: boolean
  setShowAIModal: (show: boolean) => void
  getAIFormContext: () => any
  handleAIApply: (data: any) => void
  textGenConfig: {
    isOpen: boolean
    title: string
    fieldName: string
    systemInstruction?: string
    targetField: string
  }
  setTextGenConfig: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean
      title: string
      fieldName: string
      systemInstruction?: string
      targetField: string
    }>
  >
  formData: any
  setFormData: React.Dispatch<React.SetStateAction<any>>
  aiKalemConfig: {
    isOpen: boolean
  }
  setAiKalemConfig: (config: { isOpen: boolean }) => void
  showKopyalaModal: boolean
  setShowKopyalaModal: (show: boolean) => void
  dosyalar: any[]
  handleCopyDosya: (dosyaId: number) => void
}

export const DosyaManageModals: React.FC<DosyaManageModalsProps> = ({
  showAIModal,
  setShowAIModal,
  getAIFormContext,
  handleAIApply,
  textGenConfig,
  setTextGenConfig,
  formData,
  setFormData,
  aiKalemConfig,
  setAiKalemConfig,
  showKopyalaModal,
  setShowKopyalaModal,
  dosyalar,
  handleCopyDosya
}) => {
  return (
    <>
      {/* AI Form Fill Modal */}
      <AIFormFillModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        context={getAIFormContext()}
        onApply={handleAIApply}
      />

      {/* AI Text Generator Modal */}
      <AITextGeneratorModal
        isOpen={textGenConfig.isOpen}
        onClose={() => setTextGenConfig((prev) => ({ ...prev, isOpen: false }))}
        title={textGenConfig.title}
        fieldName={textGenConfig.fieldName}
        initialSubject={formData.konu}
        systemInstruction={textGenConfig.systemInstruction}
        placeholderMappings={{
          '[DOSYA_KONU]': formData.konu || 'Belirtilmemiş',
          '[DOSYA_NO]': formData.temin_no || 'Belirtilmemiş',
          '[DOSYA_MALIYET]': formData.yaklasik_maliyet
            ? String(formData.yaklasik_maliyet)
            : 'Belirtilmemiş'
        }}
        onApply={(text) => {
          setFormData((prev) => ({
            ...prev,
            [textGenConfig.targetField]: text
          }))
        }}
      />

      {/* AI Kalem Asistanı Modal */}
      <AITextGeneratorModal
        isOpen={aiKalemConfig.isOpen}
        onClose={() => setAiKalemConfig({ isOpen: false })}
        title="Yapay Zeka ile Kalem Tanımlama"
        fieldName="Kalem (OKAS ve Ortak Alımlar Sözlüğü)"
        initialSubject={formData.konu}
        mode="json"
        expectedJsonFormat={
          '{ "kalemAdi": "Örn: A4 Fotokopi Kağıdı 80gr", "miktari": 50, "birimi": "Paket", "okasKodu": "Örn: 30197630-1" }'
        }
        systemInstruction={`Sen bir kamu ihale ve doğrudan temin uzmanısın. Kullanıcı bir mal, hizmet veya yapım işi için listeye kalem eklemek istiyor. 
Kullanıcının girdiği genel tanıma ve alımın konusuna ([DOSYA_KONU]) bakarak:
1. En uygun, resmi, şartnameye uygun 'Kalem Adı'nı belirle.
2. Bu kalem için EKAP sisteminde kullanılan en uygun 'OKAS Kodunu' (Ortak Alımlar Sözlüğü CPV kodu) veya Taşınır/Taşınmaz mal kodunu bul. Bulamazsan uygun bir üst kategori OKAS kodu tahmin et.
3. Uygun miktar ve ölçü birimi (Adet, Paket, Kg, Ton, Ay, Gün, m2 vb.) öner.
Yanıtını SADECE JSON formatında ver.`}
        placeholderMappings={{
          '[DOSYA_KONU]': formData.konu || formData.tur || 'Belirtilmemiş'
        }}
        onApply={(data) => {
          console.log('AI Kalem Verisi:', data)
          alert(
            `Yapay Zeka şu kalemi buldu:\n\nAdı: ${data.kalemAdi}\nOKAS Kodu: ${data.okasKodu}\nMiktar: ${data.miktari} ${data.birimi}\n\nNot: Kalem listesi altyapısı tamamlandığında bu kalem otomatik olarak listeye eklenecektir.`
          )
        }}
      />

      {/* Eski Dosya Kopyala Modal */}
      <EskiDosyaKopyalaModal
        isOpen={showKopyalaModal}
        onClose={() => setShowKopyalaModal(false)}
        dosyalar={dosyalar}
        onSelect={handleCopyDosya}
      />
    </>
  )
}
