'use client'
import { useState, useEffect } from 'react'

interface Service {
  id: string
  name: string
  description?: string
  imageUrl?: string
  duration: number
  price: number
}

interface Store {
  name: string
  slug: string
  logoUrl?: string
  address?: string
  phone: string
  businessHours?: string
  description?: string
  isActive: boolean
}

const formatPrice = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const formatDuration = (min: number) => {
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

const buildWhatsApp = (store: Store, service: Service) => {
  const msg = encodeURIComponent(
    `Olá, ${store.name}! 😊\n\nGostaria de agendar um horário para:\n\n` +
    `✦ *${service.name}*\n` +
    `⏱ Duração: ${formatDuration(service.duration)}\n` +
    `💰 Valor: ${formatPrice(service.price)}\n\n` +
    `Poderia me informar os horários disponíveis?`
  )
  const phone = store.phone.replace(/\D/g, '')
  return `https://wa.me/55${phone}?text=${msg}`
}

// ─── Service Card ─────────────────────────────────────────────────────────────
function ServiceCard({ service, onSelect }: {
  service: Service
  onSelect: (s: Service) => void
}) {
  return (
    <button
      onClick={() => onSelect(service)}
      className="card text-left w-full group hover:scale-[1.01] transition-transform duration-200"
    >
      <div className="w-full h-44 rounded-xl overflow-hidden mb-4"
        style={{ background: 'var(--bg-input)' }}>
        {service.imageUrl ? (
          <img src={service.imageUrl} alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">✦</div>
        )}
      </div>

      <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
        {service.name}
      </h3>
      {service.description && (
        <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
          {service.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-4">
        <span className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ background: 'var(--color-brand-50)', color: 'var(--color-brand)' }}>
          ⏱ {formatDuration(service.duration)}
        </span>
        <span className="text-lg font-bold" style={{ color: 'var(--color-brand)' }}>
          {formatPrice(service.price)}
        </span>
      </div>
    </button>
  )
}

// ─── Booking Modal ────────────────────────────────────────────────────────────
function BookingModal({ service, store, onClose }: {
  service: Service
  store: Store
  onClose: () => void
}) {
  const url = buildWhatsApp(store, service)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden animate-slideUp"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
      >
        {/* Imagem */}
        {service.imageUrl && (
          <div className="w-full h-48 overflow-hidden">
            <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {service.name}
            </h2>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
              style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
              ✕
            </button>
          </div>

          {service.description && (
            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {service.description}
            </p>
          )}

          {/* Resumo */}
          <div className="rounded-2xl p-4 mb-5 space-y-2"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)' }}>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Duração estimada</span>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {formatDuration(service.duration)}
              </span>
            </div>
            <div className="h-px" style={{ background: 'var(--border-default)' }} />
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Valor</span>
              <span className="text-xl font-bold" style={{ color: 'var(--color-brand)' }}>
                {formatPrice(service.price)}
              </span>
            </div>
          </div>

          {/* Botão WhatsApp */}
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="btn-brand w-full flex items-center justify-center gap-2 no-underline text-white">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Agendar via WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function PublicCatalogPage({ params }: { params: { slug: string } }) {
  const [store,    setStore]    = useState<Store | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [selected, setSelected] = useState<Service | null>(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    fetch(`/api/public/${params.slug}`)
      .then(r => r.json())
      .then(data => { setStore(data.store); setServices(data.services) })
      .finally(() => setLoading(false))
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: 'var(--color-brand)', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Carregando catálogo...</p>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="text-center">
          <div className="text-5xl mb-4">✦</div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Loja não encontrada</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Verifique o link e tente novamente.</p>
        </div>
      </div>
    )
  }

  if (!store.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="text-center max-w-sm px-6">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Catálogo temporariamente indisponível
          </h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            Entre em contato com a profissional para mais informações.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Hero Header */}
      <div className="relative pb-8 pt-10"
        style={{ background: 'linear-gradient(160deg, var(--color-brand-50) 0%, var(--bg-page) 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl"
            style={{ background: 'var(--color-brand)' }} />
        </div>

        <div className="max-w-lg mx-auto px-4 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl"
              style={{
                background: store.logoUrl ? 'transparent' : 'linear-gradient(135deg, var(--color-brand), var(--color-brand-muted))',
                border: '2px solid var(--border-default)',
              }}>
              {store.logoUrl
                ? <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
                : '✦'}
            </div>
            <div>
              <h1 className="text-xl font-bold"
                style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}>
                {store.name}
              </h1>
              {store.description && (
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{store.description}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {store.address && (
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                📍 {store.address}
              </span>
            )}
            {store.businessHours && (
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                🕐 {store.businessHours}
              </span>
            )}
            <a href={`https://wa.me/55${store.phone.replace(/\D/g, '')}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full no-underline"
              style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)', color: '#25D366' }}>
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Catálogo */}
      <div className="max-w-lg mx-auto px-4 pb-16">
        <div className="flex items-center gap-3 mb-5 mt-6">
          <span className="text-lg" style={{ color: 'var(--color-brand)' }}>✦</span>
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-secondary)' }}>Nossos serviços</h2>
          <div className="flex-1 h-px" style={{ background: 'var(--border-default)' }} />
        </div>

        {services.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🌸</div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Novidades chegando em breve...</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map(s => (
              <ServiceCard key={s.id} service={s} onSelect={setSelected} />
            ))}
          </div>
        )}
      </div>

      <footer className="text-center py-6 text-xs"
        style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-default)' }}>
        Powered by <span style={{ color: 'var(--color-brand)' }}>B.aesthetics</span>
      </footer>

      {selected && store && (
        <BookingModal service={selected} store={store} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
