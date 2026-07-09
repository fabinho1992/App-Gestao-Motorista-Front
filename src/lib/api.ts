const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7123'

export interface ApiResponse<T> {
  data: T
  isSuccess: boolean
  message: string
  totalPage: number
}

// Auth DTOs
export interface LoginRequest {
  email: string
  senha: string
}

export interface LoginResponse {
  token: string
  motoristaId: string
  displayName: string
}

export interface RegistrarRequest {
  nome: string
  cpf: string
  cnh: string
  telefone: string
  vencimentoCnh: string
  email: string
  senha: string
}

// Dashboard DTOs
export interface DashboardResumo {
  totalGanhosMes: number
  totalGastosMes: number
  lucroLiquidoMes: number
  totalKmRodadosMes: number
  totalViagensMes: number
  totalEntregasMes: number
  temViagemAtiva: boolean
  viagemAtivaId: string | null
  viagemAtivaEmpresa: string | null
  viagemAtivaStatus: string | null
  entregasConcluidasAtiva: number
  totalEntregasAtiva: number
}

// Motorista DTOs
export interface MotoristaDto {
  id: string
  nome: string
  cpf: string
  email: string
  telefone: string
  cnh: string
  vencimentoCnh: string
}

export interface AtualizarMotoristaRequest {
  nome: string
  cpf: string
  email: string
  telefone: string
  cnh: string
  vencimentoCnh: string
}

// Veiculo DTOs
export interface AlertaOleo {
  nivel: 'Verde' | 'Amarelo' | 'Vermelho'
  mensagem: string
  kmFaltando: number
}

export interface Veiculo {
  id: string
  placa: string
  modelo: string
  ano: number
  tipoCombustivel: string
  kmAtual: number
  kmUltimoOleo: number
  dataUltimoOleo: string
  alertaOleo: AlertaOleo
}

export interface ViagemResumoDto {
  id: string
  empresaContratante: string
  dataSaida: string
  status: string
  valorFrete: number
  saldoLiquido: number
  kmRodado: number | null
  totalEntregas: number
}

export interface VeiculoComAlerta {
  id: string
  placa: string
  modelo: string
  ano: number
  tipoCombustivel: string
  kmAtual: number
  kmUltimoOleo: number
  dataUltimoOleo: string
  intervaloOleo: number
  alertaOleo: {
    nivel: 'Verde' | 'Amarelo' | 'Vermelho'
    mensagem: string
    kmFaltando: number
  }
  viagens: ViagemResumoDto[]
}

export interface CriarVeiculoRequest {
  placa: string
  modelo: string
  ano: number
  tipoCombustivel: string
  kmAtual: number
  kmUltimoOleo: number
  dataUltimoOleo: string
  intervaloOleo: number
}

// Viagem DTOs
export interface Viagem {
  id: string
  veiculoId: string
  origem: string
  empresaContratante: string
  kmInicial: number
  kmFinal: number | null
  valorFrete: number
  formaPagamento: string
  status: 'Aberta' | 'EmRota' | 'Encerrada'
  statusPagamento: 'Pendente' | 'Pago' | 'Cancelado'
  criadoEm: string
  dataEncerramento: string | null
  gastoCombustivel: number
  gastoPedagio: number
  gastoAlimentacao: number
  gastoOutros: number
  obsEncerramento: string | null
  saldoLiquido: number
}

export interface AtualizarStatusPagamentoRequest {
  novoStatus: 'Pendente' | 'Pago' | 'Cancelado'
}

export interface CriarViagemRequest {
  veiculoId: string
  origem: string
  empresaContratante: string
  kmInicial: number
  valorFrete: number
  formaPagamento: string
}

export interface EncerrarViagemRequest {
  kmFinal: number
  gastoCombustivel: number
  gastoPedagio: number
  gastoAlimentacao: number
  gastoOutros: number
  obsEncerramento: string
}

// Entrega DTOs
export interface Entrega {
  id: string
  viagemId: string
  cliente: string
  enderecoDestino: string
  observacao: string
  status: 'Pendente' | 'Entregue' | 'TentativaFalha'
  dataCriacao: string
  dataConfirmacao: string | null
  motivoFalha: string | null
  fotos: string[]
}

export interface CriarEntregaRequest {
  viagemId: string
  cliente: string
  enderecoDestino: string
  observacao: string
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken()
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.clear()
      window.location.href = '/login'
    }
    throw new Error('Não autorizado')
  }

  const json: ApiResponse<T> = await res.json()
  return json
}

// Auth
export async function login(body: LoginRequest) {
  return request<LoginResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function registrar(body: RegistrarRequest) {
  return request<string>('/api/v1/auth/registrar', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// Motorista
export async function getMotorista() {
  return request<MotoristaDto>('/api/v1/motorista/perfil')
}

export async function atualizarMotorista(body: AtualizarMotoristaRequest) {
  return request<void>('/api/v1/motorista', {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export async function resetarDados() {
  return request<void>('/api/v1/motorista/resetar', {
    method: 'DELETE',
  })
}

export interface DetalheCombustivelDto {
  viagemId: string
  empresaContratante: string
  dataEncerramento: string
  gastoCombustivel: number
  gastoPedagio: number
  gastoAlimentacao: number
  gastoOutros: number
  totalGastos: number
  kmRodado: number
  valorFrete: number
  saldoLiquido: number
}

export interface RelatorioCombustivelDto {
  mes: number
  ano: number
  nomeMes: string
  totalGastoCombustivel: number
  totalGastoPedagio: number
  totalGastoAlimentacao: number
  totalGastoOutros: number
  totalGastosGeral: number
  totalKmRodado: number
  mediaKmPorLitro: number
  totalViagensEncerradas: number
  viagens: DetalheCombustivelDto[]
}

// Dashboard
export async function getDashboardResumo(mes: number, ano: number) {
  return request<DashboardResumo>(
    `/api/v1/dashboard/resumo?mes=${mes}&ano=${ano}`
  )
}

export async function getRelatorioCombustivel(mes: number, ano: number) {
  return request<RelatorioCombustivelDto>(
    `/api/v1/dashboard/relatorio-combustivel?mes=${mes}&ano=${ano}`
  )
}

// Veiculo
export async function getVeiculos() {
  return request<Veiculo[]>('/api/v1/veiculo')
}

export async function getVeiculo(id: string) {
  return request<Veiculo>(`/api/v1/veiculo/${id}`)
}

export async function criarVeiculo(body: CriarVeiculoRequest) {
  return request<Veiculo>('/api/v1/veiculo', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function deletarVeiculo(id: string) {
  return request<void>(`/api/v1/veiculo/${id}`, {
    method: 'DELETE',
  })
}

export async function trocarOleo(id: string) {
  return request<Veiculo>(`/api/v1/veiculo/${id}/trocar-oleo`, {
    method: 'PUT',
  })
}

export async function getVeiculoDetalhes(id: string) {
  return request<VeiculoComAlerta>(`/api/v1/veiculo/${id}`)
}

export async function trocarOleoVeiculo(id: string) {
  return request<VeiculoComAlerta>(`/api/v1/veiculo/${id}/trocar-oleo`, {
    method: 'PUT',
  })
}

// Viagem
export async function getViagens(
  status?: string,
  dataInicio?: string,
  dataFim?: string,
  empresaContratante?: string,
  pageNumber = 1,
  pageSize = 10
) {
  let url = `/api/v1/viagem?pageNumber=${pageNumber}&pageSize=${pageSize}`
  if (status && status !== 'Todos') {
    url += `&status=${status}`
  }
  if (dataInicio) url += `&dataInicio=${dataInicio}`
  if (dataFim) url += `&dataFim=${dataFim}`
  if (empresaContratante) url += `&empresaContratante=${empresaContratante}`
  return request<Viagem[]>(url)
}

export async function getEmpresasDistintas() {
  return request<string[]>('/api/v1/viagem/empresas')
}

export async function getViagem(id: string) {
  return request<Viagem>(`/api/v1/viagem/${id}`)
}

export async function criarViagem(body: CriarViagemRequest) {
  return request<Viagem>('/api/v1/viagem', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function encerrarViagem(id: string, body: EncerrarViagemRequest) {
  return request<Viagem>(`/api/v1/viagem/${id}/encerrar`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export async function atualizarStatusPagamento(
  id: string,
  novoStatus: 'Pendente' | 'Pago' | 'Cancelado'
) {
  return request<void>(`/api/v1/viagem/${id}/status-pagamento`, {
    method: 'PUT',
    body: JSON.stringify({ novoStatus }),
  })
}

// Entrega
export async function getEntregasPorViagem(viagemId: string) {
  return request<Entrega[]>(`/api/v1/entrega/viagem/${viagemId}`)
}

export async function criarEntrega(body: CriarEntregaRequest) {
  return request<Entrega>('/api/v1/entrega', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// src/lib/api.ts
export async function confirmarEntrega(id: string, fotos?: File[]) {
  const formData = new FormData()
  if (fotos && fotos.length > 0) {
    fotos.forEach((foto) => {
      formData.append('fotos', foto)
    })
  }
  return request<Entrega>(`/api/v1/entrega/${id}/confirmar`, {
    method: 'PUT',
    body: formData,
  })

}

export async function registrarFalhaEntrega(id: string, motivo: string) {
  return request<Entrega>(`/api/v1/entrega/${id}/falha`, {
    method: 'PUT',
    body: JSON.stringify({ motivo }),
  })
}
