'use client'
import { useState, useEffect } from 'react'

type Status = 'PENDING' | 'COMPLETED' | 'CANCELLED'

interface Appointment {
  id: string
  clientName: string
  clientPhone?: string
  serviceName?: string
  price: number
  scheduledAt: string
  status: Status
  notes?: string
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const STATUS_MAP = {
  PENDING:   { label: 'Pendente',   cls: 'badge-pending'   },
  COMPLETED: { label: 'Concluído',  cls: 'badge-completed' },
  CANCELLED: { label: 'Cancelado',  cls: 'badge-cancelled' },
}

const EMPTY_FORM = {
  clientName: '', clientPhone: '', serviceName: '', price: 0, scheduledAt: '', notes: '', status: 'PENDING' as Status
}

export default function AppointmentsManager() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Appointment | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // Filtros
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10)
  })
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [statusFilter, setStatusFilter] = useState<Status | 'ALL'>('ALL')

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams({ from, to })
    if (statusFilter !== 'ALL') params.append('status', statusFilter)
    fetch(`/api/appointments?${params}`).then(r => r.json()).then(setAppointments).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [from, to, statusFilter])

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (a: Appointment) => {
    setEditing(a)
    setForm({
      clientName: a.clientName, clientPhone: a.clientPhone || '', serviceName: a.serviceName || '',
      price: a.price, scheduledAt: a.scheduledAt.slice(0, 16), notes: a.notes || '', status: a.status,
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.clientName || !form.scheduledAt) return
    setSaving(true)
    const method = editing ? 'PUT' : 'POST'
    const url = editing ? `/api/appointments/${editing.id}` : '/api/appointments'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    setShowForm(false)
    load()
  }

  const changeStatus = async (id: string, status: Status) => {
    await fetch(`/api/appointments/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status })
    })
    load()
  }

  const deleteAppt = async (id: string) => {
    if (!confirm('Excluir este agendamento?')) return
    await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Agenda</h1>
          <p className="page-subtitle">Registre e acompanhe seus atendimentos</p>
        </div>
        <button onClick={openNew} className="btn-brand self-start sm:self-auto">+ Novo agendamento</button>
      </div>

      {/* Filtros */}
      <div className="card mb-5 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>De</span>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input py-2 w-36" />
          <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Até</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="input py-2 w-36" />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {(['ALL', 'PENDING', 'COMPLETED', 'CANCELLED'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: statusFilter === s ? 'var(--color-brand)' : 'var(--bg-input)',
                color: statusFilter === s ? '#fff' : 'var(--text-muted)',
              }}>
              {s === 'ALL' ? 'Todos' : STATUS_MAP[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => (
          <div key={i} className="card h-24 animate-pulse" style={{ background: 'var(--bg-input)' }} />
        ))}</div>
      ) : appointments.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">📅</div>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Nenhum agendamento neste período</h3>
          <p className="text-sm mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>Registre seus atendimentos para acompanhar o faturamento.</p>
          <button onClick={openNew} className="btn-brand mx-auto">+ Registrar atendimento</button>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(a => (
            <div key={a.id} className="card">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: 'var(--color-brand-50)', color: 'var(--color-brand)' }}>
                  {a.clientName.slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{a.clientName}</h3>
                      {a.clientPhone && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.clientPhone}</p>}
                    </div>
                    <span className={STATUS_MAP[a.status].cls}>{STATUS_MAP[a.status].label}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span>📅 {fmtDate(a.scheduledAt)}</span>
                    {a.serviceName && <span>✦ {a.serviceName}</span>}
                    <span className="font-semibold" style={{ color: 'var(--color-brand)' }}>{fmt(a.price)}</span>
                  </div>
                  {a.notes && <p className="text-xs mt-1.5 italic" style={{ color: 'var(--text-muted)' }}>"{a.notes}"</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border-default)' }}>
                <button onClick={() => openEdit(a)} className="btn-ghost py-1.5 px-3 text-xs">Editar</button>
                {a.status !== 'COMPLETED' && (
                  <button onClick={() => changeStatus(a.id, 'COMPLETED')}
                    className="py-1.5 px-3 rounded-xl text-xs font-semibold transition-colors"
                    style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
                    ✓ Concluído
                  </button>
                )}
                {a.status !== 'CANCELLED' && (
                  <button onClick={() => changeStatus(a.id, 'CANCELLED')}
                    className="py-1.5 px-3 rounded-xl text-xs font-semibold transition-colors"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                    ✕ Cancelar
                  </button>
                )}
                <button onClick={() => deleteAppt(a.id)}
                  className="py-1.5 px-3 rounded-xl text-xs font-semibold transition-colors ml-auto"
                  style={{ color: 'var(--text-muted)' }}>
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="w-full max-w-lg rounded-3xl p-6 max-h-[90vh] overflow-y-auto animate-slideUp"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {editing ? 'Editar agendamento' : 'Novo agendamento'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Nome do cliente *</label>
                  <input className="input" placeholder="Maria Silva" value={form.clientName}
                    onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Telefone</label>
                  <input className="input" placeholder="(11) 99999-9999" value={form.clientPhone}
                    onChange={e => setForm(f => ({ ...f, clientPhone: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Serviço</label>
                <input className="input" placeholder="Ex: Lash Fio a Fio" value={form.serviceName}
                  onChange={e => setForm(f => ({ ...f, serviceName: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Data e horário *</label>
                  <input type="datetime-local" className="input" value={form.scheduledAt}
                    onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Valor (R$)</label>
                  <input type="number" className="input" min={0} step={0.01} value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
                </div>
              </div>
              {editing && (
                <div>
                  <label className="label">Status</label>
                  <select className="input" value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as Status }))}>
                    <option value="PENDING">Pendente</option>
                    <option value="COMPLETED">Concluído</option>
                    <option value="CANCELLED">Cancelado</option>
                  </select>
                </div>
              )}
              <div>
                <label className="label">Observações</label>
                <input className="input" placeholder="Algum detalhe importante..." value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.clientName || !form.scheduledAt}
                className="btn-brand flex-1 disabled:opacity-60">
                {saving ? 'Salvando...' : editing ? 'Salvar' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
