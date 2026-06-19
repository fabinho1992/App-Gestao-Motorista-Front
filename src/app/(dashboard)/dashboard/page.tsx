'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import MetricCard from '@/components/features/dashboard/MetricCard'
import ViagemAtiva from '@/components/features/dashboard/ViagemAtiva'
import Button from '@/components/ui/Button'
import { getDashboardResumo, getVeiculos } from '@/lib/api'
import type { DashboardResumo, Veiculo } from '@/lib/api'

export default function DashboardPage() {
  const [resumo, setResumo] = useState<DashboardResumo | null>(null)
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const now = new Date()
        const [resDash, resVeiculos] = await Promise.all([
          getDashboardResumo(now.getMonth() + 1, now.getFullYear()),
          getVeiculos(),
        ])
        if (resDash.isSuccess) setResumo(resDash.data)
        else setErro(resDash.message)
        if (resVeiculos.isSuccess) setVeiculos(resVeiculos.data)
      } catch {
        setErro('Erro ao carregar dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <p className="text-sm text-[#6b7280] text-center py-8">Carregando...</p>
  if (erro) return <p className="text-sm text-red-600 text-center py-8">{erro}</p>
  if (!resumo) return null

  const alertas = veiculos.filter(
    (v) => v.alertaOleo && (v.alertaOleo.nivel === 'Amarelo' || v.alertaOleo.nivel === 'Vermelho')
  )

  return (
    <div className="flex flex-col gap-4">
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

      <div className="grid grid-cols-2 gap-3">
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

      {resumo.temViagemAtiva && resumo.viagemAtivaId ? (
        <ViagemAtiva
          viagemId={resumo.viagemAtivaId}
          empresa={resumo.viagemAtivaEmpresa || ''}
          status={resumo.viagemAtivaStatus || ''}
          entregasConcluidas={resumo.entregasConcluidasAtiva}
          totalEntregas={resumo.totalEntregasAtiva}
        />
      ) : (
        <Link href="/viagens/nova">
          <Button className="w-full">Iniciar nova viagem</Button>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3">
        <MetricCard title="Viagens no mês" value={String(resumo.totalViagensMes)} />
        <MetricCard title="Entregas no mês" value={String(resumo.totalEntregasMes)} />
      </div>
    </div>
  )
}
