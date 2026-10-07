import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '../Input'

interface SecretInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  iconSize?: number
}

/** Göster/gizle butonlu parola tipi input. */
export function SecretInput({
  value,
  onChange,
  placeholder,
  className = '',
  iconSize = 13
}: SecretInputProps): React.JSX.Element {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <Input
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-mono pr-8 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        title={visible ? 'Gizle' : 'Göster'}
      >
        {visible ? <EyeOff size={iconSize} /> : <Eye size={iconSize} />}
      </button>
    </div>
  )
}
