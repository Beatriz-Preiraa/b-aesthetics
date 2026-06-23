import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, setSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ message: 'Informe e-mail e senha' }, { status: 400 })
    }

    const store = await prisma.store.findUnique({ where: { email } })
    if (!store) {
      return NextResponse.json({ message: 'E-mail ou senha incorretos' }, { status: 401 })
    }

    const valid = await verifyPassword(password, store.password)
    if (!valid) {
      return NextResponse.json({ message: 'E-mail ou senha incorretos' }, { status: 401 })
    }

    if (!store.isActive) {
      return NextResponse.json({
        message: 'Sua conta está temporariamente bloqueada. Entre em contato com o suporte.',
      }, { status: 403 })
    }

    await setSession({ storeId: store.id, email: store.email })

    return NextResponse.json({
      user: {
        id: store.id, name: store.name, email: store.email, slug: store.slug,
        logoUrl: store.logoUrl, isActive: store.isActive,
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Erro interno ao entrar' }, { status: 500 })
  }
}
