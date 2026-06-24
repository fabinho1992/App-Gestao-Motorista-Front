'use client'

import { useState, useRef } from 'react'
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
  const [fotos, setFotos] = useState<File[]>([])
  const [motivo, setMotivo] = useState('')
  const refCamera = useRef<HTMLInputElement>(null)
  const refGaleria = useRef<HTMLInputElement>(null)

  function handleFotos(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFotos((prev) => [...prev, ...Array.from(e.target.files!)])
    }
    e.target.value = ''
  }

  function removerFoto(index: number) {
    setFotos((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleConfirmar() {
    setLoading(true)
    setErro('')
    try {
      let fileList: FileList | undefined
      if (fotos.length > 0) {
        const dt = new DataTransfer()
        fotos.forEach((f) => dt.items.add(f))
        fileList = dt.files
      }
      const res = await confirmarEntrega(entregaId, fileList)
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
        <Button onClick={() => setModo('confirmar')} className="flex-1 min-h-[48px]">
          Confirmar entrega
        </Button>
        <Button variant="danger" onClick={() => setModo('falha')} className="flex-1 min-h-[48px]">
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
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#111827]">Fotos (opcional)</label>
            <input
              ref={refCamera}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleFotos}
              className="hidden"
            />
            <input
              ref={refGaleria}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFotos}
              className="hidden"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => refCamera.current?.click()}
                className="flex-1 min-h-[48px] flex items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white text-sm font-medium text-[#111827] hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <span>📷</span> Tirar foto
              </button>
              <button
                type="button"
                onClick={() => refGaleria.current?.click()}
                className="flex-1 min-h-[48px] flex items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white text-sm font-medium text-[#111827] hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <span>🖼️</span> Escolher da galeria
              </button>
            </div>
          </div>

          {fotos.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[#6b7280]">
                {fotos.length} foto{fotos.length !== 1 ? 's' : ''} selecionada{fotos.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {fotos.map((foto, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[#e5e7eb]">
                    <img
                      src={URL.createObjectURL(foto)}
                      alt={`Foto ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removerFoto(i)}
                      className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-red-600 text-white text-xs cursor-pointer hover:bg-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <div className="flex gap-2">
            <Button onClick={handleConfirmar} loading={loading} className="flex-1 min-h-[48px]">
              Confirmar
            </Button>
            <Button variant="secondary" onClick={() => { setModo('idle'); setFotos([]) }} className="flex-1 min-h-[48px]">
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
          <Button variant="danger" onClick={handleFalha} loading={loading} className="flex-1 min-h-[48px]">
            Registrar
          </Button>
          <Button variant="secondary" onClick={() => setModo('idle')} className="flex-1 min-h-[48px]">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}
