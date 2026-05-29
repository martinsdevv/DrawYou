import type { DrawYouNodeKind, NodeStatus } from './drawYou'

export interface INoFluxograma {
  id: number
  titulo: string
  descricao?: string | null
  tipo: DrawYouNodeKind
  status: NodeStatus
  posicaoX: number
  posicaoY: number
  criadoEm?: string
  atualizadoEm?: string
}

export interface INoFluxogramaPayload {
  titulo: string
  descricao?: string
  tipo: DrawYouNodeKind
  status: NodeStatus
  posicaoX: number
  posicaoY: number
}

export interface IDashboardApi {
  totalNos: number
  totalPendentes: number
  totalAtivos: number
  totalConcluidos: number
  totalErros: number
}

export interface IApiErro {
  mensagem: string
}
