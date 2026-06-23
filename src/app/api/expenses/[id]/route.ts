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

  const existing = await prisma.expense.findUnique({ where: { id } })
  if (!existing || existing.storeId !== auth.storeId) {
    return NextResponse.json({ message: 'Despesa não encontrada' }, { status: 404 })
  }

  try {
    const body = await req.json()
    const { description, amount, date, category } = body

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        ...(description !== undefined && { description }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(category !== undefined && { category }),
      },
    })

    return NextResponse.json({ ...updated, amount: Number(updated.amount) })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Erro ao atualizar despesa' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireStore()
  if (auth.error) return auth.error
  const { id } = await params

  const existing = await prisma.expense.findUnique({ where: { id } })
  if (!existing || existing.storeId !== auth.storeId) {
    return NextResponse.json({ message: 'Despesa não encontrada' }, { status: 404 })
  }

  await prisma.expense.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
