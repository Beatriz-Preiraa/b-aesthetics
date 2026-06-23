'use client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DashboardOverview from '@/components/dashboard/DashboardOverview'
import ServicesManager from '@/components/dashboard/ServicesManager'
import AppointmentsManager from '@/components/dashboard/AppointmentsManager'
import ExpensesManager from '@/components/dashboard/ExpensesManager'
import ProfileSettings from '@/components/dashboard/ProfileSettings'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      {(section) => {
        switch (section) {
          case 'overview':     return <DashboardOverview />
          case 'services':     return <ServicesManager />
          case 'appointments': return <AppointmentsManager />
          case 'expenses':     return <ExpensesManager />
          case 'profile':      return <ProfileSettings />
          default:             return <DashboardOverview />
        }
      }}
    </DashboardLayout>
  )
}
