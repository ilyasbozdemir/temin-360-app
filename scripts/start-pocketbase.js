const fs = require('fs')
const path = require('path')
const { spawn, execSync } = require('child_process')

const POCKETBASE_VERSION = '0.23.4'
const BIN_DIR = path.join(__dirname, '..', 'pocketbase_bin')
const EXE_PATH = path.join(BIN_DIR, 'pocketbase.exe')
const ZIP_PATH = path.join(BIN_DIR, 'pocketbase.zip')
const DOWNLOAD_URL = `https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_windows_amd64.zip`

async function downloadFile(url, dest) {
  const command = `powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '${url}' -OutFile '${dest}'"`
  execSync(command, { stdio: 'inherit' })
}

async function startLocalExecutable() {
  if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR, { recursive: true })
  }

  if (!fs.existsSync(EXE_PATH)) {
    console.log(`📥 Yerel PocketBase v${POCKETBASE_VERSION} indiriliyor...`)
    try {
      await downloadFile(DOWNLOAD_URL, ZIP_PATH)
      console.log('📦 Zip dosyası açılıyor...')
      execSync(`powershell -Command "Expand-Archive -Path '${ZIP_PATH}' -DestinationPath '${BIN_DIR}' -Force"`, { stdio: 'inherit' })
      if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH)
      console.log('✓ PocketBase.exe hazırlandı!')
    } catch (err) {
      console.error('❌ PocketBase indirilemedi:', err.message)
      console.log('👉 Lütfen https://pocketbase.io/docs/ adresinden indirip pocketbase.exe dosyasını ' + BIN_DIR + ' klasörüne yerleştirin.')
      process.exit(1)
    }
  }

  console.log('\n🚀 PocketBase 8090 portunda çalışıyor (http://127.0.0.1:8090)...')
  console.log('📌 PocketBase Admin Paneli: http://127.0.0.1:8090/_/\n')
  
  const pbProcess = spawn(EXE_PATH, ['serve', '--http=127.0.0.1:8090'], { stdio: 'inherit', cwd: BIN_DIR })
  pbProcess.on('error', (err) => {
    console.error('PocketBase çalıştırma hatası:', err)
  })
}

async function main() {
  // Docker dene, hata alırsan veya imaj çekilemezse otomatik olarak yerel .exe'ye düş
  try {
    const dockerCheck = execSync('docker info', { stdio: 'ignore', timeout: 2000 })
    console.log('⚡ Docker daemon tespit edildi. Docker Compose ile deneniyor...')
    execSync('docker compose up -d pocketbase', { stdio: 'inherit', shell: true })
    console.log('✓ PocketBase Docker kapsayıcısı başarıyla başlatıldı!')
    return
  } catch (dockerErr) {
    console.log('ℹ️ Docker kapalı veya imaj çekilemedi. Otomatik Yerel Executable (.exe) moduna geçiliyor...')
  }

  await startLocalExecutable()
}

main()
