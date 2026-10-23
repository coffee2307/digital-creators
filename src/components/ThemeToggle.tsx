import { Moon, Sun } from 'lucide-react'
import { setSiteTheme, useThemeMode } from '../hooks/useThemeMode'

export default function ThemeToggle() {
  const mode = useThemeMode()
  const dark = mode === 'dark'
  return <button
    type="button"
    className="dc-theme-toggle"
    aria-label={dark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
    title={dark ? 'Chế độ sáng' : 'Chế độ tối cyberpunk'}
    aria-pressed={dark}
    onClick={() => setSiteTheme(dark ? 'light' : 'dark')}
  >
    <span className="dc-theme-track" aria-hidden="true">
      <span className="dc-theme-thumb">{dark ? <Sun size={15}/> : <Moon size={15}/>}</span>
    </span>
    <span className="dc-theme-name">{dark ? 'Sáng' : 'Tối'}</span>
  </button>
}
