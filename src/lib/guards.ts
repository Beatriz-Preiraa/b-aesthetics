import { NextResponse } from 'next/server'
import { getSession, getAdminSession } from './auth'
import { prisma } from './prisma'

/**
 * Garante que a requisição vem de uma loja autenticada e ativa.
 */
export async function requireStore() {
  const session = await getSession()
  const storeId = session?.storeId as string | undefined

  if (!storeId) {
    return {
      error: NextResponse.json({ message: 'Não autenticado' }, { status: 401 }),
      storeId: undefined as unknown as string,
      store: undefined as unknown as Awaited<ReturnType<typeof prisma.store.findUnique>>,
    }
  }

  const store = await prisma.store.findUnique({ where: { id: storeId } })
  if (!store) {
    return {
      error: NextResponse.json({ message: 'Conta não encontrada' }, { status: 404 }),
      storeId: undefined as unknown as string,
      store: undefined as unknown as Awaited<ReturnType<typeof prisma.store.findUnique>>,
    }
  }
  if (!store.isActive) {
    return {
      error: NextResponse.json({ message: 'Conta bloqueada' }, { status: 403 }),
      storeId: undefined as unknown as string,
      store: undefined as unknown as Awaited<ReturnType<typeof prisma.store.findUnique>>,
    }
  }

  return { storeId, store, error: undefined as unknown as NextResponse }
}

/**
 * Garante que a requisição vem de um Admin autenticado via cookie ba_admin_session.
 */
export async function requireAdmin() {
  const session = await getAdminSession()
  if (!session?.adminId) {
    return {
      error: NextResponse.json({ message: 'Não autorizado' }, { status: 401 }),
      adminId: undefined as unknown as string,
    }
  }
  return { adminId: session.adminId as string, error: undefined as unknown as NextResponse }
}
