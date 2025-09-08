import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import Topbar from '@/components/Topbar'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Feature Requests',
  description: 'Gestão de pedidos de funcionalidades'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="body-surface">
        <AuthProvider>
          <Topbar />
          <div className="container-app py-6">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}