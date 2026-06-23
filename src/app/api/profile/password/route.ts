import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStore } from '@/lib/guards'
import { verifyPassword, hashPassword } from '@/lib/auth'

export async function PUT(req: NextRequest) {
  const auth = await requireStore()
  if (auth.error) return auth.error

  try {
    const { currentPassword, newPassword } = await req.json()
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: 'Preencha todos os campos' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ message: 'A nova senha deve ter no mínimo 8 caracteres' }, { status: 400 })
    }

    const store = await prisma.store.findUnique({ where: { id: auth.storeId } })
    if (!store) {
      return NextResponse.json({ message: 'Conta não encontrada' }, { status: 404 })
    }

    const valid = await verifyPassword(currentPassword, store.password)
    if (!valid) {
      return NextResponse.json({ message: 'Senha atual incorreta' }, { status: 401 })
    }

    const hashed = await hashPassword(newPassword)
    await prisma.store.update({ where: { id: auth.storeId }, data: { password: hashed } })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Erro ao alterar senha' }, { status: 500 })
  }
}
