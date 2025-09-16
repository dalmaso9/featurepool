import { ReactNode } from 'react'
import Sidebar from '@/components/Sidebar'

export default function DashboardGroupLayout({ children }:{ children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <div className="container-app py-6">
          {children}
        </div>
      </div>
    </div>
  )
}
