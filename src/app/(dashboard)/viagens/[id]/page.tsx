'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Badge, { getStatusViagemColor } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EntregaItem from '@/components/features/entregas/EntregaItem'
import FormEncerrar from '@/components/features/viagens/FormEncerrar'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import { getViagem, getEntregasPorViagem, criarEntrega, getVeiculo } from '@/lib/api'
import type { Viagem, Entrega, AlertaOleo } from '@/lib/api'
import BackButton from '@/components/ui/BackButton'

export default function ViagemDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [viagem, setViagem] = useState<Viagem | null>(null)
  const [entregas, setEntregas] = useState<Entrega[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [showEncerrar, setShowEncerrar] = useState(false)
  const [showNovaEntrega, setShowNovaEntrega] = useState(false)
  const [alertaOleo, setAlertaOleo] = useState<AlertaOleo | null>(null)

  const [entregaForm, setEntregaForm] = useState({ cliente: '', enderecoDestino: '', observacao: '' })
  const [entregaLoading, setEntregaLoading] = useState(false)
  const [entregaErro, setEntregaErro] = useState('')

  async function loadData() {
    try {
      const [resViagem, resEntregas] = await Promise.all([
        getViagem(id),
        getEntregasPorViagem(id),
      ])
      if (resViagem.isSuccess) setViagem(resViagem.data)
      else setErro(resViagem.message)
      if (resEntregas.isSuccess) setEntregas(resEntregas.data)
    } catch {
      setErro('Erro ao carregar viagem')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  async function handleNovaEntrega(e: React.FormEvent) {
    e.preventDefault()
    if (!entregaForm.cliente || !entregaForm.enderecoDestino) {
      setEntregaErro('Preencha cliente e endereço')
      return
    }
    setEntregaLoading(true)
    setEntregaErro('')
    try {
      const res = await criarEntrega({
        viagemId: id,
        cliente: entregaForm.cliente,
        enderecoDestino: entregaForm.enderecoDestino,
        observacao: entregaForm.observacao,
      })
      if (!res.isSuccess) {
        setEntregaErro(res.message)
        return
      }
      setEntregaForm({ cliente: '', enderecoDestino: '', observacao: '' })
      setShowNovaEntrega(false)
      loadData()
    } catch {
      setEntregaErro('Erro ao criar entrega')
    } finally {
      setEntregaLoading(false)
    }
  }

  async function handleEncerrarSuccess() {
    setShowEncerrar(false)
    setLoading(true)
    const resViagem = await getViagem(id)
    if (resViagem.isSuccess) {
      setViagem(resViagem.data)
      if (resViagem.data.veiculoId) {
        try {
          const resVeiculo = await getVeiculo(resViagem.data.veiculoId)
          if (resVeiculo.isSuccess && resVeiculo.data.alertaOleo) {
            setAlertaOleo(resVeiculo.data.alertaOleo)
          }
        } catch {
          // ignore
        }
      }
    }
    setLoading(false)
  }

  if (loading) return <p className="text-sm text-[#6b7280] text-center py-8">Carregando...</p>
  if (erro) return <p className="text-sm text-red-600 text-center py-8">{erro}</p>
  if (!viagem) return null

  const frete = viagem.valorFrete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const km = viagem.kmFinal
    ? `${viagem.kmInicial.toLocaleString('pt-BR')} → ${viagem.kmFinal.toLocaleString('pt-BR')} km`
    : `${viagem.kmInicial.toLocaleString('pt-BR')} km`
  const podeAdicionarEntrega = viagem.status === 'EmRota' || viagem.status === 'Aberta'

  return (
    <div className="flex flex-col gap-4">
      <BackButton />
      {alertaOleo && (alertaOleo.nivel === 'Amarelo' || alertaOleo.nivel === 'Vermelho') && (
        <Alert type={alertaOleo.nivel === 'Vermelho' ? 'error' : 'warning'}>
          {alertaOleo.mensagem}
        </Alert>
      )}

      <Card>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-base">{viagem.empresaContratante}</h2>
          <Badge color={getStatusViagemColor(viagem.status)}>{viagem.status}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm text-[#6b7280]">
          <div>
            <p className="text-xs">Frete</p>
            <p className="font-medium text-[#111827]">{frete}</p>
          </div>
          <div>
            <p className="text-xs">Km</p>
            <p className="font-medium text-[#111827]">{km}</p>
          </div>
          <div>
            <p className="text-xs">Origem</p>
            <p className="font-medium text-[#111827]">{viagem.origem}</p>
          </div>
          <div>
            <p className="text-xs">Pagamento</p>
            <p className="font-medium text-[#111827]">{viagem.formaPagamento}</p>
          </div>
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Entregas ({entregas.length})</h3>
          {podeAdicionarEntrega && (
            <button
              onClick={() => setShowNovaEntrega(!showNovaEntrega)}
              className="text-sm text-[#534AB7] font-medium cursor-pointer"
            >
              {showNovaEntrega ? 'Cancelar' : '+ Nova entrega'}
            </button>
          )}
        </div>

        {showNovaEntrega && (
          <div className="bg-[#f9fafb] rounded-xl border border-[#e5e7eb] p-4 mb-3">
            <form onSubmit={handleNovaEntrega} className="flex flex-col gap-3">
              <Input label="Cliente *" value={entregaForm.cliente} onChange={(e) => setEntregaForm({ ...entregaForm, cliente: e.target.value })} />
              <Input label="Endereço destino *" value={entregaForm.enderecoDestino} onChange={(e) => setEntregaForm({ ...entregaForm, enderecoDestino: e.target.value })} />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#111827]">Observação</label>
                <textarea
                  value={entregaForm.observacao}
                  onChange={(e) => setEntregaForm({ ...entregaForm, observacao: e.target.value })}
                  rows={2}
                  className="px-3 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                />
              </div>
              {entregaErro && <p className="text-sm text-red-600">{entregaErro}</p>}
              <Button type="submit" loading={entregaLoading}>Adicionar entrega</Button>
            </form>
          </div>
        )}

        <Card>
          {entregas.length === 0 ? (
            <p className="text-sm text-[#6b7280] text-center py-2">Nenhuma entrega registrada</p>
          ) : (
            entregas.map((e) => <EntregaItem key={e.id} entrega={e} />)
          )}
        </Card>
      </div>

      {viagem.status === 'EmRota' && !showEncerrar && (
        <Button onClick={() => setShowEncerrar(true)} variant="danger" className="w-full">
          Encerrar viagem
        </Button>
      )}

      {showEncerrar && (
        <FormEncerrar
          viagemId={id}
          onSuccess={handleEncerrarSuccess}
          onCancel={() => setShowEncerrar(false)}
        />
      )}

      {viagem.status === 'Encerrada' && (
        <Card>
          <h3 className="font-semibold text-sm mb-2">Resumo</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-[#6b7280]">
            <div>
              <p>Combustível</p>
              <p className="font-medium text-[#111827]">
                {(viagem.gastoCombustivel ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div>
              <p>Pedágio</p>
              <p className="font-medium text-[#111827]">
                {(viagem.gastoPedagio ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div>
              <p>Alimentação</p>
              <p className="font-medium text-[#111827]">
                {(viagem.gastoAlimentacao ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div>
              <p>Outros</p>
              <p className="font-medium text-[#111827]">
                {(viagem.gastoOutros ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
          {viagem.obsEncerramento && (
            <p className="text-xs text-[#6b7280] mt-2">Obs: {viagem.obsEncerramento}</p>
          )}
        </Card>
      )}
    </div>
  )
}
