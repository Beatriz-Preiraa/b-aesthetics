'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import Link from 'next/link'

const steps = ['Conta', 'Empresa', 'Confirmar']

interface FormData {
  // Step 1: Conta
  ownerName: string
  email: string
  password: string
  confirmPassword: string
  // Step 2: Empresa
  name: string
  slug: string
  phone: string
  address: string
}

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormData>({
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    slug: '',
    phone: '',
    address: '',
  })

  const { theme, toggleTheme } = useTheme()
  const router = useRouter()

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setForm(prev => ({
      ...prev,
      [field]: value,
      // Auto-gera slug a partir do nome da empresa
      ...(field === 'name' ? {
        slug: value.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      } : {}),
    }))
  }

  const validateStep = () => {
    if (step === 0) {
      if (!form.ownerName || !form.email || !form.password) return 'Preencha todos os campos'
      if (form.password.length < 8) return 'Senha deve ter no mínimo 8 caracteres'
      if (form.password !== form.confirmPassword) return 'As senhas não coincidem'
    }
    if (step === 1) {
      if (!form.name || !form.phone) return 'Preencha nome da empresa e WhatsApp'
      if (form.slug.length < 3) return 'Nome da empresa muito curto'
    }
    return null
  }

  const handleNext = () => {
    const err = validateStep()
    if (err) return setError(err)
    setError('')
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Erro no cadastro')
      }
      router.push('/dashboard?welcome=1')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
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
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: 'var(--color-brand)' }} />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-10 blur-3xl"
          style={{ background: 'var(--color-brand-muted)' }} />
      </div>

      {/* Toggle tema */}
      <button onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-xl transition-colors"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3"
            style={{ background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-muted))' }}>
            <span className="text-xl">✦</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}>
            B.aesthetics
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Crie sua loja em minutos</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={{
                    background: i <= step ? 'var(--color-brand)' : 'var(--bg-input)',
                    color: i <= step ? '#fff' : 'var(--text-muted)',
                  }}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block" style={{ color: i === step ? 'var(--color-brand)' : 'var(--text-muted)' }}>
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-8 h-px mx-1 transition-all duration-300"
                  style={{ background: i < step ? 'var(--color-brand)' : 'var(--border-default)' }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: '0 24px 64px rgba(0,0,0,0.10)' }}>

          {/* Step 0 — Conta */}
          {step === 0 && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Seus dados de acesso
              </h2>
              <div>
                <label className="label">Seu nome completo</label>
                <input className="input" placeholder="Ana Silva" value={form.ownerName} onChange={set('ownerName')} />
              </div>
              <div>
                <label className="label">E-mail</label>
                <input type="email" className="input" placeholder="ana@email.com" value={form.email} onChange={set('email')} />
              </div>
              <div>
                <label className="label">Senha</label>
                <input type="password" className="input" placeholder="Mínimo 8 caracteres" value={form.password} onChange={set('password')} />
              </div>
              <div>
                <label className="label">Confirmar senha</label>
                <input type="password" className="input" placeholder="Repita a senha" value={form.confirmPassword} onChange={set('confirmPassword')} />
              </div>
            </div>
          )}

          {/* Step 1 — Empresa */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Dados da sua empresa
              </h2>
              <div>
                <label className="label">Nome da empresa</label>
                <input className="input" placeholder="Lash Studio Ana" value={form.name} onChange={set('name')} />
              </div>
              <div>
                <label className="label">Link do seu catálogo</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-3 rounded-xl whitespace-nowrap" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1.5px solid var(--border-default)' }}>
                    aesthetics.app/
                  </span>
                  <input className="input" placeholder="lash-studio-ana" value={form.slug} onChange={set('slug')} />
                </div>
              </div>
              <div>
                <label className="label">WhatsApp (com DDD)</label>
                <input className="input" placeholder="(11) 99999-9999" value={form.phone} onChange={set('phone')} />
              </div>
              <div>
                <label className="label">Endereço (opcional)</label>
                <input className="input" placeholder="Rua das Flores, 123 — SP" value={form.address} onChange={set('address')} />
              </div>
            </div>
          )}

          {/* Step 2 — Confirmar */}
          {step === 2 && (
            <div className="animate-fadeIn">
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Confirme seus dados
              </h2>
              <div className="space-y-3 rounded-2xl p-4" style={{ background: 'var(--bg-input)' }}>
                {[
                  ['Proprietária', form.ownerName],
                  ['E-mail', form.email],
                  ['Empresa', form.name],
                  ['Link', `aesthetics.app/${form.slug}`],
                  ['WhatsApp', form.phone],
                  ...(form.address ? [['Endereço', form.address]] : []),
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs mt-4 text-center" style={{ color: 'var(--text-muted)' }}>
                Ao criar, você concorda com os Termos de Uso e a Política de Privacidade.
              </p>
            </div>
          )}

          {/* Erro */}
          {error && (
            <div className="mt-4 rounded-xl px-4 py-3 text-sm animate-fadeIn"
              style={{ background: 'rgba(232,15,136,0.08)', border: '1px solid rgba(232,15,136,0.3)', color: 'var(--color-brand)' }}>
              ⚠ {error}
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="btn-ghost flex-1">
                Voltar
              </button>
            )}
            {step < 2 ? (
              <button onClick={handleNext} className="btn-brand flex-1">
                Continuar →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="btn-brand flex-1 disabled:opacity-60">
                {loading ? (
                  <><span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Criando...</>
                ) : 'Criar minha loja ✦'}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm mt-4" style={{ color: 'var(--text-muted)' }}>
          Já tem conta?{' '}
          <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--color-brand)' }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
