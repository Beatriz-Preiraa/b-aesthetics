'use client'
import { useState, useEffect } from 'react'

interface DashboardData {
  totalCompleted: number
  totalCancelled: number
  totalPending: number
  grossRevenue: number
  totalExpenses: number
  netProfit: number
  topServices: { name: string; count: number; revenue: number }[]
  globalAnnouncement?: string
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

function KPICard({ label, value, sub, color, icon }: {
  label: string
  value: string
  sub?: string
  color?: string
  icon?: string
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <p className="text-2xl font-bold" style={{ color: color || 'var(--text-primary)' }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}

export default function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().slice(0, 10)
  })
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))

  const load = () => {
    setLoading(true)
    fetch(`/api/dashboard?from=${from}&to=${to}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [from, to])

  return (
    <div>
      {/* Anúncio global */}
      {data?.globalAnnouncement && (
        <div className="rounded-xl px-4 py-3 mb-6 text-sm flex items-start gap-2 animate-fadeIn"
          style={{ background: 'rgba(232,15,136,0.08)', border: '1px solid rgba(232,15,136,0.25)', color: 'var(--color-brand)' }}>
          📢 {data.globalAnnouncement}
        </div>
      )}

      {/* Header + Filtro de Datas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Visão geral</h1>
          <p className="page-subtitle">Acompanhe o desempenho do seu negócio</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>De</span>
            <input
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="input py-2 w-36"
            />
            <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Até</span>
            <input
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
              className="input py-2 w-36"
            />
          </div>
          <button onClick={load} className="btn-brand py-2 px-4 text-sm">
            Filtrar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-28 animate-pulse" style={{ background: 'var(--bg-input)' }} />
          ))}
        </div>
      ) : data ? (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard
              label="Faturamento bruto"
              value={fmt(data.grossRevenue)}
              sub={`${data.totalCompleted} serviços concluídos`}
              color="var(--color-brand)"
              icon="💰"
            />
            <KPICard
              label="Despesas totais"
              value={fmt(data.totalExpenses)}
              icon="📉"
            />
            <KPICard
              label="Lucro líquido"
              value={fmt(data.netProfit)}
              sub={data.netProfit >= 0 ? '▲ positivo' : '▼ negativo'}
              color={data.netProfit >= 0 ? '#22c55e' : '#ef4444'}
              icon="📊"
            />
            <KPICard
              label="Atendimentos"
              value={String(data.totalCompleted + data.totalCancelled + data.totalPending)}
              sub={`${data.totalCancelled} cancelados · ${data.totalPending} pendentes`}
              icon="📅"
            />
          </div>

          {/* Status breakdown */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Concluídos', value: data.totalCompleted, cls: 'badge-completed', color: '#22c55e' },
              { label: 'Pendentes',  value: data.totalPending,   cls: 'badge-pending',   color: '#f59e0b' },
              { label: 'Cancelados', value: data.totalCancelled, cls: 'badge-cancelled', color: '#ef4444' },
            ].map(item => (
              <div key={item.label} className="card text-center py-4">
                <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                <span className={item.cls + ' mt-1'}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Rank de Serviços */}
          {data.topServices.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                ✦ Serviços mais solicitados
              </h2>
              <div className="space-y-3">
                {data.topServices.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0"
                      style={{
                        background: i === 0 ? 'var(--color-brand)' : 'var(--bg-input)',
                        color: i === 0 ? '#fff' : 'var(--text-muted)',
                      }}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {s.name}
                        </span>
                        <span className="text-xs ml-2 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                          {s.count}x · {fmt(s.revenue)}
                        </span>
                      </div>
                      {/* Bar */}
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(s.count / data.topServices[0].count) * 100}%`,
                            background: 'linear-gradient(to right, var(--color-brand), var(--color-brand-muted))',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
