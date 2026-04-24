import { useState } from 'react'

interface FloatingActionsProps {
  isDashboardOpen: boolean
  onCreateNode: () => void
  onToggleSidebar: () => void
  onToggleDashboard: () => void
}

export const FloatingActions = ({
  isDashboardOpen,
  onCreateNode,
  onToggleSidebar,
  onToggleDashboard,
}: FloatingActionsProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={`floating-actions ${isExpanded ? 'expanded' : ''}`}>
      <button
        type="button"
        className="floating-btn floating-primary"
        onClick={() => setIsExpanded((current) => !current)}
      >
        Acoes
      </button>

      <button type="button" className="floating-btn floating-option option-1" onClick={onCreateNode}>
        Criar no
      </button>
      <button
        type="button"
        className="floating-btn floating-option option-2"
        onClick={onToggleSidebar}
      >
        Menu
      </button>
      <button
        type="button"
        className="floating-btn floating-option option-3"
        onClick={onToggleDashboard}
      >
        {isDashboardOpen ? 'Ocultar dados' : 'Dashboard'}
      </button>
    </div>
  )
}
