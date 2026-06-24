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
    const ext    = file.type.split('/')[1].replace('jpeg', 'jpg')
    
    // Gerando o nome do arquivo diretamente na raiz do bucket para evitar caminhos inválidos
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    // Faz o upload usando parâmetros otimizados para o ambiente Next.js da Vercel
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filename, bytes, {
        contentType: file.type,
        duplex: 'half'
      })

    if (uploadError) {
      console.error('Erro interno do Supabase Storage:', uploadError)
      throw uploadError
    }

    // Busca a URL pública definitiva do arquivo
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(filename)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Erro ao salvar imagem' }, { status: 500 })
  }
}