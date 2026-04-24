import {
  Handle,
  NodeResizeControl,
  Position,
  ResizeControlVariant,
  type NodeProps,
} from '@xyflow/react'
import type { DrawYouNode as DrawYouNodeType, NodeStatus } from '../../types/drawYou'

const statusClassMap: Partial<Record<NodeStatus, string>> = {
  pendente: 'status-pendente',
  ativo: 'status-ativo',
  concluido: 'status-concluido',
  erro: 'status-erro',
}

export const DrawYouNode = ({ data, selected }: NodeProps<DrawYouNodeType>) => {
  const customNodeStyle = {
    backgroundColor: (data.nodeBgColor as string | undefined) ?? undefined,
    borderColor: (data.nodeBorderColor as string | undefined) ?? undefined,
    color: (data.nodeTextColor as string | undefined) ?? undefined,
    borderWidth: data.nodeBorderWidth ? `${data.nodeBorderWidth}px` : undefined,
  }

  return (
    <div className={`draw-you-node ${statusClassMap[data.status] ?? ''}`} style={customNodeStyle}>
      {selected ? (
        <>
          <NodeResizeControl
            position="top"
            minWidth={180}
            minHeight={100}
            maxWidth={560}
            maxHeight={420}
            autoScale={false}
            variant={ResizeControlVariant.Line}
            className="node-resizer-edge"
          />
          <NodeResizeControl
            position="right"
            minWidth={180}
            minHeight={100}
            maxWidth={560}
            maxHeight={420}
            autoScale={false}
            variant={ResizeControlVariant.Line}
            className="node-resizer-edge"
          />
          <NodeResizeControl
            position="bottom"
            minWidth={180}
            minHeight={100}
            maxWidth={560}
            maxHeight={420}
            autoScale={false}
            variant={ResizeControlVariant.Line}
            className="node-resizer-edge"
          />
          <NodeResizeControl
            position="left"
            minWidth={180}
            minHeight={100}
            maxWidth={560}
            maxHeight={420}
            autoScale={false}
            variant={ResizeControlVariant.Line}
            className="node-resizer-edge"
          />
          <NodeResizeControl
            position="top-left"
            minWidth={180}
            minHeight={100}
            maxWidth={560}
            maxHeight={420}
            autoScale={false}
            className="node-resizer-corner"
          />
          <NodeResizeControl
            position="top-right"
            minWidth={180}
            minHeight={100}
            maxWidth={560}
            maxHeight={420}
            autoScale={false}
            className="node-resizer-corner"
          />
          <NodeResizeControl
            position="bottom-left"
            minWidth={180}
            minHeight={100}
            maxWidth={560}
            maxHeight={420}
            autoScale={false}
            className="node-resizer-corner"
          />
          <NodeResizeControl
            position="bottom-right"
            minWidth={180}
            minHeight={100}
            maxWidth={560}
            maxHeight={420}
            autoScale={false}
            className="node-resizer-corner"
          />
        </>
      ) : null}
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        className="connection-handle connection-handle-left"
      />
      <Handle
        id="top"
        type="source"
        position={Position.Top}
        className="connection-handle connection-handle-top"
      />
      <header className="draw-you-node-header">
        <strong className="draw-you-node-title">{data.titulo}</strong>
        <span className="badge text-bg-light draw-you-node-type">{data.tipo}</span>
      </header>
      <div className="draw-you-node-content">
        {data.descricao ? <p className="mb-2 draw-you-node-description">{data.descricao}</p> : null}
      </div>
      <small className="text-uppercase fw-semibold draw-you-node-status">Status: {data.status}</small>
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className="connection-handle connection-handle-right"
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="connection-handle connection-handle-bottom"
      />
    </div>
  )
}
