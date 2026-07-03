import Link from 'next/link'
import Card from '@/components/ui/Card'
import Badge, { getStatusViagemColor } from '@/components/ui/Badge'
import type { Viagem } from '@/lib/api'

interface ViagemCardProps {
  viagem: Viagem
}

export default function ViagemCard({ viagem }: ViagemCardProps) {
  const frete = viagem.valorFrete.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
  const lucro = (viagem.saldoLiquido ?? 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
  const km = viagem.kmFinal
    ? (viagem.kmFinal - viagem.kmInicial).toLocaleString('pt-BR')
    : '-'
  const data = new Date(viagem.criadoEm).toLocaleDateString('pt-BR')

  return (
    <Link href={`/viagens/${viagem.id}`} className="cursor-pointer">
      <Card className="hover:border-[#534AB7] transition-colors">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm truncate">{viagem.empresaContratante}</h3>
          <div className="flex flex-col items-end gap-1">
            <Badge color={getStatusViagemColor(viagem.status)}>{viagem.status}</Badge>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                viagem.statusPagamento === 'Pago'
                  ? 'bg-green-50 text-green-700'
                  : viagem.statusPagamento === 'Cancelado'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-yellow-50 text-yellow-700'
              }`}
            >
              {viagem.statusPagamento}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs text-[#6b7280]">
          <div>
            <p>Data</p>
            <p className="font-medium text-[#111827]">{data}</p>
          </div>
          <div>
            <p>Frete</p>
            <p className="font-medium text-[#111827]">{frete}</p>
          </div>
          <div>
            <p>Km</p>
            <p className="font-medium text-[#111827]">{km}</p>
          </div>
        </div>
        {viagem.status === 'Encerrada' && (
          <div className="mt-2 text-xs">
            <span className="text-[#6b7280]">Lucro: </span>
            <span className="font-medium text-green-700">{lucro}</span>
          </div>
        )}
      </Card>
    </Link>
  )
}
