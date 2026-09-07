import { Settings, Mail, Palette, Bot, Archive, RefreshCw, Code } from 'lucide-react'
import { InnerMenuItem } from '../../components/ui/InnerMenu'

export const menuItems: InnerMenuItem[] = [
  {
    id: 'genel',
    label: 'Genel Ayarlar',
    icon: <Settings className="w-4 h-4 shrink-0" />
  },
  { id: 'div0', label: '', icon: null, isDivider: true },
  {
    id: 'smtp',
    label: 'SMTP Ayarları',
    icon: <Mail className="w-4 h-4 shrink-0" />
  },
  { id: 'div1', label: '', icon: null, isDivider: true },
  {
    id: 'tema',
    label: 'Renk & Tema',
    icon: <Palette className="w-4 h-4 shrink-0" />
  },
  { id: 'div2', label: '', icon: null, isDivider: true },
  {
    id: 'ai',
    label: 'Yapay Zeka',
    icon: <Bot className="w-4 h-4 shrink-0" />
  },
  { id: 'div3', label: '', icon: null, isDivider: true },
  {
    id: 'archive',
    label: 'Veri & Arşiv',
    icon: <Archive className="w-4 h-4 shrink-0" />
  },
  { id: 'div4', label: '', icon: null, isDivider: true },
  {
    id: 'sync',
    label: 'Web Senkronizasyon',
    icon: <RefreshCw className="w-4 h-4 shrink-0" />
  },

  ...(import.meta.env.DEV
    ? [
        { id: 'div5', label: '', icon: null, isDivider: true },
        {
          id: 'developer',
          label: 'Geliştirici & Test',
          icon: <Code className="w-4 h-4 shrink-0" />
        }
      ]
    : [])
] as InnerMenuItem[]
