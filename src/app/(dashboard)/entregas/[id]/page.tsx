'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Card from '@/components/ui/Card'
import Badge, { getStatusEntregaColor } from '@/components/ui/Badge'
import FormConfirmar from '@/components/features/entregas/FormConfirmar'
import FotoComprovante from '@/components/features/entregas/FotoComprovante'
import { getEntregasPorViagem, excluirEntrega } from '@/lib/api'
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
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [erroExclusao, setErroExclusao] = useState('')

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

  async function handleExcluirEntrega() {
    setExcluindo(true)
    setErroExclusao('')
    try {
      const res = await excluirEntrega(id)
      if (res.isSuccess) {
        router.push(`/viagens/${viagemId}`)
      } else {
        setErroExclusao(res.message)
        setConfirmandoExclusao(false)
      }
    } catch {
      setErroExclusao('Erro ao excluir entrega')
      setConfirmandoExclusao(false)
    } finally {
      setExcluindo(false)
    }
  }

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

      {entrega.status === 'Pendente' && (
        !confirmandoExclusao ? (
          <button
            onClick={() => setConfirmandoExclusao(true)}
            className="border border-red-300 text-red-500 w-full h-11 rounded-lg cursor-pointer hover:bg-red-50 text-sm mt-2"
          >
            Excluir entrega
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
            <p className="text-sm text-red-700 text-center mb-3">
              Tem certeza? Esta ação não pode ser desfeita.
            </p>
            {erroExclusao && <p className="text-sm text-red-600 mb-2">{erroExclusao}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setConfirmandoExclusao(false)
                  setErroExclusao('')
                }}
                className="flex-1 h-11 border border-gray-300 bg-white text-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleExcluirEntrega}
                disabled={excluindo}
                className="flex-1 h-11 bg-red-500 text-white rounded-lg cursor-pointer hover:bg-red-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {excluindo ? 'Excluindo...' : 'Confirmar'}
              </button>
            </div>
          </div>
        )
      )}
    </div>
  )
}
