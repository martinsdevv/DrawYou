import { useState } from 'react'
import { DrawYouCanvas } from '../components/canvas/DrawYouCanvas'
import { DrawYouFooterAddress } from '../components/layout/DrawYouFooterAddress'
import { FloatingActions } from '../components/layout/FloatingActions'
import { DrawYouHeader } from '../components/layout/DrawYouHeader'
import { DrawYouMain } from '../components/layout/DrawYouMain'
import { DrawYouSidebar } from '../components/layout/DrawYouSidebar'
import { useDrawYouState } from '../hooks/useDrawYouState'

export const DrawYouPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDashboardOpen, setIsDashboardOpen] = useState(true)

  const {
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
  } = useDrawYouState()

  const currentDate = new Date().toLocaleDateString('pt-BR')
  const handleCreateQuickNode = () => {
    addNode({
      titulo: `Novo no ${nodes.length + 1}`,
      tipo: 'processo',
      status: 'pendente',
    })
  }

  return (
    <div className="app-shell">
      <DrawYouHeader onToggleSidebar={() => setIsSidebarOpen(true)} />
      <DrawYouMain
        canvas={
          <DrawYouCanvas
            nodes={nodes}
            edges={edges}
            dashboard={dashboard}
            showDashboard={isDashboardOpen}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onReconnect={onReconnect}
            onUpdateEdgeStyle={updateEdgeStyle}
            onRemoveEdge={removeEdge}
            onUpdateNodeData={updateNodeData}
            onRemoveNode={removeNode}
            onDuplicateNode={duplicateNode}
          />
        }
      />
      <DrawYouSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        nodes={nodes}
        dashboard={dashboard}
        onAddNode={addNode}
        onUpdateNodeStatus={updateNodeStatus}
        onRemoveNode={removeNode}
      />
      <FloatingActions
        isDashboardOpen={isDashboardOpen}
        onCreateNode={handleCreateQuickNode}
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onToggleDashboard={() => setIsDashboardOpen((current) => !current)}
      />
      <DrawYouFooterAddress
        nomeCompleto="Gabriel Martins Torres"
        dataReferencia={currentDate}
        disciplina="Desenvolvimento Web"
        professor="Fernando"
      />
    </div>
  )
}
