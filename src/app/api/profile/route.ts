import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStore } from '@/lib/guards'

export async function GET() {
  const auth = await requireStore()
  if (auth.error) return auth.error

  const store = await prisma.store.findUnique({
    where: { id: auth.storeId },
    select: {
      name: true, ownerName: true, email: true, logoUrl: true, address: true,
      phone: true, businessHours: true, description: true, slug: true,
    },
  })

  return NextResponse.json(store)
}

export async function PUT(req: NextRequest) {
  const auth = await requireStore()
  if (auth.error) return auth.error

  try {
    const body = await req.json()
    const { name, logoUrl, address, phone, businessHours, description } = body

    const updated = await prisma.store.update({
      where: { id: auth.storeId },
      data: {
        ...(name !== undefined && { name }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(businessHours !== undefined && { businessHours }),
        ...(description !== undefined && { description }),
      },
      select: {
        name: true, ownerName: true, email: true, logoUrl: true, address: true,
        phone: true, businessHours: true, description: true, slug: true,
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Erro ao atualizar perfil' }, { status: 500 })
  }
}
