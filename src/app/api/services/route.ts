import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStore } from '@/lib/guards'

export async function GET() {
  const auth = await requireStore()
  if (auth.error) return auth.error

  const services = await prisma.service.findMany({
    where: { storeId: auth.storeId },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json(services.map(s => ({ ...s, price: Number(s.price) })))
}

export async function POST(req: NextRequest) {
  const auth = await requireStore()
  if (auth.error) return auth.error

  try {
    const body = await req.json()
    const { name, description, imageUrl, duration, price, isActive } = body

    if (!name || !duration || price === undefined) {
      return NextResponse.json({ message: 'Nome, duração e valor são obrigatórios' }, { status: 400 })
    }

    const count = await prisma.service.count({ where: { storeId: auth.storeId } })

    const service = await prisma.service.create({
      data: {
        storeId: auth.storeId,
        name,
        description: description || null,
        imageUrl: imageUrl || null,
        duration: Number(duration),
        price: Number(price),
        isActive: isActive ?? true,
        order: count,
      },
    })

    return NextResponse.json({ ...service, price: Number(service.price) }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Erro ao criar serviço' }, { status: 500 })
  }
}
