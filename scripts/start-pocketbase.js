const fs = require('fs')
const path = require('path')
const { spawn, execSync } = require('child_process')
const https = require('https')

const POCKETBASE_VERSION = '0.23.4'
const BIN_DIR = path.join(__dirname, '..', 'pocketbase_bin')
const EXE_PATH = path.join(BIN_DIR, 'pocketbase.exe')
const ZIP_PATH = path.join(BIN_DIR, 'pocketbase.zip')
const DOWNLOAD_URL = `https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_windows_amd64.zip`

async function downloadFile(url, dest) {
  const command = `powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '${url}' -OutFile '${dest}'"`
  execSync(command, { stdio: 'inherit' })
}

async function main() {
  if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR, { recursive: true })
  }

  // Docker kontrolü dene (Docker çalışıyorsa docker compose ile başlat)
  try {
    const dockerCheck = execSync('docker info', { stdio: 'ignore', timeout: 3000 })
    console.log('⚡ Docker daemon tespit edildi. Docker Compose ile başlatılıyor...')
    const child = spawn('docker', ['compose', 'up', '-d', 'pocketbase'], { stdio: 'inherit', shell: true })
    child.on('exit', (code) => process.exit(code || 0))
    return
  } catch {
    console.log('ℹ️ Docker aktif değil. Yerel PocketBase Executable (.exe) kontrol ediliyor...')
  }

  // Docker yoksa veya çalışmıyorsa doğrudan PocketBase .exe indir & çalıştır
  if (!fs.existsSync(EXE_PATH)) {
    console.log(`📥 PocketBase v${POCKETBASE_VERSION} indiriliyor (${DOWNLOAD_URL})...`)
    try {
      await downloadFile(DOWNLOAD_URL, ZIP_PATH)
      console.log('📦 Zip dosyası açılıyor...')
      // PowerShell tar/Expand-Archive ile zipten çıkar
      execSync(`powershell -Command "Expand-Archive -Path '${ZIP_PATH}' -DestinationPath '${BIN_DIR}' -Force"`, { stdio: 'inherit' })
      if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH)
      console.log('✓ PocketBase.exe hazırlandı!')
    } catch (err) {
      console.error('❌ PocketBase indirilemedi:', err.message)
      console.log('👉 Lütfen https://pocketbase.io/docs/ adresinden indirip pocketbase.exe dosyasını ' + BIN_DIR + ' klasörüne yerleştirin.')
      process.exit(1)
    }
  }

  console.log('🚀 PocketBase 8090 portunda başlatılıyor (http://127.0.0.1:8090)...')
  console.log('📌 Admin Paneli: http://127.0.0.1:8090/_/')
  
  const pbProcess = spawn(EXE_PATH, ['serve', '--http=127.0.0.1:8090'], { stdio: 'inherit', cwd: BIN_DIR })

  pbProcess.on('error', (err) => {
    console.error('PocketBase çalıştırma hatası:', err)
  })
}

main()
