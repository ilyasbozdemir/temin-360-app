!macro customInstall
  ; --- 1. Uzantı Tanımı (Sadece .temin) ---
  WriteRegStr HKCU "Software\Classes\.temin" "" "Temin360.Document"
  WriteRegStr HKCU "Software\Classes\.temin" "Content Type" "application/x-temin"
  WriteRegStr HKCU "Software\Classes\.temin\OpenWithProgids" "Temin360.Document" ""
  WriteRegStr HKCU "Software\Classes\.temin\DefaultIcon" "" "$INSTDIR\resources\icon.ico"
  WriteRegStr HKCU "Software\Classes\.temin\ShellNew" "NullFile" ""
  WriteRegStr HKCU "Software\Classes\.temin\ShellNew" "ItemName" "TEMİN 360 Proje Dosyası"
  WriteRegStr HKCU "Software\Classes\.temin\ShellNew" "IconPath" "$INSTDIR\resources\icon.ico"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.temin\OpenWithProgids" "Temin360.Document" ""
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.temin\UserChoice"

  ; Eski kayıtları temizle
  DeleteRegKey HKCU "Software\Classes\.dtal"
  DeleteRegKey HKCU "Software\Classes\.hkmp"
  DeleteRegKey HKCU "Software\Classes\.dtm"
  DeleteRegKey HKCU "Software\Classes\.dte"
  DeleteRegKey HKCU "Software\Classes\.dta"
  DeleteRegKey HKCU "Software\Classes\.tmn360"

  ; --- 2. ProgID Tanımı, İkon ve Açma Komutu ---
  WriteRegStr HKCU "Software\Classes\Temin360.Document" "" "TEMİN 360 Proje Dosyası"
  WriteRegStr HKCU "Software\Classes\Temin360.Document\DefaultIcon" "" "$INSTDIR\resources\icon.ico"
  WriteRegStr HKCU "Software\Classes\Temin360.Document\shell" "" "open"
  WriteRegStr HKCU "Software\Classes\Temin360.Document\shell\open" "" "TEMİN 360 ile Aç"
  WriteRegStr HKCU "Software\Classes\Temin360.Document\shell\open\command" "" '"$INSTDIR\TEMIN360.exe" "%1"'

  ; --- 3. Applications Kaydı ---
  WriteRegStr HKCU "Software\Classes\Applications\TEMIN360.exe" "FriendlyAppName" "TEMİN 360"
  WriteRegStr HKCU "Software\Classes\Applications\TEMIN360.exe\DefaultIcon" "" "$INSTDIR\resources\icon.ico"
  WriteRegStr HKCU "Software\Classes\Applications\TEMIN360.exe\shell\open\command" "" '"$INSTDIR\TEMIN360.exe" "%1"'
  WriteRegStr HKCU "Software\Classes\Applications\TEMIN360.exe\SupportedTypes" ".temin" ""

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
