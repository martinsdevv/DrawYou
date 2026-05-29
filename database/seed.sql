TRUNCATE TABLE no_fluxograma RESTART IDENTITY;

INSERT INTO no_fluxograma (titulo, descricao, tipo, status, posicao_x, posicao_y) VALUES
    ('Inicio do Fluxo', 'Ponto de entrada do processo.', 'inicio', 'ativo', 90, 120),
    ('Validar Informacoes', 'Conferencia dos dados enviados.', 'processo', 'pendente', 420, 120),
    ('Decidir Aprovacao', 'Analise para aprovar ou rejeitar a solicitacao.', 'decisao', 'pendente', 740, 120),
    ('Aprovado', 'Fluxo segue para implementacao.', 'processo', 'pendente', 1080, 40),
    ('Ajustar Solicitacao', 'Retornar para correcao de dados.', 'processo', 'pendente', 1080, 210),
    ('Finalizar', 'Encerramento do fluxo.', 'fim', 'pendente', 1410, 120);
