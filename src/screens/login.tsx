'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import Link from 'next/link'

// Ícones inline simples
const EyeIcon = ({ open }: { open: boolean }) => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {open ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    )}
  </svg>
)

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
)

const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return setError('Preencha todos os campos')
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg-page)' }}
    >
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: 'var(--color-brand)' }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-15 blur-3xl"
          style={{ background: 'var(--color-brand-muted)' }}
        />
      </div>

      {/* Toggle de tema */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-xl transition-all duration-200"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-secondary)',
        }}
        aria-label="Alternar tema"
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>

      {/* Card de Login */}
      <div
        className="w-full max-w-md rounded-3xl p-8 relative z-10"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
        }}
      >
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-muted))' }}
          >
            <span className="text-2xl">✦</span>
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'Playfair Display, Georgia, serif', color: 'var(--text-primary)' }}
          >
            B.aesthetics
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Acesse seu painel de gestão
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">E-mail</label>
            <input
              type="email"
              className="input"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="label">Senha</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="input pr-11"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <EyeIcon open={showPass} />
              </button>
            </div>
          </div>

          {/* Link de recuperação */}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs font-medium hover:underline transition-colors"
              style={{ color: 'var(--color-brand)' }}
            >
              Esqueci minha senha
            </Link>
          </div>

          {/* Erro */}
          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm flex items-center gap-2 animate-fadeIn"
              style={{
                background: 'rgba(232, 15, 136, 0.08)',
                border: '1px solid rgba(232, 15, 136, 0.3)',
                color: 'var(--color-brand)',
              }}
            >
              <span>⚠</span> {error}
            </div>
          )}

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={loading}
            className="btn-brand w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar no painel'
            )}
          </button>
        </form>

        {/* Divisor */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: 'var(--border-default)' }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>ou</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border-default)' }} />
        </div>

        {/* Cadastro */}
        <div className="text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Ainda não tem conta?{' '}
            <Link
              href="/register"
              className="font-semibold hover:underline"
              style={{ color: 'var(--color-brand)' }}
            >
              Criar grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
