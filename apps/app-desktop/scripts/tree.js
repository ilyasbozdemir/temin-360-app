/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs')
const path = require('path')

/**
 * Recursively prints directory tree structure.
 * @param {string} dir
 * @param {string} [prefix='']
 * @returns {void}
 */
function printTree(dir, prefix = '') {
  const files = fs.readdirSync(dir)
  files.forEach((file, index) => {
    const isFileLast = index === files.length - 1
    const filePath = path.join(dir, file)
    const stats = fs.statSync(filePath)

    const branch = isFileLast ? '└── ' : '├── '
    const nextPrefix = prefix + (isFileLast ? '    ' : '│   ')

    if (stats.isDirectory()) {
      console.log(`${prefix}${branch}📁 ${file}/`)
      printTree(filePath, nextPrefix)
    } else {
      console.log(`${prefix}${branch}📄 ${file}`)
    }
  })
}

console.log('📁 src/')
printTree(path.join(__dirname, '../src'))
