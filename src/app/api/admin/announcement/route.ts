import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/guards'

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { message } = await req.json()

    const existing = await prisma.admin.findFirst()
    if (existing) {
      await prisma.admin.update({
        where: { id: existing.id },
        data: { globalAnnouncement: message || null },
      })
    } else {
      await prisma.admin.update({
        where: { id: auth.adminId },
        data: { globalAnnouncement: message || null },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Erro ao salvar aviso' }, { status: 500 })
  }
}
