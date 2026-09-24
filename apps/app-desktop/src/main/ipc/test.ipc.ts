import { ipcMain, app } from 'electron'
import { spawn } from 'child_process'
import { join } from 'path'

export interface ParsedTestFile {
  path: string
  testsCount: number
  duration: string
  status: 'passed' | 'failed'
}

export interface TestResultOutput {
  success: boolean
  output: string
  exitCode: number | null
  stats?: {
    testFilesPassed: number
    testFilesTotal: number
    testsPassed: number
    testsTotal: number
    duration: string
    files: ParsedTestFile[]
  }
}

// eslint-disable-next-line no-control-regex
const ANSI_REGEX = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g

function stripAnsiCodes(str: string): string {
  return str
    .replace(ANSI_REGEX, '')
    .replace(/\r\n/g, '\n')
}

function parseVitestStats(rawText: string): TestResultOutput['stats'] {
  const text = stripAnsiCodes(rawText)
  const files: ParsedTestFile[] = []

  // Parse individual files like: ✓ src/shared/__tests__/sample.test.ts (2 tests) 5ms
  const fileRegex = /([✓✔xX✗])\s+([^\s(]+)\s+\((\d+)\s+tests?\)\s*(\d+ms|\d+\.?\d*s)?/g
  let match: RegExpExecArray | null
  while ((match = fileRegex.exec(text)) !== null) {
    const isPass = match[1] === '✓' || match[1] === '✔'
    files.push({
      status: isPass ? 'passed' : 'failed',
      path: match[2].trim(),
      testsCount: parseInt(match[3], 10) || 1,
      duration: match[4] || ''
    })
  }

  // Parse Test Files summary: Test Files  4 passed (4)
  const testFilesMatch = text.match(/Test Files\s+(\d+)\s+passed\s*\((\d+)\)/)
  const testFilesPassed = testFilesMatch ? parseInt(testFilesMatch[1], 10) : files.length
  const testFilesTotal = testFilesMatch ? parseInt(testFilesMatch[2], 10) : files.length

  // Parse Tests summary: Tests  14 passed (14)
  const testsMatch = text.match(/Tests\s+(\d+)\s+passed\s*\((\d+)\)/)
  const testsPassed = testsMatch
    ? parseInt(testsMatch[1], 10)
    : files.reduce((acc, f) => acc + f.testsCount, 0)
  const testsTotal = testsMatch ? parseInt(testsMatch[2], 10) : testsPassed

  // Parse Duration: Duration  1.97s
  const durationMatch = text.match(/Duration\s+([\d.]+m?s)/)
  const duration = durationMatch ? durationMatch[1] : ''

  return {
    testFilesPassed,
    testFilesTotal,
    testsPassed,
    testsTotal,
    duration,
    files
  }
}

/**
 * Registers IPC handlers for running unit/integration tests in dev mode.
 * @returns {void}
 */
export function registerTestIpcHandlers(): void {
  ipcMain.handle('dev:run-tests', async (): Promise<TestResultOutput> => {
    if (app.isPackaged) {
      return {
        success: false,
        output: 'Tests can only be executed in development mode.',
        exitCode: -1
      }
    }

    return new Promise((resolve) => {
      const desktopDir = join(__dirname, '../..')
      const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx'

      console.log('[Dev Test Runner] Starting Vitest run in:', desktopDir)

      const child = spawn(cmd, ['vitest', 'run', '--no-color'], {
        cwd: desktopDir,
        shell: true,
        env: {
          ...process.env,
          NODE_ENV: 'test',
          NO_COLOR: '1',
          FORCE_COLOR: '0'
        }
      })

      let rawOutput = ''

      child.stdout?.on('data', (data) => {
        const text = data.toString()
        rawOutput += text
      })

      child.stderr?.on('data', (data) => {
        const text = data.toString()
        rawOutput += text
      })

      child.on('close', (code) => {
        const cleanOutput = stripAnsiCodes(rawOutput).trim()
        const stats = parseVitestStats(cleanOutput)
        console.log(`[Dev Test Runner] Vitest completed with code ${code}`)

        resolve({
          success: code === 0,
          output: cleanOutput,
          exitCode: code,
          stats
        })
      })

      child.on('error', (err) => {
        console.error('[Dev Test Runner] Failed to start Vitest:', err)
        resolve({
          success: false,
          output: `Vitest süreci başlatılamadı: ${err.message}`,
          exitCode: -1
        })
      })
    })
  })
}
