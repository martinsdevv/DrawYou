import type { Edge, Node } from '@xyflow/react'

export type DrawYouNodeKind = 'inicio' | 'processo' | 'decisao' | 'fim' | (string & {})
export type NodeStatus = 'pendente' | 'ativo' | 'concluido' | 'erro' | (string & {})

export interface IDrawYouNodeData {
  titulo: string
  descricao?: string
  tipo: DrawYouNodeKind
  status: NodeStatus
  nodeBgColor?: string
  nodeBorderColor?: string
  nodeTextColor?: string
  nodeBorderWidth?: number
  [key: string]: unknown
}

export type DrawYouNode = Node<IDrawYouNodeData, 'drawYouNode'>
export type DrawYouEdgeType = 'smoothstep' | 'step' | 'straight' | 'bezier'
export type DrawYouEdge = Edge

export interface IDashboardDrawYou {
  totalNos: number
  totalConexoes: number
  totalPendentes: number
  totalAtivos: number
  totalConcluidos: number
  totalErros: number
}

export interface ICreateNodePayload {
  titulo: string
  tipo: DrawYouNodeKind
  status: NodeStatus
}

export interface IUpdateNodeStylePayload {
  nodeBgColor?: string
  nodeBorderColor?: string
  nodeTextColor?: string
  nodeBorderWidth?: number
}

export interface IUpdateNodeDataPayload extends IUpdateNodeStylePayload {
  titulo?: string
  descricao?: string
  tipo?: DrawYouNodeKind
  status?: NodeStatus
}

export interface IUpdateEdgeStylePayload {
  label?: string
  type?: DrawYouEdgeType
  strokeWidth?: number
  dashed?: boolean
  color?: string
}
