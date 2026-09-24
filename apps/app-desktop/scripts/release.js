/* eslint-disable */
#!/usr/bin/env node

/**
 * release.js - Otomatik Release & Tag Yönetim Scripti
 *
 * Yapılanlar:
 *   1. package.json'dan mevcut versiyonu okur
 *   2. versions.json'a yeni versiyonu ekler (eğer yoksa)
 *   3. Tüm değişiklikleri stage eder (git add .)
 *   4. "chore: release vX.Y.Z" commit mesajı ile commit atar
 *   5. "vX.Y.Z" tag'i oluşturur
 *   6. (Opsiyonel) commit ve tag'i remote'a push eder
 *
 * Kullanım:
 *   node scripts/release.js                  # Tam release (commit + tag + push)
 *   node scripts/release.js --no-push        # Push yapmadan (sadece commit + tag)
 *   node scripts/release.js --dry-run        # Hiçbir şey yapmadan ne yapılacağını göster
 *   node scripts/release.js --message "msg"  # Özel commit mesajı
 *   node scripts/release.js --patch          # Otomatik patch bump (beta.15 → beta.16)
 *   node scripts/release.js --skip-versions  # versions.json güncelleme
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// ─── Renk Yardımcıları ────────────────────────────────────
const c = {
  green: (t) => `\x1b[32m${t}\x1b[0m`,
  red: (t) => `\x1b[31m${t}\x1b[0m`,
  yellow: (t) => `\x1b[33m${t}\x1b[0m`,
  cyan: (t) => `\x1b[36m${t}\x1b[0m`,
  dim: (t) => `\x1b[2m${t}\x1b[0m`,
  bold: (t) => `\x1b[1m${t}\x1b[0m`
}

// ─── Argüman Parse ────────────────────────────────────────
const args = process.argv.slice(2)
const flags = {
  dryRun: args.includes('--dry-run'),
  noPush: args.includes('--no-push'),
  patch: args.includes('--patch'),
  skipVersions: args.includes('--skip-versions'),
  help: args.includes('--help') || args.includes('-h')
}

// --message "mesaj" desteği
let customMessage = null
const msgIdx = args.indexOf('--message')
if (msgIdx !== -1 && args[msgIdx + 1]) {
  customMessage = args[msgIdx + 1]
}
const msgShortIdx = args.indexOf('-m')
if (msgShortIdx !== -1 && args[msgShortIdx + 1]) {
  customMessage = args[msgShortIdx + 1]
}

// ─── Yardım ───────────────────────────────────────────────
if (flags.help) {
  console.log(`
${c.bold('📦 TEMİN 360 - Release Script')}

${c.cyan('Kullanım:')}
  node scripts/release.js [seçenekler]

${c.cyan('Seçenekler:')}
  ${c.yellow('--dry-run')}         Hiçbir değişiklik yapmadan ne yapılacağını gösterir
  ${c.yellow('--no-push')}         Sadece commit + tag oluşturur, push yapmaz
  ${c.yellow('--patch')}           Versiyon numarasını otomatik artırır (beta.15 → beta.16)
  ${c.yellow('--skip-versions')}   versions.json dosyasını güncellemeyi atlar
  ${c.yellow('--message, -m')}     Özel commit mesajı belirler
  ${c.yellow('--help, -h')}        Bu yardım mesajını gösterir

${c.cyan('Örnekler:')}
  node scripts/release.js                          # Tam release akışı
  node scripts/release.js --no-push                # Push'suz release
  node scripts/release.js --dry-run                # Önizleme modu
  node scripts/release.js --patch --no-push        # Versiyon artır, push yapma
  node scripts/release.js -m "feat: yeni özellik"  # Özel mesaj
`)
  process.exit(0)
}

// ─── Yardımcı Fonksiyonlar ────────────────────────────────
const ROOT = path.resolve(__dirname, '..')
const GIT_ROOT = path.resolve(__dirname, '../../..')

function exec(cmd, opts = {}) {
  try {
    return execSync(cmd, {
      cwd: opts.cwd || GIT_ROOT,
      encoding: 'utf-8',
      stdio: opts.silent ? 'pipe' : 'inherit',
      ...opts
    })
  } catch (err) {
    if (opts.ignoreError) return err.stdout || ''
    console.error(c.red(`\n❌ Komut başarısız: ${cmd}`))
    console.error(c.dim(err.message))
    process.exit(1)
  }
}

function execSilent(cmd) {
  return exec(cmd, { silent: true, ignoreError: true }).trim()
}

function readJSON(filePath) {
  const full = path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath)
  return JSON.parse(fs.readFileSync(full, 'utf-8'))
}

function writeJSON(filePath, data) {
  const full = path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath)
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

/**
 * Prerelease numarasını 1 artırır.
 * Örn: "1.0.0-beta.15" → "1.0.0-beta.16"
 */
function bumpPatch(version) {
  const match = version.match(/^(.+?)(\d+)$/)
  if (!match) {
    console.error(c.red(`❌ Versiyon formatı anlaşılamadı: ${version}`))
    process.exit(1)
  }
  return `${match[1]}${parseInt(match[2], 10) + 1}`
}

// ─── Ana Akış ─────────────────────────────────────────────
function main() {
  console.log(`\n${c.bold('📦 TEMİN 360 - Release Script')}\n`)

  // 1. Mevcut versiyonu oku
  const pkg = readJSON('package.json')
  let version = pkg.version

  if (flags.patch) {
    const oldVersion = version
    version = bumpPatch(version)
    console.log(c.cyan(`🔄 Versiyon bump: ${oldVersion} → ${c.bold(version)}`))

    if (!flags.dryRun) {
      pkg.version = version
      writeJSON('package.json', pkg)
    }
  }

  const tag = `v${version}`

  console.log(c.cyan(`📌 Versiyon: ${c.bold(version)}`))
  console.log(c.cyan(`🏷️  Tag:      ${c.bold(tag)}`))

  if (flags.dryRun) {
    console.log(c.yellow('\n⚠️  DRY RUN modu - hiçbir değişiklik yapılmayacak\n'))
  }

  // 2. Mevcut tag kontrolü
  const existingTags = execSilent('git tag --list')
  if (existingTags.split('\n').includes(tag)) {
    console.error(c.red(`\n❌ Tag "${tag}" zaten mevcut!`))
    console.error(c.dim("Versiyon numarasını artırın veya --patch flag'ini kullanın."))
    process.exit(1)
  }

  // 3. versions.json güncelle
  if (!flags.skipVersions) {
    const versionsPath = path.join(GIT_ROOT, 'packages/database/versions.json')
    let versions = []
    try {
      versions = readJSON(versionsPath)
    } catch {
      console.log(c.yellow('⚠️  versions.json bulunamadı, yeni oluşturulacak.'))
    }

    if (!versions.includes(version)) {
      console.log(c.green(`✅ versions.json'a "${version}" eklendi`))
      if (!flags.dryRun) {
        versions.push(version)
        writeJSON(versionsPath, versions)
      }
    } else {
      console.log(c.dim(`ℹ️  "${version}" zaten versions.json'da mevcut`))
    }
  } else {
    console.log(c.dim('ℹ️  versions.json güncellemesi atlandı (--skip-versions)'))
  }

  // 4. Git durumu kontrol et
  const status = execSilent('git status --porcelain')
  const hasChanges = status.length > 0

  if (hasChanges) {
    const changedFiles = status
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const flag = line.substring(0, 2).trim()
        const file = line.substring(3)
        const icon = flag === '??' ? '🆕' : flag === 'M' ? '📝' : flag === 'D' ? '🗑️' : '📄'
        return `  ${icon} ${file}`
      })

    console.log(c.cyan(`\n📂 Değişen dosyalar (${changedFiles.length}):`))
    changedFiles.forEach((f) => console.log(f))

    // Stage all
    if (!flags.dryRun) {
      console.log(c.cyan('\n📥 Tüm değişiklikler stage ediliyor...'))
      exec('git add .')
    } else {
      console.log(c.yellow('\n📥 [DRY RUN] git add . çalıştırılacak'))
    }
  } else {
    console.log(c.dim('\nℹ️  Commit edilecek değişiklik yok (clean working tree)'))
  }

  // 5. Commit
  const commitMsg = customMessage || `chore: release ${tag}`

  if (hasChanges || !flags.skipVersions) {
    // versions.json eklenmiş olabilir, tekrar stage edelim
    if (!flags.dryRun) {
      exec('git add .')
    }

    const stagedCheck = execSilent('git diff --cached --name-only')
    if (stagedCheck.length > 0 || hasChanges) {
      console.log(c.cyan(`\n💾 Commit: "${commitMsg}"`))
      if (!flags.dryRun) {
        exec(`git commit -m "${commitMsg}"`)
      } else {
        console.log(c.yellow(`[DRY RUN] git commit -m "${commitMsg}"`))
      }
    }
  }

  // 6. Release Notlarını Üret ve Tag oluştur
  const { generateReleaseNotes } = require('./generate-release-notes')
  const notes = generateReleaseNotes(tag)

  console.log(c.cyan(`\n📝 Sürüm Değişiklik Notları (Changelog):`))
  console.log(c.dim('─'.repeat(40)))
  console.log(notes)
  console.log(c.dim('─'.repeat(40)))

  console.log(c.cyan(`\n🏷️  Tag oluşturuluyor: ${tag}`))
  if (!flags.dryRun) {
    exec(`git tag -a ${tag} -m "Release ${tag}"`)
    console.log(c.green(`✅ Tag "${tag}" oluşturuldu`))
  } else {
    console.log(c.yellow(`[DRY RUN] git tag -a ${tag} -m "Release ${tag}"`))
  }

  // 7. Push
  if (!flags.noPush && !flags.dryRun) {
    console.log(c.cyan("\n🚀 Remote'a push ediliyor..."))
    exec('git push')
    exec(`git push origin ${tag}`)
    console.log(c.green('✅ Commit ve tag push edildi'))
  } else if (flags.noPush) {
    console.log(c.yellow('\nℹ️  Push atlandı (--no-push). Manuel push için:'))
    console.log(c.dim(`    git push && git push origin ${tag}`))
  }

  // 8. Özet
  console.log(`\n${c.bold('─'.repeat(50))}`)
  console.log(c.bold(c.green('\n🎉 Release tamamlandı!\n')))
  console.log(`  📌 Versiyon  : ${c.bold(version)}`)
  console.log(`  🏷️  Tag       : ${c.bold(tag)}`)
  console.log(`  💾 Commit    : ${commitMsg}`)
  console.log(
    `  🚀 Push      : ${flags.noPush || flags.dryRun ? c.yellow('Hayır') : c.green('Evet')}`
  )

  if (flags.dryRun) {
    console.log(c.yellow('\n  ⚠️  DRY RUN - Hiçbir değişiklik yapılmadı'))
  }

  console.log('')
}

main()
