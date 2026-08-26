import { AdminAuthProvider } from '@/contexts/AdminAuthContext'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={poppins.className}>
      <AdminAuthProvider>
        {children}
      </AdminAuthProvider>
    </div>
  )
}