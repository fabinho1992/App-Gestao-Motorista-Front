import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import AssinaturaGuard from '@/components/features/assinatura/AssinaturaGuard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen pb-20">
      <Header />
      <main className="max-w-lg mx-auto px-4 py-4">
        <AssinaturaGuard>{children}</AssinaturaGuard>
      </main>
      <BottomNav />
    </div>
  )
}
