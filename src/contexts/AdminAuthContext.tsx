'use client'
import { createContext, useContext, useEffect, useState } from 'react'

interface AdminUser {
  id: string
  name: string
  email: string
}

interface AdminAuthContextType {
  admin: AdminUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  admin: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
})

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.admin) setAdmin(data.admin) })
      .finally(() => setIsLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.message || 'Credenciais inválidas')
    }
    const data = await res.json()
    setAdmin(data.admin)
  }

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    setAdmin(null)
    window.location.href = '/admin/login'
  }

  return (
    <AdminAuthContext.Provider value={{
      admin, isLoading, login, logout,
      isAuthenticated: !!admin,
    }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => useContext(AdminAuthContext)
