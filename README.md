# Draw-you

Editor web de fluxogramas com canvas interativo, CRUD de nós persistido em PostgreSQL e API Java consumida pelo front-end em React.

**Disciplina:** Desenvolvimento Web — Prof. Fernando

---

## Integrantes

- Gabriel Martins Torres - 20241012001820

---

## Tema

**Sistema de modelagem de fluxos (fluxogramas)** — cada etapa do processo é um **nó** (`NoFluxograma`) com título, tipo, status e posição no diagrama.

O domínio aparece no código e no banco: entidade `NoFluxograma`, tabela `no_fluxograma`, endpoints `/api/nos`.

---

## Sobre a aplicação

O Draw-you permite montar fluxogramas arrastando cards no canvas (React Flow), ligar etapas com setas e acompanhar o andamento por status (`pendente`, `ativo`, `concluido`, `erro`). O menu lateral concentra cadastro, listagem, edição e exclusão dos nós; o dashboard exibe totais vindos do back-end.

Os **nós** são gravados no PostgreSQL via API Java. As **conexões** entre nós (arestas do diagrama) ficam no navegador (`localStorage`), pois o foco da avaliação foi a tabela principal e o CRUD dela.

---

## Tecnologias

| Camada | Stack |
|--------|--------|
| Front-end | React 19, Vite, TypeScript, Bootstrap 5, React Flow |
| Back-end | Java 17, Servlets (Jakarta), Hibernate 6, Gson |
| Banco | PostgreSQL |
| Servidor | Tomcat 10 (embutido no desenvolvimento via Maven Cargo) |

---

## Estrutura do repositório

```
Draw-you/
├── database/          # Scripts SQL (schema e seed)
├── backend/           # API WAR (Servlets + Hibernate)
├── src/               # Aplicação React
├── public/
├── .env.example       # URL da API para o Vite
└── README.md
```

---

## Pré-requisitos

- Node.js 20+ e npm
- JDK 17 e Maven 3.9+
- PostgreSQL em execução na máquina local

---

## Banco de dados

**1.** Crie o banco:

```bash
psql -U postgres -d postgres -c "CREATE DATABASE draw_you WITH ENCODING 'UTF8';"
```

**2.** Crie a tabela e índices:

```bash
psql -U postgres -d draw_you -f database/schema.sql
```

**3.** (Opcional) Dados de exemplo para o primeiro acesso:

```bash
psql -U postgres -d draw_you -f database/seed.sql
```

A tabela `no_fluxograma` possui chave primária `id`, campos de negócio (`titulo`, `descricao`, `tipo`, `status`), coordenadas do canvas (`posicao_x`, `posicao_y`) e timestamps de auditoria.

---

## Back-end

**1.** Configure a conexão (arquivo local, não versionado):

```bash
cp backend/src/main/resources/hibernate.properties.example \
   backend/src/main/resources/hibernate.properties
```

Edite usuário e senha do Postgres em `hibernate.properties`.

**2.** Compile e suba a API (Tomcat embutido — não é necessário instalar Tomcat):

```bash
cd backend
mvn clean package cargo:run
```

Base da API: `http://localhost:8080/draw-you-api`

**3.** Teste rápido:

```bash
curl http://localhost:8080/draw-you-api/api/nos
curl http://localhost:8080/draw-you-api/api/dashboard
```

### Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/nos` | Lista todos os nós |
| GET | `/api/nos/{id}` | Busca um nó |
| POST | `/api/nos` | Cadastra |
| PUT | `/api/nos/{id}` | Atualiza |
| DELETE | `/api/nos/{id}` | Remove |
| GET | `/api/dashboard` | Totais por status |

### CORS

O React roda em outra origem (`http://localhost:5173`) e a API em `http://localhost:8080`. Sem CORS, o navegador bloqueia as requisições `fetch`.

O filtro `com.drawyou.filter.CorsFilter` libera a origem do Vite, os métodos HTTP usados no CRUD e o header `Content-Type`. Requisições `OPTIONS` (preflight) retornam 204 antes de chegar aos servlets.

---

## Front-end

**1.** Variável de ambiente:

```bash
cp .env.example .env
```

O padrão aponta para `http://localhost:8080/draw-you-api`. Reinicie o Vite se alterar o `.env`.

**2.** Instale dependências e execute:

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`. Mantenha o back-end rodando no outro terminal.

Build de produção:

```bash
npm run build
```

A comunicação com o Java está em `src/services/noFluxogramaApi.ts` (wrapper em cima de `fetch`).

---

## Arquitetura

```
┌─────────────┐     fetch (JSON)      ┌──────────────────┐
│  React/Vite │ ◄──────────────────► │ Servlets + Gson  │
│  :5173      │     CORS Filter       │  Tomcat :8080    │
└──────┬──────┘                       └────────┬─────────┘
       │ localStorage                         │ Hibernate
       │ (arestas do fluxo)                   ▼
       ▼                               ┌─────────────┐
  React Flow canvas                     │ PostgreSQL  │
                                        │  draw_you   │
                                        └─────────────┘
```

**Front-end:** componentes de layout e canvas; hook `useDrawYouState` orquestra estado do diagrama e chamadas à API; `flowMappers.ts` converte entre o formato do React Flow e o JSON do servidor.

**Back-end:** camadas separadas — `model` (entidade), `dao` (sessão Hibernate), `servlet` (HTTP/JSON), `filter` (CORS), `dto` e `util`.

---

## Capturas de tela

Inclua imagens na pasta `docs/prints/` (ou ajuste os caminhos abaixo) e referencie aqui:

| Tela | Arquivo |
|------|---------|
| Canvas com fluxograma | `docs/prints/canvas.png` |
| Menu lateral — cadastro | `docs/prints/cadastro.png` |
| Menu lateral — edição / lista | `docs/prints/listagem-edicao.png` |
| Dashboard | `docs/prints/dashboard.png` |
| Exemplo de requisição (DevTools ou curl) | `docs/prints/api.png` |

---

## Vídeo explicativo

Link (YouTube ou Drive): **_(preencher antes da entrega)_**

---
