DROP TABLE IF EXISTS no_fluxograma;

CREATE TABLE no_fluxograma (
    id          BIGSERIAL       PRIMARY KEY,
    titulo      VARCHAR(150)    NOT NULL,
    descricao   TEXT,
    tipo        VARCHAR(30)     NOT NULL,
    status      VARCHAR(30)     NOT NULL,
    posicao_x   DOUBLE PRECISION NOT NULL DEFAULT 0,
    posicao_y   DOUBLE PRECISION NOT NULL DEFAULT 0,
    criado_em   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_no_fluxograma_status ON no_fluxograma (status);
CREATE INDEX idx_no_fluxograma_tipo ON no_fluxograma (tipo);

COMMENT ON TABLE no_fluxograma IS 'Nós (etapas) de um fluxograma no Draw-you';
COMMENT ON COLUMN no_fluxograma.titulo IS 'Nome exibido no card do nó';
COMMENT ON COLUMN no_fluxograma.tipo IS 'inicio | processo | decisao | fim';
COMMENT ON COLUMN no_fluxograma.status IS 'pendente | ativo | concluido | erro';
COMMENT ON COLUMN no_fluxograma.posicao_x IS 'Posição horizontal no canvas (React Flow)';
COMMENT ON COLUMN no_fluxograma.posicao_y IS 'Posição vertical no canvas (React Flow)';
