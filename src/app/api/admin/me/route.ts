import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET() {
  const session = await getAdminSession()
  if (!session?.adminId) {
    return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
  }

  const admin = await prisma.admin.findUnique({
    where: { id: session.adminId as string },
    select: { id: true, name: true, email: true },
  })

  if (!admin) {
    return NextResponse.json({ message: 'Admin não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ admin })
}
