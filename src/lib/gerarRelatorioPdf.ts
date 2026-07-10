import jsPDF from 'jspdf'
import type { DashboardResumo, RelatorioCombustivelDto } from './api'

const PAGE_WIDTH = 210
const MARGIN_LEFT = 15
const MARGIN_RIGHT = 15
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT

const COR_PRIMARIA: [number, number, number] = [83, 74, 183]
const COR_TEXTO_ESCURO: [number, number, number] = [17, 24, 39]
const COR_TEXTO_CINZA: [number, number, number] = [107, 114, 128]
const COR_VERDE: [number, number, number] = [5, 150, 105]
const COR_VERMELHA: [number, number, number] = [220, 38, 38]
const COR_BORDA: [number, number, number] = [229, 231, 235]
const COR_FUNDO_CLARO: [number, number, number] = [249, 250, 251]
const COR_FUNDO_CABECALHO: [number, number, number] = [243, 244, 246]

const ALTURA_VIAGEM_ESTIMADA = 60
const GAP_ENTRE_VIAGENS = 5

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarDataBR(data: string): string {
  const [ano, mes, dia] = data.split('T')[0].split('-')
  return `${dia}/${mes}/${ano}`
}

export function gerarRelatorioPdf(
  nomeMes: string,
  ano: number,
  nomeMotorista: string,
  resumo: DashboardResumo,
  relatorio: RelatorioCombustivelDto
) {
  const doc = new jsPDF('p', 'mm', 'a4')

  function desenharCabecalhoPrincipal() {
    doc.setFillColor(...COR_PRIMARIA)
    doc.rect(0, 0, PAGE_WIDTH, 35, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.text('ROTA CERTA', PAGE_WIDTH / 2, 15, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text('Relatório Mensal de Viagens', PAGE_WIDTH / 2, 23, { align: 'center' })

    doc.setFontSize(10)
    doc.text(`${nomeMes} ${ano} — ${nomeMotorista}`, PAGE_WIDTH / 2, 30, { align: 'center' })
  }

  function desenharCabecalhoCompacto() {
    doc.setFillColor(...COR_PRIMARIA)
    doc.rect(0, 0, PAGE_WIDTH, 20, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text('ROTA CERTA', PAGE_WIDTH / 2, 10, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`${nomeMes} ${ano}`, PAGE_WIDTH / 2, 16, { align: 'center' })
  }

  function linhaResumo(
    x: number,
    y: number,
    width: number,
    label: string,
    valor: string,
    cor: [number, number, number] = COR_TEXTO_ESCURO,
    bold = false
  ) {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...COR_TEXTO_CINZA)
    doc.text(label, x + 4, y)
    doc.setTextColor(...cor)
    doc.text(valor, x + width - 4, y, { align: 'right' })
  }

  function linhaViagem(
    x: number,
    y: number,
    width: number,
    rowHeight: number,
    index: number,
    label: string,
    valor: string,
    cor: [number, number, number],
    bold = false
  ) {
    if (index % 2 === 1) {
      doc.setFillColor(...COR_FUNDO_CLARO)
      doc.rect(x, y, width, rowHeight, 'F')
    }
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...COR_TEXTO_ESCURO)
    doc.text(label, x + 3, y + rowHeight / 2 + 1.5)
    doc.setTextColor(...cor)
    doc.text(valor, x + width - 3, y + rowHeight / 2 + 1.5, { align: 'right' })
  }

  function linhaPontilhada(x: number, y: number, width: number) {
    doc.setDrawColor(...COR_BORDA)
    doc.setLineDashPattern([1, 1], 0)
    doc.line(x, y, x + width, y)
    doc.setLineDashPattern([], 0)
  }

  // Seção 1 — Cabeçalho
  desenharCabecalhoPrincipal()

  // Seção 2 — Resumo financeiro do mês
  doc.setTextColor(...COR_PRIMARIA)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Resumo do Mês', MARGIN_LEFT, 45)

  const boxWidth = 42
  const boxHeight = 22
  const boxGap = 2
  const boxY = 50

  const boxesResumo: { label: string; valor: string; cor: [number, number, number] }[] = [
    { label: 'Ganhos', valor: formatarMoeda(resumo.totalGanhosMes), cor: COR_VERDE },
    { label: 'Gastos', valor: formatarMoeda(resumo.totalGastosMes), cor: COR_VERMELHA },
    { label: 'Lucro líquido', valor: formatarMoeda(resumo.lucroLiquidoMes), cor: COR_VERDE },
    {
      label: 'Km rodados',
      valor: `${resumo.totalKmRodadosMes.toLocaleString('pt-BR')} km`,
      cor: COR_PRIMARIA,
    },
  ]

  boxesResumo.forEach((box, index) => {
    const x = MARGIN_LEFT + index * (boxWidth + boxGap)
    doc.setDrawColor(...COR_BORDA)
    doc.rect(x, boxY, boxWidth, boxHeight, 'S')

    doc.setTextColor(...COR_TEXTO_CINZA)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(box.label, x + 3, boxY + 6)

    doc.setTextColor(...box.cor)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(box.valor, x + 3, boxY + 16)
  })

  // Seção 3 — Resumo de gastos
  doc.setTextColor(...COR_PRIMARIA)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Gastos do Mês', MARGIN_LEFT, 80)

  const boxGastosY = 86
  const boxGastosHeight = 40
  const boxGastosWidth = 87
  const boxEsquerdaX = MARGIN_LEFT
  const boxDireitaX = MARGIN_LEFT + boxGastosWidth + 6

  doc.setDrawColor(...COR_BORDA)
  doc.rect(boxEsquerdaX, boxGastosY, boxGastosWidth, boxGastosHeight, 'S')
  doc.rect(boxDireitaX, boxGastosY, boxGastosWidth, boxGastosHeight, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...COR_TEXTO_ESCURO)
  doc.text('Detalhamento de gastos', boxEsquerdaX + 4, boxGastosY + 7)

  let rY = boxGastosY + 14
  linhaResumo(boxEsquerdaX, rY, boxGastosWidth, 'Combustível', formatarMoeda(relatorio.totalGastoCombustivel))
  rY += 6
  linhaResumo(boxEsquerdaX, rY, boxGastosWidth, 'Pedágio', formatarMoeda(relatorio.totalGastoPedagio))
  rY += 6
  linhaResumo(boxEsquerdaX, rY, boxGastosWidth, 'Alimentação', formatarMoeda(relatorio.totalGastoAlimentacao))
  rY += 6
  linhaResumo(boxEsquerdaX, rY, boxGastosWidth, 'Outros', formatarMoeda(relatorio.totalGastoOutros))
  rY += 4
  doc.setDrawColor(...COR_BORDA)
  doc.line(boxEsquerdaX + 4, rY, boxEsquerdaX + boxGastosWidth - 4, rY)
  rY += 6
  linhaResumo(boxEsquerdaX, rY, boxGastosWidth, 'Total', formatarMoeda(relatorio.totalGastosGeral), COR_VERMELHA, true)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...COR_TEXTO_ESCURO)
  doc.text('Indicadores', boxDireitaX + 4, boxGastosY + 7)

  let iY = boxGastosY + 14
  linhaResumo(boxDireitaX, iY, boxGastosWidth, 'Viagens encerradas', `${relatorio.totalViagensEncerradas}`)
  iY += 6
  linhaResumo(boxDireitaX, iY, boxGastosWidth, 'Total de entregas', `${resumo.totalEntregasMes}`)
  iY += 6
  linhaResumo(
    boxDireitaX,
    iY,
    boxGastosWidth,
    'Km total rodado',
    `${relatorio.totalKmRodado.toLocaleString('pt-BR')} km`
  )
  if (relatorio.mediaKmPorLitro > 0) {
    iY += 6
    linhaResumo(
      boxDireitaX,
      iY,
      boxGastosWidth,
      'Média km por litro',
      `${relatorio.mediaKmPorLitro.toFixed(1)} km/l`
    )
  }

  // Seção 4 — Detalhes por viagem
  const tituloViagensY = boxGastosY + boxGastosHeight + 12
  doc.setTextColor(...COR_PRIMARIA)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Detalhes das Viagens', MARGIN_LEFT, tituloViagensY)

  let y = tituloViagensY + 10

  if (relatorio.viagens.length === 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...COR_TEXTO_CINZA)
    doc.text('Nenhuma viagem encerrada neste período', PAGE_WIDTH / 2, y, { align: 'center' })
  } else {
    relatorio.viagens.forEach((viagem) => {
      if (y + ALTURA_VIAGEM_ESTIMADA > 270) {
        doc.addPage()
        desenharCabecalhoCompacto()
        y = 30
      }

      const blocoY = y
      const rowHeight = 6

      doc.setFillColor(...COR_FUNDO_CABECALHO)
      doc.rect(MARGIN_LEFT, blocoY, CONTENT_WIDTH, 8, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(...COR_TEXTO_ESCURO)
      doc.text(viagem.empresaContratante, MARGIN_LEFT + 3, blocoY + 5.5)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...COR_TEXTO_CINZA)
      doc.text(formatarDataBR(viagem.dataEncerramento), MARGIN_LEFT + CONTENT_WIDTH - 3, blocoY + 5.5, {
        align: 'right',
      })

      let linhaY = blocoY + 8

      linhaViagem(MARGIN_LEFT, linhaY, CONTENT_WIDTH, rowHeight, 0, 'Combustível', formatarMoeda(viagem.gastoCombustivel), COR_VERMELHA)
      linhaY += rowHeight
      linhaViagem(MARGIN_LEFT, linhaY, CONTENT_WIDTH, rowHeight, 1, 'Pedágio', formatarMoeda(viagem.gastoPedagio), COR_VERMELHA)
      linhaY += rowHeight
      linhaViagem(MARGIN_LEFT, linhaY, CONTENT_WIDTH, rowHeight, 2, 'Alimentação', formatarMoeda(viagem.gastoAlimentacao), COR_VERMELHA)
      linhaY += rowHeight
      linhaViagem(MARGIN_LEFT, linhaY, CONTENT_WIDTH, rowHeight, 3, 'Outros', formatarMoeda(viagem.gastoOutros), COR_VERMELHA)
      linhaY += rowHeight

      linhaY += 2
      linhaPontilhada(MARGIN_LEFT, linhaY, CONTENT_WIDTH)
      linhaY += 2

      linhaViagem(MARGIN_LEFT, linhaY, CONTENT_WIDTH, rowHeight, 4, 'Total gastos', formatarMoeda(viagem.totalGastos), COR_VERMELHA, true)
      linhaY += rowHeight
      linhaViagem(MARGIN_LEFT, linhaY, CONTENT_WIDTH, rowHeight, 5, 'Km rodado', `${viagem.kmRodado.toLocaleString('pt-BR')} km`, COR_TEXTO_ESCURO)
      linhaY += rowHeight

      linhaY += 2
      linhaPontilhada(MARGIN_LEFT, linhaY, CONTENT_WIDTH)
      linhaY += 2

      linhaViagem(MARGIN_LEFT, linhaY, CONTENT_WIDTH, rowHeight, 6, 'Frete recebido', formatarMoeda(viagem.valorFrete), COR_VERDE)
      linhaY += rowHeight
      linhaViagem(MARGIN_LEFT, linhaY, CONTENT_WIDTH, rowHeight, 7, 'Lucro líquido', formatarMoeda(viagem.saldoLiquido), COR_VERDE, true)

      y = blocoY + ALTURA_VIAGEM_ESTIMADA + GAP_ENTRE_VIAGENS
    })
  }

  // Rodapé em todas as páginas
  const totalPaginas = (doc.internal.pages.length - 1)
  const dataGeracao = new Date().toLocaleDateString('pt-BR')
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i)
    doc.setDrawColor(...COR_BORDA)
    doc.line(MARGIN_LEFT, 285, PAGE_WIDTH - MARGIN_RIGHT, 285)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...COR_TEXTO_CINZA)
    doc.text(`Rota Certa — Relatório gerado em ${dataGeracao}`, PAGE_WIDTH / 2, 290, { align: 'center' })
    doc.text(`${i}`, PAGE_WIDTH - MARGIN_RIGHT, 290, { align: 'right' })
  }

  doc.save(`relatorio-rotacerta-${nomeMes}-${ano}.pdf`)
}
