# Escopo do Frontend

Criado em: 2026-05-30

Ultima reavaliacao: 2026-05-30, com backend rodando e Swagger em `http://localhost:8000/docs`.

## Contexto do Projeto

O frontend vai integrar a API local do projeto "Rede Hospitalar IoMT com SDN, NFV e API REST".

A aplicacao backend simula uma rede hospitalar com tres grupos:

| Grupo | Rede | Gateway | Sensores |
| --- | --- | --- | --- |
| `uti` | `10.0.1.0/24` | `gw-uti` | `sensor-uti-1`, `sensor-uti-2`, `sensor-uti-3` |
| `enfermaria` | `10.0.2.0/24` | `gw-enfermaria` | `sensor-enfermaria-1`, `sensor-enfermaria-2`, `sensor-enfermaria-3` |
| `triagem` | `10.0.3.0/24` | `gw-triagem` | `sensor-triagem-1`, `sensor-triagem-2`, `sensor-triagem-3` |

O servidor hospitalar central fica em `10.0.100.10:9000`, e a API FastAPI esta em `http://localhost:8000`.

A documentacao backend usada nesta reavaliacao esta em `../backend/atividad_6/README.md` e `../backend/atividad_6/docs/api.md`.

## Objetivo do Frontend

Criar uma interface operacional para diagnosticar a simulacao SDN/NFV:

- visualizar saude da API e do ambiente Docker;
- acompanhar status dos grupos, sensores, containers e gateways;
- monitorar metricas de trafego por grupo;
- monitorar metricas por sensor clinico e leituras recentes;
- consultar logs e dados de diagnostico dos gateways;
- executar politicas VNF expostas pela API;
- registrar estados vazios e erros operacionais de forma clara.

## Stack Definida

- Next.js com App Router;
- React 19;
- TypeScript 5.7+;
- Tailwind CSS 4;
- shadcn/ui como base de componentes;
- bloco `dashboard-01` do shadcn como template inicial;
- REUI como registro adicional de componentes personalizaveis;
- Base UI e Radix UI disponiveis para componentes REUI;
- Motion para componentes animados da REUI quando necessario;
- Recharts via componente `chart` do shadcn;
- TanStack Query para cache, polling e mutations da API;
- `openapi-typescript` para gerar tipos a partir do Swagger local.

Observacao: `pnpm` nao esta instalado neste ambiente; o scaffold inicial deve usar `npm`/`npx`, salvo instalacao posterior de outro package manager.

## Requisitos de UI

Base inicial:

```bash
npx shadcn@latest add dashboard-01
```

O bloco `dashboard-01` fornece a base de sidebar, header, cards, grafico e tabela. A tela sera adaptada para dados reais da rede hospitalar, sem landing page.

Registro REUI em `components.json`:

```json
{
  "style": "base-nova",
  "registries": {
    "@reui": "https://reui.io/r/{style}/{name}.json"
  }
}
```

Componentes REUI previstos:

- `data-grid` para tabelas de containers, gateways, politicas e diagnosticos;
- `filters` para filtros por grupo, status e container;
- `badge` e `alert` para estados operacionais;
- `frame` para paineis de diagnostico com acoes;
- `timeline` para historico de acoes/politicas, se houver dado suficiente no frontend.

## Integracao com a API

Base URL do backend:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```

OpenAPI:

```text
http://localhost:8000/openapi.json
```

### Decisao de Proxy

A API local respondeu sem header `Access-Control-Allow-Origin` quando chamada com `Origin: http://localhost:3000`. Para evitar erro de CORS no navegador, o frontend deve chamar um proxy interno do Next:

```text
/api/backend/[...path]
```

O proxy usa uma variavel server-side:

```env
API_BASE_URL=http://localhost:8000
```

O browser chama apenas a mesma origem do Next, por exemplo:

```text
GET /api/backend/health
POST /api/backend/policies/enfermaria/limit
```

## Contratos Principais

Tipos iniciais a gerar ou modelar:

- `CommandResult`;
- `GatewayPolicyStatus`;
- `GatewayStatus`;
- `GroupInfo`;
- `GroupMetrics`;
- `GroupRoutes`;
- `PolicyEndpoint`;
- `ReadingFieldStats`;
- `SensorMetrics`;
- `SensorMetricsCollection`;
- `TrafficMetrics`;
- erro FastAPI `{ detail: string | ValidationError[] }`.

Endpoints usados no MVP:

| Area | Endpoint |
| --- | --- |
| Sistema | `GET /health`, `GET /status`, `GET /containers` |
| Grupos | `GET /groups`, `GET /groups/{group}` |
| Gateways | `GET /gateways`, `GET /groups/{group}/gateway/*` |
| Metricas | `GET /metrics/traffic`, `GET /groups/{group}/metrics` |
| Sensores | `GET /sensors`, `GET /sensors/metrics`, `GET /groups/{group}/sensors/metrics`, `GET /groups/{group}/sensors/{sensor}/metrics` |
| Logs | `GET /logs/{container_name}`, `GET /groups/{group}/logs` |
| Rotas | `GET /groups/{group}/routes` |
| Politicas | `GET /policies`, `POST /policies/*` |

## Observacoes Reais do Ambiente

Estado observado na reavaliacao de 2026-05-30:

- `GET /health` retornou `status=ok` e `docker=ok`;
- `GET /status` retornou `total_containers=15`, `running=15` e todos os servicos como `running`;
- `GET /containers` retornou os 15 containers esperados;
- `GET /groups` retornou os tres grupos esperados com gateway e containers de sensores;
- `GET /gateways` retornou gateways `running=true`;
- `GET /policies` retornou cinco acoes: limitar/restaurar enfermaria, bloquear/desbloquear triagem e restaurar tudo;
- `GET /metrics/traffic?tail=1000` retornou metricas agregadas para `uti`, `enfermaria` e `triagem`;
- `GET /groups/{group}/metrics?tail=1000` retornou metricas por grupo para os tres grupos;
- `GET /sensors/metrics?tail=1000` retornou metricas por sensor clinico, agrupadas por grupo;
- `GET /groups/{group}/sensors/metrics?tail=1000` retornou os sensores clinicos de cada grupo;
- `GET /groups/{group}/sensors/{sensor}/metrics?tail=1000` funcionou com nomes de sensores vindos dos logs, como `sensor-cardiaco`, `sensor-pressao`, `sensor-glicemia` e `monitor-portatil`;
- `GET /groups/uti/sensors/sensor-uti-1/metrics?tail=1000` retornou `404`, porque `sensor-uti-1` e similares sao containers, nao nomes de sensores clinicos nos logs;
- `GET /groups/{group}/sensors` retornou `500` nos tres grupos. Causa observada no log do container `dashboard`: `ResponseValidationError`, pois a rota declara `dict[str, list[str]]` mas retorna tambem a chave `group` com string. Ate corrigir o backend, o frontend deve preferir `GET /groups` ou `GET /sensors` para inventario de containers de sensores;
- `GET /groups/uti/logs?tail=10` e `GET /logs/server?tail=10` retornaram logs recentes;
- chamada com `Origin: http://localhost:3000` nao retornou `Access-Control-Allow-Origin`, e `OPTIONS /status` retornou `405`. O proxy interno do Next continua necessario.

Nao foram executados `POST` de politicas durante esta reavaliacao para nao alterar o estado atual da simulacao.

## Modelo de Dados de Sensores

Ha duas nomenclaturas diferentes que o frontend precisa separar:

| Tipo | Origem | Exemplo | Uso no frontend |
| --- | --- | --- | --- |
| Container de sensor | `GET /groups`, `GET /sensors`, rotas | `sensor-uti-1` | topologia, containers e rotas |
| Sensor clinico | logs e metricas | `sensor-cardiaco`, `sensor-oxigenacao`, `monitor-portatil` | graficos, leituras e alertas |

Os sensores clinicos possuem:

- volume: `messages`, `bytes`, `messages_per_second`, `throughput_bps`;
- qualidade: `avg_delay_ms`, `min_delay_ms`, `max_delay_ms`, `jitter_ms`, `packet_loss_percent`;
- sequenciamento: `expected_messages`, `missing_messages`, `last_sequence`;
- periodo: `first_seen`, `last_seen`;
- leitura recente: `last_reading`;
- estatisticas por campo: `reading_stats`.

## Telas do MVP

### 1. Dashboard

Rota: `/dashboard`

Conteudo:

- cards de saude geral: API, Docker, containers running, grupos ativos;
- cards por grupo com gateway, sensores e politicas ativas;
- grafico de mensagens, throughput, delay, jitter e perda por grupo;
- resumo dos sensores clinicos mais recentes por grupo;
- tabela resumida de gateways;
- estado vazio quando ainda nao houver metricas ou quando a API estiver offline.

### 2. Sensores

Rotas:

- `/sensores`
- `/sensores/[group]/[sensor]`

Conteudo:

- grid por grupo com sensores clinicos vindos de `GET /sensors/metrics`;
- cards de leitura recente (`last_reading`);
- estatisticas por campo medico (`reading_stats`);
- taxa de mensagens, vazao, delay, jitter e perda;
- detalhe de sensor usando `GET /groups/{group}/sensors/{sensor}/metrics`;
- destaque visual para perda, jitter elevado ou ausencia de dados.

### 3. Grupos

Rotas:

- `/grupos`
- `/grupos/[group]`

Conteudo:

- lista dos grupos hospitalares;
- containers de sensores por grupo;
- sensores clinicos por grupo;
- gateway associado;
- metricas por grupo;
- logs filtrados por grupo;
- rotas do gateway e sensores.

### 4. Gateways

Rota: `/gateways`

Conteudo:

- status Docker;
- `ip_forward`;
- interfaces;
- regras `iptables`;
- regras `tc`;
- politicas ativas;
- visualizacao de saidas em blocos monoespacados.

### 5. Politicas

Rota: `/politicas`

Conteudo:

- lista dinamica vinda de `GET /policies`;
- botoes para executar apenas acoes disponiveis;
- confirmacao visual do `CommandResult`;
- refresh automatico de `GET /gateways` apos a execucao;
- estado de erro quando `exit_code !== 0` ou quando a API retornar erro HTTP.

### 6. Logs

Rota: `/logs`

Conteudo:

- seletor de container;
- seletor de grupo;
- controle de `tail`;
- visualizacao de logs com busca local;
- estado vazio para logs ainda nao gerados.

### 7. Diagnostico

Rota: `/diagnostico`

Conteudo:

- containers do projeto;
- rotas por grupo;
- comandos executados;
- saidas de diagnostico dos gateways;
- link externo para Swagger em `http://localhost:8000/docs`.

## Estrutura de Pastas Planejada

```text
src/
  app/
    api/
      backend/
        [...path]/
          route.ts
    (dashboard)/
      layout.tsx
      dashboard/
        page.tsx
      sensores/
        page.tsx
        [group]/
          [sensor]/
            page.tsx
      grupos/
        page.tsx
        [group]/
          page.tsx
      gateways/
        page.tsx
      politicas/
        page.tsx
      logs/
        page.tsx
      diagnostico/
        page.tsx
    page.tsx
    layout.tsx
    globals.css
  components/
    dashboard/
    sensors/
    groups/
    gateways/
    policies/
    logs/
    shell/
    ui/
  config/
    groups.ts
    navigation.ts
  hooks/
    use-polling-interval.ts
  lib/
    api/
      client.ts
      errors.ts
      generated.ts
      types.ts
    utils.ts
```

## Variaveis de Ambiente

Arquivo planejado: `.env.example`

```env
API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=SDN NFV IoMT Dashboard
```

`API_BASE_URL` fica server-side porque o browser deve usar o proxy do Next.

## Etapas de Execucao

1. Scaffold Next.js + TypeScript + Tailwind 4.
2. Inicializar shadcn/ui usando npm/npx.
3. Adicionar `dashboard-01` e validar build inicial.
4. Configurar REUI no `components.json` com estilo `base-nova`.
5. Adicionar dependencias de REUI: Base UI, Radix UI, Motion e tokens de estilo.
6. Criar proxy `/api/backend/[...path]` antes de qualquer chamada no browser.
7. Gerar tipos do OpenAPI local, incluindo `SensorMetrics` e `SensorMetricsCollection`.
8. Criar cliente da API e normalizacao de erros.
9. Implementar o shell do `dashboard-01` com navegacao real.
10. Implementar Dashboard com `/health`, `/status`, `/containers`, `/gateways`, `/metrics/traffic` e `/sensors/metrics`.
11. Implementar Sensores como segunda area do MVP, usando nomes clinicos retornados por `/sensors/metrics`.
12. Implementar Grupos usando `GET /groups`, `GET /sensors`, metricas por grupo, rotas e logs. Evitar `GET /groups/{group}/sensors` ate a correcao do backend.
13. Implementar Gateways, Politicas, Logs e Diagnostico.
14. Validar estados vazios, API offline, metricas ausentes, sensor inexistente e erros de politica.
15. Rodar `npm run lint` e `npm run build`.
16. Subir dev server e testar fluxo com o backend em `localhost:8000`.

## Pendencias do Backend que Afetam o Frontend

- Corrigir `GET /groups/{group}/sensors` para retornar apenas `{"sensors": [...]}` ou ajustar o schema para permitir `{"group": string, "sensors": string[]}`.
- Decidir se o backend tera CORS habilitado para `http://localhost:3000`. Sem isso, manter o proxy do Next.
- Manter clara a diferenca entre containers de sensores (`sensor-uti-1`) e sensores clinicos (`sensor-cardiaco`), pois os endpoints de metricas por sensor aceitam os nomes clinicos.

## Criterios de Pronto

- app Next roda localmente;
- dashboard abre sem erro quando a API esta online;
- dashboard mostra estado claro quando a API esta offline;
- metricas ausentes ou sensores inexistentes nao quebram a pagina;
- dashboard apresenta metricas agregadas por grupo;
- tela de sensores apresenta leituras recentes e estatisticas por campo clinico;
- politicas podem ser executadas pela tela e exibem retorno operacional;
- dados principais batem com o Swagger/OpenAPI;
- `npm run build` passa;
- README do frontend documenta instalacao, env e execucao local.
