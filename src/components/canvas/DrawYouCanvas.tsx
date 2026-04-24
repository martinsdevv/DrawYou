import {
  Background,
  ConnectionLineType,
  ConnectionMode,
  type EdgeMouseHandler,
  type NodeMouseHandler,
  MarkerType,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from '@xyflow/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { DrawYouNode } from './DrawYouNode'
import { DashboardCards } from '../dashboard/DashboardCards'
import type {
  DrawYouNodeKind,
  DrawYouEdge,
  DrawYouEdgeType,
  DrawYouNode as DrawYouNodeType,
  IDashboardDrawYou,
  IUpdateEdgeStylePayload,
  IUpdateNodeDataPayload,
  NodeStatus,
} from '../../types/drawYou'

interface DrawYouCanvasProps {
  nodes: DrawYouNodeType[]
  edges: DrawYouEdge[]
  dashboard: IDashboardDrawYou
  showDashboard: boolean
  onNodesChange: (changes: NodeChange<DrawYouNodeType>[]) => void
  onEdgesChange: (changes: EdgeChange<DrawYouEdge>[]) => void
  onConnect: (connection: Connection) => void
  onReconnect: (oldEdge: DrawYouEdge, newConnection: Connection) => void
  onUpdateEdgeStyle: (edgeId: string, payload: IUpdateEdgeStylePayload) => void
  onRemoveEdge: (edgeId: string) => void
  onUpdateNodeData: (nodeId: string, payload: IUpdateNodeDataPayload) => void
  onRemoveNode: (nodeId: string) => void
  onDuplicateNode: (nodeId: string) => void
}

const nodeTypes = {
  drawYouNode: DrawYouNode,
}

export const DrawYouCanvas = ({
  nodes,
  edges,
  dashboard,
  showDashboard,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onReconnect,
  onUpdateEdgeStyle,
  onRemoveEdge,
  onUpdateNodeData,
  onRemoveNode,
  onDuplicateNode,
}: DrawYouCanvasProps) => {
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [newStatusOption, setNewStatusOption] = useState('')
  const [newTypeOption, setNewTypeOption] = useState('')
  const [copiedNodeId, setCopiedNodeId] = useState<string | null>(null)

  const selectedEdge = useMemo(
    () => edges.find((edge) => edge.id === selectedEdgeId) ?? null,
    [edges, selectedEdgeId],
  )
  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  )
  const availableStatusOptions = useMemo(
    () =>
      Array.from(
        new Set<NodeStatus>(['pendente', 'ativo', 'concluido', 'erro', ...nodes.map((n) => n.data.status)]),
      ),
    [nodes],
  )
  const availableTypeOptions = useMemo(
    () =>
      Array.from(
        new Set<DrawYouNodeKind>([
          'inicio',
          'processo',
          'decisao',
          'fim',
          ...nodes.map((n) => n.data.tipo),
        ]),
      ),
    [nodes],
  )

  const defaultEdgeOptions: Partial<DrawYouEdge> = {
    type: 'smoothstep',
    animated: false,
    style: {
      stroke: '#64748b',
      strokeWidth: 2,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#64748b',
      width: 20,
      height: 20,
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

  const handleEdgeClick: EdgeMouseHandler<DrawYouEdge> = (_, edge) => {
    setSelectedNodeId(null)
    setSelectedEdgeId(edge.id)
  }

  const handleNodeClick: NodeMouseHandler<DrawYouNodeType> = (_, node) => {
    setSelectedEdgeId(null)
    setSelectedNodeId(node.id)
  }

  const handlePaneClick = () => {
    setSelectedEdgeId(null)
    setSelectedNodeId(null)
  }

  const handleAddStatusOption = useCallback(() => {
    if (!selectedNode) return
    const cleanValue = newStatusOption.trim()
    if (!cleanValue) return
    onUpdateNodeData(selectedNode.id, { status: cleanValue as NodeStatus })
    setNewStatusOption('')
  }, [newStatusOption, onUpdateNodeData, selectedNode])

  const handleAddTypeOption = useCallback(() => {
    if (!selectedNode) return
    const cleanValue = newTypeOption.trim()
    if (!cleanValue) return
    onUpdateNodeData(selectedNode.id, { tipo: cleanValue as DrawYouNodeKind })
    setNewTypeOption('')
  }, [newTypeOption, onUpdateNodeData, selectedNode])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTypingField =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)

      if (isTypingField) {
        return
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedNodeId) {
          event.preventDefault()
          onRemoveNode(selectedNodeId)
          setSelectedNodeId(null)
          return
        }

        if (selectedEdgeId) {
          event.preventDefault()
          onRemoveEdge(selectedEdgeId)
          setSelectedEdgeId(null)
        }
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c' && selectedNodeId) {
        event.preventDefault()
        setCopiedNodeId(selectedNodeId)
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v' && copiedNodeId) {
        event.preventDefault()
        onDuplicateNode(copiedNodeId)
      }

      if (event.key === 'Escape') {
        setSelectedEdgeId(null)
        setSelectedNodeId(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [copiedNodeId, onDuplicateNode, onRemoveEdge, onRemoveNode, selectedEdgeId, selectedNodeId])

  const edgeType = (selectedEdge?.type as DrawYouEdgeType | undefined) ?? 'smoothstep'
  const edgeWidth = Number(selectedEdge?.style?.strokeWidth ?? 2)
  const edgeDashed = Boolean(selectedEdge?.style?.strokeDasharray)
  const edgeColor = (selectedEdge?.style?.stroke as string) ?? '#64748b'
  const edgeLabel = typeof selectedEdge?.label === 'string' ? selectedEdge.label : ''
  const nodeTitle = selectedNode?.data.titulo ?? ''
  const nodeDescription = selectedNode?.data.descricao ?? ''
  const nodeStatus = (selectedNode?.data.status ?? 'pendente') as NodeStatus
  const nodeType = (selectedNode?.data.tipo ?? 'processo') as DrawYouNodeKind
  const nodeBgColor = (selectedNode?.data.nodeBgColor as string | undefined) ?? '#ffffff'
  const nodeBorderColor = (selectedNode?.data.nodeBorderColor as string | undefined) ?? '#ced4da'
  const nodeTextColor = (selectedNode?.data.nodeTextColor as string | undefined) ?? '#1f2937'
  const nodeBorderWidth = Number(selectedNode?.data.nodeBorderWidth ?? 2)

  return (
    <div className="canvas-shell border rounded-3 overflow-hidden">
      <ReactFlowProvider>
        <ReactFlow<DrawYouNodeType, DrawYouEdge>
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          connectionMode={ConnectionMode.Loose}
          connectionLineType={ConnectionLineType.SmoothStep}
          connectionRadius={28}
          edgesReconnectable
          reconnectRadius={18}
          fitView
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onReconnect={onReconnect}
          onEdgeClick={handleEdgeClick}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          className="draw-you-flow"
        >
          <Background gap={16} size={1} />
          {showDashboard ? (
            <Panel position="top-right" className="dashboard-floating-panel">
              <DashboardCards dashboard={dashboard} />
            </Panel>
          ) : null}
          {selectedEdge ? (
            <Panel position="bottom-left" className="edge-options-panel">
              <h3 className="h6 mb-2">Editar seta</h3>
              <label className="form-label mb-1">Tipo</label>
              <select
                className="form-select form-select-sm mb-2"
                value={edgeType}
                onChange={(event) =>
                  onUpdateEdgeStyle(selectedEdge.id, {
                    type: event.target.value as DrawYouEdgeType,
                  })
                }
              >
                <option value="smoothstep">Suave</option>
                <option value="step">Degrau</option>
                <option value="straight">Reta</option>
                <option value="bezier">Curva Bezier</option>
              </select>

              <label className="form-label mb-1">Espessura ({edgeWidth}px)</label>
              <input
                className="form-range mb-2"
                type="range"
                min={1}
                max={8}
                step={1}
                value={edgeWidth}
                onChange={(event) =>
                  onUpdateEdgeStyle(selectedEdge.id, {
                    strokeWidth: Number(event.target.value),
                  })
                }
              />

              <label className="form-label mb-1">Cor</label>
              <input
                className="form-control form-control-color mb-2"
                type="color"
                value={edgeColor}
                onChange={(event) =>
                  onUpdateEdgeStyle(selectedEdge.id, {
                    color: event.target.value,
                  })
                }
              />

              <div className="form-check mb-2">
                <input
                  id="edge-dashed"
                  className="form-check-input"
                  type="checkbox"
                  checked={edgeDashed}
                  onChange={(event) =>
                    onUpdateEdgeStyle(selectedEdge.id, {
                      dashed: event.target.checked,
                    })
                  }
                />
                <label className="form-check-label" htmlFor="edge-dashed">
                  Pontilhado
                </label>
              </div>

              <label className="form-label mb-1">Texto</label>
              <input
                className="form-control form-control-sm mb-3"
                type="text"
                value={edgeLabel}
                placeholder="Ex: aprovado"
                onChange={(event) =>
                  onUpdateEdgeStyle(selectedEdge.id, {
                    label: event.target.value,
                  })
                }
              />

              <div className="d-flex align-items-center justify-content-between gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setSelectedEdgeId(null)}
                >
                  Fechar
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger remove-icon-btn ms-auto"
                  onClick={() => {
                    onRemoveEdge(selectedEdge.id)
                    setSelectedEdgeId(null)
                  }}
                  aria-label="Remover seta"
                  title="Remover seta"
                >
                  🗑
                </button>
              </div>
            </Panel>
          ) : null}
          {selectedNode ? (
            <Panel position="bottom-left" className="node-options-panel">
              <h3 className="h6 mb-2">Personalizar card</h3>

              <label className="form-label mb-1">Titulo</label>
              <input
                className="form-control form-control-sm mb-2"
                type="text"
                value={nodeTitle}
                onChange={(event) =>
                  onUpdateNodeData(selectedNode.id, {
                    titulo: event.target.value,
                  })
                }
              />

              <label className="form-label mb-1">Descricao</label>
              <textarea
                className="form-control form-control-sm mb-2"
                rows={3}
                value={nodeDescription}
                onChange={(event) =>
                  onUpdateNodeData(selectedNode.id, {
                    descricao: event.target.value,
                  })
                }
              />

              <label className="form-label mb-1">Status</label>
              <select
                className="form-select form-select-sm mb-2"
                value={nodeStatus}
                onChange={(event) =>
                  onUpdateNodeData(selectedNode.id, {
                    status: event.target.value as NodeStatus,
                  })
                }
              >
                {availableStatusOptions.map((statusOption) => (
                  <option key={statusOption} value={statusOption}>
                    {statusOption}
                  </option>
                ))}
              </select>
              <div className="d-flex gap-2 mb-2">
                <input
                  className="form-control form-control-sm"
                  type="text"
                  value={newStatusOption}
                  placeholder="Novo status"
                  onChange={(event) => setNewStatusOption(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      handleAddStatusOption()
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleAddStatusOption}
                >
                  +
                </button>
              </div>

              <label className="form-label mb-1">Tipo</label>
              <select
                className="form-select form-select-sm mb-2"
                value={nodeType}
                onChange={(event) =>
                  onUpdateNodeData(selectedNode.id, {
                    tipo: event.target.value as DrawYouNodeKind,
                  })
                }
              >
                {availableTypeOptions.map((typeOption) => (
                  <option key={typeOption} value={typeOption}>
                    {typeOption}
                  </option>
                ))}
              </select>
              <div className="d-flex gap-2 mb-2">
                <input
                  className="form-control form-control-sm"
                  type="text"
                  value={newTypeOption}
                  placeholder="Novo tipo"
                  onChange={(event) => setNewTypeOption(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      handleAddTypeOption()
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleAddTypeOption}
                >
                  +
                </button>
              </div>

              <div className="node-color-grid mb-2">
                <div>
                  <label className="form-label mb-1">Cor interna</label>
                  <input
                    className="form-control form-control-color"
                    type="color"
                    value={nodeBgColor}
                    onChange={(event) =>
                      onUpdateNodeData(selectedNode.id, {
                        nodeBgColor: event.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="form-label mb-1">Cor da borda</label>
                  <input
                    className="form-control form-control-color"
                    type="color"
                    value={nodeBorderColor}
                    onChange={(event) =>
                      onUpdateNodeData(selectedNode.id, {
                        nodeBorderColor: event.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="form-label mb-1">Cor do texto</label>
                  <input
                    className="form-control form-control-color"
                    type="color"
                    value={nodeTextColor}
                    onChange={(event) =>
                      onUpdateNodeData(selectedNode.id, {
                        nodeTextColor: event.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <label className="form-label mb-1">Espessura da borda ({nodeBorderWidth}px)</label>
              <input
                className="form-range mb-3"
                type="range"
                min={1}
                max={8}
                step={1}
                value={nodeBorderWidth}
                onChange={(event) =>
                  onUpdateNodeData(selectedNode.id, {
                    nodeBorderWidth: Number(event.target.value),
                  })
                }
              />

              <div className="d-flex align-items-center justify-content-between gap-2">
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setSelectedNodeId(null)}
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() =>
                      onUpdateNodeData(selectedNode.id, {
                        titulo: selectedNode.data.titulo,
                        descricao: selectedNode.data.descricao,
                        tipo: selectedNode.data.tipo as DrawYouNodeKind,
                        status: selectedNode.data.status as NodeStatus,
                        nodeBgColor: '#ffffff',
                        nodeBorderColor: '#ced4da',
                        nodeTextColor: '#1f2937',
                        nodeBorderWidth: 2,
                      })
                    }
                  >
                    Resetar
                  </button>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger remove-icon-btn ms-auto"
                  onClick={() => {
                    onRemoveNode(selectedNode.id)
                    setSelectedNodeId(null)
                  }}
                  aria-label="Remover no"
                  title="Remover no"
                >
                  🗑
                </button>
              </div>
            </Panel>
          ) : null}
          <MiniMap pannable zoomable />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  )
}
