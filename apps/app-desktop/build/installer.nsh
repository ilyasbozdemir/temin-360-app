!macro customInstall
  ; --- .temin Uzantısı (TEMİN 360 Varsayılan Proje Dosyası) ---
  WriteRegStr HKCU "Software\Classes\.temin" "" "Temin360.Document"
  WriteRegStr HKCU "Software\Classes\.temin" "Content Type" "application/x-temin"
  WriteRegStr HKCU "Software\Classes\.temin\ShellNew" "NullFile" ""
  WriteRegStr HKCU "Software\Classes\.temin\ShellNew" "ItemName" "TEMİN 360 Proje Dosyası"
  WriteRegStr HKCU "Software\Classes\.temin\ShellNew" "IconPath" '"$INSTDIR\TEMIN360.exe",0'

  ; --- Diğer Desteklenen Uzantılar ---
  WriteRegStr HKCU "Software\Classes\.tmn360" "" "Temin360.Document"
  WriteRegStr HKCU "Software\Classes\.tmn360" "Content Type" "application/x-tmn360"

  WriteRegStr HKCU "Software\Classes\.hkmp" "" "Temin360.Document"
  WriteRegStr HKCU "Software\Classes\.hkmp" "Content Type" "application/x-hkmp"

  WriteRegStr HKCU "Software\Classes\.dtal" "" "Temin360.Document"
  WriteRegStr HKCU "Software\Classes\.dtal" "Content Type" "application/x-dtal"

  WriteRegStr HKCU "Software\Classes\.dtm" "" "Temin360.Document"
  WriteRegStr HKCU "Software\Classes\.dtm" "Content Type" "application/x-dtm"

  WriteRegStr HKCU "Software\Classes\.dte" "" "Temin360.Document"
  WriteRegStr HKCU "Software\Classes\.dte" "Content Type" "application/x-dte"

  WriteRegStr HKCU "Software\Classes\.dta" "" "Temin360.Document"
  WriteRegStr HKCU "Software\Classes\.dta" "Content Type" "application/x-dta"

  ; --- ProgID Tanımı ve Açma Komutu ---
  WriteRegStr HKCU "Software\Classes\Temin360.Document" "" "TEMİN 360 Proje Dosyası"
  WriteRegStr HKCU "Software\Classes\Temin360.Document\DefaultIcon" "" '"$INSTDIR\TEMIN360.exe",0'
  WriteRegStr HKCU "Software\Classes\Temin360.Document\shell\open\command" "" '"$INSTDIR\TEMIN360.exe" "%1"'

  ; --- Windows Explorer'ı yenile ---
  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
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
  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend

