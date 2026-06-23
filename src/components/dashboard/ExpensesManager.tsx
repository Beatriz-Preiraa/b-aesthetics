'use client'
import { useState, useEffect } from 'react'

interface Expense {
  id: string
  description: string
  amount: number
  date: string
  category?: string
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

const CATEGORIES = ['Insumos', 'Aluguel', 'Marketing', 'Equipamentos', 'Transporte', 'Outros']

const EMPTY = { description: '', amount: 0, date: new Date().toISOString().slice(0, 10), category: 'Insumos' }

export default function ExpensesManager() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10)
  })
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))

  const load = () => {
    setLoading(true)
    fetch(`/api/expenses?from=${from}&to=${to}`).then(r => r.json()).then(setExpenses).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [from, to])

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const openEdit = (e: Expense) => {
    setEditing(e)
    setForm({ description: e.description, amount: e.amount, date: e.date.slice(0, 10), category: e.category || 'Outros' })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.description || form.amount <= 0) return
    setSaving(true)
    const method = editing ? 'PUT' : 'POST'
    const url = editing ? `/api/expenses/${editing.id}` : '/api/expenses'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    setShowForm(false)
    load()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    setDeleteId(null)
    load()
  }

  const catIcon = (cat?: string) => ({
    Insumos: '🧴', Aluguel: '🏠', Marketing: '📣', Equipamentos: '🛠', Transporte: '🚗', Outros: '📦'
  }[cat || 'Outros'] || '📦')

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Despesas</h1>
          <p className="page-subtitle">Controle os gastos do seu negócio</p>
        </div>
        <button onClick={openNew} className="btn-brand self-start sm:self-auto">+ Nova despesa</button>
      </div>

      {/* Filtro + Total */}
      <div className="card mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>De</span>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input py-2 w-36" />
          <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Até</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="input py-2 w-36" />
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Total no período</p>
          <p className="text-xl font-bold" style={{ color: 'var(--color-brand)' }}>{fmt(total)}</p>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => (
          <div key={i} className="card h-16 animate-pulse" style={{ background: 'var(--bg-input)' }} />
        ))}</div>
      ) : expenses.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">💸</div>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Nenhuma despesa neste período</h3>
          <p className="text-sm mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>
            Lance seus gastos para acompanhar o lucro líquido real.
          </p>
          <button onClick={openNew} className="btn-brand mx-auto">+ Lançar despesa</button>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map(e => (
            <div key={e.id} className="card flex items-center gap-4 py-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: 'var(--bg-input)' }}>
                {catIcon(e.category)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{e.description}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {e.category || 'Outros'} · {fmtDate(e.date)}
                </p>
              </div>
              <span className="text-base font-bold flex-shrink-0" style={{ color: '#ef4444' }}>
                − {fmt(e.amount)}
              </span>
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={() => openEdit(e)} className="text-xs px-2.5 py-1.5 rounded-lg font-semibold"
                  style={{ color: 'var(--text-secondary)', background: 'var(--bg-input)' }}>
                  Editar
                </button>
                <button onClick={() => setDeleteId(e.id)} className="text-xs px-2.5 py-1.5 rounded-lg font-semibold"
                  style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}>
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
          <div className="w-full max-w-md rounded-3xl p-6 animate-slideUp"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {editing ? 'Editar despesa' : 'Nova despesa'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Descrição *</label>
                <input className="input" placeholder="Ex: Compra de cílios fio a fio" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Valor (R$) *</label>
                  <input type="number" className="input" min={0} step={0.01} value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="label">Data *</label>
                  <input type="date" className="input" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Categoria</label>
                <select className="input" value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.description || form.amount <= 0}
                className="btn-brand flex-1 disabled:opacity-60">
                {saving ? 'Salvando...' : editing ? 'Salvar' : 'Lançar despesa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-3xl p-6 animate-fadeIn"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Excluir despesa?</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-ghost flex-1">Cancelar</button>
              <button onClick={() => handleDelete(deleteId!)}
                className="flex-1 py-3 px-6 rounded-xl text-sm font-semibold text-white" style={{ background: '#ef4444' }}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
