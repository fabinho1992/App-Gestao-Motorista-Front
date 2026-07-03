'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ViagemCard from '@/components/features/viagens/ViagemCard'
import { getViagens, getEmpresasDistintas } from '@/lib/api'
import type { Viagem } from '@/lib/api'
import BackButton from '@/components/ui/BackButton'

const filtros = ['Todos', 'EmRota', 'Encerrada']

export default function ViagensPage() {
  const [viagens, setViagens] = useState<Viagem[]>([])
  const [status, setStatus] = useState('Todos')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [empresaFiltro, setEmpresaFiltro] = useState('')
  const [empresasSugestoes, setEmpresasSugestoes] = useState<string[]>([])
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)

  useEffect(() => {
    async function loadEmpresas() {
      try {
        const res = await getEmpresasDistintas()
        if (res.isSuccess) setEmpresasSugestoes(res.data)
      } catch {
        // ignore
      }
    }
    loadEmpresas()
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setErro('')
      try {
        const res = await getViagens(status, dataInicio || undefined, dataFim || undefined, empresaFiltro || undefined, page, 5)
        if (res.isSuccess) {
          setViagens(res.data)
          setTotalPages(res.totalPage || 1)

          console.log(res.data);
        } else {
          setErro(res.message)
        }
      } catch {
        setErro('Erro ao carregar viagens')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [status, dataInicio, dataFim, empresaFiltro, page])

  function changeFilter(f: string) {
    setStatus(f)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-4">
      <BackButton href="/dashboard" label="Início" />
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Viagens</h2>
      </div>

      <div className="flex gap-2">
        {filtros.map((f) => (
          <button
            key={f}
            onClick={() => changeFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              status === f
                ? 'bg-[#534AB7] text-white'
                : 'bg-white text-[#6b7280] border border-[#e5e7eb]'
            }`}
          >
            {f === 'EmRota' ? 'Em Rota' : f}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mt-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#111827]">De</label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => { setDataInicio(e.target.value); setPage(1) }}
            className="px-3 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] min-h-[44px] cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#111827]">Até</label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => { setDataFim(e.target.value); setPage(1) }}
            className="px-3 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] min-h-[44px] cursor-pointer"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[#111827]">Empresa</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por empresa..."
            value={empresaFiltro}
            onFocus={() => setMostrarSugestoes(true)}
            onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
            onChange={(e) => { setEmpresaFiltro(e.target.value); setPage(1); setMostrarSugestoes(true) }}
            className="w-full px-3 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] min-h-[44px] pr-8"
          />
          {empresaFiltro && (
            <button
              type="button"
              onClick={() => { setEmpresaFiltro(''); setPage(1) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#111827] cursor-pointer text-base leading-none"
            >
              ✕
            </button>
          )}
          {mostrarSugestoes && empresasSugestoes.filter(e => e.toLowerCase().includes(empresaFiltro.toLowerCase())).length > 0 && (
            <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-md max-h-48 overflow-y-auto mt-1">
              {empresasSugestoes
                .filter(e => e.toLowerCase().includes(empresaFiltro.toLowerCase()))
                .map(empresa => (
                  <div
                    key={empresa}
                    onMouseDown={() => { setEmpresaFiltro(empresa); setMostrarSugestoes(false) }}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                  >
                    {empresa}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {(dataInicio || dataFim || empresaFiltro) && (
        <button
          onClick={() => { setDataInicio(''); setDataFim(''); setEmpresaFiltro(''); setPage(1) }}
          className="text-sm text-purple-700 underline cursor-pointer"
        >
          Limpar filtros de data
        </button>
      )}

      {loading && <p className="text-sm text-[#6b7280] text-center py-8">Carregando...</p>}
      {erro && <p className="text-sm text-red-600 text-center py-8">{erro}</p>}

      {!loading && !erro && (
        <>
          {viagens.length === 0 ? (
            <p className="text-sm text-[#6b7280] text-center py-8">Nenhuma viagem encontrada</p>
          ) : (
            <div className="flex flex-col gap-3">
              {viagens.map((v) => (
                <ViagemCard key={v.id} viagem={v} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm border border-[#e5e7eb] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-3 py-1.5 text-sm text-[#6b7280]">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm border border-[#e5e7eb] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}

      <Link
        href="/viagens/nova"
        className="fixed bottom-20 right-4 w-14 h-14 bg-[#534AB7] text-white rounded-full flex items-center justify-center text-2xl shadow-lg hover:bg-[#443d9a] transition-colors z-40 cursor-pointer"
      >
        +
      </Link>
    </div>
  )
}
