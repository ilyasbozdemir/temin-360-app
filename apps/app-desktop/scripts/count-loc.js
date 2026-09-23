/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs')
const path = require('path')

const targetDir = path.join(__dirname, '../src')
const outputFile = path.join(__dirname, '../src/renderer/src/generated-loc.json')

let totalFiles = 0
let totalLines = 0
let codeLines = 0 // lines that are not empty

const allowedExtensions = ['.ts', '.tsx', '.css', '.html', '.js', '.jsx']

/**
 * Recursively counts lines of code in the given directory.
 * @param {string} dir
 * @returns {void}
 */
function countLoc(dir) {
  if (!fs.existsSync(dir)) return
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stats = fs.statSync(filePath)
    if (stats.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== 'out' && file !== '.git') {
        countLoc(filePath)
      }
    } else {
      const ext = path.extname(file).toLowerCase()
      if (allowedExtensions.includes(ext)) {
        totalFiles++
        const content = fs.readFileSync(filePath, 'utf-8')
        const lines = content.split(/\r?\n/)
        totalLines += lines.length
        for (const line of lines) {
          if (line.trim().length > 0) {
            codeLines++
          }
        }
      }
    }
  }
}

countLoc(targetDir)

const result = {
  totalFiles,
  totalLines,
  codeLines,
  timestamp: new Date().toISOString()
}

// Make sure the target directory exists
const outputDir = path.dirname(outputFile)
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

fs.writeFileSync(outputFile, JSON.stringify(result, null, 2))
console.log(
  `[LOC Counter] Counted ${codeLines} code lines (${totalLines} total lines) across ${totalFiles} files.`
)
