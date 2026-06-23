import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStore } from '@/lib/guards'

export async function GET(req: NextRequest) {
  const auth = await requireStore()
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  if (!from || !to) {
    return NextResponse.json({ message: 'Informe o período (from/to)' }, { status: 400 })
  }

  const dateRange = {
    gte: new Date(`${from}T00:00:00`),
    lte: new Date(`${to}T23:59:59`),
  }

  // ── Agendamentos no período ──────────────────────────────────────────────
  const appointments = await prisma.appointment.findMany({
    where: { storeId: auth.storeId, scheduledAt: dateRange },
    include: { service: { select: { name: true } } },
  })

  const completed = appointments.filter(a => a.status === 'COMPLETED')
  const cancelled = appointments.filter(a => a.status === 'CANCELLED')
  const pending   = appointments.filter(a => a.status === 'PENDING')

  const grossRevenue = completed.reduce((sum, a) => sum + Number(a.price), 0)

  // ── Despesas no período ──────────────────────────────────────────────────
  const expenses = await prisma.expense.findMany({
    where: { storeId: auth.storeId, date: dateRange },
  })
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  // ── Rank de serviços (baseado em concluídos) ──────────────────────────────
  const serviceMap = new Map<string, { count: number; revenue: number }>()
  for (const a of completed) {
    const name = a.service?.name || 'Serviço avulso'
    const current = serviceMap.get(name) || { count: 0, revenue: 0 }
    current.count += 1
    current.revenue += Number(a.price)
    serviceMap.set(name, current)
  }
  const topServices = Array.from(serviceMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // ── Aviso global (Admin) ──────────────────────────────────────────────────
  const admin = await prisma.admin.findFirst({ select: { globalAnnouncement: true } })

  return NextResponse.json({
    totalCompleted: completed.length,
    totalCancelled: cancelled.length,
    totalPending: pending.length,
    grossRevenue,
    totalExpenses,
    netProfit: grossRevenue - totalExpenses,
    topServices,
    globalAnnouncement: admin?.globalAnnouncement || null,
  })
}
