'use client'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'

const NAV_ITEMS = [
  { key: 'overview',     icon: '◈', label: 'Visão Geral'    },
  { key: 'services',     icon: '✦', label: 'Serviços'       },
  { key: 'appointments', icon: '📅', label: 'Agenda'         },
  { key: 'expenses',     icon: '💸', label: 'Despesas'       },
  { key: 'profile',      icon: '⚙', label: 'Minha loja'     },
]

interface SidebarProps {
  active: string
  onChange: (k: string) => void
  mobile?: boolean
  onClose?: () => void
}

function Sidebar({ active, onChange, mobile, onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <aside
      className={`flex flex-col h-full ${mobile ? 'w-72' : 'w-64'}`}
      style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border-default)' }}
    >
      {/* Brand */}
      <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border-default)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
          style={{ background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-muted))' }}>
          ✦
        </div>
        <div>
          <p className="text-sm font-bold" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}>
            B.aesthetics
          </p>
          <p className="text-xs truncate max-w-[140px]" style={{ color: 'var(--text-muted)' }}>
            {user?.name}
          </p>
        </div>
        {mobile && (
          <button onClick={onClose} className="ml-auto text-lg" style={{ color: 'var(--text-muted)' }}>✕</button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(item => (
          <button
            key={item.key}
            onClick={() => { onChange(item.key); onClose?.() }}
            className={`nav-item w-full${active === item.key ? ' active' : ''}`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 space-y-1" style={{ borderTop: '1px solid var(--border-default)' }}>
        {/* Link catálogo público */}
        <a
          href={`/${user?.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="nav-item flex items-center gap-2 no-underline"
        >
          <span>🔗</span>
          <span className="text-xs truncate">Ver catálogo público</span>
          <span className="ml-auto text-xs">↗</span>
        </a>

        {/* Toggle tema */}
        <button onClick={toggleTheme} className="nav-item w-full">
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        </button>

        {/* Logout */}
        <button onClick={logout} className="nav-item w-full">
          <span>🚪</span>
          Sair
        </button>
      </div>
    </aside>
  )
}

// ─── Dashboard Layout ─────────────────────────────────────────────────────────
interface DashboardLayoutProps {
  children: (activeSection: string) => React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [active, setActive] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--bg-page)' }}>
      {/* Sidebar desktop */}
      <div className="hidden lg:flex">
        <Sidebar active={active} onChange={setActive} />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0" style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setMobileOpen(false)} />
          <div className="relative z-10">
            <Sidebar active={active} onChange={setActive} mobile onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3"
          style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}>
          <button onClick={() => setMobileOpen(true)} className="text-xl p-1" style={{ color: 'var(--text-secondary)' }}>
            ☰
          </button>
          <span className="text-sm font-bold" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}>
            B.aesthetics
          </span>
          <div className="w-8" />
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-5xl mx-auto animate-fadeIn">
            {children(active)}
          </div>
        </main>
      </div>
    </div>
  )
}
