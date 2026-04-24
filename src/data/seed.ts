import type { DrawYouEdge, DrawYouNode } from '../types/drawYou'

export const initialNodes: DrawYouNode[] = [
  {
    id: 'node-1',
    type: 'drawYouNode',
    position: { x: 90, y: 120 },
    data: {
      titulo: 'Inicio do Fluxo',
      tipo: 'inicio',
      status: 'ativo',
      descricao: 'Ponto de entrada do processo.',
    },
  },
  {
    id: 'node-2',
    type: 'drawYouNode',
    position: { x: 420, y: 120 },
    data: {
      titulo: 'Validar Informacoes',
      tipo: 'processo',
      status: 'pendente',
      descricao: 'Conferencia dos dados enviados.',
    },
  },
  {
    id: 'node-3',
    type: 'drawYouNode',
    position: { x: 740, y: 120 },
    data: {
      titulo: 'Decidir Aprovacao',
      tipo: 'decisao',
      status: 'pendente',
      descricao: 'Analise para aprovar ou rejeitar a solicitacao.',
    },
  },
  {
    id: 'node-4',
    type: 'drawYouNode',
    position: { x: 1080, y: 40 },
    data: {
      titulo: 'Aprovado',
      tipo: 'processo',
      status: 'pendente',
      descricao: 'Fluxo segue para implementacao.',
    },
  },
  {
    id: 'node-5',
    type: 'drawYouNode',
    position: { x: 1080, y: 210 },
    data: {
      titulo: 'Ajustar Solicitacao',
      tipo: 'processo',
      status: 'pendente',
      descricao: 'Retornar para correcao de dados.',
    },
  },
  {
    id: 'node-6',
    type: 'drawYouNode',
    position: { x: 1410, y: 120 },
    data: {
      titulo: 'Finalizar',
      tipo: 'fim',
      status: 'pendente',
      descricao: 'Encerramento do fluxo.',
    },
  },
]

export const initialEdges: DrawYouEdge[] = [
  {
    id: 'edge-1-2',
    source: 'node-1',
    target: 'node-2',
    label: 'proximo',
  },
  {
    id: 'edge-2-3',
    source: 'node-2',
    target: 'node-3',
    label: 'avaliar',
  },
  {
    id: 'edge-3-4',
    source: 'node-3',
    target: 'node-4',
    label: 'sim',
  },
  {
    id: 'edge-3-5',
    source: 'node-3',
    target: 'node-5',
    label: 'nao',
  },
  {
    id: 'edge-4-6',
    source: 'node-4',
    target: 'node-6',
    label: 'concluir',
  },
  {
    id: 'edge-5-2',
    source: 'node-5',
    target: 'node-2',
    label: 'revisar',
  },
]
