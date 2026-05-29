import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
  type Connection,
  type Edge,
  type EdgeChange,
  type NodeChange,
} from '@xyflow/react'
import { defaultEdges } from '../data/defaultEdges'
import { noFluxogramaApi } from '../services/noFluxogramaApi'
import type {
  DrawYouEdge,
  DrawYouEdgeType,
  DrawYouNode,
  ICreateNodePayload,
  IDashboardDrawYou,
  IUpdateEdgeStylePayload,
  IUpdateNodeDataPayload,
  NodeStatus,
} from '../types/drawYou'
import type { IDashboardApi } from '../types/noFluxograma'
import {
  mergeNodeDataPayload,
  parseNodeId,
  toApiPayloadFromCreate,
  toApiPayloadFromNode,
  toDrawYouNode,
} from '../utils/flowMappers'

interface IUseDrawYouStateReturn {
  nodes: DrawYouNode[]
  edges: DrawYouEdge[]
  dashboard: IDashboardDrawYou
  isLoading: boolean
  apiError: string | null
  recarregar: () => Promise<void>
  onNodesChange: (changes: NodeChange<DrawYouNode>[]) => void
  onEdgesChange: (changes: EdgeChange<DrawYouEdge>[]) => void
  onConnect: (connection: Connection) => void
  onReconnect: (oldEdge: Edge, newConnection: Connection) => void
  updateEdgeStyle: (edgeId: string, payload: IUpdateEdgeStylePayload) => void
  removeEdge: (edgeId: string) => void
  addNode: (payload: ICreateNodePayload) => Promise<void>
  duplicateNode: (nodeId: string) => Promise<void>
  removeNode: (nodeId: string) => Promise<void>
  updateNodeStatus: (nodeId: string, status: NodeStatus) => Promise<void>
  updateNodeData: (nodeId: string, payload: IUpdateNodeDataPayload) => Promise<void>
}

interface IEdgeStylePreset {
  type: DrawYouEdgeType
  strokeWidth: number
  dashed: boolean
  color: string
}

interface INodeStylePreset {
  nodeBgColor?: string
  nodeBorderColor?: string
  nodeTextColor?: string
  nodeBorderWidth?: number
}

interface IPersistedBoardState {
  edges: DrawYouEdge[]
  edgePreset: IEdgeStylePreset
  nodeStylePreset: INodeStylePreset
}

const BOARD_STORAGE_KEY = 'draw-you-board-v2'
const POSITION_SYNC_DELAY_MS = 400

const DEFAULT_EDGE_PRESET: IEdgeStylePreset = {
  type: 'smoothstep',
  strokeWidth: 2,
  dashed: false,
  color: '#64748b',
}

const DEFAULT_NODE_STYLE_PRESET: INodeStylePreset = {}

const getMarkerSize = (strokeWidth: number) => Math.max(10, Math.min(18, 9 + strokeWidth * 1.1))

const edgeVisualDefaults: Partial<DrawYouEdge> = {
  type: DEFAULT_EDGE_PRESET.type,
  animated: false,
  style: {
    stroke: DEFAULT_EDGE_PRESET.color,
    strokeWidth: DEFAULT_EDGE_PRESET.strokeWidth,
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: DEFAULT_EDGE_PRESET.color,
    width: getMarkerSize(DEFAULT_EDGE_PRESET.strokeWidth),
    height: getMarkerSize(DEFAULT_EDGE_PRESET.strokeWidth),
  },
  labelStyle: {
    fill: '#334155',
    fontSize: 12,
    fontWeight: 600,
  },
  labelBgStyle: {
    fill: '#ffffff',
    fillOpacity: 0.92,
  },
  labelBgBorderRadius: 6,
  labelBgPadding: [8, 4],
}

const withEdgeDefaults = (edges: DrawYouEdge[]): DrawYouEdge[] =>
  edges.map((edge) => ({
    ...edgeVisualDefaults,
    ...edge,
    type: (edge.type as DrawYouEdgeType | undefined) ?? 'smoothstep',
  }))

const readPersistedBoardState = (): IPersistedBoardState | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawValue = window.localStorage.getItem(BOARD_STORAGE_KEY)
    if (!rawValue) {
      return null
    }

    const parsedValue = JSON.parse(rawValue) as Partial<IPersistedBoardState>
    if (!Array.isArray(parsedValue.edges)) {
      return null
    }

    const parsedPreset = parsedValue.edgePreset ?? DEFAULT_EDGE_PRESET
    const parsedNodeStylePreset = parsedValue.nodeStylePreset ?? DEFAULT_NODE_STYLE_PRESET

    return {
      edges: parsedValue.edges as DrawYouEdge[],
      edgePreset: {
        type: parsedPreset.type ?? DEFAULT_EDGE_PRESET.type,
        strokeWidth: parsedPreset.strokeWidth ?? DEFAULT_EDGE_PRESET.strokeWidth,
        dashed: parsedPreset.dashed ?? DEFAULT_EDGE_PRESET.dashed,
        color: parsedPreset.color ?? DEFAULT_EDGE_PRESET.color,
      },
      nodeStylePreset: {
        nodeBgColor: parsedNodeStylePreset.nodeBgColor,
        nodeBorderColor: parsedNodeStylePreset.nodeBorderColor,
        nodeTextColor: parsedNodeStylePreset.nodeTextColor,
        nodeBorderWidth: parsedNodeStylePreset.nodeBorderWidth,
      },
    }
  } catch (error) {
    console.error('Falha ao ler estado salvo do board:', error)
    return null
  }
}

const filtrarEdgesValidas = (edges: DrawYouEdge[], nodeIds: Set<string>) =>
  edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))

const combinarDashboard = (apiDashboard: IDashboardApi, totalConexoes: number): IDashboardDrawYou => ({
  totalNos: apiDashboard.totalNos,
  totalConexoes,
  totalPendentes: apiDashboard.totalPendentes,
  totalAtivos: apiDashboard.totalAtivos,
  totalConcluidos: apiDashboard.totalConcluidos,
  totalErros: apiDashboard.totalErros,
})

const temCamposDeNegocio = (payload: IUpdateNodeDataPayload) =>
  payload.titulo !== undefined ||
  payload.descricao !== undefined ||
  payload.tipo !== undefined ||
  payload.status !== undefined

export const useDrawYouState = (): IUseDrawYouStateReturn => {
  const persistedState = useMemo(() => readPersistedBoardState(), [])
  const positionSyncTimers = useRef<Record<string, number>>({})

  const [nodes, setNodes] = useState<DrawYouNode[]>([])
  const [edges, setEdges] = useState<DrawYouEdge[]>(
    withEdgeDefaults(persistedState?.edges ?? defaultEdges),
  )
  const [edgePreset, setEdgePreset] = useState<IEdgeStylePreset>(
    persistedState?.edgePreset ?? DEFAULT_EDGE_PRESET,
  )
  const [nodeStylePreset, setNodeStylePreset] = useState<INodeStylePreset>(
    persistedState?.nodeStylePreset ?? DEFAULT_NODE_STYLE_PRESET,
  )
  const [dashboardApi, setDashboardApi] = useState<IDashboardApi>({
    totalNos: 0,
    totalPendentes: 0,
    totalAtivos: 0,
    totalConcluidos: 0,
    totalErros: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  const aplicarNosDaApi = useCallback(
    (apiNodes: Awaited<ReturnType<typeof noFluxogramaApi.listar>>) => {
      const flowNodes = apiNodes.map((no) => toDrawYouNode(no, nodeStylePreset))
      const nodeIds = new Set(flowNodes.map((node) => node.id))
      setNodes(flowNodes)
      setEdges((currentEdges) =>
        withEdgeDefaults(
          filtrarEdgesValidas(currentEdges.length > 0 ? currentEdges : defaultEdges, nodeIds),
        ),
      )
    },
    [nodeStylePreset],
  )

  const recarregar = useCallback(async () => {
    setIsLoading(true)
    setApiError(null)

    try {
      const [apiNodes, apiDashboard] = await Promise.all([
        noFluxogramaApi.listar(),
        noFluxogramaApi.dashboard(),
      ])
      aplicarNosDaApi(apiNodes)
      setDashboardApi(apiDashboard)
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Falha ao carregar dados da API.'
      setApiError(mensagem)
    } finally {
      setIsLoading(false)
    }
  }, [aplicarNosDaApi])

  useEffect(() => {
    void recarregar()
  }, [recarregar])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const payload: IPersistedBoardState = {
      edges,
      edgePreset,
      nodeStylePreset,
    }

    window.localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(payload))
  }, [edgePreset, edges, nodeStylePreset])

  const sincronizarPosicao = useCallback((node: DrawYouNode) => {
    const apiId = parseNodeId(node.id)
    if (apiId === null) {
      return
    }

    if (positionSyncTimers.current[node.id]) {
      window.clearTimeout(positionSyncTimers.current[node.id])
    }

    positionSyncTimers.current[node.id] = window.setTimeout(() => {
      void (async () => {
        try {
          await noFluxogramaApi.atualizar(apiId, toApiPayloadFromNode(node))
        } catch (error) {
          console.error('Falha ao sincronizar posicao do no:', error)
        }
      })()
    }, POSITION_SYNC_DELAY_MS)
  }, [])

  const onNodesChange = useCallback(
    (changes: NodeChange<DrawYouNode>[]) => {
      setNodes((currentNodes) => {
        const nextNodes = applyNodeChanges(changes, currentNodes)

        for (const change of changes) {
          if (change.type === 'position' && change.dragging === false) {
            const nodeAtualizado = nextNodes.find((node) => node.id === change.id)
            if (nodeAtualizado) {
              sincronizarPosicao(nodeAtualizado)
            }
          }
        }

        return nextNodes
      })
    },
    [sincronizarPosicao],
  )

  const onEdgesChange = useCallback((changes: EdgeChange<DrawYouEdge>[]) => {
    setEdges((currentEdges) => applyEdgeChanges(changes, currentEdges))
  }, [])

  const onConnect = useCallback((connection: Connection) => {
    setEdges((currentEdges) =>
      addEdge(
        {
          ...edgeVisualDefaults,
          ...connection,
          type: edgePreset.type,
          id: `edge-${connection.source ?? 'unknown'}-${connection.target ?? 'unknown'}-${Date.now()}`,
          label: 'nova conexao',
          style: {
            stroke: edgePreset.color,
            strokeWidth: edgePreset.strokeWidth,
            strokeDasharray: edgePreset.dashed ? '8 6' : undefined,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edgePreset.color,
            width: getMarkerSize(edgePreset.strokeWidth),
            height: getMarkerSize(edgePreset.strokeWidth),
          },
        },
        currentEdges,
      ),
    )
  }, [edgePreset])

  const onReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => {
    setEdges((currentEdges) =>
      currentEdges.map((edge) =>
        edge.id === oldEdge.id
          ? {
              ...edge,
              source: newConnection.source ?? edge.source,
              target: newConnection.target ?? edge.target,
              sourceHandle: newConnection.sourceHandle ?? edge.sourceHandle,
              targetHandle: newConnection.targetHandle ?? edge.targetHandle,
            }
          : edge,
      ),
    )
  }, [])

  const updateEdgeStyle = useCallback((edgeId: string, payload: IUpdateEdgeStylePayload) => {
    const nextPreset: IEdgeStylePreset = {
      type: payload.type ?? edgePreset.type,
      strokeWidth: payload.strokeWidth ?? edgePreset.strokeWidth,
      dashed: payload.dashed ?? edgePreset.dashed,
      color: payload.color ?? edgePreset.color,
    }
    setEdgePreset(nextPreset)

    setEdges((currentEdges) =>
      currentEdges.map((edge) => {
        if (edge.id !== edgeId) {
          return edge
        }

        const nextColor = payload.color ?? (edge.style?.stroke as string) ?? '#64748b'
        const nextWidth = payload.strokeWidth ?? Number(edge.style?.strokeWidth ?? 2)
        const nextDashed = payload.dashed ?? Boolean(edge.style?.strokeDasharray)
        const nextLabel = payload.label ?? (typeof edge.label === 'string' ? edge.label : '')
        const nextType =
          payload.type ?? ((edge.type as DrawYouEdgeType | undefined) ?? 'smoothstep')
        const nextMarkerSize = getMarkerSize(nextWidth)

        return {
          ...edge,
          type: nextType,
          label: nextLabel,
          style: {
            ...edge.style,
            stroke: nextColor,
            strokeWidth: nextWidth,
            strokeDasharray: nextDashed ? '8 6' : undefined,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: nextColor,
            width: nextMarkerSize,
            height: nextMarkerSize,
          },
          labelStyle: {
            ...edge.labelStyle,
            fill: '#334155',
            fontSize: 12,
            fontWeight: 600,
          },
          labelBgStyle: {
            fill: '#ffffff',
            fillOpacity: 0.92,
          },
          labelBgBorderRadius: 6,
          labelBgPadding: [8, 4],
        }
      }),
    )
  }, [edgePreset])

  const removeEdge = useCallback((edgeId: string) => {
    setEdges((currentEdges) => currentEdges.filter((edge) => edge.id !== edgeId))
  }, [])

  const addNode = useCallback(
    async (payload: ICreateNodePayload) => {
      setApiError(null)
      const posicao = {
        x: 80 + (nodes.length % 3) * 280,
        y: 280 + Math.floor(nodes.length / 3) * 150,
      }

      try {
        const criado = await noFluxogramaApi.cadastrar(
          toApiPayloadFromCreate(payload, posicao),
        )
        setNodes((current) => [...current, toDrawYouNode(criado, nodeStylePreset)])
        const apiDashboard = await noFluxogramaApi.dashboard()
        setDashboardApi(apiDashboard)
      } catch (error) {
        const mensagem = error instanceof Error ? error.message : 'Falha ao cadastrar no.'
        setApiError(mensagem)
        throw error
      }
    },
    [nodeStylePreset, nodes.length],
  )

  const duplicateNode = useCallback(
    async (nodeId: string) => {
      const sourceNode = nodes.find((node) => node.id === nodeId)
      if (!sourceNode) {
        return
      }

      setApiError(null)

      try {
        const criado = await noFluxogramaApi.cadastrar({
          titulo: `${sourceNode.data.titulo} copia`,
          descricao: sourceNode.data.descricao ?? '',
          tipo: sourceNode.data.tipo,
          status: sourceNode.data.status,
          posicaoX: sourceNode.position.x + 60,
          posicaoY: sourceNode.position.y + 60,
        })
        setNodes((current) => [...current, toDrawYouNode(criado, nodeStylePreset)])
        const apiDashboard = await noFluxogramaApi.dashboard()
        setDashboardApi(apiDashboard)
      } catch (error) {
        const mensagem = error instanceof Error ? error.message : 'Falha ao duplicar no.'
        setApiError(mensagem)
      }
    },
    [nodeStylePreset, nodes],
  )

  const persistirNoNaApi = useCallback(
    async (nodeId: string, payload: IUpdateNodeDataPayload) => {
      const apiId = parseNodeId(nodeId)
      const nodeAtual = nodes.find((node) => node.id === nodeId)

      if (apiId === null || !nodeAtual) {
        return
      }

      const atualizado = await noFluxogramaApi.atualizar(
        apiId,
        mergeNodeDataPayload(nodeAtual, payload),
      )

      setNodes((current) =>
        current.map((node) =>
          node.id === nodeId ? toDrawYouNode(atualizado, nodeStylePreset) : node,
        ),
      )
      const apiDashboard = await noFluxogramaApi.dashboard()
      setDashboardApi(apiDashboard)
    },
    [nodeStylePreset, nodes],
  )

  const removeNode = useCallback(
    async (nodeId: string) => {
      const apiId = parseNodeId(nodeId)
      if (apiId === null) {
        return
      }

      setApiError(null)

      try {
        await noFluxogramaApi.excluir(apiId)
        setNodes((current) => current.filter((node) => node.id !== nodeId))
        setEdges((current) =>
          current.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
        )
        const apiDashboard = await noFluxogramaApi.dashboard()
        setDashboardApi(apiDashboard)
      } catch (error) {
        const mensagem = error instanceof Error ? error.message : 'Falha ao excluir no.'
        setApiError(mensagem)
      }
    },
    [],
  )

  const updateNodeStatus = useCallback(
    async (nodeId: string, status: NodeStatus) => {
      setApiError(null)
      try {
        await persistirNoNaApi(nodeId, { status })
      } catch (error) {
        const mensagem = error instanceof Error ? error.message : 'Falha ao atualizar status.'
        setApiError(mensagem)
      }
    },
    [persistirNoNaApi],
  )

  const updateNodeData = useCallback(
    async (nodeId: string, payload: IUpdateNodeDataPayload) => {
      const hasStylePayload =
        payload.nodeBgColor !== undefined ||
        payload.nodeBorderColor !== undefined ||
        payload.nodeTextColor !== undefined ||
        payload.nodeBorderWidth !== undefined

      if (hasStylePayload) {
        setNodeStylePreset((currentPreset) => ({
          ...currentPreset,
          ...(payload.nodeBgColor !== undefined ? { nodeBgColor: payload.nodeBgColor } : {}),
          ...(payload.nodeBorderColor !== undefined
            ? { nodeBorderColor: payload.nodeBorderColor }
            : {}),
          ...(payload.nodeTextColor !== undefined ? { nodeTextColor: payload.nodeTextColor } : {}),
          ...(payload.nodeBorderWidth !== undefined
            ? { nodeBorderWidth: payload.nodeBorderWidth }
            : {}),
        }))
      }

      setNodes((currentNodes) =>
        currentNodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  ...(payload.titulo !== undefined ? { titulo: payload.titulo } : {}),
                  ...(payload.descricao !== undefined ? { descricao: payload.descricao } : {}),
                  ...(payload.tipo !== undefined ? { tipo: payload.tipo } : {}),
                  ...(payload.status !== undefined ? { status: payload.status } : {}),
                  ...(payload.nodeBgColor !== undefined
                    ? { nodeBgColor: payload.nodeBgColor }
                    : {}),
                  ...(payload.nodeBorderColor !== undefined
                    ? { nodeBorderColor: payload.nodeBorderColor }
                    : {}),
                  ...(payload.nodeTextColor !== undefined
                    ? { nodeTextColor: payload.nodeTextColor }
                    : {}),
                  ...(payload.nodeBorderWidth !== undefined
                    ? { nodeBorderWidth: payload.nodeBorderWidth }
                    : {}),
                },
              }
            : node,
        ),
      )

      if (!temCamposDeNegocio(payload)) {
        return
      }

      setApiError(null)
      try {
        await persistirNoNaApi(nodeId, payload)
      } catch (error) {
        const mensagem = error instanceof Error ? error.message : 'Falha ao atualizar no.'
        setApiError(mensagem)
        void recarregar()
      }
    },
    [persistirNoNaApi, recarregar],
  )

  const dashboard = useMemo<IDashboardDrawYou>(
    () => combinarDashboard(dashboardApi, edges.length),
    [dashboardApi, edges.length],
  )

  return {
    nodes,
    edges,
    dashboard,
    isLoading,
    apiError,
    recarregar,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onReconnect,
    updateEdgeStyle,
    removeEdge,
    addNode,
    duplicateNode,
    removeNode,
    updateNodeStatus,
    updateNodeData,
  }
}
