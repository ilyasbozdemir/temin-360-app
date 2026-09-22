const fs = require('fs')
const path = require('path')
const { spawn, execSync } = require('child_process')
const http = require('http')

const POCKETBASE_VERSION = '0.23.4'
const BIN_DIR = path.join(__dirname, '..', 'pocketbase_bin')
const EXE_PATH = path.join(BIN_DIR, 'pocketbase.exe')
const ZIP_PATH = path.join(BIN_DIR, 'pocketbase.zip')
const DOWNLOAD_URL = `https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_windows_amd64.zip`

function isPortInUse(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/api/health`, (res) => {
      resolve(true)
    })
    req.on('error', () => {
      resolve(false)
    })
    req.setTimeout(1000, () => {
      req.destroy()
      resolve(false)
    })
  })
}

async function downloadFile(url, dest) {
  const command = `powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '${url}' -OutFile '${dest}'"`
  execSync(command, { stdio: 'inherit' })
}

async function startLocalExecutable() {
  const inUse = await isPortInUse(8090)
  if (inUse) {
    console.log('⚡ PocketBase zaten 8090 portunda aktif ve çalışıyor! (http://127.0.0.1:8090)')
    console.log('📌 Admin Paneli: http://127.0.0.1:8090/_/\n')
    return
  }

  if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR, { recursive: true })
  }

  if (!fs.existsSync(EXE_PATH)) {
    console.log(`📥 Yerel PocketBase v${POCKETBASE_VERSION} indiriliyor (${DOWNLOAD_URL})...`)
    try {
      await downloadFile(DOWNLOAD_URL, ZIP_PATH)
      console.log('📦 Zip dosyası açılıyor...')
      execSync(`powershell -Command "Expand-Archive -Path '${ZIP_PATH}' -DestinationPath '${BIN_DIR}' -Force"`, { stdio: 'inherit' })
      if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH)
      console.log('✓ PocketBase.exe başarıyla hazırlandı!')
    } catch (err) {
      console.error('❌ PocketBase indirilemedi:', err.message)
      console.log('👉 Lütfen https://pocketbase.io/docs/ adresinden indirip pocketbase.exe dosyasını ' + BIN_DIR + ' klasörüne yerleştirin.')
      process.exit(1)
    }
  }

  console.log('\n🚀 PocketBase 8090 portunda başlatılıyor (http://127.0.0.1:8090)...')
  console.log('📌 PocketBase Admin Paneli: http://127.0.0.1:8090/_/\n')
  
  const pbProcess = spawn(EXE_PATH, ['serve', '--http=127.0.0.1:8090'], { stdio: 'inherit', cwd: BIN_DIR })
  pbProcess.on('error', (err) => {
    console.error('PocketBase çalıştırma hatası:', err)
  })
}

startLocalExecutable()
