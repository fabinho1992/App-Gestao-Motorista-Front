'use client'

import { useState } from 'react'
import type { PixRenovacaoDto } from '@/lib/api'

function formatarExpiracao(expiracao: string): string {
  const data = new Date(expiracao)
  if (isNaN(data.getTime())) return expiracao
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface PixQrCodeProps {
  pix: PixRenovacaoDto
}

export default function PixQrCode({ pix }: PixQrCodeProps) {
  const [copiado, setCopiado] = useState(false)

  async function copiarCodigo() {
    try {
      await navigator.clipboard.writeText(pix.pixCopiaECola)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-[#6b7280] text-center">
        Escaneie o QR Code abaixo no app do seu banco
      </p>

      <div className="bg-white border border-[#e5e7eb] rounded-xl p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={'data:image/png;base64,' + pix.qrCodeBase64}
          alt="QR Code Pix para renovação da assinatura"
          width={220}
          height={220}
          className="w-[220px] h-[220px] block"
        />
      </div>

      <div className="w-full flex flex-col gap-2">
        <label className="text-sm font-medium text-[#111827]">
          Pix copia e cola
        </label>
        <p className="w-full px-3 py-2.5 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] text-xs text-[#6b7280] break-all select-all">
          {pix.pixCopiaECola}
        </p>
        <button
          type="button"
          onClick={copiarCodigo}
          className="w-full min-h-[48px] rounded-lg bg-[#534AB7] text-white text-sm font-medium hover:bg-[#443d9a] cursor-pointer transition-colors"
        >
          {copiado ? 'Código copiado!' : 'Copiar código'}
        </button>
      </div>

      <p className="text-xs text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 w-full text-center">
        Este código é válido até {formatarExpiracao(pix.expiracao)}. Após esse
        horário será necessário gerar um novo.
      </p>
    </div>
  )
}
