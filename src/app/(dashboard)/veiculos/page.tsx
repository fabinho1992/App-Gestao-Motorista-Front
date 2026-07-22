'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { getVeiculos } from '@/lib/api'
import type { Veiculo } from '@/lib/api'
import BackButton from '@/components/ui/BackButton'

export default function VeiculosPage() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

useEffect(() => {
  async function load() {
    try {
      const res = await getVeiculos()
      if (res.isSuccess) {
        setVeiculos(res.data)
      } else {
        setErro(res.message) // ← adiciona isso
      }
    } catch {
      setErro('Erro ao carregar veículos')
    } finally {
      setLoading(false)
    }
  }
  load()
}, [])

  // useEffect(() => {
  //   async function load() {
  //     try {
  //       const res = await getVeiculos()
  //       if (res.isSuccess) setVeiculos(res.data)
  //       else setErro(res.message)
  //     } catch {
  //       setErro('Erro ao carregar veículos')
  //     } finally {
  //       setLoading(false)
  //     }
  //   }
  //   load()
  // }, [])

  if (loading) return <p className="text-sm text-[#6b7280] text-center py-8">Carregando...</p>
  if (erro) return <p className="text-sm text-red-600 text-center py-8">{erro}</p>

  return (
    <div className="flex flex-col gap-4">
      <BackButton href="/dashboard" label="Início" />
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Veículos</h2>
        <Link
          href="/veiculos/novo"
          className="text-sm text-purple-700 border border-purple-300 px-3 py-2 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors"
        >
          Novo veículo
        </Link>
      </div>

      {(!veiculos || veiculos.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700 mt-4">Nenhum veículo cadastrado</h3>
          <p className="text-sm text-gray-500 text-center mt-2 max-w-xs">
            Cadastre seu primeiro veículo para começar a registrar suas viagens
          </p>
          <Link
            href="/veiculos/novo"
            className="mt-6 inline-flex items-center justify-center bg-[#534AB7] text-white px-6 py-3 rounded-lg cursor-pointer hover:opacity-85 transition-opacity font-medium text-sm"
          >
            Cadastrar veículo
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {veiculos.map((v) => {
            const showAlerta =
              v.alertaOleo &&
              (v.alertaOleo.nivel === 'Amarelo' || v.alertaOleo.nivel === 'Vermelho')

            return (
              <Link key={v.id} href={`/veiculos/${v.id}`} className="cursor-pointer">
                <Card className="hover:border-[#534AB7] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm">{v.placa}</h3>
                        {showAlerta && (
                          <Badge color={v.alertaOleo.nivel === 'Vermelho' ? 'red' : 'yellow'}>
                            {v.alertaOleo.nivel === 'Vermelho' ? 'Troca vencida' : 'Trocar óleo em breve'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-[#6b7280]">{v.modelo} - {v.ano}</p>
                      <p className="text-xs text-[#6b7280] mt-1">
                        Km atual: <span className="font-medium text-[#111827]">{v.kmAtual.toLocaleString('pt-BR')}</span>
                      </p>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#6b7280] flex-shrink-0 ml-2">
                      <path d="M7.5 4.5L13 10L7.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      <Link
        href="/veiculos/novo"
        className="fixed bottom-20 right-4 w-14 h-14 bg-[#534AB7] text-white rounded-full flex items-center justify-center text-2xl shadow-lg hover:bg-[#443d9a] transition-colors z-40 cursor-pointer"
      >
        +
      </Link>
    </div>
  )
}
