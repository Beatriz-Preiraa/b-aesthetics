import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { requireStore } from '@/lib/guards'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

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
    const buffer = Buffer.from(bytes)

    // Salva em /public/uploads/<storeId>/
    const ext      = file.type.split('/')[1].replace('jpeg', 'jpg')
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const dir      = join(process.cwd(), 'public', 'uploads', auth.storeId)

    await mkdir(dir, { recursive: true })
    await writeFile(join(dir, filename), buffer)

    const url = `/uploads/${auth.storeId}/${filename}`
    return NextResponse.json({ url })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Erro ao salvar imagem' }, { status: 500 })
  }
}
