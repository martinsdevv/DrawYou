package com.drawyou.servlet;

import com.drawyou.dao.NoFluxogramaDAO;
import com.drawyou.dto.ErroDTO;
import com.drawyou.model.NoFluxograma;
import com.drawyou.util.JsonUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.stream.Collectors;

@WebServlet(name = "NoFluxogramaServlet", urlPatterns = "/api/nos/*")
public class NoFluxogramaServlet extends HttpServlet {

    private final NoFluxogramaDAO dao = new NoFluxogramaDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            Long id = extrairId(request);

            if (id == null) {
                JsonUtil.escreverJson(response, HttpServletResponse.SC_OK, dao.listarTodos());
                return;
            }

            var no = dao.buscarPorId(id);
            if (no.isEmpty()) {
                JsonUtil.escreverJson(
                        response,
                        HttpServletResponse.SC_NOT_FOUND,
                        new ErroDTO("No nao encontrado.")
                );
                return;
            }

            JsonUtil.escreverJson(response, HttpServletResponse.SC_OK, no.get());
        } catch (IllegalArgumentException exception) {
            JsonUtil.escreverJson(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    new ErroDTO(exception.getMessage())
            );
        } catch (Exception exception) {
            JsonUtil.escreverJson(
                    response,
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    new ErroDTO("Erro ao listar nos: " + exception.getMessage())
            );
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            NoFluxograma payload = JsonUtil.lerJson(lerCorpo(request), NoFluxograma.class);
            validarCamposObrigatorios(payload);

            if (payload.getPosicaoX() == null) {
                payload.setPosicaoX(0.0);
            }
            if (payload.getPosicaoY() == null) {
                payload.setPosicaoY(0.0);
            }

            NoFluxograma criado = dao.salvar(payload);
            JsonUtil.escreverJson(response, HttpServletResponse.SC_CREATED, criado);
        } catch (IllegalArgumentException exception) {
            JsonUtil.escreverJson(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    new ErroDTO(exception.getMessage())
            );
        } catch (Exception exception) {
            JsonUtil.escreverJson(
                    response,
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    new ErroDTO("Erro ao cadastrar no: " + exception.getMessage())
            );
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            Long id = extrairId(request);
            if (id == null) {
                JsonUtil.escreverJson(
                        response,
                        HttpServletResponse.SC_BAD_REQUEST,
                        new ErroDTO("Informe o id na URL para atualizar.")
                );
                return;
            }

            NoFluxograma existente = dao.buscarPorId(id).orElse(null);
            if (existente == null) {
                JsonUtil.escreverJson(
                        response,
                        HttpServletResponse.SC_NOT_FOUND,
                        new ErroDTO("No nao encontrado.")
                );
                return;
            }

            NoFluxograma payload = JsonUtil.lerJson(lerCorpo(request), NoFluxograma.class);
            validarCamposObrigatorios(payload);

            existente.setTitulo(payload.getTitulo());
            existente.setDescricao(payload.getDescricao());
            existente.setTipo(payload.getTipo());
            existente.setStatus(payload.getStatus());

            if (payload.getPosicaoX() != null) {
                existente.setPosicaoX(payload.getPosicaoX());
            }
            if (payload.getPosicaoY() != null) {
                existente.setPosicaoY(payload.getPosicaoY());
            }

            NoFluxograma atualizado = dao.atualizar(existente);
            JsonUtil.escreverJson(response, HttpServletResponse.SC_OK, atualizado);
        } catch (IllegalArgumentException exception) {
            JsonUtil.escreverJson(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    new ErroDTO(exception.getMessage())
            );
        } catch (Exception exception) {
            JsonUtil.escreverJson(
                    response,
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    new ErroDTO("Erro ao atualizar no: " + exception.getMessage())
            );
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            Long id = extrairId(request);
            if (id == null) {
                JsonUtil.escreverJson(
                        response,
                        HttpServletResponse.SC_BAD_REQUEST,
                        new ErroDTO("Informe o id na URL para excluir.")
                );
                return;
            }

            boolean removido = dao.excluir(id);
            if (!removido) {
                JsonUtil.escreverJson(
                        response,
                        HttpServletResponse.SC_NOT_FOUND,
                        new ErroDTO("No nao encontrado.")
                );
                return;
            }

            response.setStatus(HttpServletResponse.SC_NO_CONTENT);
        } catch (Exception exception) {
            JsonUtil.escreverJson(
                    response,
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    new ErroDTO("Erro ao excluir no: " + exception.getMessage())
            );
        }
    }

    private Long extrairId(HttpServletRequest request) {
        String pathInfo = request.getPathInfo();
        if (pathInfo == null || pathInfo.equals("/")) {
            return null;
        }

        String idTexto = pathInfo.replace("/", "");
        if (idTexto.isBlank()) {
            return null;
        }

        try {
            return Long.parseLong(idTexto);
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("Id invalido na URL.");
        }
    }

    private String lerCorpo(HttpServletRequest request) throws IOException {
        return request.getReader()
                .lines()
                .collect(Collectors.joining())
                .trim();
    }

    private void validarCamposObrigatorios(NoFluxograma no) {
        if (no == null) {
            throw new IllegalArgumentException("Corpo da requisicao ausente.");
        }
        if (no.getTitulo() == null || no.getTitulo().isBlank()) {
            throw new IllegalArgumentException("Campo titulo e obrigatorio.");
        }
        if (no.getTipo() == null || no.getTipo().isBlank()) {
            throw new IllegalArgumentException("Campo tipo e obrigatorio.");
        }
        if (no.getStatus() == null || no.getStatus().isBlank()) {
            throw new IllegalArgumentException("Campo status e obrigatorio.");
        }
    }
}
