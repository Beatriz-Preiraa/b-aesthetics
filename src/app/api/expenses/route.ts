import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStore } from '@/lib/guards'

export async function GET(req: NextRequest) {
  const auth = await requireStore()
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const expenses = await prisma.expense.findMany({
    where: {
      storeId: auth.storeId,
      ...(from && to ? {
        date: { gte: new Date(`${from}T00:00:00`), lte: new Date(`${to}T23:59:59`) },
      } : {}),
    },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(expenses.map(e => ({ ...e, amount: Number(e.amount) })))
}

export async function POST(req: NextRequest) {
  const auth = await requireStore()
  if (auth.error) return auth.error

  try {
    const body = await req.json()
    const { description, amount, date, category } = body

    if (!description || amount === undefined || !date) {
      return NextResponse.json({ message: 'Descrição, valor e data são obrigatórios' }, { status: 400 })
    }

    const expense = await prisma.expense.create({
      data: {
        storeId: auth.storeId,
        description,
        amount: Number(amount),
        date: new Date(date),
        category: category || null,
      },
    })

    return NextResponse.json({ ...expense, amount: Number(expense.amount) }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Erro ao criar despesa' }, { status: 500 })
  }
}
