import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireStore } from '@/lib/guards'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// Inicializa o cliente do Supabase usando as variáveis que já estão na Vercel
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const auth = await requireStore()
  if (auth.error) return auth.error

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ message: 'Nenhum arquivo enviado' }, { status: 400 })
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ message: 'Formato inválido. Use JPG, PNG ou WebP.' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: 'Arquivo muito grande. Máximo 5 MB.' }, { status: 400 })
    }

    const bytes  = await file.arrayBuffer()
    const ext      = file.type.split('/')[1].replace('jpeg', 'jpg')
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    // Faz o upload direto para o bucket do Supabase chamado 'uploads'
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filename, bytes, {
        contentType: file.type,
        upsert: true
      })

    if (error) throw error

    // Gera a URL pública da imagem vinda do Supabase
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filename)

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Erro ao salvar imagem' }, { status: 500 })
  }
}