import Link from 'next/link'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface ViagemAtivaProps {
  viagemId: string
  empresa: string
  status: string
  entregasConcluidas: number
  totalEntregas: number
}

export default function ViagemAtiva({
  viagemId,
  empresa,
  status,
  entregasConcluidas,
  totalEntregas,
}: ViagemAtivaProps) {
  const progresso = totalEntregas > 0 ? (entregasConcluidas / totalEntregas) * 100 : 0

  return (
    <Card className="border-[#534AB7] border-l-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">Viagem ativa</h3>
        <Badge color="yellow">{status}</Badge>
      </div>
      <p className="text-sm text-[#6b7280] mb-3">{empresa}</p>
      <div className="mb-2">
        <div className="flex justify-between text-xs text-[#6b7280] mb-1">
          <span>Entregas</span>
          <span>{entregasConcluidas}/{totalEntregas}</span>
        </div>
        <div className="w-full bg-[#e5e7eb] rounded-full h-2">
          <div
            className="bg-[#534AB7] h-2 rounded-full transition-all"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>
      <Link
        href={`/viagens/${viagemId}`}
        className="text-sm text-[#534AB7] font-medium hover:underline cursor-pointer"
      >
        Ver detalhes
      </Link>
    </Card>
  )
}
