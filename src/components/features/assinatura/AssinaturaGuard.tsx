'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStatusAssinatura, assinaturaBloqueada } from '@/lib/api'

export default function AssinaturaGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [verificando, setVerificando] = useState(true)

  useEffect(() => {
    let ativo = true

    async function verificar() {
      try {
        const res = await getStatusAssinatura()
        if (ativo && res.isSuccess && assinaturaBloqueada(res.data.status)) {
          router.replace('/assinatura-vencida')
          return
        }
      } catch {
        // falha na verificação não deve bloquear o acesso ao app
      }
      if (ativo) setVerificando(false)
    }

    verificar()
    return () => {
      ativo = false
    }
  }, [router])

  if (verificando) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-32 bg-gray-100 rounded animate-pulse" />
        <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    )
  }

  return <>{children}</>
}
