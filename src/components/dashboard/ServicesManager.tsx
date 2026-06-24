'use client'
import { useState, useEffect } from 'react'
import ImageUploader from '@/components/ui/ImageUploader'

interface Service {
  id: string
  name: string
  description?: string
  imageUrl?: string
  duration: number
  price: number
  isActive: boolean
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const EMPTY: Omit<Service, 'id'> = {
  name: '', description: '', imageUrl: '', duration: 60, price: 0, isActive: true
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState<Service | null>(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetch('/api/services').then(r => r.json()).then(setServices).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const openEdit = (s: Service) => {
    setEditing(s)
    setForm({ name: s.name, description: s.description || '', imageUrl: s.imageUrl || '', duration: s.duration, price: s.price, isActive: s.isActive })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name) return
    setSaving(true)
    const method = editing ? 'PUT' : 'POST'
    const url    = editing ? `/api/services/${editing.id}` : '/api/services'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    setShowForm(false)
    load()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/services/${id}`, { method: 'DELETE' })
    setDeleteId(null)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Serviços</h1>
          <p className="page-subtitle">Gerencie o que aparece no seu catálogo</p>
        </div>
        <button onClick={openNew} className="btn-brand">+ Novo serviço</button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-20 animate-pulse" style={{ background: 'var(--bg-input)' }} />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">🌸</div>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Nenhum serviço ainda</h3>
          <p className="text-sm mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>
            Adicione seus serviços para que as clientes possam ver e agendar.
          </p>
          <button onClick={openNew} className="btn-brand mx-auto">+ Adicionar serviço</button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map(s => (
            <div key={s.id} className="card flex items-center gap-4">
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl"
                style={{ background: 'var(--bg-input)' }}>
                {s.imageUrl
                  ? <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover" />
                  : '✦'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{s.name}</h3>
                  {!s.isActive && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                      Oculto
                    </span>
                  )}
                </div>
                {s.description && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{s.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    ⏱ {s.duration >= 60
                      ? `${Math.floor(s.duration / 60)}h${s.duration % 60 ? s.duration % 60 + 'min' : ''}`
                      : `${s.duration}min`}
                  </span>
                  <span className="text-sm font-bold" style={{ color: 'var(--color-brand)' }}>{fmt(s.price)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => openEdit(s)} className="btn-ghost py-2 px-3 text-xs">Editar</button>
                <button onClick={() => setDeleteId(s.id)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="w-full max-w-lg rounded-3xl p-6 max-h-[85vh] overflow-y-auto scrollbar-none animate-slideUp shadow-2xl"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>

            <div className="flex items-center justify-between mb-5 sticky top-0 pb-2 z-10" style={{ background: 'var(--bg-surface)' }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {editing ? 'Editar serviço' : 'Novo serviço'}
              </h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800 transition-colors" style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>

            <div className="space-y-4">
              {/* Upload de imagem */}
              <ImageUploader
                value={form.imageUrl || ''}
                onChange={url => setForm(f => ({ ...f, imageUrl: url }))}
              />

              <div>
                <label className="label">Nome do serviço *</label>
                <input className="input" placeholder="Ex: Design de Sobrancelhas" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>

              <div>
                <label className="label">Descrição</label>
                <input className="input" placeholder="Descreva brevemente o serviço" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Duração (minutos)</label>
                  <input type="number" className="input" min={5} step={5} value={form.duration}
                    onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="label">Valor (R$)</label>
                  <input type="number" className="input" min={0} step={0.01} value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
                  style={{ background: form.isActive ? 'var(--color-brand)' : 'var(--border-default)' }}>
                  <span className="absolute top-1 transition-all duration-200 w-4 h-4 bg-white rounded-full shadow"
                    style={{ left: form.isActive ? '24px' : '4px' }} />
                </button>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {form.isActive ? 'Visível no catálogo' : 'Oculto do catálogo'}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6 sticky bottom-0 pt-3 z-10" style={{ background: 'var(--bg-surface)' }}>
              <button onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.name} className="btn-brand flex-1 disabled:opacity-60">
                {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar serviço'}
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
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Excluir serviço?</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-ghost flex-1">Cancelar</button>
              <button onClick={() => handleDelete(deleteId!)}
                className="flex-1 py-3 px-6 rounded-xl text-sm font-semibold text-white"
                style={{ background: '#ef4444' }}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}