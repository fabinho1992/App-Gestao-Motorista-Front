'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Badge, { getStatusViagemColor } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import BackButton from '@/components/ui/BackButton'
import {
  getVeiculoDetalhes,
  trocarOleoVeiculo,
  deletarVeiculo,
  getManutencoes,
  registrarManutencao,
  excluirManutencao,
} from '@/lib/api'
import type { VeiculoComAlerta, ManutencaoDto } from '@/lib/api'
import { formatarNumero, parsearNumero, formatarDinheiro, parsearDinheiro } from '@/lib/masks'

const POR_PAGINA = 5

const TIPOS_MANUTENCAO = [
  { valor: 'Oleo', label: 'Óleo' },
  { valor: 'Revisao', label: 'Revisão' },
  { valor: 'Freios', label: 'Freios' },
  { valor: 'Filtros', label: 'Filtros' },
  { valor: 'Outro', label: 'Outro' },
]

const BADGE_TIPO_MANUTENCAO: Record<string, string> = {
  Oleo: 'bg-blue-100 text-blue-800',
  Revisao: 'bg-purple-100 text-purple-800',
  Freios: 'bg-red-100 text-red-800',
  Filtros: 'bg-green-100 text-green-800',
  Outro: 'bg-gray-100 text-gray-700',
}

function labelTipoManutencao(tipo: string): string {
  return TIPOS_MANUTENCAO.find((t) => t.valor === tipo)?.label ?? tipo
}

function formatarDataManutencao(data: string): string {
  const [ano, mes, dia] = data.split('T')[0].split('-')
  return `${dia}/${mes}/${ano}`
}

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

  const [manutencoes, setManutencoes] = useState<ManutencaoDto[]>([])
  const [showFormManutencao, setShowFormManutencao] = useState(false)
  const [salvandoManutencao, setSalvandoManutencao] = useState(false)
  const [erroManutencao, setErroManutencao] = useState('')
  const [formManutencao, setFormManutencao] = useState({
    tipo: 'Oleo',
    descricao: '',
    dataRealizacao: '',
    kmRealizacao: '',
    custo: '',
    observacao: ''
  })

  async function loadVeiculo() {
    try {
      const res = await getVeiculoDetalhes(id)
      if (res.isSuccess) setVeiculo(res.data)
      else setErro(res.message)

      const resManutencoes = await getManutencoes(id)
      if (resManutencoes.isSuccess) setManutencoes(resManutencoes.data)
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

  async function handleRegistrarManutencao(e: React.FormEvent) {
    e.preventDefault()
    if (!formManutencao.dataRealizacao) {
      setErroManutencao('Data de realização é obrigatória.')
      return
    }
    if (!formManutencao.kmRealizacao) {
      setErroManutencao('Km de realização é obrigatório.')
      return
    }
    setSalvandoManutencao(true)
    setErroManutencao('')
    try {
      const res = await registrarManutencao({
        veiculoId: id,
        tipo: formManutencao.tipo,
        descricao: formManutencao.descricao || undefined,
        dataRealizacao: formManutencao.dataRealizacao,
        kmRealizacao: parsearNumero(formManutencao.kmRealizacao),
        custo: parsearDinheiro(formManutencao.custo),
        observacao: formManutencao.observacao || undefined
      })
      if (res.isSuccess) {
        const resManutencoes = await getManutencoes(id)
        if (resManutencoes.isSuccess) setManutencoes(resManutencoes.data)
        setShowFormManutencao(false)
        setFormManutencao({
          tipo: 'Oleo', descricao: '', dataRealizacao: '',
          kmRealizacao: '', custo: '', observacao: ''
        })
        if (formManutencao.tipo === 'Oleo') {
          const resVeiculo = await getVeiculoDetalhes(id)
          if (resVeiculo.isSuccess) setVeiculo(resVeiculo.data)
        }
      } else {
        setErroManutencao(res.message)
      }
    } catch {
      setErroManutencao('Erro ao registrar manutenção.')
    } finally {
      setSalvandoManutencao(false)
    }
  }

  async function handleExcluirManutencao(manutencaoId: string) {
    try {
      const res = await excluirManutencao(manutencaoId)
      if (res.isSuccess) {
        setManutencoes(prev => prev.filter(m => m.id !== manutencaoId))
      }
    } catch {
      console.error('Erro ao excluir manutenção')
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

      {/* SEÇÃO — MANUTENÇÕES */}
      <div className="mt-2">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Manutenções</h2>
          <button
            type="button"
            onClick={() => setShowFormManutencao(true)}
            className="text-sm text-[#534AB7] border border-[#534AB7] px-3 py-1.5 rounded-lg cursor-pointer hover:bg-purple-50 min-h-[36px]"
          >
            + Registrar
          </button>
        </div>

        {showFormManutencao && (
          <div className="border border-gray-200 rounded-xl p-4 mb-3">
            <form onSubmit={handleRegistrarManutencao} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Tipo de manutenção</label>
                <div className="flex gap-2 flex-wrap">
                  {TIPOS_MANUTENCAO.map((t) => (
                    <span
                      key={t.valor}
                      onClick={() => setFormManutencao({ ...formManutencao, tipo: t.valor })}
                      className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium ${
                        formManutencao.tipo === t.valor
                          ? 'bg-[#534AB7] text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {t.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Data</label>
                <input
                  type="date"
                  required
                  value={formManutencao.dataRealizacao}
                  onChange={(e) => setFormManutencao({ ...formManutencao, dataRealizacao: e.target.value })}
                  className="px-3 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Km</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatarNumero(formManutencao.kmRealizacao)}
                  onChange={(e) =>
                    setFormManutencao({ ...formManutencao, kmRealizacao: String(parsearNumero(e.target.value)) })
                  }
                  className="px-3 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Custo (R$)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0,00"
                  value={formatarDinheiro(formManutencao.custo)}
                  onChange={(e) =>
                    setFormManutencao({ ...formManutencao, custo: e.target.value.replace(/\D/g, '') })
                  }
                  className="px-3 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Observação (opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Óleo 15W40 Shell Helix"
                  value={formManutencao.observacao}
                  onChange={(e) => setFormManutencao({ ...formManutencao, observacao: e.target.value })}
                  className="px-3 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                />
              </div>

              {erroManutencao && <p className="text-sm text-red-600 mt-1">{erroManutencao}</p>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowFormManutencao(false); setErroManutencao('') }}
                  className="flex-1 h-12 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoManutencao}
                  className="flex-1 h-12 bg-[#534AB7] text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-[#443d9a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {salvandoManutencao ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {manutencoes.length === 0 && !showFormManutencao ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-400">Nenhuma manutenção registrada</p>
            <p className="text-xs text-gray-300 mt-1">Registre trocas de óleo, revisões e outras manutenções</p>
          </div>
        ) : (
          manutencoes.map((m) => {
            const custoFormatado = m.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            return (
              <div key={m.id} className="border border-gray-100 rounded-xl p-3 mt-2">
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${BADGE_TIPO_MANUTENCAO[m.tipo] ?? BADGE_TIPO_MANUTENCAO.Outro}`}>
                    {labelTipoManutencao(m.tipo)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{formatarDataManutencao(m.dataRealizacao)}</span>
                    <span
                      onClick={() => handleExcluirManutencao(m.id)}
                      className="cursor-pointer text-gray-300 hover:text-red-400"
                    >
                      ✕
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 mt-2">
                  <span className="text-xs text-gray-600">{m.kmRealizacao.toLocaleString('pt-BR')} km</span>
                  <span className="text-xs text-gray-600">{custoFormatado}</span>
                </div>
                {m.observacao && (
                  <p className="text-xs text-gray-500 mt-1 italic">{m.observacao}</p>
                )}
              </div>
            )
          })
        )}

        {manutencoes.length > 0 && (
          <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center">
            <span className="text-xs text-gray-500">Total em manutenções</span>
            <span className="text-sm font-medium text-red-600">
              {manutencoes.reduce((soma, m) => soma + m.custo, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        )}
      </div>

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
