import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

// NOTA: Integrar com serviço de e-mail (ex: Resend) em produção.
// Este endpoint sempre retorna sucesso para não revelar se o e-mail existe.

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ message: 'Informe o e-mail' }, { status: 400 })
    }

    const store = await prisma.store.findUnique({ where: { email } })

    if (store) {
      const resetToken = await signToken({ storeId: store.id, purpose: 'password-reset' })
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`

      // TODO: enviar e-mail real com resetUrl
      console.log(`[DEV] Link de redefinição para ${email}: ${resetUrl}`)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Erro ao processar solicitação' }, { status: 500 })
  }
}
