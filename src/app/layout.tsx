import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

export const metadata = {
  title: 'Rota Certa',
  description: 'Gestão de motoristas autônomos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={geist.variable}>
      <body className="bg-[#f9fafb] text-[#111827] font-sans min-h-screen">
        {children}
      </body>
    </html>
  )
}
