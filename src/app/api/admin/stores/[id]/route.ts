import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/guards'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error
  const { id } = await params

  try {
    const { isActive } = await req.json()
    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ message: 'Campo isActive deve ser booleano' }, { status: 400 })
    }

    const updated = await prisma.store.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, isActive: true },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Erro ao atualizar loja' }, { status: 500 })
  }
}
