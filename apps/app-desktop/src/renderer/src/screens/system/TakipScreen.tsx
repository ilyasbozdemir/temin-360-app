/* eslint-disable */
import React from 'react'
import { useTakip } from './components/takip/useTakip'
import { TakipHeader } from './components/takip/TakipHeader'
import { TakipActiveDosyaSummary } from './components/takip/TakipActiveDosyaSummary'
import { TakipDosyaTarihlerWidget } from './components/takip/TakipDosyaTarihlerWidget'
import { TakipUretilenBelgelerWidget } from './components/takip/TakipUretilenBelgelerWidget'
import { TakipAsamaStepper } from './components/takip/TakipAsamaStepper'
import { TakipIsAkisiYonergesi } from './components/takip/TakipIsAkisiYonergesi'
import { TakipKalemlerVeFirmalarGrid } from './components/takip/TakipKalemlerVeFirmalarGrid'
import { TakipDosyaDetayBilgileri } from './components/takip/TakipDosyaDetayBilgileri'
import { TakipAsamaAciklamalari } from './components/takip/TakipAsamaAciklamalari'
import { TakipGenelMetrikView } from './components/takip/TakipGenelMetrikView'
import { DosyaNotlariWidget } from '../notlar/components/DosyaNotlariWidget'

export function TakipScreen(): React.JSX.Element {
  const {
    activeDosyaId,
    setActiveDosyaId,
    activeDosya,
    dosyalar,
    dbBelgeler,
    allBelgeler,
    kalemler,
    firmalar,
    komisyonlar,
    stages,
    dbAsamalar,
    currentAsamaSira,
    STAGE_ROUTES,
    STAGE_SHORT_LABELS,
    status,
    setStatus,
    acilisTarihi,
    setAcilisTarihi,
    sonTeklifTarihi,
    setSonTeklifTarihi,
    teminTarihi,
    setTeminTarihi,
    teslimTarihi,
    setTeslimTarihi,
    notlar,
    setNotlar,
    saveLoading,
    saveMessage,
    handleEditDosya,
    handleSurecAkisi,
    handleOpenInNewWindow,
    handleDelete,
    handleUpdateDosya,
    handleToggleSign,
    formatCurrency
  } = useTakip()

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER SECTION */}
      <TakipHeader activeDosya={activeDosya} onEditClick={handleEditDosya} />

      {activeDosya ? (
        <div className="space-y-6">
          {/* TOP SECTION: 12-COL GRID FOR SUMMARY & ACTIONS/DATES */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: ACTIVE FILE SUMMARY & PROCESS CARDS */}
            <div className="lg:col-span-8 space-y-6">
              <TakipActiveDosyaSummary
                activeDosya={activeDosya}
                kalemler={kalemler}
                firmalar={firmalar}
                formatCurrency={formatCurrency}
                onEditClick={handleEditDosya}
                onSurecAkisiClick={handleSurecAkisi}
                onOpenNewWindowClick={handleOpenInNewWindow}
                onDeleteClick={handleDelete}
              />
            </div>

            {/* RIGHT COLUMN: NOTLAR, DATES/STATUS & SIGNED DOCUMENTS */}
            <div className="lg:col-span-4 space-y-6">
              {activeDosyaId && (
                <DosyaNotlariWidget dosyaId={activeDosyaId} dosyaNo={activeDosya?.temin_no} />
              )}

              <TakipDosyaTarihlerWidget
                status={status}
                setStatus={setStatus}
                acilisTarihi={acilisTarihi}
                setAcilisTarihi={setAcilisTarihi}
                sonTeklifTarihi={sonTeklifTarihi}
                setSonTeklifTarihi={setSonTeklifTarihi}
                teminTarihi={teminTarihi}
                setTeminTarihi={setTeminTarihi}
                teslimTarihi={teslimTarihi}
                setTeslimTarihi={setTeslimTarihi}
                notlar={notlar}
                setNotlar={setNotlar}
                saveLoading={saveLoading}
                saveMessage={saveMessage}
                onSubmit={handleUpdateDosya}
              />

              <TakipUretilenBelgelerWidget
                dbBelgeler={dbBelgeler}
                onToggleSign={handleToggleSign}
              />
            </div>
          </div>

          {/* LOWER SECTIONS: FULL WIDTH */}
          <div className="space-y-6">
            <TakipAsamaStepper
              stages={stages}
              currentAsamaSira={currentAsamaSira}
              stageRoutes={STAGE_ROUTES}
              stageShortLabels={STAGE_SHORT_LABELS}
            />

            <TakipIsAkisiYonergesi />

            <TakipKalemlerVeFirmalarGrid kalemler={kalemler} firmalar={firmalar} />

            <TakipDosyaDetayBilgileri
              activeDosya={activeDosya}
              komisyonlar={komisyonlar}
              onEditClick={handleEditDosya}
            />

            <TakipAsamaAciklamalari stages={stages} currentAsamaSira={currentAsamaSira} />
          </div>
        </div>
      ) : (
        /* NO ACTIVE DOSSIER SELECTED STATE */
        <TakipGenelMetrikView
          dosyalar={dosyalar}
          allBelgeler={allBelgeler}
          stages={stages}
          dbAsamalar={dbAsamalar}
          formatCurrency={formatCurrency}
          setActiveDosyaId={setActiveDosyaId}
        />
      )}
    </div>
  )
}
