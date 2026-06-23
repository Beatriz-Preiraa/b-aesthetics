import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStore } from '@/lib/guards'

type AppointmentStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED'

export async function GET(req: NextRequest) {
  const auth = await requireStore()
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const status = searchParams.get('status') as AppointmentStatus | null

  const appointments = await prisma.appointment.findMany({
    where: {
      storeId: auth.storeId,
      ...(from && to ? {
        scheduledAt: {
          gte: new Date(`${from}T00:00:00`),
          lte: new Date(`${to}T23:59:59`),
        },
      } : {}),
      ...(status ? { status } : {}),
    },
    include: { service: { select: { name: true } } },
    orderBy: { scheduledAt: 'desc' },
  })

  return NextResponse.json(
    appointments.map(a => ({
      id: a.id,
      clientName: a.clientName,
      clientPhone: a.clientPhone,
      serviceName: a.service?.name,
      price: Number(a.price),
      scheduledAt: a.scheduledAt,
      status: a.status,
      notes: a.notes,
    }))
  )
}

export async function POST(req: NextRequest) {
  const auth = await requireStore()
  if (auth.error) return auth.error

  try {
    const body = await req.json()
    const { clientName, clientPhone, serviceName, price, scheduledAt, notes, status } = body

    if (!clientName || !scheduledAt || price === undefined) {
      return NextResponse.json({ message: 'Cliente, data e valor são obrigatórios' }, { status: 400 })
    }

    // Tenta vincular a um serviço existente pelo nome (opcional)
    let serviceId: string | undefined
    if (serviceName) {
      const matched = await prisma.service.findFirst({
        where: { storeId: auth.storeId, name: serviceName },
      })
      serviceId = matched?.id
    }

    const appointment = await prisma.appointment.create({
      data: {
        storeId: auth.storeId,
        serviceId: serviceId || null,
        clientName,
        clientPhone: clientPhone || null,
        price: Number(price),
        scheduledAt: new Date(scheduledAt),
        notes: notes || null,
        status: status || 'PENDING',
      },
    })

    return NextResponse.json({ ...appointment, price: Number(appointment.price) }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Erro ao criar agendamento' }, { status: 500 })
  }
}
