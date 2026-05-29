package com.drawyou.servlet;

import com.drawyou.dao.NoFluxogramaDAO;
import com.drawyou.dto.DashboardDTO;
import com.drawyou.dto.ErroDTO;
import com.drawyou.util.JsonUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet(name = "DashboardServlet", urlPatterns = "/api/dashboard")
public class DashboardServlet extends HttpServlet {

    private final NoFluxogramaDAO dao = new NoFluxogramaDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            DashboardDTO dashboard = new DashboardDTO(
                    dao.contarTotal(),
                    dao.contarPorStatus("pendente"),
                    dao.contarPorStatus("ativo"),
                    dao.contarPorStatus("concluido"),
                    dao.contarPorStatus("erro")
            );
            JsonUtil.escreverJson(response, HttpServletResponse.SC_OK, dashboard);
        } catch (Exception exception) {
            JsonUtil.escreverJson(
                    response,
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    new ErroDTO("Erro ao carregar dashboard: " + exception.getMessage())
            );
        }
    }
}
