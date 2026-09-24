import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { isSupportedFile, allExtensions, defaultFormat } from '../fileFormats'

describe('File Formats Configuration & Validation', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'temin360-test-'))
  })

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  it('should have a valid default format', () => {
    expect(defaultFormat).toBeDefined()
    expect(defaultFormat.ext).toBe('temin')
    expect(defaultFormat.isDefault).toBe(true)
  })

  it('should contain all expected extension definitions', () => {
    expect(allExtensions).toContain('temin')
    expect(allExtensions).toContain('hkmp')
    expect(allExtensions).toContain('dtal')
    expect(allExtensions).toContain('tmn360')
    expect(allExtensions).toContain('sqlite')
  })

  it('should return false for invalid or empty file paths', () => {
    expect(isSupportedFile('')).toBe(false)
    // @ts-expect-error testing runtime null safety
    expect(isSupportedFile(null)).toBe(false)
    // @ts-expect-error testing runtime undefined safety
    expect(isSupportedFile(undefined)).toBe(false)
    expect(isSupportedFile('-flag-arg')).toBe(false)
  })

  it('should return true for supported file extensions by path string', () => {
    expect(isSupportedFile('C:\\Projects\\test.temin')).toBe(true)
    expect(isSupportedFile('/user/docs/file.hkmp')).toBe(true)
    expect(isSupportedFile('archive.tmn360')).toBe(true)
    expect(isSupportedFile('data.dtal')).toBe(true)
  })

  it('should return false for unsupported file extensions', () => {
    expect(isSupportedFile('document.docx')).toBe(false)
    expect(isSupportedFile('script.js')).toBe(false)
    expect(isSupportedFile('executable.exe')).toBe(false)
  })

  it('should correctly strip surrounding quotes in file path', () => {
    expect(isSupportedFile('"project.temin"')).toBe(true)
    expect(isSupportedFile('  "project.dtal"  ')).toBe(true)
  })

  it('should identify a SQLite database file by magic bytes regardless of extension', () => {
    const customFilePath = path.join(tempDir, 'mydata.customext')
    // SQLite header magic string: 'SQLite format 3\0'
    const header = Buffer.from('SQLite format 3\0', 'binary')
    fs.writeFileSync(customFilePath, header)

    expect(isSupportedFile(customFilePath)).toBe(true)
  })

  it('should identify a ZIP/TEMIN archive file by PK magic bytes regardless of extension', () => {
    const zipFilePath = path.join(tempDir, 'data.unknown')
    // PK header: 0x50, 0x4B
    const header = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00])
    fs.writeFileSync(zipFilePath, header)

    expect(isSupportedFile(zipFilePath)).toBe(true)
  })
})
