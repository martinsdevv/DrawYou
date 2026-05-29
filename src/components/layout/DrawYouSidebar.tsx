import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { DashboardCards } from '../dashboard/DashboardCards'
import type {
  DrawYouNode,
  DrawYouNodeKind,
  IDashboardDrawYou,
  IUpdateNodeDataPayload,
  NodeStatus,
} from '../../types/drawYou'

interface DrawYouSidebarProps {
  isOpen: boolean
  onClose: () => void
  nodes: DrawYouNode[]
  dashboard: IDashboardDrawYou
  onAddNode: (payload: { titulo: string; tipo: DrawYouNodeKind; status: NodeStatus }) => Promise<void>
  onUpdateNode: (nodeId: string, payload: IUpdateNodeDataPayload) => Promise<void>
  onUpdateNodeStatus: (nodeId: string, status: NodeStatus) => Promise<void>
  onRemoveNode: (nodeId: string) => Promise<void>
}

const defaultNodeKinds: DrawYouNodeKind[] = ['inicio', 'processo', 'decisao', 'fim']
const defaultStatusList: NodeStatus[] = ['pendente', 'ativo', 'concluido', 'erro']

export const DrawYouSidebar = ({
  isOpen,
  onClose,
  nodes,
  dashboard,
  onAddNode,
  onUpdateNode,
  onUpdateNodeStatus,
  onRemoveNode,
}: DrawYouSidebarProps) => {
  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState<DrawYouNodeKind>('processo')
  const [status, setStatus] = useState<NodeStatus>('pendente')
  const [newStatusOption, setNewStatusOption] = useState('')
  const [newTypeOption, setNewTypeOption] = useState('')
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [editTitulo, setEditTitulo] = useState('')
  const [editDescricao, setEditDescricao] = useState('')
  const [editTipo, setEditTipo] = useState<DrawYouNodeKind>('processo')
  const [editStatus, setEditStatus] = useState<NodeStatus>('pendente')

  const nodeKinds = useMemo(
    () => Array.from(new Set([...defaultNodeKinds, ...nodes.map((node) => node.data.tipo)])),
    [nodes],
  )
  const statusList = useMemo(
    () => Array.from(new Set([...defaultStatusList, ...nodes.map((node) => node.data.status)])),
    [nodes],
  )
  const [activeTab, setActiveTab] = useState<'acoes' | 'itens' | 'dashboard'>('acoes')

  const editingNode = nodes.find((node) => node.id === editingNodeId) ?? null

  useEffect(() => {
    if (!editingNode) {
      return
    }

    setEditTitulo(editingNode.data.titulo)
    setEditDescricao(editingNode.data.descricao ?? '')
    setEditTipo(editingNode.data.tipo)
    setEditStatus(editingNode.data.status)
  }, [editingNode])

  const handleAddNode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanTitle = titulo.trim()

    if (!cleanTitle) {
      return
    }

    void onAddNode({
      titulo: cleanTitle,
      tipo,
      status,
    }).then(() => {
      setTitulo('')
      setTipo('processo')
      setStatus('pendente')
    })
  }

  const handleEditNode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingNodeId) {
      return
    }

    const cleanTitle = editTitulo.trim()
    if (!cleanTitle) {
      return
    }

    void onUpdateNode(editingNodeId, {
      titulo: cleanTitle,
      descricao: editDescricao,
      tipo: editTipo,
      status: editStatus,
    }).then(() => {
      setEditingNodeId(null)
    })
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

            {editingNode ? (
              <form className="vstack gap-2 mb-3 p-2 border rounded" onSubmit={handleEditNode}>
                <h4 className="h6 mb-0">Editar no #{editingNode.id}</h4>
                <label className="form-label mb-0" htmlFor="edit-title">
                  Titulo
                </label>
                <input
                  id="edit-title"
                  className="form-control"
                  value={editTitulo}
                  onChange={(event) => setEditTitulo(event.target.value)}
                />
                <label className="form-label mb-0" htmlFor="edit-desc">
                  Descricao
                </label>
                <textarea
                  id="edit-desc"
                  className="form-control"
                  rows={2}
                  value={editDescricao}
                  onChange={(event) => setEditDescricao(event.target.value)}
                />
                <label className="form-label mb-0" htmlFor="edit-type">
                  Tipo
                </label>
                <select
                  id="edit-type"
                  className="form-select"
                  value={editTipo}
                  onChange={(event) => setEditTipo(event.target.value as DrawYouNodeKind)}
                >
                  {nodeKinds.map((nodeKind) => (
                    <option key={nodeKind} value={nodeKind}>
                      {nodeKind}
                    </option>
                  ))}
                </select>
                <label className="form-label mb-0" htmlFor="edit-status">
                  Status
                </label>
                <select
                  id="edit-status"
                  className="form-select"
                  value={editStatus}
                  onChange={(event) => setEditStatus(event.target.value as NodeStatus)}
                >
                  {statusList.map((statusOption) => (
                    <option key={statusOption} value={statusOption}>
                      {statusOption}
                    </option>
                  ))}
                </select>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-sm btn-primary">
                    Salvar
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setEditingNodeId(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : null}

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
                      <div className="d-flex gap-1 ms-auto">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setEditingNodeId(node.id)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger remove-icon-btn"
                          onClick={() => void onRemoveNode(node.id)}
                          aria-label="Remover no"
                          title="Remover no"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                    <div className="d-flex gap-1 flex-wrap mt-2">
                      {statusList.map((statusOption) => (
                        <button
                          key={statusOption}
                          type="button"
                          className={`btn btn-sm ${
                            node.data.status === statusOption
                              ? 'btn-primary'
                              : 'btn-outline-primary'
                          }`}
                          onClick={() => void onUpdateNodeStatus(node.id, statusOption)}
                        >
                          {statusOption}
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
