import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, setSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { ownerName, email, password, name, slug, phone, address } = body

    if (!ownerName || !email || !password || !name || !slug || !phone) {
      return NextResponse.json({ message: 'Preencha todos os campos obrigatórios' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ message: 'A senha deve ter no mínimo 8 caracteres' }, { status: 400 })
    }

    const [existingEmail, existingSlug] = await Promise.all([
      prisma.store.findUnique({ where: { email } }),
      prisma.store.findUnique({ where: { slug } }),
    ])
    if (existingEmail) {
      return NextResponse.json({ message: 'Este e-mail já está em uso' }, { status: 409 })
    }
    if (existingSlug) {
      return NextResponse.json({ message: 'Este link de loja já está em uso, escolha outro' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)

    const store = await prisma.store.create({
      data: {
        ownerName, email, password: hashedPassword, name, slug, phone,
        address: address || null,
      },
    })

    await setSession({ storeId: store.id, email: store.email })

    return NextResponse.json({
      user: {
        id: store.id, name: store.name, email: store.email, slug: store.slug,
        isActive: store.isActive,
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Erro interno ao criar conta' }, { status: 500 })
  }
}
