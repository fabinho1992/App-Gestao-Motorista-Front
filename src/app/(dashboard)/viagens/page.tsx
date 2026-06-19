'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ViagemCard from '@/components/features/viagens/ViagemCard'
import { getViagens } from '@/lib/api'
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

  useEffect(() => {
    async function load() {
      setLoading(true)
      setErro('')
      try {
        const res = await getViagens(status, page, 10)
        if (res.isSuccess) {
          setViagens(res.data)
          setTotalPages(res.totalPage || 1)
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
  }, [status, page])

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
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              status === f
                ? 'bg-[#534AB7] text-white'
                : 'bg-white text-[#6b7280] border border-[#e5e7eb]'
            }`}
          >
            {f === 'EmRota' ? 'Em Rota' : f}
          </button>
        ))}
      </div>

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
                className="px-3 py-1.5 rounded-lg text-sm border border-[#e5e7eb] disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="px-3 py-1.5 text-sm text-[#6b7280]">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm border border-[#e5e7eb] disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}

      <Link
        href="/viagens/nova"
        className="fixed bottom-20 right-4 w-14 h-14 bg-[#534AB7] text-white rounded-full flex items-center justify-center text-2xl shadow-lg hover:bg-[#443d9a] transition-colors z-40"
      >
        +
      </Link>
    </div>
  )
}
