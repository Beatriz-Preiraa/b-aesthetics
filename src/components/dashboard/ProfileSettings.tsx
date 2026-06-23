'use client'
import { useState, useEffect } from 'react'
import ImageUploader from '@/components/ui/ImageUploader'

interface Profile {
  name: string
  ownerName: string
  email: string
  logoUrl?: string
  address?: string
  phone: string
  businessHours?: string
  description?: string
  slug: string
}

export default function ProfileSettings() {
  const [profile,   setProfile]   = useState<Profile | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [tab,       setTab]       = useState<'info' | 'hours' | 'security'>('info')

  // Senha
  const [currentPassword,  setCurrentPassword]  = useState('')
  const [newPassword,      setNewPassword]      = useState('')
  const [confirmPassword,  setConfirmPassword]  = useState('')
  const [pwError,          setPwError]          = useState('')
  const [pwSaving,         setPwSaving]         = useState(false)
  const [pwSaved,          setPwSaved]          = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => { setProfile(data); setLoading(false) })
  }, [])

  const set = (field: keyof Profile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setProfile(p => p ? { ...p, [field]: e.target.value } : p)

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handlePasswordChange = async () => {
    setPwError('')
    if (!currentPassword || !newPassword) return setPwError('Preencha todos os campos')
    if (newPassword.length < 8) return setPwError('A nova senha deve ter no mínimo 8 caracteres')
    if (newPassword !== confirmPassword) return setPwError('As senhas não coincidem')
    setPwSaving(true)
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Senha atual incorreta')
      }
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      setPwSaved(true)
      setTimeout(() => setPwSaved(false), 2500)
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : 'Erro ao alterar senha')
    } finally {
      setPwSaving(false)
    }
  }

  if (loading || !profile) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card h-20 animate-pulse" style={{ background: 'var(--bg-input)' }} />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Minha loja</h1>
        <p className="page-subtitle">Configure as informações públicas e sua conta</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {([
          ['info',     'Informações'],
          ['hours',    'Horários'],
          ['security', 'Segurança'],
        ] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: tab === key ? 'var(--color-brand)' : 'var(--bg-input)',
              color:      tab === key ? '#fff'                : 'var(--text-secondary)',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB: Informações ─────────────────────────────────────────────── */}
      {tab === 'info' && (
        <div className="card space-y-5 animate-fadeIn">

          {/* Logo via upload */}
          <div className="flex items-start gap-5">
            {/* Upload circular da logo */}
            <div className="flex-shrink-0">
              <p className="label mb-2">Logo / Foto</p>
              <ImageUploader
                value={profile.logoUrl || ''}
                onChange={url => setProfile(p => p ? { ...p, logoUrl: url } : p)}
                shape="circle"
                height={88}
                placeholder="✦"
              />
            </div>

            {/* Nome + descrição ao lado da logo */}
            <div className="flex-1 space-y-4 pt-1">
              <div>
                <label className="label">Nome da empresa</label>
                <input className="input" value={profile.name} onChange={set('name')} />
              </div>
              <div>
                <label className="label">Descrição curta</label>
                <input className="input" placeholder="Ex: Especialista em volume russo"
                  value={profile.description || ''} onChange={set('description')} />
              </div>
            </div>
          </div>

          {/* Link do catálogo */}
          <div>
            <label className="label">Link do catálogo</label>
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-3 rounded-xl whitespace-nowrap"
                style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1.5px solid var(--border-default)' }}>
                aesthetics.app/
              </span>
              <input className="input" value={profile.slug} disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Para alterar seu link, entre em contato com o suporte.
            </p>
          </div>

          {/* Endereço + WhatsApp */}
          <div>
            <label className="label">Endereço</label>
            <input className="input" placeholder="Rua, número, bairro, cidade"
              value={profile.address || ''} onChange={set('address')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">WhatsApp</label>
              <input className="input" placeholder="(11) 99999-9999"
                value={profile.phone} onChange={set('phone')} />
            </div>
            <div>
              <label className="label">E-mail</label>
              <input className="input" value={profile.email} disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            </div>
          </div>

          {/* Salvar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {saved && (
              <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>✓ Salvo com sucesso</span>
            )}
            <button onClick={handleSave} disabled={saving}
              className="btn-brand py-2.5 px-6 disabled:opacity-60">
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: Horários ────────────────────────────────────────────────── */}
      {tab === 'hours' && (
        <div className="card animate-fadeIn">
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Defina um texto livre de horário de funcionamento (exibido no catálogo público).
          </p>
          <label className="label">Horário de funcionamento</label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Ex: Seg–Sex: 9h às 19h · Sáb: 9h às 16h"
            value={profile.businessHours || ''}
            onChange={set('businessHours')}
          />
          <div className="flex items-center justify-end gap-3 mt-4">
            {saved && (
              <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>✓ Salvo com sucesso</span>
            )}
            <button onClick={handleSave} disabled={saving}
              className="btn-brand py-2.5 px-6 disabled:opacity-60">
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: Segurança ───────────────────────────────────────────────── */}
      {tab === 'security' && (
        <div className="card animate-fadeIn">
          <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
            Alterar senha
          </h2>
          <div className="space-y-4 max-w-sm">
            <div>
              <label className="label">Senha atual</label>
              <input type="password" className="input"
                value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <label className="label">Nova senha</label>
              <input type="password" className="input" placeholder="Mínimo 8 caracteres"
                value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div>
              <label className="label">Confirmar nova senha</label>
              <input type="password" className="input"
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>

            {pwError && (
              <div className="rounded-xl px-4 py-2.5 text-sm"
                style={{ background: 'rgba(232,15,136,0.08)', border: '1px solid rgba(232,15,136,0.25)', color: 'var(--color-brand)' }}>
                ⚠ {pwError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button onClick={handlePasswordChange} disabled={pwSaving}
                className="btn-brand py-2.5 px-6 disabled:opacity-60">
                {pwSaving ? 'Alterando...' : 'Alterar senha'}
              </button>
              {pwSaved && (
                <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>✓ Senha alterada</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
