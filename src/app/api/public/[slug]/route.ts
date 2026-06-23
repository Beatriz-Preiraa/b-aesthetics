import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const store = await prisma.store.findUnique({
    where: { slug },
    select: {
      name: true, slug: true, logoUrl: true, address: true, phone: true,
      businessHours: true, description: true, isActive: true,
    },
  })

  if (!store) {
    return NextResponse.json({ message: 'Loja não encontrada' }, { status: 404 })
  }

  // Se a loja estiver bloqueada, retorna apenas o necessário para exibir o aviso
  if (!store.isActive) {
    return NextResponse.json({ store, services: [] })
  }

  const services = await prisma.service.findMany({
    where: { store: { slug }, isActive: true },
    orderBy: { order: 'asc' },
    select: {
      id: true, name: true, description: true, imageUrl: true,
      duration: true, price: true,
    },
  })

  return NextResponse.json({
    store,
    services: services.map(s => ({ ...s, price: Number(s.price) })),
  })
}
