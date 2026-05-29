# Back-end Draw-you (Servlets + Hibernate)

API JSON para CRUD de nos do fluxograma (`no_fluxograma`).

## Requisitos

- Java 17+
- Maven 3.9+
- PostgreSQL com banco `draw_you` (ver `../database/`)

Tomcat **nao precisa** estar instalado: o Maven sobe um Tomcat 10 embutido (plugin Cargo).

## Configuracao do Hibernate

```bash
cp src/main/resources/hibernate.properties.example src/main/resources/hibernate.properties
```

Edite `hibernate.properties` com usuario e senha do Postgres.

## Build

```bash
cd backend
mvn clean package
```

Gera `target/draw-you-api.war`.

## Subir a API (sem instalar Tomcat)

Na pasta `backend`, com `hibernate.properties` configurado:

```bash
mvn clean package cargo:run
```

Na primeira vez o Maven baixa o Tomcat embutido (pode demorar um pouco).

- API: `http://localhost:8080/draw-you-api`
- Parar o servidor: `Ctrl+C`

Teste rapido (outro terminal):

```bash
curl http://localhost:8080/draw-you-api/api/nos
```

## Deploy manual no Tomcat (opcional)

Se preferir instalar Tomcat 10+ no sistema:

1. `mvn clean package`
2. Copie `target/draw-you-api.war` para `TOMCAT_HOME/webapps/`
3. Execute `TOMCAT_HOME/bin/startup.sh`
4. Mesma URL: `http://localhost:8080/draw-you-api`

Arch Linux: `sudo pacman -S tomcat10`

## Endpoints

| Metodo | URL | Acao |
|--------|-----|------|
| GET | `/api/nos` | Listar todos |
| GET | `/api/nos/{id}` | Buscar por id |
| POST | `/api/nos` | Cadastrar |
| PUT | `/api/nos/{id}` | Atualizar |
| DELETE | `/api/nos/{id}` | Excluir |
| GET | `/api/dashboard` | Contadores por status |

### Exemplo POST

```bash
curl -X POST http://localhost:8080/draw-you-api/api/nos \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Teste API","descricao":"via curl","tipo":"processo","status":"pendente","posicaoX":100,"posicaoY":200}'
```

### Exemplo listagem

```bash
curl http://localhost:8080/draw-you-api/api/nos
```

## CORS

O `CorsFilter` libera requisicoes de `http://localhost:5173` (Vite). Ajuste a constante `FRONTEND_ORIGIN` se usar outra porta.

## Estrutura de pacotes

```
com.drawyou
├── model      → entidade JPA/Hibernate
├── dao        → acesso ao banco
├── servlet    → endpoints HTTP
├── filter     → CORS
├── dto        → respostas auxiliares
└── util       → Hibernate, JSON
```
