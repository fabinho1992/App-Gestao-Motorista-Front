export function formatarCpf(valor: string): string {
  const numeros = valor.replace(/\D/g, '').slice(0, 11)
  if (numeros.length <= 3) return numeros
  if (numeros.length <= 6) return numeros.slice(0, 3) + '.' + numeros.slice(3)
  if (numeros.length <= 9) return numeros.slice(0, 3) + '.' + numeros.slice(3, 6) + '.' + numeros.slice(6)
  return numeros.slice(0, 3) + '.' + numeros.slice(3, 6) + '.' + numeros.slice(6, 9) + '-' + numeros.slice(9)
}

export function parsearCpf(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, 11)
}

export function formatarNumero(valor: number | string): string {
  const str = String(valor).replace(/\D/g, '')
  if (str === '') return ''
  const numero = Number(str)
  if (isNaN(numero)) return ''
  return numero.toLocaleString('pt-BR')
}

export function parsearNumero(valor: string): number {
  return Number(valor.replace(/\./g, '').replace(',', '.')) || 0
}

export function formatarDinheiro(valor: number | string): string {
  // remove tudo que não for número
  const str = String(valor).replace(/\D/g, '')
  if (str === '' || str === '0') return ''
  
  // converte para centavos e formata
  const numero = Number(str) / 100
  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export function parsearDinheiro(valor: string): number {
  const str = valor.replace(/\D/g, '')
  if (str === '') return 0
  return Number(str) / 100
}

export function formatarTelefone(valor: string): string {
  const numeros = valor.replace(/\D/g, '').slice(0, 11)
  if (numeros.length <= 2) return numeros
  if (numeros.length <= 7) return '(' + numeros.slice(0, 2) + ') ' + numeros.slice(2)
  return '(' + numeros.slice(0, 2) + ') ' + numeros.slice(2, 7) + '-' + numeros.slice(7)
}

export function parsearTelefone(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, 11)
}
