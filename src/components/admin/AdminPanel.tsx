'use client'
import { useState, useEffect } from 'react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

interface Store {
  id: string
  name: string
  ownerName: string
  email: string
  phone: string
  slug: string
  isActive: boolean
  plan: string
  createdAt: string
  _count: {
    services: number
    appointments: number
  }
}

interface AdminStats {
  totalStores: number
  activeStores: number
  inactiveStores: number
  powerUsers: Store[]
  recentStores: Store[]
  globalAnnouncement?: string
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

export default function AdminPanel() {
  const { admin, logout } = useAdminAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [announcement, setAnnouncement] = useState('')
  const [savingAnn, setSavingAnn] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'stores'>('dashboard')
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    const [statsRes, storesRes] = await Promise.all([
      fetch('/api/admin/stats'),
      fetch('/api/admin/stores'),
    ])
    const statsData = await statsRes.json()
    const storesData = await storesRes.json()
    setStats(statsData)
    setStores(storesData)
    setAnnouncement(statsData.globalAnnouncement || '')
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleStore = async (id: string, current: boolean) => {
    await fetch(`/api/admin/stores/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    load()
  }

  const saveAnnouncement = async () => {
    setSavingAnn(true)
    await fetch('/api/admin/announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: announcement }),
    })
    setSavingAnn(false)
    alert('Aviso enviado para todas as lojas!')
  }

  const filtered = stores.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.ownerName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Admin Header */}
      <div className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
            style={{ background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-muted))' }}>
            ⚡
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>B.aesthetics Admin</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{admin?.name ?? 'Painel Master'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(['dashboard', 'stores'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: activeTab === t ? 'var(--color-brand)' : 'transparent',
                color: activeTab === t ? '#fff' : 'var(--text-secondary)',
              }}>
              {t === 'dashboard' ? 'Dashboard' : 'Lojas'}
            </button>
          ))}
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all ml-2"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
          >
            Sair
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-28 animate-pulse" style={{ background: 'var(--bg-input)' }} />
            ))}
          </div>
        ) : activeTab === 'dashboard' ? (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="card text-center">
                <p className="text-3xl font-bold" style={{ color: 'var(--color-brand)' }}>{stats?.totalStores ?? 0}</p>
                <p className="text-xs mt-1 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Total de lojas</p>
              </div>
              <div className="card text-center">
                <p className="text-3xl font-bold" style={{ color: '#22c55e' }}>{stats?.activeStores ?? 0}</p>
                <p className="text-xs mt-1 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Lojas ativas</p>
              </div>
              <div className="card text-center">
                <p className="text-3xl font-bold" style={{ color: '#ef4444' }}>{stats?.inactiveStores ?? 0}</p>
                <p className="text-xs mt-1 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Bloqueadas</p>
              </div>
            </div>

            {/* Power Users */}
            <div className="card mb-6">
              <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                🔥 Power Users (mais movimentação)
              </h2>
              {(stats?.powerUsers ?? []).slice(0, 5).map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 py-2.5"
                  style={{ borderBottom: i < 4 ? '1px solid var(--border-default)' : 'none' }}>
                  <span className="w-6 text-center text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.ownerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {s._count.appointments} agendamentos · {s._count.services} serviços
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Global Announcement */}
            <div className="card">
              <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                📢 Aviso global para todas as lojas
              </h2>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Ex: Manutenção programada hoje às 23h. O sistema estará offline por 30 minutos."
                value={announcement}
                onChange={e => setAnnouncement(e.target.value)}
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Deixe vazio para remover o aviso atual.
                </p>
                <button onClick={saveAnnouncement} disabled={savingAnn} className="btn-brand py-2 px-4 text-sm disabled:opacity-60">
                  {savingAnn ? 'Enviando...' : 'Enviar aviso'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Stores List */}
            <div className="flex items-center gap-3 mb-4">
              <input className="input flex-1" placeholder="Buscar por nome, email ou proprietária..." value={search}
                onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="space-y-3">
              {filtered.map(s => (
                <div key={s.id} className="card flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: 'var(--color-brand-50)', color: 'var(--color-brand)' }}>
                    {s.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{s.name}</h3>
                      <span className={s.isActive ? 'badge-completed' : 'badge-cancelled'}>
                        {s.isActive ? 'Ativa' : 'Bloqueada'}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {s.ownerName} · {s.email} · desde {fmtDate(s.createdAt)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {s._count.services} serviços · {s._count.appointments} agendamentos
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a href={`/${s.slug}`} target="_blank" rel="noopener noreferrer"
                      className="btn-ghost py-1.5 px-3 text-xs no-underline">
                      Ver loja ↗
                    </a>
                    <button onClick={() => toggleStore(s.id, s.isActive)}
                      className="py-1.5 px-3 rounded-xl text-xs font-semibold transition-colors"
                      style={{
                        background: s.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.12)',
                        color: s.isActive ? '#ef4444' : '#22c55e',
                      }}>
                      {s.isActive ? 'Bloquear' : 'Ativar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
