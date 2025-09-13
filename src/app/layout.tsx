import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Featurepool',
  description: 'Gestão de pedidos de funcionalidades'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="body-surface">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
