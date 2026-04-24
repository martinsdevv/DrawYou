import { useCallback, useEffect, useMemo } from 'react'
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
import { initialEdges, initialNodes } from '../data/seed'
import type {
  DrawYouNodeKind,
  DrawYouEdge,
  DrawYouEdgeType,
  DrawYouNode,
  ICreateNodePayload,
  IDashboardDrawYou,
  IUpdateEdgeStylePayload,
  IUpdateNodeDataPayload,
  NodeStatus,
} from '../types/drawYou'
import { useState } from 'react'

interface IUseDrawYouStateReturn {
  nodes: DrawYouNode[]
  edges: DrawYouEdge[]
  dashboard: IDashboardDrawYou
  onNodesChange: (changes: NodeChange<DrawYouNode>[]) => void
  onEdgesChange: (changes: EdgeChange<DrawYouEdge>[]) => void
  onConnect: (connection: Connection) => void
  onReconnect: (oldEdge: Edge, newConnection: Connection) => void
  updateEdgeStyle: (edgeId: string, payload: IUpdateEdgeStylePayload) => void
  removeEdge: (edgeId: string) => void
  addNode: (payload: ICreateNodePayload) => void
  duplicateNode: (nodeId: string) => void
  removeNode: (nodeId: string) => void
  updateNodeStatus: (nodeId: string, status: NodeStatus) => void
  updateNodeData: (nodeId: string, payload: IUpdateNodeDataPayload) => void
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
  nodes: DrawYouNode[]
  edges: DrawYouEdge[]
  edgePreset: IEdgeStylePreset
  nodeStylePreset: INodeStylePreset
}

const BOARD_STORAGE_KEY = 'draw-you-board-v1'

const DEFAULT_EDGE_PRESET: IEdgeStylePreset = {
  type: 'smoothstep',
  strokeWidth: 2,
  dashed: false,
  color: '#64748b',
}

const DEFAULT_NODE_STYLE_PRESET: INodeStylePreset = {}

const getMarkerSize = (strokeWidth: number) => Math.max(10, Math.min(18, 9 + strokeWidth * 1.1))

const getInitialEdges = () =>
  initialEdges.map((edge) => ({
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
    if (!Array.isArray(parsedValue.nodes) || !Array.isArray(parsedValue.edges)) {
      return null
    }

    const parsedPreset = parsedValue.edgePreset ?? DEFAULT_EDGE_PRESET
    const parsedNodeStylePreset = parsedValue.nodeStylePreset ?? DEFAULT_NODE_STYLE_PRESET

    return {
      nodes: parsedValue.nodes as DrawYouNode[],
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

const getNodeId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `node-${crypto.randomUUID()}`
  }

  return `node-${Date.now()}`
}

export const useDrawYouState = (): IUseDrawYouStateReturn => {
  const persistedState = useMemo(() => readPersistedBoardState(), [])

  const [nodes, setNodes] = useState<DrawYouNode[]>(persistedState?.nodes ?? initialNodes)
  const [edgePreset, setEdgePreset] = useState<IEdgeStylePreset>(
    persistedState?.edgePreset ?? DEFAULT_EDGE_PRESET,
  )
  const [nodeStylePreset, setNodeStylePreset] = useState<INodeStylePreset>(
    persistedState?.nodeStylePreset ?? DEFAULT_NODE_STYLE_PRESET,
  )
  const [edges, setEdges] = useState<DrawYouEdge[]>(persistedState?.edges ?? getInitialEdges())

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const payload: IPersistedBoardState = {
      nodes,
      edges,
      edgePreset,
      nodeStylePreset,
    }

    window.localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(payload))
  }, [edgePreset, edges, nodeStylePreset, nodes])

  const onNodesChange = useCallback((changes: NodeChange<DrawYouNode>[]) => {
    setNodes((currentNodes) => applyNodeChanges(changes, currentNodes))
  }, [])

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

  const addNode = useCallback((payload: ICreateNodePayload) => {
    setNodes((currentNodes) => {
      const nextIndex = currentNodes.length
      const nextNode: DrawYouNode = {
        id: getNodeId(),
        type: 'drawYouNode',
        position: {
          x: 80 + (nextIndex % 3) * 280,
          y: 280 + Math.floor(nextIndex / 3) * 150,
        },
        data: {
          titulo: payload.titulo,
          descricao: '',
          tipo: payload.tipo,
          status: payload.status,
          ...nodeStylePreset,
        },
      }

      return [...currentNodes, nextNode]
    })
  }, [nodeStylePreset])

  const duplicateNode = useCallback((nodeId: string) => {
    setNodes((currentNodes) => {
      const sourceNode = currentNodes.find((node) => node.id === nodeId)
      if (!sourceNode) {
        return currentNodes
      }

      const duplicatedNode: DrawYouNode = {
        ...sourceNode,
        id: getNodeId(),
        position: {
          x: sourceNode.position.x + 60,
          y: sourceNode.position.y + 60,
        },
        data: {
          ...sourceNode.data,
          titulo: `${sourceNode.data.titulo} copia`,
        },
      }

      return [...currentNodes, duplicatedNode]
    })
  }, [])

  const removeNode = useCallback((nodeId: string) => {
    setNodes((currentNodes) => currentNodes.filter((node) => node.id !== nodeId))
    setEdges((currentEdges) =>
      currentEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
    )
  }, [])

  const updateNodeStatus = useCallback((nodeId: string, status: NodeStatus) => {
    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, status } } : node,
      ),
    )
  }, [])

  const updateNodeData = useCallback((nodeId: string, payload: IUpdateNodeDataPayload) => {
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
                ...(payload.tipo !== undefined
                  ? { tipo: payload.tipo as DrawYouNodeKind }
                  : {}),
                ...(payload.status !== undefined
                  ? { status: payload.status as NodeStatus }
                  : {}),
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
  }, [])

  const dashboard = useMemo<IDashboardDrawYou>(() => {
    const totalNos = nodes.length
    const totalConexoes = edges.length
    const totalPendentes = nodes.filter((node) => node.data.status === 'pendente').length
    const totalAtivos = nodes.filter((node) => node.data.status === 'ativo').length
    const totalConcluidos = nodes.filter((node) => node.data.status === 'concluido').length
    const totalErros = nodes.filter((node) => node.data.status === 'erro').length

    return {
      totalNos,
      totalConexoes,
      totalPendentes,
      totalAtivos,
      totalConcluidos,
      totalErros,
    }
  }, [edges.length, nodes])

  return {
    nodes,
    edges,
    dashboard,
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
