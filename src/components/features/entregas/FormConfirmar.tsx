'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { confirmarEntrega, registrarFalhaEntrega } from '@/lib/api'

interface FormConfirmarProps {
  entregaId: string
  onSuccess: () => void
}

export default function FormConfirmar({ entregaId, onSuccess }: FormConfirmarProps) {
  const [modo, setModo] = useState<'idle' | 'confirmar' | 'falha'>('idle')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [fotos, setFotos] = useState<FileList | null>(null)
  const [motivo, setMotivo] = useState('')

  async function handleConfirmar() {
    setLoading(true)
    setErro('')
    try {
      const res = await confirmarEntrega(entregaId, fotos || undefined)
      if (!res.isSuccess) {
        setErro(res.message)
        return
      }
      onSuccess()
    } catch {
      setErro('Erro ao confirmar entrega')
    } finally {
      setLoading(false)
    }
  }

  async function handleFalha() {
    if (!motivo.trim()) {
      setErro('Informe o motivo da falha')
      return
    }
    setLoading(true)
    setErro('')
    try {
      const res = await registrarFalhaEntrega(entregaId, motivo)
      if (!res.isSuccess) {
        setErro(res.message)
        return
      }
      onSuccess()
    } catch {
      setErro('Erro ao registrar falha')
    } finally {
      setLoading(false)
    }
  }

  if (modo === 'idle') {
    return (
      <div className="flex gap-2 mt-4">
        <Button onClick={() => setModo('confirmar')} className="flex-1">
          Confirmar entrega
        </Button>
        <Button variant="danger" onClick={() => setModo('falha')} className="flex-1">
          Registrar falha
        </Button>
      </div>
    )
  }

  if (modo === 'confirmar') {
    return (
      <div className="mt-4 p-4 bg-[#f9fafb] rounded-xl border border-[#e5e7eb]">
        <h3 className="font-semibold text-sm mb-3">Confirmar entrega</h3>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#111827]">Fotos (opcional)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFotos(e.target.files)}
              className="text-sm"
            />
          </div>
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <div className="flex gap-2">
            <Button onClick={handleConfirmar} loading={loading} className="flex-1">
              Confirmar
            </Button>
            <Button variant="secondary" onClick={() => setModo('idle')} className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 p-4 bg-[#f9fafb] rounded-xl border border-[#e5e7eb]">
      <h3 className="font-semibold text-sm mb-3">Registrar falha</h3>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#111827]">Motivo *</label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            className="px-3 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
            placeholder="Descreva o motivo da falha"
          />
        </div>
        {erro && <p className="text-sm text-red-600">{erro}</p>}
        <div className="flex gap-2">
          <Button variant="danger" onClick={handleFalha} loading={loading} className="flex-1">
            Registrar
          </Button>
          <Button variant="secondary" onClick={() => setModo('idle')} className="flex-1">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}
