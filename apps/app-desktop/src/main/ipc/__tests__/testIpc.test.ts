import { describe, it, expect, vi } from 'vitest'

// Mock Electron modules
vi.mock('electron', () => {
  const handlers: Record<string, (...args: unknown[]) => unknown> = {}
  return {
    app: {
      isPackaged: false
    },
    ipcMain: {
      handle: (channel: string, handler: (...args: unknown[]) => unknown) => {
        handlers[channel] = handler
      },
      _getHandler: (channel: string) => handlers[channel]
    }
  }
})

import { registerTestIpcHandlers } from '../test.ipc'
import { ipcMain } from 'electron'

describe('Test IPC Handlers Entegrasyonu', () => {
  it('should register dev:run-tests IPC channel', () => {
    registerTestIpcHandlers()
    // @ts-ignore
    const handler = ipcMain._getHandler('dev:run-tests')
    expect(handler).toBeDefined()
    expect(typeof handler).toBe('function')
  })
})
