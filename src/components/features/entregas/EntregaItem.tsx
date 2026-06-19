import Link from 'next/link'
import Badge, { getStatusEntregaColor } from '@/components/ui/Badge'
import type { Entrega } from '@/lib/api'

interface EntregaItemProps {
  entrega: Entrega
}

export default function EntregaItem({ entrega }: EntregaItemProps) {
  return (
    <Link href={`/entregas/${entrega.id}?viagemId=${entrega.viagemId}`}>
      <div className="flex items-center justify-between py-3 border-b border-[#e5e7eb] last:border-0">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{entrega.cliente}</p>
          <p className="text-xs text-[#6b7280] truncate">{entrega.enderecoDestino}</p>
        </div>
        <Badge color={getStatusEntregaColor(entrega.status)}>{entrega.status}</Badge>
      </div>
    </Link>
  )
}
