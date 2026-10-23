import type { ReactNode } from 'react'
import { CLIENTE } from '@/cliente.config'
import './globals.css'

export const metadata = { title: `Painel de Lucro · ${CLIENTE.nome}`, robots: { index: false, follow: false } }
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#12301f' }

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>
}
