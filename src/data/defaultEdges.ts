import type { DrawYouEdge } from '../types/drawYou'

/** Conexoes padrao entre nos com ids numericos da API (1..6). */
export const defaultEdges: DrawYouEdge[] = [
  { id: 'edge-1-2', source: '1', target: '2', label: 'proximo' },
  { id: 'edge-2-3', source: '2', target: '3', label: 'avaliar' },
  { id: 'edge-3-4', source: '3', target: '4', label: 'sim' },
  { id: 'edge-3-5', source: '3', target: '5', label: 'nao' },
  { id: 'edge-4-6', source: '4', target: '6', label: 'concluir' },
  { id: 'edge-5-2', source: '5', target: '2', label: 'revisar' },
]
