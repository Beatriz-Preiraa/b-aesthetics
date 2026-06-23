import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/guards'

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const stores = await prisma.store.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { services: true, appointments: true } } },
  })

  return NextResponse.json(
    stores.map(s => ({
      id: s.id, name: s.name, ownerName: s.ownerName, email: s.email,
      phone: s.phone, slug: s.slug, isActive: s.isActive, plan: s.plan,
      createdAt: s.createdAt, _count: s._count,
    }))
  )
}
