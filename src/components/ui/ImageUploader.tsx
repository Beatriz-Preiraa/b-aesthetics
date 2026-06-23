'use client'
import { useState, useEffect, useRef } from 'react'

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  label?: string
  shape?: 'square' | 'circle'
  height?: number
  placeholder?: string
}

export default function ImageUploader({
  value,
  onChange,
  label,
  shape = 'square',
  height = 160,
  placeholder = '📷',
}: ImageUploaderProps) {
  const inputRef                  = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview,   setPreview]   = useState(value)
  const [error,     setError]     = useState('')

  useEffect(() => { setPreview(value) }, [value])

  const handleFile = async (file: File) => {
    setError('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res  = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Erro no upload')
      setPreview(data.url)
      onChange(data.url)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro no upload')
    } finally {
      setUploading(false)
    }
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const radius = shape === 'circle' ? '9999px' : '12px'

  return (
    <div>
      {label && <label className="label">{label}</label>}

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        className="relative cursor-pointer overflow-hidden transition-all duration-200"
        style={{
          width: shape === 'circle' ? `${height}px` : '100%',
          height: `${height}px`,
          borderRadius: radius,
          background: 'var(--bg-input)',
          border: `2px dashed ${preview ? 'var(--color-brand)' : 'var(--border-default)'}`,
        }}
      >
        {/* Preview */}
        {preview ? (
          <>
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.5)' }}
            >
              <span className="text-white text-sm font-semibold">Trocar foto</span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-4">
            {uploading ? (
              <>
                <div
                  className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: 'var(--color-brand)', borderTopColor: 'transparent' }}
                />
                <span className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>Enviando...</span>
              </>
            ) : (
              <>
                <span className="text-3xl">{placeholder}</span>
                {shape !== 'circle' && (
                  <>
                    <span className="text-sm font-medium text-center" style={{ color: 'var(--text-secondary)' }}>
                      Clique ou arraste uma foto
                    </span>
                    <span className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                      JPG, PNG ou WebP · máx 5 MB
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Spinner sobre preview durante upload */}
        {uploading && preview && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin border-white" />
          </div>
        )}
      </div>

      {/* Botões abaixo */}
      {preview && (
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold"
            style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}
          >
            Trocar foto
          </button>
          <button
            type="button"
            onClick={() => { setPreview(''); onChange('') }}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
          >
            Remover
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>⚠ {error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  )
}
