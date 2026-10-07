import React from 'react'
import { Modal } from './Modal'
import { useGoogleDrive } from './google-drive/useGoogleDrive'
import { AuthSection } from './google-drive/AuthSection'
import { DriveActionCards, StatusAlert } from './google-drive/DriveActionCards'
import { DriveFileList } from './google-drive/DriveFileList'

interface GoogleDriveModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GoogleDriveModal({ isOpen, onClose }: GoogleDriveModalProps): React.JSX.Element {
  const gd = useGoogleDrive(isOpen, onClose)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Google Drive Bulut Entegrasyonu"
      description="Google hesabınızla giriş yaparak çalışma dosyalarınızı buluta yedekleyin veya mevcut yedeklerinizi indirin."
      className="max-w-7xl"
    >
      <div className="space-y-5">
        <AuthSection gd={gd} />
        <StatusAlert msg={gd.statusMsg} />
        <DriveActionCards gd={gd} />
        <DriveFileList gd={gd} />
      </div>
    </Modal>
  )
}
