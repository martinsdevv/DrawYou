import { type FormEvent, useMemo, useState } from 'react'
import { DashboardCards } from '../dashboard/DashboardCards'
import type {
  DrawYouNode,
  DrawYouNodeKind,
  IDashboardDrawYou,
  NodeStatus,
} from '../../types/drawYou'

interface DrawYouSidebarProps {
  isOpen: boolean
  onClose: () => void
  nodes: DrawYouNode[]
  dashboard: IDashboardDrawYou
  onAddNode: (payload: { titulo: string; tipo: DrawYouNodeKind; status: NodeStatus }) => void
  onUpdateNodeStatus: (nodeId: string, status: NodeStatus) => void
  onRemoveNode: (nodeId: string) => void
}

const defaultNodeKinds: DrawYouNodeKind[] = ['inicio', 'processo', 'decisao', 'fim']
const defaultStatusList: NodeStatus[] = ['pendente', 'ativo', 'concluido', 'erro']

export const DrawYouSidebar = ({
  isOpen,
  onClose,
  nodes,
  dashboard,
  onAddNode,
  onUpdateNodeStatus,
  onRemoveNode,
}: DrawYouSidebarProps) => {
  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState<DrawYouNodeKind>('processo')
  const [status, setStatus] = useState<NodeStatus>('pendente')
  const [newStatusOption, setNewStatusOption] = useState('')
  const [newTypeOption, setNewTypeOption] = useState('')
  const nodeKinds = useMemo(
    () => Array.from(new Set([...defaultNodeKinds, ...nodes.map((node) => node.data.tipo)])),
    [nodes],
  )
  const statusList = useMemo(
    () => Array.from(new Set([...defaultStatusList, ...nodes.map((node) => node.data.status)])),
    [nodes],
  )
  const [activeTab, setActiveTab] = useState<'acoes' | 'itens' | 'dashboard'>('acoes')

  const handleAddNode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanTitle = titulo.trim()

    if (!cleanTitle) {
      return
    }

    onAddNode({
      titulo: cleanTitle,
      tipo,
      status,
    })

    setTitulo('')
    setTipo('processo')
    setStatus('pendente')
  }

  return (
    <>
      <div
        className={`sidebar-backdrop ${isOpen ? 'show' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      <aside className={`side-panel ${isOpen ? 'open' : ''}`} aria-label="Menu lateral do draw-you">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h5 mb-0">Menu lateral</h2>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>

        <nav className="d-flex gap-2 mb-3">
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'acoes' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab('acoes')}
          >
            Acoes
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'itens' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab('itens')}
          >
            Itens
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
        </nav>

        {activeTab === 'acoes' ? (
          <section className="mb-4">
            <h3 className="h6 mb-3">Novo no</h3>
            <form className="vstack gap-2" onSubmit={handleAddNode}>
              <label className="form-label mb-0" htmlFor="node-title">
                Titulo
              </label>
              <input
                id="node-title"
                className="form-control"
                value={titulo}
                onChange={(event) => setTitulo(event.target.value)}
                placeholder="Ex: Aprovar pedido"
              />
              <label className="form-label mb-0" htmlFor="node-type">
                Tipo
              </label>
              <select
                id="node-type"
                className="form-select"
                value={tipo}
                onChange={(event) => setTipo(event.target.value as DrawYouNodeKind)}
              >
                {nodeKinds.map((nodeKind) => (
                  <option key={nodeKind} value={nodeKind}>
                    {nodeKind}
                  </option>
                ))}
              </select>
              <div className="d-flex gap-2">
                <input
                  className="form-control form-control-sm"
                  type="text"
                  value={newTypeOption}
                  placeholder="Novo tipo"
                  onChange={(event) => setNewTypeOption(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      const cleanValue = newTypeOption.trim()
                      if (!cleanValue) return
                      setTipo(cleanValue as DrawYouNodeKind)
                      setNewTypeOption('')
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => {
                    const cleanValue = newTypeOption.trim()
                    if (!cleanValue) return
                    setTipo(cleanValue as DrawYouNodeKind)
                    setNewTypeOption('')
                  }}
                >
                  +
                </button>
              </div>
              <label className="form-label mb-0" htmlFor="node-status">
                Status
              </label>
              <select
                id="node-status"
                className="form-select"
                value={status}
                onChange={(event) => setStatus(event.target.value as NodeStatus)}
              >
                {statusList.map((statusOption) => (
                  <option key={statusOption} value={statusOption}>
                    {statusOption}
                  </option>
                ))}
              </select>
              <div className="d-flex gap-2">
                <input
                  className="form-control form-control-sm"
                  type="text"
                  value={newStatusOption}
                  placeholder="Novo status"
                  onChange={(event) => setNewStatusOption(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      const cleanValue = newStatusOption.trim()
                      if (!cleanValue) return
                      setStatus(cleanValue as NodeStatus)
                      setNewStatusOption('')
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => {
                    const cleanValue = newStatusOption.trim()
                    if (!cleanValue) return
                    setStatus(cleanValue as NodeStatus)
                    setNewStatusOption('')
                  }}
                >
                  +
                </button>
              </div>
              <button type="submit" className="btn btn-success mt-2">
                Criar no
              </button>
            </form>
          </section>
        ) : null}

        {activeTab === 'itens' ? (
          <section aria-label="Lista de nos">
            <h3 className="h6 mb-3">Itens do fluxo</h3>
            <div className="vstack gap-2">
              {nodes.map((node) => (
                <article key={node.id} className="node-item-list card border-0 shadow-sm">
                  <div className="card-body p-2">
                    <div className="d-flex justify-content-between align-items-center gap-2">
                      <div>
                        <strong className="d-block">{node.data.titulo}</strong>
                        <small className="text-secondary">
                          {node.data.tipo} | status: {node.data.status}
                        </small>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger remove-icon-btn ms-auto"
                        onClick={() => onRemoveNode(node.id)}
                        aria-label="Remover no"
                        title="Remover no"
                      >
                        🗑
                      </button>
                    </div>
                    <div className="d-flex gap-1 flex-wrap mt-2">
                      {statusList.map((status) => (
                        <button
                          key={status}
                          type="button"
                          className={`btn btn-sm ${
                            node.data.status === status ? 'btn-primary' : 'btn-outline-primary'
                          }`}
                          onClick={() => onUpdateNodeStatus(node.id, status)}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === 'dashboard' ? (
          <section>
            <DashboardCards dashboard={dashboard} />
          </section>
        ) : null}
      </aside>
    </>
  )
}
