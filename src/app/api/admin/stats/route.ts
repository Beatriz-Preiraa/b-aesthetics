import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/guards'

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const [totalStores, activeStores, admin, storesWithCounts] = await Promise.all([
    prisma.store.count(),
    prisma.store.count({ where: { isActive: true } }),
    prisma.admin.findFirst({ select: { globalAnnouncement: true } }),
    prisma.store.findMany({
      include: { _count: { select: { services: true, appointments: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  // Power users = mais agendamentos + serviços, ordenado por atividade total
  const powerUsers = [...storesWithCounts]
    .sort((a, b) =>
      (b._count.appointments + b._count.services) - (a._count.appointments + a._count.services)
    )
    .slice(0, 10)
    .map(s => ({
      id: s.id, name: s.name, ownerName: s.ownerName,
      _count: s._count,
    }))

  return NextResponse.json({
    totalStores,
    activeStores,
    inactiveStores: totalStores - activeStores,
    powerUsers,
    globalAnnouncement: admin?.globalAnnouncement || null,
  })
}
