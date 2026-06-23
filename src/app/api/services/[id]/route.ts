import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStore } from '@/lib/guards'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireStore()
  if (auth.error) return auth.error
  const { id } = await params

  const existing = await prisma.service.findUnique({ where: { id } })
  if (!existing || existing.storeId !== auth.storeId) {
    return NextResponse.json({ message: 'Serviço não encontrado' }, { status: 404 })
  }

  try {
    const body = await req.json()
    const { name, description, imageUrl, duration, price, isActive } = body

    const updated = await prisma.service.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(duration !== undefined && { duration: Number(duration) }),
        ...(price !== undefined && { price: Number(price) }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({ ...updated, price: Number(updated.price) })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Erro ao atualizar serviço' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireStore()
  if (auth.error) return auth.error
  const { id } = await params

  const existing = await prisma.service.findUnique({ where: { id } })
  if (!existing || existing.storeId !== auth.storeId) {
    return NextResponse.json({ message: 'Serviço não encontrado' }, { status: 404 })
  }

  await prisma.service.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
