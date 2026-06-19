'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { getVeiculos, trocarOleo } from '@/lib/api'
import type { Veiculo } from '@/lib/api'
import BackButton from '@/components/ui/BackButton'

export default function VeiculosPage() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [trocandoOleo, setTrocandoOleo] = useState<string | null>(null)

  async function loadVeiculos() {
    try {
      const res = await getVeiculos()
      if (res.isSuccess) setVeiculos(res.data)
      else setErro(res.message)
    } catch {
      setErro('Erro ao carregar veículos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVeiculos()
  }, [])

  async function handleTrocarOleo(id: string) {
    setTrocandoOleo(id)
    try {
      const res = await trocarOleo(id)
      if (res.isSuccess) {
        loadVeiculos()
      }
    } catch {
      // ignore
    } finally {
      setTrocandoOleo(null)
    }
  }

  if (loading) return <p className="text-sm text-[#6b7280] text-center py-8">Carregando...</p>
  if (erro) return <p className="text-sm text-red-600 text-center py-8">{erro}</p>

  return (
    <div className="flex flex-col gap-4">
      <BackButton href="/dashboard" label="Início" />
      <h2 className="text-lg font-bold">Veículos</h2>

      {veiculos.length === 0 ? (
        <p className="text-sm text-[#6b7280] text-center py-8">Nenhum veículo cadastrado</p>
      ) : (
        <div className="flex flex-col gap-3">
          {veiculos.map((v) => {
            const showAlerta =
              v.alertaOleo &&
              (v.alertaOleo.nivel === 'Amarelo' || v.alertaOleo.nivel === 'Vermelho')

            return (
              <Card key={v.id}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-sm">{v.placa}</h3>
                    <p className="text-xs text-[#6b7280]">{v.modelo} - {v.ano}</p>
                  </div>
                  {showAlerta && (
                    <Badge color={v.alertaOleo.nivel === 'Vermelho' ? 'red' : 'yellow'}>
                      Óleo: {v.alertaOleo.nivel}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-[#6b7280]">
                  Km atual: <span className="font-medium text-[#111827]">{v.kmAtual.toLocaleString('pt-BR')}</span>
                </p>
                {showAlerta && (
                  <div className="mt-2">
                    <p className="text-xs text-[#6b7280] mb-1">{v.alertaOleo.mensagem}</p>
                    <Button
                      variant="secondary"
                      onClick={() => handleTrocarOleo(v.id)}
                      loading={trocandoOleo === v.id}
                      className="text-xs"
                    >
                      Trocar óleo
                    </Button>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Link
        href="/veiculos/novo"
        className="fixed bottom-20 right-4 w-14 h-14 bg-[#534AB7] text-white rounded-full flex items-center justify-center text-2xl shadow-lg hover:bg-[#443d9a] transition-colors z-40"
      >
        +
      </Link>
    </div>
  )
}
