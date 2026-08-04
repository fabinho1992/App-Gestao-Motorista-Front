import imageCompression from 'browser-image-compression'

const OPCOES_COMPRESSAO = {
  maxSizeMB: 0.5,          // ~500KB por foto
  maxWidthOrHeight: 1280,  // resolução suficiente pra comprovante de entrega
  useWebWorker: true,      // roda em background, não trava a UI no celular
  fileType: 'image/webp',
}

export async function comprimirImagem(arquivo: File): Promise<File> {
  try {
    const comprimido = await imageCompression(arquivo, OPCOES_COMPRESSAO)
    console.log(`${arquivo.name}: ${(arquivo.size / 1024).toFixed(0)}KB → ${(comprimido.size / 1024).toFixed(0)}KB`)
    return comprimido
  } catch (err) {
    console.error('Falha ao comprimir imagem, enviando original:', err)
    return arquivo
  }
}