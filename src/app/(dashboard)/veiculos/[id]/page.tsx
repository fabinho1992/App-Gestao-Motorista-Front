'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Badge, { getStatusViagemColor } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import BackButton from '@/components/ui/BackButton'
import { getVeiculoDetalhes, trocarOleoVeiculo, deletarVeiculo } from '@/lib/api'
import type { VeiculoComAlerta } from '@/lib/api'

const POR_PAGINA = 5

export default function VeiculoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [veiculo, setVeiculo] = useState<VeiculoComAlerta | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [trocandoOleo, setTrocandoOleo] = useState(false)
  const [pagina, setPagina] = useState(1)
  const [confirmando, setConfirmando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [erroExclusao, setErroExclusao] = useState('')

  async function loadVeiculo() {
    try {
      const res = await getVeiculoDetalhes(id)
      if (res.isSuccess) setVeiculo(res.data)
      else setErro(res.message)
    } catch {
      setErro('Erro ao carregar veículo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVeiculo()
  }, [id])

  async function handleTrocarOleo() {
    setTrocandoOleo(true)
    try {
      const res = await trocarOleoVeiculo(id)
      if (res.isSuccess) {
        setVeiculo(res.data)
      }
    } catch {
      // ignore
    } finally {
      setTrocandoOleo(false)
    }
  }

  async function excluirVeiculo() {
    setExcluindo(true)
    setErroExclusao('')
    try {
      const res = await deletarVeiculo(id)
      if (res.isSuccess) {
        router.push('/veiculos')
        return
      }
      setErroExclusao(res.message)
    } catch {
      setErroExclusao('Erro ao excluir veículo')
    } finally {
      setExcluindo(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-5 w-20 bg-gray-100 rounded animate-pulse" />
        <div className="h-8 w-32 bg-gray-100 rounded animate-pulse" />
        <div className="h-5 w-48 bg-gray-100 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-6 w-40 bg-gray-100 rounded animate-pulse mt-4" />
        <div className="h-28 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-28 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (erro) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <p className="text-sm text-red-600">{erro}</p>
        <Button onClick={() => router.refresh()} className="min-h-[48px]">
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (!veiculo) return null

  const alerta = veiculo.alertaOleo
  const showAlerta = alerta.nivel === 'Amarelo' || alerta.nivel === 'Vermelho'
  const alertaColor = alerta.nivel === 'Verde' ? 'green' : alerta.nivel === 'Amarelo' ? 'yellow' : 'red'

  const proximaTroca = veiculo.kmUltimoOleo + veiculo.intervaloOleo

  const totalViagens = veiculo.viagens.length
  const totalPaginas = Math.max(1, Math.ceil(totalViagens / POR_PAGINA))
  const viagensPagina = veiculo.viagens.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  return (
    <div className="flex flex-col gap-4">
      <BackButton href="/veiculos" label="Veículos" />

      {/* SEÇÃO 1 — DADOS DO VEÍCULO */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#111827]">{veiculo.placa}</h1>
          <p className="text-sm text-[#6b7280]">{veiculo.modelo} - {veiculo.ano}</p>
        </div>
        <Badge color={alertaColor}>
          {alerta.nivel === 'Verde' && 'Óleo OK'}
          {alerta.nivel === 'Amarelo' && 'Trocar em breve'}
          {alerta.nivel === 'Vermelho' && 'Troca vencida'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs text-[#6b7280] mb-1">Km atual</p>
          <p className="text-xl font-bold text-[#111827]">{veiculo.kmAtual.toLocaleString('pt-BR')}</p>
        </Card>
        <Card>
          <p className="text-xs text-[#6b7280] mb-1">Próxima troca</p>
          <p className="text-xl font-bold text-[#111827]">{proximaTroca.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-[#6b7280]">km</p>
        </Card>
      </div>

      <div className={`px-4 py-3 rounded-lg text-sm ${
        alerta.nivel === 'Vermelho'
          ? 'bg-red-50 text-red-800'
          : alerta.nivel === 'Amarelo'
            ? 'bg-yellow-50 text-yellow-800'
            : 'bg-green-50 text-green-800'
      }`}>
        {alerta.mensagem}
      </div>

      {showAlerta && (
        <Button
          onClick={handleTrocarOleo}
          loading={trocandoOleo}
          className="w-full min-h-[48px]"
        >
          Registrar troca de óleo
        </Button>
      )}

      {/* SEÇÃO 2 — HISTÓRICO DE VIAGENS */}
      <div className="mt-2">
        <h2 className="font-bold text-base text-[#111827] mb-3">
          Histórico de viagens ({totalViagens})
        </h2>

        {totalViagens === 0 ? (
          /* SEÇÃO 3 — ESTADO VAZIO */
          <div className="flex flex-col items-center gap-3 py-8">
            <p className="text-sm text-[#6b7280]">Nenhuma viagem registrada</p>
            <Link href="/viagens/nova">
              <Button className="min-h-[48px]">Iniciar viagem</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {viagensPagina.map((v) => {
                const frete = v.valorFrete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                const lucro = v.saldoLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                const data = new Date(v.dataSaida).toLocaleDateString('pt-BR', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })
                const km = v.kmRodado != null ? v.kmRodado.toLocaleString('pt-BR') + ' km' : '-'

                return (
                  <Link key={v.id} href={`/viagens/${v.id}`} className="cursor-pointer">
                    <Card className="hover:border-[#534AB7] transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm truncate">{v.empresaContratante}</h3>
                            <Badge color={getStatusViagemColor(v.status)}>
                              {v.status === 'EmRota' ? 'Em Rota' : v.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-[#6b7280] mb-2">{data}</p>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            <div>
                              <span className="text-[#6b7280]">Frete: </span>
                              <span className="font-medium text-[#111827]">{frete}</span>
                            </div>
                            <div>
                              <span className="text-[#6b7280]">Lucro: </span>
                              <span className={`font-medium ${v.saldoLiquido >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                {lucro}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#6b7280]">Km: </span>
                              <span className="font-medium text-[#111827]">{km}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                              </svg>
                              <span className="font-medium text-[#111827]">{v.totalEntregas}</span>
                            </div>
                          </div>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#6b7280] flex-shrink-0 ml-2 mt-1">
                          <path d="M7.5 4.5L13 10L7.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>

            {totalPaginas > 1 && (
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className="px-3 min-h-[48px] rounded-lg text-sm border border-[#e5e7eb] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-sm text-[#6b7280]">
                  Página {pagina} de {totalPaginas}
                </span>
                <button
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                  className="px-3 min-h-[48px] rounded-lg text-sm border border-[#e5e7eb] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* SEÇÃO — EXCLUIR VEÍCULO */}
      {!confirmando ? (
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="w-full h-12 border border-red-500 text-red-500 bg-transparent rounded-lg text-sm font-medium hover:bg-red-50 cursor-pointer transition-colors mt-6"
        >
          Excluir veículo
        </button>
      ) : (
        <div className="border border-red-200 rounded-lg p-4 mt-6 bg-red-50">
          <p className="text-sm text-red-700 text-center mb-4">
            Tem certeza que deseja excluir este veículo?<br />
            Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setConfirmando(false); setErroExclusao('') }}
              className="flex-1 h-12 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={excluirVeiculo}
              disabled={excluindo}
              className="flex-1 h-12 bg-red-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {excluindo ? 'Excluindo...' : 'Confirmar'}
            </button>
          </div>
          {erroExclusao && (
            <p className="text-sm text-red-600 text-center mt-2">{erroExclusao}</p>
          )}
        </div>
      )}
    </div>
  )
}
