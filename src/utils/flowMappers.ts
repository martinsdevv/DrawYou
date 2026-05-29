import type { DrawYouNode, ICreateNodePayload, IUpdateNodeDataPayload } from '../types/drawYou'
import type { INoFluxograma, INoFluxogramaPayload } from '../types/noFluxograma'

interface INodeStylePreset {
  nodeBgColor?: string
  nodeBorderColor?: string
  nodeTextColor?: string
  nodeBorderWidth?: number
}

export const toDrawYouNode = (
  no: INoFluxograma,
  stylePreset?: INodeStylePreset,
): DrawYouNode => ({
  id: String(no.id),
  type: 'drawYouNode',
  position: { x: no.posicaoX, y: no.posicaoY },
  data: {
    titulo: no.titulo,
    descricao: no.descricao ?? '',
    tipo: no.tipo,
    status: no.status,
    ...stylePreset,
  },
})

export const toApiPayloadFromNode = (node: DrawYouNode): INoFluxogramaPayload => ({
  titulo: node.data.titulo,
  descricao: node.data.descricao ?? '',
  tipo: node.data.tipo,
  status: node.data.status,
  posicaoX: node.position.x,
  posicaoY: node.position.y,
})

export const toApiPayloadFromCreate = (
  payload: ICreateNodePayload,
  position: { x: number; y: number },
): INoFluxogramaPayload => ({
  titulo: payload.titulo,
  descricao: '',
  tipo: payload.tipo,
  status: payload.status,
  posicaoX: position.x,
  posicaoY: position.y,
})

export const mergeNodeDataPayload = (
  node: DrawYouNode,
  payload: IUpdateNodeDataPayload,
): INoFluxogramaPayload => ({
  titulo: payload.titulo ?? node.data.titulo,
  descricao: payload.descricao ?? node.data.descricao ?? '',
  tipo: payload.tipo ?? node.data.tipo,
  status: payload.status ?? node.data.status,
  posicaoX: node.position.x,
  posicaoY: node.position.y,
})

export const parseNodeId = (nodeId: string): number | null => {
  const parsed = Number.parseInt(nodeId, 10)
  return Number.isNaN(parsed) ? null : parsed
}
