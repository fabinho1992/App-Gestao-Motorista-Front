'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Badge, { getStatusViagemColor } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EntregaItem from '@/components/features/entregas/EntregaItem'
import FormEncerrar from '@/components/features/viagens/FormEncerrar'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import { getViagem, getEntregasPorViagem, criarEntrega, getVeiculo, atualizarStatusPagamento, excluirViagem } from '@/lib/api'
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
  const [atualizandoPagamento, setAtualizandoPagamento] = useState(false)
  const [pagamentoErro, setPagamentoErro] = useState('')
  const [confirmandoExclusaoViagem, setConfirmandoExclusaoViagem] = useState(false)
  const [excluindoViagem, setExcluindoViagem] = useState(false)
  const [erroExclusaoViagem, setErroExclusaoViagem] = useState('')

  const loadData = useCallback(async () => {
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
}, [id])

  useEffect(() => {
  loadData()
}, [loadData])

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

  async function handleAtualizarPagamento(novoStatus: 'Pendente' | 'Pago' | 'Cancelado') {
    setAtualizandoPagamento(true)
    setPagamentoErro('')
    try {
      const res = await atualizarStatusPagamento(id, novoStatus)
      if (res.isSuccess) {
        await loadData()
      } else {
        setPagamentoErro(res.message || 'Erro ao atualizar status de pagamento')
      }
    } catch {
      setPagamentoErro('Erro ao atualizar status de pagamento')
    } finally {
      setAtualizandoPagamento(false)
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

  async function handleExcluirViagem() {
    setExcluindoViagem(true)
    setErroExclusaoViagem('')
    try {
      const res = await excluirViagem(id)
      if (res.isSuccess) {
        router.push('/viagens')
      } else {
        setErroExclusaoViagem(res.message)
        setConfirmandoExclusaoViagem(false)
      }
    } catch {
      setErroExclusaoViagem('Erro ao excluir viagem')
      setConfirmandoExclusaoViagem(false)
    } finally {
      setExcluindoViagem(false)
    }
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

      <Card>
        <h3 className="font-semibold text-sm mb-3">Status de pagamento</h3>
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              viagem.statusPagamento === 'Pago'
                ? 'bg-green-100 text-green-800'
                : viagem.statusPagamento === 'Cancelado'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {viagem.statusPagamento}
          </span>
        </div>
        <p className="text-xs text-[#6b7280] mb-3">Forma: {viagem.formaPagamento}</p>

        {pagamentoErro && <p className="text-sm text-red-600 mb-2">{pagamentoErro}</p>}

        {viagem.statusPagamento === 'Pendente' && (
          <div className="flex gap-2">
            <button
              onClick={() => handleAtualizarPagamento('Pago')}
              disabled={atualizandoPagamento}
              className="bg-green-500 text-white rounded-lg h-11 flex-1 cursor-pointer hover:bg-green-600 disabled:opacity-50 text-sm font-medium"
            >
              Marcar como pago
            </button>
            <button
              onClick={() => handleAtualizarPagamento('Cancelado')}
              disabled={atualizandoPagamento}
              className="border border-red-300 text-red-600 rounded-lg h-11 flex-1 cursor-pointer hover:bg-red-50 disabled:opacity-50 text-sm font-medium"
            >
              Cancelar pagamento
            </button>
          </div>
        )}

        {viagem.statusPagamento === 'Pago' && (
          <button
            onClick={() => handleAtualizarPagamento('Pendente')}
            disabled={atualizandoPagamento}
            className="border border-gray-300 text-gray-600 rounded-lg h-11 w-full cursor-pointer hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
          >
            Reverter para pendente
          </button>
        )}

        {viagem.statusPagamento === 'Cancelado' && (
          <button
            onClick={() => handleAtualizarPagamento('Pendente')}
            disabled={atualizandoPagamento}
            className="border border-yellow-300 text-yellow-700 rounded-lg h-11 w-full cursor-pointer hover:bg-yellow-50 disabled:opacity-50 text-sm font-medium"
          >
            Reativar pagamento
          </button>
        )}
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

      {(viagem.status === 'Aberta' || viagem.status === 'EmRota') && (
  !confirmandoExclusaoViagem ? (
    <button
      onClick={() => setConfirmandoExclusaoViagem(true)}
      className="border border-red-300 text-red-500 w-full h-12 rounded-lg cursor-pointer hover:bg-red-50 font-medium text-sm mt-4"
    >
      Excluir viagem
    </button>
  ) : (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
      <p className="text-sm font-medium text-red-700 text-center mb-1">
        Tem certeza que deseja excluir esta viagem?
      </p>
      <p className="text-xs text-red-500 text-center mb-3">
        Esta ação não pode ser desfeita.
      </p>
      {viagem.status === 'EmRota' && viagem.entregas && viagem.entregas.length > 0 && (
        <p className="text-xs text-red-600 text-center mb-2">
          Esta viagem possui {viagem.entregas.length} entrega(s) vinculada(s).
          Todas serão excluídas junto com a viagem.
        </p>
      )}
      {erroExclusaoViagem && (
        <p className="text-sm text-red-600 text-center mb-2">{erroExclusaoViagem}</p>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setConfirmandoExclusaoViagem(false)
            setErroExclusaoViagem('')
          }}
          className="flex-1 h-11 border border-gray-300 bg-white text-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 text-sm"
        >
          Cancelar
        </button>
        <button
          onClick={handleExcluirViagem}
          disabled={excluindoViagem}
          className="flex-1 h-11 bg-red-500 text-white rounded-lg cursor-pointer hover:bg-red-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {excluindoViagem ? 'Excluindo...' : 'Confirmar'}
        </button>
      </div>
    </div>
  )
)}
    </div>
  )
}
