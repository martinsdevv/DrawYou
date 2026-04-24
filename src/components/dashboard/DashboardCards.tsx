import type { IDashboardDrawYou } from '../../types/drawYou'

interface DashboardCardsProps {
  dashboard: IDashboardDrawYou
}

export const DashboardCards = ({ dashboard }: DashboardCardsProps) => {
  return (
    <section className="dashboard-wrapper mb-4" aria-label="Resumo do dashboard">
      <h2 className="h5 mb-3">Dashboard</h2>
      <div className="row g-2">
        <div className="col-6">
          <article className="dashboard-card">
            <span>Total de nos</span>
            <strong>{dashboard.totalNos}</strong>
          </article>
        </div>
        <div className="col-6">
          <article className="dashboard-card">
            <span>Total de conexoes</span>
            <strong>{dashboard.totalConexoes}</strong>
          </article>
        </div>
        <div className="col-6">
          <article className="dashboard-card">
            <span>Pendentes</span>
            <strong>{dashboard.totalPendentes}</strong>
          </article>
        </div>
        <div className="col-6">
          <article className="dashboard-card">
            <span>Ativos</span>
            <strong>{dashboard.totalAtivos}</strong>
          </article>
        </div>
        <div className="col-6">
          <article className="dashboard-card">
            <span>Concluidos</span>
            <strong>{dashboard.totalConcluidos}</strong>
          </article>
        </div>
        <div className="col-6">
          <article className="dashboard-card">
            <span>Com erro</span>
            <strong>{dashboard.totalErros}</strong>
          </article>
        </div>
      </div>
    </section>
  )
}
