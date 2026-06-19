'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface BackButtonProps {
  href?: string
  label?: string
}

export default function BackButton({ href, label = 'Voltar' }: BackButtonProps) {
  const router = useRouter()

  const icon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  )

  const className = 'flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#111827] cursor-pointer transition-colors mb-4'

  if (href) {
    return (
      <Link href={href} className={className}>
        {icon}
        <span>{label}</span>
      </Link>
    )
  }

  return (
    <button onClick={() => router.back()} className={className}>
      {icon}
      <span>{label}</span>
    </button>
  )
}
