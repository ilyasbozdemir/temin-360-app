import { ipcMain, app } from 'electron'
import { spawn } from 'child_process'
import { join } from 'path'

export interface TestResultOutput {
  success: boolean
  output: string
  exitCode: number | null
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

      const child = spawn(cmd, ['vitest', 'run'], {
        cwd: desktopDir,
        shell: true,
        env: { ...process.env, NODE_ENV: 'test' }
      })

      let output = ''

      child.stdout?.on('data', (data) => {
        const text = data.toString()
        output += text
        console.log('[Vitest stdout]:', text)
      })

      child.stderr?.on('data', (data) => {
        const text = data.toString()
        output += text
        console.warn('[Vitest stderr]:', text)
      })

      child.on('close', (code) => {
        console.log(`[Dev Test Runner] Vitest process exited with code ${code}`)
        resolve({
          success: code === 0,
          output,
          exitCode: code
        })
      })

      child.on('error', (err) => {
        console.error('[Dev Test Runner] Failed to start Vitest:', err)
        resolve({
          success: false,
          output: `Failed to execute tests: ${err.message}\n${output}`,
          exitCode: -1
        })
      })
    })
  })
}
