'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getRelatorioCombustivel } from '@/lib/api'
import type { RelatorioCombustivelDto } from '@/lib/api'

interface RelatorioCombustivelProps {
  mes: number
  ano: number
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function RelatorioCombustivel({ mes, ano }: RelatorioCombustivelProps) {
  const [relatorio, setRelatorio] = useState<RelatorioCombustivelDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await getRelatorioCombustivel(mes, ano)
        if (res.isSuccess) setRelatorio(res.data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [mes, ano])

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 border border-gray-100 rounded-lg p-3 animate-pulse">
              <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white animate-pulse">
          <div className="h-4 w-full bg-gray-200 rounded mb-3" />
          <div className="h-4 w-full bg-gray-200 rounded mb-3" />
          <div className="h-4 w-full bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  if (!relatorio) return null

  if (relatorio.totalViagensEncerradas === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        Nenhuma viagem encerrada em {relatorio.nomeMes}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
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

      <Link
        href={`/relatorio?mes=${mes}&ano=${ano}`}
        className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 rounded-lg border border-[#534AB7] text-[#534AB7] text-sm font-medium cursor-pointer hover:bg-purple-50 transition-colors"
      >
        Ver relatório completo
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
          <path d="M4 10h12M12 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  )
}
