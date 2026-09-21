'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import PixQrCode from './PixQrCode'
import { renovarAssinatura, iniciarAssinatura, type PixRenovacaoDto } from '@/lib/api'

interface RenovarAssinaturaProps {
  modo?: 'checkout' | 'renovar'
  label?: string
  className?: string
  onPixGerado?: () => void
}

export default function RenovarAssinatura({
  modo = 'renovar',
  label,
  className = '',
  onPixGerado,
}: RenovarAssinaturaProps) {
  const [pix, setPix] = useState<PixRenovacaoDto | null>(null)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState('')

  const textoBotao = label ?? (modo === 'checkout' ? 'Assinar agora' : 'Renovar assinatura')

  async function gerarPix() {
    setGerando(true)
    setErro('')
    try {
      const res = modo === 'checkout' ? await iniciarAssinatura() : await renovarAssinatura()
      if (res.isSuccess) {
        setPix(res.data)
        onPixGerado?.()
      } else {
        setErro(res.message)
      }
    } catch {
      setErro('Erro ao gerar o Pix')
    } finally {
      setGerando(false)
    }
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {pix ? (
        <>
          <PixQrCode pix={pix} />
          <button
            type="button"
            onClick={gerarPix}
            disabled={gerando}
            className="w-full min-h-[48px] border border-[#e5e7eb] bg-white text-[#111827] rounded-lg text-sm font-medium hover:bg-[#f9fafb] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {gerando ? 'Gerando...' : 'Gerar novo código'}
          </button>
        </>
      ) : (
        <Button type="button" onClick={gerarPix} loading={gerando} className="w-full min-h-[48px]">
          {textoBotao}
        </Button>
      )}

      {erro && <p className="text-sm text-red-600">{erro}</p>}
    </div>
  )
}