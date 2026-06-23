import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session?.storeId) {
    return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
  }

  const store = await prisma.store.findUnique({ where: { id: session.storeId as string } })
  if (!store) {
    return NextResponse.json({ message: 'Conta não encontrada' }, { status: 404 })
  }

  return NextResponse.json({
    user: {
      id: store.id, name: store.name, email: store.email, slug: store.slug,
      logoUrl: store.logoUrl, isActive: store.isActive,
    },
  })
}
