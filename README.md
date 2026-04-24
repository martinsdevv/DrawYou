# Draw-you

Aplicacao web para criacao de fluxogramas interativos com drag and drop, conexoes entre nos, cards redimensionaveis e dashboard dinamico.

## Stack

- React + Vite + TypeScript
- React Flow (`@xyflow/react`) para canvas, drag e resize
- Bootstrap via CDN (em `index.html`)
- CSS externo para identidade visual (`src/styles/app.css`)

## Como executar

```bash
npm install
npm run dev
```

Para gerar build de producao:

```bash
npm run build
```

## Arquitetura e justificativa da divisao

A arquitetura foi separada por responsabilidade para facilitar manutencao, reuso e testes:

- `src/types`: contratos TypeScript do dominio (`IDrawYouNodeData`, `NodeStatus`, etc.)
- `src/hooks`: estado central e regras de negocio (`useDrawYouState`)
- `src/components/layout`: estrutura semantica da pagina (`header`, `main`, `aside`, `section`, `address`)
- `src/components/canvas`: integracao com React Flow e no custom redimensionavel
- `src/components/dashboard`: exibicao de metricas do estado em tempo real
- `src/data`: seed inicial tipada para subir a aplicacao com dados de exemplo
- `src/pages`: composicao da tela principal (`DrawYouPage`)

Essa divisao foi escolhida para:

1. manter a regra de negocio isolada da camada visual;
2. permitir que componentes sejam reutilizados sem acoplamento;
3. reforcar seguranca de dados por tipagem forte no estado e nas props.

## Requisitos da disciplina contemplados

- Componentizacao de interface em blocos menores
- Tipagem de props e estado com TypeScript
- Grid responsivo com Bootstrap (desktop assimetrico e mobile empilhado)
- Semantica HTML5 com `header`, `main`, `section`, `aside` e `address`
- Dashboard com contadores dinamicos atualizados em tempo real
- Mudanca visual de status ao interagir com itens do fluxo

## Estrutura de funcionalidades do MVP

- Criar e remover nos
- Arrastar nos com fluidez no canvas
- Redimensionar cards de no
- Conectar nos com arestas
- Alterar status (`pendente`, `ativo`, `concluido`, `erro`)
- Visualizar totais no dashboard

