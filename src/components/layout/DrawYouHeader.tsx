interface DrawYouHeaderProps {
  onToggleSidebar: () => void
}

export const DrawYouHeader = ({ onToggleSidebar }: DrawYouHeaderProps) => {
  return (
    <header className="app-header border-bottom">
      <div className="container-fluid py-3 px-3 px-lg-4 d-flex justify-content-between align-items-center gap-2">
        <div>
          <h1 className="h3 mb-1">Draw-you</h1>
          <p className="text-secondary mb-0">Fluxograma interativo.</p>
        </div>
        <button type="button" className="btn btn-outline-light" onClick={onToggleSidebar}>
          Menu
        </button>
      </div>
    </header>
  )
}
