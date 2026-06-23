import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, setAdminSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ message: 'Informe e-mail e senha' }, { status: 400 })
    }

    const admin = await prisma.admin.findUnique({ where: { email } })
    if (!admin) {
      return NextResponse.json({ message: 'E-mail ou senha incorretos' }, { status: 401 })
    }

    const valid = await verifyPassword(password, admin.password)
    if (!valid) {
      return NextResponse.json({ message: 'E-mail ou senha incorretos' }, { status: 401 })
    }

    await setAdminSession({ adminId: admin.id, email: admin.email })

    return NextResponse.json({
      admin: { id: admin.id, name: admin.name, email: admin.email },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Erro interno ao entrar' }, { status: 500 })
  }
}
