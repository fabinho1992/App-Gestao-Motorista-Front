'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import BackButton from '@/components/ui/BackButton'
import { getRelatorioCombustivel } from '@/lib/api'
import type { RelatorioCombustivelDto } from '@/lib/api'

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const now = new Date()
const mesAtual = now.getMonth() + 1
const anoAtual = now.getFullYear()

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarData(data: string) {
  const [ano, mes, dia] = data.split('T')[0].split('-')
  return `${dia}/${mes}/${ano}`
}

export default function RelatorioContent() {
  const searchParams = useSearchParams()
  const mesParam = searchParams.get('mes')
  const anoParam = searchParams.get('ano')

  const [mes, setMes] = useState(mesParam ? Number(mesParam) : mesAtual)
  const [ano, setAno] = useState(anoParam ? Number(anoParam) : anoAtual)
  const [relatorio, setRelatorio] = useState<RelatorioCombustivelDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [viagemAbertaIndex, setViagemAbertaIndex] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setErro('')
    try {
      const res = await getRelatorioCombustivel(mes, ano)
      if (res.isSuccess) setRelatorio(res.data)
      else setErro(res.message)
    } catch {
      setErro('Erro ao carregar relatório')
    } finally {
      setLoading(false)
    }
  }, [mes, ano])

  useEffect(() => {
    load()
  }, [load])

  const isNoMesAtual = mes === mesAtual && ano === anoAtual

  function mesAnterior() {
    if (mes === 1) {
      setMes(12)
      setAno((a) => a - 1)
    } else {
      setMes((m) => m - 1)
    }
  }

  function mesSeguinte() {
    if (isNoMesAtual) return
    if (mes === 12) {
      setMes(1)
      setAno((a) => a + 1)
    } else {
      setMes((m) => m + 1)
    }
  }

  function toggleViagem(index: number) {
    setViagemAbertaIndex((atual) => (atual === index ? null : index))
  }

  return (
    <div>
      <BackButton href="/dashboard" label="Início" />
      <h2 className="text-xl font-bold mt-2 mb-4">Relatório de gastos</h2>

      <div className="flex items-center justify-center gap-4 py-2">
        <button
          type="button"
          onClick={mesAnterior}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-[#e5e7eb] hover:bg-gray-50 cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-[15px] font-semibold text-[#111827] min-w-[140px] text-center">
          {meses[mes - 1]} {ano}
        </span>
        <button
          type="button"
          onClick={mesSeguinte}
          disabled={isNoMesAtual}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-[#e5e7eb] hover:bg-gray-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {loading && (
        <div className="flex flex-col gap-3 mt-4">
          <div className="h-[80px] bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-[80px] bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-[80px] bg-gray-100 rounded-lg animate-pulse" />
        </div>
      )}

      {!loading && erro && (
        <div className="flex flex-col items-center gap-3 py-8">
          <p className="text-red-600 text-sm text-center">{erro}</p>
          <button
            type="button"
            onClick={load}
            className="min-h-[44px] px-4 rounded-lg border border-[#534AB7] text-[#534AB7] text-sm font-medium cursor-pointer hover:bg-purple-50"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !erro && relatorio && (
        <div className="flex flex-col gap-3 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
              <p className="text-xs text-gray-500">Combustível</p>
              <p className="text-base font-semibold text-red-600">
                {formatarMoeda(relatorio.totalGastoCombustivel)}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
              <p className="text-xs text-gray-500">Pedágio</p>
              <p className="text-base font-semibold text-red-600">
                {formatarMoeda(relatorio.totalGastoPedagio)}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
              <p className="text-xs text-gray-500">Alimentação</p>
              <p className="text-base font-semibold text-red-600">
                {formatarMoeda(relatorio.totalGastoAlimentacao)}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
              <p className="text-xs text-gray-500">Outros</p>
              <p className="text-base font-semibold text-red-600">
                {formatarMoeda(relatorio.totalGastoOutros)}
              </p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Total de gastos</span>
              <span className="text-sm font-bold text-red-600">
                {formatarMoeda(relatorio.totalGastosGeral)}
              </span>
            </div>

            <div className="border-t border-gray-100 my-2" />

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Km rodado</span>
              <span className="text-sm font-medium text-[#111827]">
                {relatorio.totalKmRodado.toLocaleString('pt-BR')} km
              </span>
            </div>

            {relatorio.mediaKmPorLitro > 0 && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-700">Média km/litro</span>
                <span className="text-sm font-medium text-[#111827]">
                  {relatorio.mediaKmPorLitro.toFixed(1)} km/l
                </span>
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-700">Viagens encerradas</span>
              <span className="text-sm font-medium text-[#111827]">
                {relatorio.totalViagensEncerradas}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mt-4 mb-2">
              Detalhes por viagem ({relatorio.totalViagensEncerradas})
            </p>

            {relatorio.totalViagensEncerradas === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                Nenhuma viagem encerrada em {relatorio.nomeMes}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {relatorio.viagens.map((viagem, index) => {
                  const aberta = viagemAbertaIndex === index
                  return (
                    <div key={viagem.viagemId}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleViagem(index)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') toggleViagem(index)
                        }}
                        className="flex items-center justify-between p-3 min-h-[44px] border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div>
                          <p className="text-sm font-medium">{viagem.empresaContratante}</p>
                          <p className="text-xs text-gray-500">
                            {formatarData(viagem.dataEncerramento)}
                          </p>
                        </div>
                        {aberta ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
                            <path d="M3 10L8 5L13 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
                            <path d="M3 6L8 11L13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>

                      {aberta && (
                        <div className="border border-t-0 border-gray-200 rounded-b-lg bg-gray-50 p-3 flex flex-col gap-1">
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Combustível</span>
                            <span className="text-xs font-medium text-gray-800">
                              {formatarMoeda(viagem.gastoCombustivel)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Pedágio</span>
                            <span className="text-xs font-medium text-gray-800">
                              {formatarMoeda(viagem.gastoPedagio)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Alimentação</span>
                            <span className="text-xs font-medium text-gray-800">
                              {formatarMoeda(viagem.gastoAlimentacao)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Outros</span>
                            <span className="text-xs font-medium text-gray-800">
                              {formatarMoeda(viagem.gastoOutros)}
                            </span>
                          </div>

                          <div className="border-t border-gray-200 my-1" />

                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Total gastos</span>
                            <span className="text-xs font-semibold text-red-600">
                              {formatarMoeda(viagem.totalGastos)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Km rodado</span>
                            <span className="text-xs font-medium text-gray-800">
                              {viagem.kmRodado.toLocaleString('pt-BR')} km
                            </span>
                          </div>

                          <div className="border-t border-gray-200 my-1" />

                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Frete</span>
                            <span className="text-xs font-medium text-green-600">
                              {formatarMoeda(viagem.valorFrete)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Lucro líquido</span>
                            <span className="text-xs font-semibold text-green-700">
                              {formatarMoeda(viagem.saldoLiquido)}
                            </span>
                          </div>

                          <Link
                            href={`/viagens/${viagem.viagemId}`}
                            className="text-xs text-[#534AB7] underline cursor-pointer mt-1"
                          >
                            Ver viagem
                          </Link>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
