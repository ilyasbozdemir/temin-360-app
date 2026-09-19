!macro customInstall
  ; --- 1. Uzantı Tanımları (Extension Registrations) ---
  ; .temin (Varsayılan TEMİN 360 Proje Dosyası)
  WriteRegStr HKCU "Software\Classes\.temin" "" "Temin360.Document"
  WriteRegStr HKCU "Software\Classes\.temin" "Content Type" "application/x-temin"
  WriteRegStr HKCU "Software\Classes\.temin\OpenWithProgids" "Temin360.Document" ""
  WriteRegStr HKCU "Software\Classes\.temin\DefaultIcon" "" "$INSTDIR\TEMIN360.exe,0"
  WriteRegStr HKCU "Software\Classes\.temin\ShellNew" "NullFile" ""
  WriteRegStr HKCU "Software\Classes\.temin\ShellNew" "ItemName" "TEMİN 360 Proje Dosyası"
  WriteRegStr HKCU "Software\Classes\.temin\ShellNew" "IconPath" "$INSTDIR\TEMIN360.exe,0"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.temin\OpenWithProgids" "Temin360.Document" ""
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.temin\UserChoice"

  ; .dtal (Eski TEMİN 360 / DTAL Veri Dosyası)
  WriteRegStr HKCU "Software\Classes\.dtal" "" "Temin360.Document"
  WriteRegStr HKCU "Software\Classes\.dtal" "Content Type" "application/x-dtal"
  WriteRegStr HKCU "Software\Classes\.dtal\OpenWithProgids" "Temin360.Document" ""
  WriteRegStr HKCU "Software\Classes\.dtal\DefaultIcon" "" "$INSTDIR\TEMIN360.exe,0"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.dtal\OpenWithProgids" "Temin360.Document" ""
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.dtal\UserChoice"

  ; .hkmp (Eski Hakim Pro Proje Dosyası)
  WriteRegStr HKCU "Software\Classes\.hkmp" "" "Temin360.Document"
  WriteRegStr HKCU "Software\Classes\.hkmp" "Content Type" "application/x-hkmp"
  WriteRegStr HKCU "Software\Classes\.hkmp\OpenWithProgids" "Temin360.Document" ""
  WriteRegStr HKCU "Software\Classes\.hkmp\DefaultIcon" "" "$INSTDIR\TEMIN360.exe,0"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.hkmp\OpenWithProgids" "Temin360.Document" ""
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.hkmp\UserChoice"

  ; .dtm (TEMİN 360 Veri / Şablon Dosyası)
  WriteRegStr HKCU "Software\Classes\.dtm" "" "Temin360.Document"
  WriteRegStr HKCU "Software\Classes\.dtm" "Content Type" "application/x-dtm"
  WriteRegStr HKCU "Software\Classes\.dtm\OpenWithProgids" "Temin360.Document" ""
  WriteRegStr HKCU "Software\Classes\.dtm\DefaultIcon" "" "$INSTDIR\TEMIN360.exe,0"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.dtm\OpenWithProgids" "Temin360.Document" ""
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.dtm\UserChoice"

  ; .dte (TEMİN 360 Ek Veri Aktarım Dosyası)
  WriteRegStr HKCU "Software\Classes\.dte" "" "Temin360.Document"
  WriteRegStr HKCU "Software\Classes\.dte" "Content Type" "application/x-dte"
  WriteRegStr HKCU "Software\Classes\.dte\OpenWithProgids" "Temin360.Document" ""
  WriteRegStr HKCU "Software\Classes\.dte\DefaultIcon" "" "$INSTDIR\TEMIN360.exe,0"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.dte\OpenWithProgids" "Temin360.Document" ""
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.dte\UserChoice"

  ; .dta (TEMİN 360 Arşiv Veri Dosyası)
  WriteRegStr HKCU "Software\Classes\.dta" "" "Temin360.Document"
  WriteRegStr HKCU "Software\Classes\.dta" "Content Type" "application/x-dta"
  WriteRegStr HKCU "Software\Classes\.dta\OpenWithProgids" "Temin360.Document" ""
  WriteRegStr HKCU "Software\Classes\.dta\DefaultIcon" "" "$INSTDIR\TEMIN360.exe,0"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.dta\OpenWithProgids" "Temin360.Document" ""
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.dta\UserChoice"

  ; .tmn360 (TEMİN 360 Arşiv Paketi)
  WriteRegStr HKCU "Software\Classes\.tmn360" "" "Temin360.Document"
  WriteRegStr HKCU "Software\Classes\.tmn360" "Content Type" "application/x-tmn360"
  WriteRegStr HKCU "Software\Classes\.tmn360\OpenWithProgids" "Temin360.Document" ""
  WriteRegStr HKCU "Software\Classes\.tmn360\DefaultIcon" "" "$INSTDIR\TEMIN360.exe,0"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.tmn360\OpenWithProgids" "Temin360.Document" ""
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.tmn360\UserChoice"

  ; --- 2. ProgID Tanımı, İkon ve Açma Komutu ---
  WriteRegStr HKCU "Software\Classes\Temin360.Document" "" "TEMİN 360 Proje Dosyası"
  WriteRegStr HKCU "Software\Classes\Temin360.Document\DefaultIcon" "" "$INSTDIR\TEMIN360.exe,0"
  WriteRegStr HKCU "Software\Classes\Temin360.Document\shell" "" "open"
  WriteRegStr HKCU "Software\Classes\Temin360.Document\shell\open" "" "TEMİN 360 ile Aç"
  WriteRegStr HKCU "Software\Classes\Temin360.Document\shell\open\command" "" '"$INSTDIR\TEMIN360.exe" "%1"'

  ; --- 3. Applications Kaydı ---
  WriteRegStr HKCU "Software\Classes\Applications\TEMIN360.exe" "FriendlyAppName" "TEMİN 360"
  WriteRegStr HKCU "Software\Classes\Applications\TEMIN360.exe\DefaultIcon" "" "$INSTDIR\TEMIN360.exe,0"
  WriteRegStr HKCU "Software\Classes\Applications\TEMIN360.exe\shell\open\command" "" '"$INSTDIR\TEMIN360.exe" "%1"'
  WriteRegStr HKCU "Software\Classes\Applications\TEMIN360.exe\SupportedTypes" ".temin" ""
  WriteRegStr HKCU "Software\Classes\Applications\TEMIN360.exe\SupportedTypes" ".dtal" ""
  WriteRegStr HKCU "Software\Classes\Applications\TEMIN360.exe\SupportedTypes" ".hkmp" ""
  WriteRegStr HKCU "Software\Classes\Applications\TEMIN360.exe\SupportedTypes" ".dtm" ""
  WriteRegStr HKCU "Software\Classes\Applications\TEMIN360.exe\SupportedTypes" ".dte" ""
  WriteRegStr HKCU "Software\Classes\Applications\TEMIN360.exe\SupportedTypes" ".dta" ""
  WriteRegStr HKCU "Software\Classes\Applications\TEMIN360.exe\SupportedTypes" ".tmn360" ""

  ; --- 4. Windows Explorer İkon ve İlişkilendirme Önbelleğini Yenile ---
  System::Call 'shell32.dll::SHChangeNotify(i 0x08000000, i 0, i 0, i 0)'
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\Classes\.temin"
  DeleteRegKey HKCU "Software\Classes\.tmn360"
  DeleteRegKey HKCU "Software\Classes\.hkmp"
  DeleteRegKey HKCU "Software\Classes\.dtal"
  DeleteRegKey HKCU "Software\Classes\.dtm"
  DeleteRegKey HKCU "Software\Classes\.dte"
  DeleteRegKey HKCU "Software\Classes\.dta"
  DeleteRegKey HKCU "Software\Classes\Temin360.Document"
  DeleteRegKey HKCU "Software\Classes\HakimPro.Document"
  DeleteRegKey HKCU "Software\Classes\Applications\TEMIN360.exe"
  System::Call 'shell32.dll::SHChangeNotify(i 0x08000000, i 0, i 0, i 0)'
!macroend
