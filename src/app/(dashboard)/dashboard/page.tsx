'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import MetricCard from '@/components/features/dashboard/MetricCard'
import ViagemAtiva from '@/components/features/dashboard/ViagemAtiva'
import RelatorioCombustivel from '@/components/features/dashboard/RelatorioCombustivel'
import Button from '@/components/ui/Button'
import { getDashboardResumo, getVeiculos } from '@/lib/api'
import type { DashboardResumo, Veiculo } from '@/lib/api'

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const now = new Date()
const mesAtual = now.getMonth() + 1
const anoAtual = now.getFullYear()

export default function DashboardPage() {
  const [resumo, setResumo] = useState<DashboardResumo | null>(null)
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingDash, setLoadingDash] = useState(false)
  const [erro, setErro] = useState('')
  const [mes, setMes] = useState(mesAtual)
  const [ano, setAno] = useState(anoAtual)

  useEffect(() => {
    async function load() {
      try {
        const resVeiculos = await getVeiculos()
        if (resVeiculos.isSuccess) setVeiculos(resVeiculos.data)
          console.log(resVeiculos.data);
      } catch {
        setErro('Erro ao carregar veículos')
      }
    }
    load()
  }, [])

  useEffect(() => {
    async function load() {
      setLoadingDash(true)
      try {
        const res = await getDashboardResumo(mes, ano)
        if (res.isSuccess) setResumo(res.data)
        else setErro(res.message)
      } catch {
        setErro('Erro ao carregar período')
      } finally {
        setLoadingDash(false)
        setLoading(false)
      }
    }
    load()
  }, [mes, ano])

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

  if (loading) return <p className="text-sm text-[#6b7280] text-center py-8">Carregando...</p>
  if (erro && !resumo) return <p className="text-sm text-red-600 text-center py-8">{erro}</p>
  if (!resumo) return null

  const alertas = veiculos.filter(
    (v) => v.alertaOleo && (v.alertaOleo.nivel === 'Amarelo' || v.alertaOleo.nivel === 'Vermelho')
  )

  return (
    <div className="flex flex-col gap-4">
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

      {alertas.map((v) => (
        <div
          key={v.id}
          className={`px-4 py-3 rounded-lg text-sm font-medium ${
            v.alertaOleo.nivel === 'Vermelho'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {v.placa} - {v.alertaOleo.mensagem}
        </div>
      ))}

      <div className={`grid grid-cols-2 gap-3 transition-opacity ${loadingDash ? 'opacity-50' : ''}`}>
        <MetricCard
          title="Ganhos"
          value={resumo.totalGanhosMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        />
        <MetricCard
          title="Gastos"
          value={resumo.totalGastosMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        />
        <MetricCard
          title="Lucro líquido"
          value={resumo.lucroLiquidoMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        />
        <MetricCard
          title="Km rodados"
          value={resumo.totalKmRodadosMes.toLocaleString('pt-BR') + ' km'}
        />
      </div>

      {resumo.totalAReceber > 0 && (
        <div className="border border-amber-200 rounded-xl p-4 bg-amber-50">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600">
              <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span className="text-sm font-semibold text-amber-800">A receber</span>
          </div>

          <p className="text-2xl font-bold text-amber-700 mt-1">
            {resumo.totalAReceber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-xs text-amber-600 mt-1">
            {resumo.viajensPendentePagamento} viagem(ns) encerrada(s) aguardando pagamento
          </p>

          <div className="border-t border-amber-200 mt-3 pt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-amber-600">Gastos realizados</p>
              <p className="text-sm font-medium text-amber-800">
                {resumo.totalGastosPendentes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div>
              <p className="text-xs text-amber-600">Lucro estimado</p>
              <p className={`text-sm font-medium ${resumo.lucroEstimadoPendente >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {resumo.lucroEstimadoPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>

          <Link
            href="/viagens?status=Encerrada&statusPagamento=Pendente"
            className="block text-xs text-amber-700 underline cursor-pointer mt-3"
          >
            Ver viagens pendentes
          </Link>
        </div>
      )}

      {resumo.temViagemAtiva && resumo.viagemAtivaId && (
        <ViagemAtiva
          viagemId={resumo.viagemAtivaId}
          empresa={resumo.viagemAtivaEmpresa || ''}
          status={resumo.viagemAtivaStatus || ''}
          entregasConcluidas={resumo.entregasConcluidasAtiva}
          totalEntregas={resumo.totalEntregasAtiva}
        />
      )}

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2 mt-2">Relatório de gastos</p>
        <RelatorioCombustivel mes={mes} ano={ano} />
      </div>

      <Link href="/viagens/nova" className="cursor-pointer">
        {resumo.temViagemAtiva ? (
          <button
            type="button"
            className="w-full min-h-[48px] px-4 py-2.5 rounded-lg font-medium text-sm transition-colors cursor-pointer bg-transparent border border-[#534AB7] text-[#534AB7] hover:bg-purple-50"
          >
            Iniciar nova viagem
          </button>
        ) : (
          <Button className="w-full min-h-[48px]">Iniciar nova viagem</Button>
        )}
      </Link>

      <div className={`grid grid-cols-2 gap-3 transition-opacity ${loadingDash ? 'opacity-50' : ''}`}>
        <MetricCard title="Viagens no mês" value={String(resumo.totalViagensMes)} />
        <MetricCard title="Entregas no mês" value={String(resumo.totalEntregasMes)} />
      </div>
    </div>
  )
}
