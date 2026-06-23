import type { Metadata } from 'next'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'B.aesthetics — Gestão para profissionais da beleza',
  description: 'Catálogo, agenda e financeiro para Lash Designers, Nail Designers e microempreendedoras da beleza.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
