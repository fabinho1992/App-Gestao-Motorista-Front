'use client'

import { useState } from 'react'

interface FotoComprovanteProps {
  fotos: string[]
}

export default function FotoComprovante({ fotos }: FotoComprovanteProps) {
  const [modalIndex, setModalIndex] = useState<number | null>(null)
  const [erros, setErros] = useState<Set<number>>(new Set())

  function openModal(index: number) {
    setModalIndex(index)
  }

  function closeModal() {
    setModalIndex(null)
  }

  function prev() {
    if (modalIndex !== null && modalIndex > 0) {
      setModalIndex(modalIndex - 1)
    }
  }

  function next() {
    if (modalIndex !== null && modalIndex < fotos.length - 1) {
      setModalIndex(modalIndex + 1)
    }
  }

  function handleImageError(index: number) {
    setErros((prev) => new Set(prev).add(index))
  }

  async function compartilharFoto(url: string) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Comprovante de entrega',
          text: 'Comprovante de entrega — RotaCerta',
          url: url
        })
      } catch (_err) {
        // usuário cancelou o compartilhamento — não faz nada
        console.log('Compartilhamento cancelado')
      }
    } else {
      // fallback para desktop — abre a imagem em nova aba
      window.open(url, '_blank')
    }
  }

  if (fotos.length === 0) {
    return (
      <div className="flex items-center gap-2 py-4 text-[#6b7280]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
        </svg>
        <span className="text-sm">Nenhuma foto de comprovante</span>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {fotos.map((url, i) => (
          <div key={i} className="relative aspect-square">
            <button
              onClick={() => openModal(i)}
              className="w-full h-full rounded-lg border border-[#e5e7eb] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            >
              {erros.has(i) ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#f9fafb] text-[#6b7280]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 mb-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span className="text-xs">Erro ao carregar</span>
                </div>
              ) : (
                <img
                  src={url}
                  alt={`Comprovante ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(i)}
                />
              )}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); compartilharFoto(url) }}
              aria-label="Compartilhar foto"
              className="absolute bottom-1 right-1 w-7 h-7 flex items-center justify-center rounded-full bg-black/50 cursor-pointer z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {modalIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 transition-opacity"
          onClick={closeModal}
        >
          <button
            onClick={closeModal}
            aria-label="Fechar"
            className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 cursor-pointer z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {fotos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                disabled={modalIndex === 0}
                aria-label="Foto anterior"
                className="absolute left-3 w-11 h-11 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 cursor-pointer disabled:opacity-30 disabled:cursor-default z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                disabled={modalIndex === fotos.length - 1}
                aria-label="Próxima foto"
                className="absolute right-3 w-11 h-11 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 cursor-pointer disabled:opacity-30 disabled:cursor-default z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          )}

          <img
            src={fotos[modalIndex]}
            alt={`Comprovante ${modalIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => { e.stopPropagation(); compartilharFoto(fotos[modalIndex]) }}
            aria-label="Compartilhar foto"
            className="absolute bottom-6 left-4 flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/50 text-white text-sm cursor-pointer z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Compartilhar
          </button>

          {fotos.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
              {modalIndex + 1} de {fotos.length}
            </div>
          )}
        </div>
      )}
    </>
  )
}
