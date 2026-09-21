import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { FormBuilderV2Playground } from './components/FormBuilderV2Playground'

export default function FormBuilderScreen(): React.JSX.Element {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate({ to: '/sablonlar' })
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 p-4 animate-in fade-in duration-300">
      <FormBuilderV2Playground onBack={handleBack} />
    </div>
  )
}
