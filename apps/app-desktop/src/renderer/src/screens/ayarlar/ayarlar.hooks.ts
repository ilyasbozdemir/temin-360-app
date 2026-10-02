import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useWorkspaceStore } from '../../store/workspaceStore'

const fetchAllSettings = async (): Promise<Record<string, string>> => {
  const res = await window.electron.ipcRenderer.invoke('db:get-settings')
  if (res && typeof res === 'object') {
    return res as Record<string, string>
  }
  return {}
}

interface AyarlarHooksReturn {
  settings: Record<string, string>
  isLoadingSettings: boolean
  updateSetting: (params: { key: string; value: string }) => Promise<unknown>
  saveSettings: (settingsMap: Record<string, string>) => Promise<unknown>
  importSmtp: () => Promise<unknown>
  exportSmtp: () => Promise<unknown>
}

const EMPTY_SETTINGS: Record<string, string> = {}

export function useAyarlarHooks(): AyarlarHooksReturn {
  const queryClient = useQueryClient()

  const { data: settings = EMPTY_SETTINGS, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['allSettings'],
    queryFn: fetchAllSettings
  })

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const res = await window.electron.ipcRenderer.invoke('db:save-settings', { [key]: value })
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allSettings'] })
  })

  const saveSettingsMutation = useMutation({
    mutationFn: async (settingsMap: Record<string, string>) => {
      const res = await window.electron.ipcRenderer.invoke('db:save-settings', settingsMap)
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSettings'] })
      useWorkspaceStore.getState().loadActiveMeta()
    }
  })

  const importSmtpMutation = useMutation({
    mutationFn: async () => {
      const res = await window.electron.ipcRenderer.invoke('db:import-smtp')
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allSettings'] })
  })

  const exportSmtpMutation = useMutation({
    mutationFn: async () => {
      const res = await window.electron.ipcRenderer.invoke('db:export-smtp')
      if (!res.success) throw new Error(res.error)
      return res
    }
  })

  return {
    settings,
    isLoadingSettings,
    updateSetting: updateSettingMutation.mutateAsync,
    saveSettings: saveSettingsMutation.mutateAsync,
    importSmtp: importSmtpMutation.mutateAsync,
    exportSmtp: exportSmtpMutation.mutateAsync
  }
}
