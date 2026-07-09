import { Suspense } from 'react'
import RelatorioContent from './RelatorioContent'

function RelatorioSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-[80px] bg-gray-100 rounded-lg animate-pulse" />
      <div className="h-[80px] bg-gray-100 rounded-lg animate-pulse" />
      <div className="h-[80px] bg-gray-100 rounded-lg animate-pulse" />
    </div>
  )
}

export default function RelatorioPage() {
  return (
    <Suspense fallback={<RelatorioSkeleton />}>
      <RelatorioContent />
    </Suspense>
  )
}
