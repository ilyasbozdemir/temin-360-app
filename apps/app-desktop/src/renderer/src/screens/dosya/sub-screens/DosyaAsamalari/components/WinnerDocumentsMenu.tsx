import type { ReactElement } from 'react'
import {
  Building2,
  ChevronDown,
  Clock,
  FileCheck,
  Files,
  FileSignature,
  FileText,
  History,
  Shield,
  ShieldCheck,
  ShoppingCart
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/DropdownMenu'

interface WinnerDocumentsMenuProps {
  sozlesmeYapilacakMi?: boolean
  onPrintResultApproval: () => void
  onPrintAcceptanceLetter: () => void
  onPrintOrderForm?: () => void
  onPrintContractInvitation?: () => void
  onPrintContract?: () => void
  onPrintContractAlternative?: () => void
  onPrintContractLong?: () => void
  onEkapBlacklistQuery: () => void
  onEdevletBlacklistQuery: () => void
  onViewFirmaDetails?: () => void
  onViewTeklifHistory?: () => void
}

export function WinnerDocumentsMenu({
  sozlesmeYapilacakMi,
  onPrintResultApproval,
  onPrintAcceptanceLetter,
  onPrintOrderForm,
  onPrintContractInvitation,
  onPrintContract,
  onPrintContractAlternative,
  onPrintContractLong,
  onEkapBlacklistQuery,
  onEdevletBlacklistQuery,
  onViewFirmaDetails,
  onViewTeklifHistory
}: WinnerDocumentsMenuProps): ReactElement {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded-xl bg-slate-800 dark:bg-slate-700 px-3.5 py-2.5 text-xs font-bold text-white transition-all hover:bg-slate-700 dark:hover:bg-slate-600 shadow-sm hover:shadow-md cursor-pointer">
          <Files className="h-4 w-4" />
          Belge İşlemleri
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-1.5">
        {/* ── 📑 Temel Belgeler ── */}
        <DropdownMenuLabel className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1">
          📑 Karar & Tebliğ Belgeleri
        </DropdownMenuLabel>

        <DropdownMenuItem onClick={onPrintResultApproval} className="cursor-pointer">
          <FileCheck className="mr-2 h-4 w-4 text-emerald-500" />
          <span>Sonuç Onay Belgesi</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onPrintAcceptanceLetter} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4 text-blue-500" />
          <span>Kabul Edilen Teklif / Kabul Yazısı</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onPrintOrderForm}
          disabled={!onPrintOrderForm}
          className="cursor-pointer"
        >
          <ShoppingCart className="mr-2 h-4 w-4 text-amber-500" />
          <span>Sipariş Formu</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />

        {/* ── 📝 Sözleşme Belgeleri ── */}
        <DropdownMenuLabel className="flex items-center justify-between gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1">
          <span>📝 Sözleşme Belgeleri</span>
          {sozlesmeYapilacakMi ? (
            <span className="text-[9px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
              Sözleşme Aktif
            </span>
          ) : (
            <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              Opsiyonel
            </span>
          )}
        </DropdownMenuLabel>

        {onPrintContractInvitation && (
          <DropdownMenuItem onClick={onPrintContractInvitation} className="cursor-pointer">
            <Clock className="mr-2 h-4 w-4 text-violet-500" />
            <span>Sözleşmeye Davet Mektubu</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={onPrintContract}
          disabled={!onPrintContract}
          className="cursor-pointer"
        >
          <FileSignature className="mr-2 h-4 w-4 text-violet-600" />
          <span>Doğrudan Temin Sözleşmesi (Standart)</span>
        </DropdownMenuItem>

        {onPrintContractAlternative && (
          <DropdownMenuItem onClick={onPrintContractAlternative} className="cursor-pointer">
            <FileSignature className="mr-2 h-4 w-4 text-purple-400" />
            <span>Doğrudan Temin Sözleşmesi (Alternatif)</span>
          </DropdownMenuItem>
        )}

        {onPrintContractLong && (
          <DropdownMenuItem onClick={onPrintContractLong} className="cursor-pointer">
            <FileSignature className="mr-2 h-4 w-4 text-fuchsia-500" />
            <span>Doğrudan Temin Sözleşmesi (Uzun Form)</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="my-1" />

        {/* ── 🔎 Sorgulamalar ── */}
        <DropdownMenuLabel className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1">
          🔎 Yasaklılık & Kontrol
        </DropdownMenuLabel>

        <DropdownMenuItem onClick={onEkapBlacklistQuery} className="cursor-pointer">
          <ShieldCheck className="mr-2 h-4 w-4 text-orange-500" />
          <span>EKAP Yasaklı Sorgulama</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onEdevletBlacklistQuery} className="cursor-pointer">
          <Shield className="mr-2 h-4 w-4 text-indigo-500" />
          <span>e-Devlet KİK Sorgulama</span>
        </DropdownMenuItem>

        {(onViewFirmaDetails || onViewTeklifHistory) && (
          <>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuLabel className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1">
              👤 Firma & Teklif
            </DropdownMenuLabel>

            {onViewFirmaDetails && (
              <DropdownMenuItem onClick={onViewFirmaDetails} className="cursor-pointer">
                <Building2 className="mr-2 h-4 w-4 text-cyan-500" />
                <span>Firma Bilgileri</span>
              </DropdownMenuItem>
            )}

            {onViewTeklifHistory && (
              <DropdownMenuItem onClick={onViewTeklifHistory} className="cursor-pointer">
                <History className="mr-2 h-4 w-4 text-slate-500" />
                <span>Teklif Geçmişi</span>
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
