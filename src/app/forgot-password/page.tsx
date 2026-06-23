'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { theme, toggleTheme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return setError('Informe seu e-mail')
    setError('')
    setLoading(true)
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch {
      setError('Erro ao enviar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: 'var(--bg-page)' }}>
      <button onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <div className="w-full max-w-md rounded-3xl p-8"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: '0 24px 64px rgba(0,0,0,0.10)' }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-muted))' }}>
            <span className="text-2xl">{sent ? '✉' : '🔑'}</span>
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {sent ? 'Verifique seu e-mail' : 'Esqueceu sua senha?'}
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            {sent
              ? `Enviamos um link de redefinição para ${email}.`
              : 'Informe seu e-mail e enviaremos um link para redefinir sua senha.'}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">E-mail</label>
              <input type="email" className="input" placeholder="seu@email.com" value={email}
                onChange={e => setEmail(e.target.value)} />
            </div>
            {error && (
              <div className="rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(232,15,136,0.08)', border: '1px solid rgba(232,15,136,0.25)', color: 'var(--color-brand)' }}>
                ⚠ {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-brand w-full disabled:opacity-60">
              {loading ? 'Enviando...' : 'Enviar link de redefinição'}
            </button>
          </form>
        ) : (
          <button onClick={() => setSent(false)} className="btn-ghost w-full">
            Reenviar e-mail
          </button>
        )}

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--color-brand)' }}>
            ← Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  )
}
