'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Card from '@/components/ui/Card'
import Badge, { getStatusEntregaColor } from '@/components/ui/Badge'
import FormConfirmar from '@/components/features/entregas/FormConfirmar'
import FotoComprovante from '@/components/features/entregas/FotoComprovante'
import { getEntregasPorViagem } from '@/lib/api'
import type { Entrega } from '@/lib/api'
import BackButton from '@/components/ui/BackButton'

export default function EntregaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const viagemId = searchParams.get('viagemId') || ''
  const [entrega, setEntrega] = useState<Entrega | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function load() {
      if (!viagemId) {
        setErro('Viagem não encontrada')
        setLoading(false)
        return
      }
      try {
        const res = await getEntregasPorViagem(viagemId)
        if (res.isSuccess) {
          const found = res.data.find((e) => e.id === id)
          if (found) setEntrega(found)
          else setErro('Entrega não encontrada')
        } else {
          setErro(res.message)
        }
      } catch {
        setErro('Erro ao carregar entrega')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, viagemId])

  if (loading) return <p className="text-sm text-[#6b7280] text-center py-8">Carregando...</p>
  if (erro) return <p className="text-sm text-red-600 text-center py-8">{erro}</p>
  if (!entrega) return null

  return (
    <div className="flex flex-col gap-4">
      <BackButton />
      <h2 className="text-lg font-bold">Detalhes da entrega</h2>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-base">{entrega.cliente}</h3>
          <Badge color={getStatusEntregaColor(entrega.status)}>{entrega.status}</Badge>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <div>
            <p className="text-xs text-[#6b7280]">Endereço</p>
            <p className="text-[#111827]">{entrega.enderecoDestino}</p>
          </div>
          {entrega.observacao && (
            <div>
              <p className="text-xs text-[#6b7280]">Observação</p>
              <p className="text-[#111827]">{entrega.observacao}</p>
            </div>
          )}
          {entrega.motivoFalha && (
            <div>
              <p className="text-xs text-[#6b7280]">Motivo da falha</p>
              <p className="text-red-600">{entrega.motivoFalha}</p>
            </div>
          )}
        </div>
      </Card>

      {(entrega.status === 'Entregue' || (entrega.fotos && entrega.fotos.length > 0)) && (
        <Card>
          <h3 className="font-semibold text-sm mb-3">
            Comprovante de entrega{entrega.fotos && entrega.fotos.length > 0 ? ` (${entrega.fotos.length})` : ''}
          </h3>
          <FotoComprovante fotos={entrega.fotos || []} />
        </Card>
      )}

      {entrega.status === 'Pendente' && (
        <FormConfirmar
          entregaId={entrega.id}
          onSuccess={() => router.push(`/viagens/${viagemId}`)}
        />
      )}
    </div>
  )
}
