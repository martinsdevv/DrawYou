package com.drawyou.dto;

public class DashboardDTO {

    private long totalNos;
    private long totalPendentes;
    private long totalAtivos;
    private long totalConcluidos;
    private long totalErros;

    public DashboardDTO() {
    }

    public DashboardDTO(
            long totalNos,
            long totalPendentes,
            long totalAtivos,
            long totalConcluidos,
            long totalErros
    ) {
        this.totalNos = totalNos;
        this.totalPendentes = totalPendentes;
        this.totalAtivos = totalAtivos;
        this.totalConcluidos = totalConcluidos;
        this.totalErros = totalErros;
    }

    public long getTotalNos() {
        return totalNos;
    }

    public void setTotalNos(long totalNos) {
        this.totalNos = totalNos;
    }

    public long getTotalPendentes() {
        return totalPendentes;
    }

    public void setTotalPendentes(long totalPendentes) {
        this.totalPendentes = totalPendentes;
    }

    public long getTotalAtivos() {
        return totalAtivos;
    }

    public void setTotalAtivos(long totalAtivos) {
        this.totalAtivos = totalAtivos;
    }

    public long getTotalConcluidos() {
        return totalConcluidos;
    }

    public void setTotalConcluidos(long totalConcluidos) {
        this.totalConcluidos = totalConcluidos;
    }

    public long getTotalErros() {
        return totalErros;
    }

    public void setTotalErros(long totalErros) {
        this.totalErros = totalErros;
    }
}
