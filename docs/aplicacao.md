# Aplicacao Frontend SDN/NFV IoMT

## Visao geral

Esta aplicacao oferece uma camada web de operacao para a simulacao hospitalar IoMT com SDN/NFV. O frontend centraliza observabilidade, diagnostico e execucao de politicas de rede em uma interface unica, consumindo a API FastAPI do backend da atividade.

## Objetivos

- acompanhar a saude geral da simulacao;
- consolidar metricas de trafego por grupo hospitalar;
- exibir leituras e historico recente dos sensores clinicos;
- expor o estado operacional dos gateways VNF;
- permitir execucao assistida de politicas fixas e parametrizadas;
- facilitar diagnostico com logs, comandos e inventario de containers.

## Stack

- Next.js 16 com App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Base UI
- REUI Data Grid
- Recharts

## Dependencias externas

O frontend depende de uma API backend disponivel em `API_BASE_URL`, com valor padrao `http://localhost:8000`.

Principais recursos esperados:

- `GET /health`
- `GET /status`
- `GET /containers`
- `GET /gateways`
- `GET /metrics/traffic`
- `GET /sensors/metrics`
- `GET /timeseries/*`
- `GET /policies`
- `GET /openapi.json`
- endpoints operacionais em `/policies/{group}/*`

## Execucao local

Crie `.env.local`:

```env
API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=SDN NFV IoMT Dashboard
```

Instalacao e execucao:

```bash
npm install
npm run dev
```

Aplicacao:

```text
http://localhost:3000
```

## Estrutura principal

```text
src/
  app/
    (dashboard)/        rotas principais e layouts operacionais
    api/backend/        proxy interno para o backend
  components/
    dashboard/          visualizacoes e paineis do dashboard
    gateways/           componentes de diagnostico dos gateways
    logs/               renderizacao de blocos de log
    policies/           execucao e configuracao de politicas
    sensors/            tabelas e cards de metricas dos sensores
    shared/             blocos compartilhados entre telas
    ui/                 componentes base do design system
  config/               metadados fixos dos grupos hospitalares
  hooks/                hooks utilitarios
  lib/
    api/                contratos e acesso ao backend
    format.ts           formatadores para exibicao
    utils.ts            utilitarios compartilhados
```

## Modelo arquitetural

### 1. Camada de roteamento

As telas vivem em `src/app/(dashboard)`. Cada rota monta a pagina usando Server Components, `Suspense` e chamadas server-side ao backend.

### 2. Camada de integracao

`src/lib/api/server.ts` centraliza a leitura de `API_BASE_URL`, o fetch server-side e a normalizacao de erros. Isso evita duplicacao de logica nas paginas.

### 3. Proxy HTTP interno

`src/app/api/backend/[...path]/route.ts` atua como proxy para chamadas client-side. Esse caminho e usado principalmente em acoes interativas, como execucao de politicas, reduzindo atrito com CORS em ambiente local.

### 4. Componentizacao por dominio

Os componentes foram organizados por contexto funcional:

- dashboard: graficos e consolidacoes operacionais;
- sensors: exibicao e navegacao das metricas dos sensores;
- policies: descoberta e execucao de politicas do backend;
- gateways: estado dos gateways e saida de comandos;
- shared: blocos neutros reutilizados entre paginas.

## Padrao de carregamento de dados

O fluxo predominante da aplicacao segue este padrao:

1. a pagina server-side chama `apiGet<T>()`;
2. o retorno chega como `ApiResult<T>`;
3. a tela usa `dataOr()` para aplicar fallback seguro;
4. falhas sao exibidas com `ApiNotice`;
5. os dados prontos alimentam cards, tabelas e graficos.

Esse padrao torna o frontend resiliente quando um endpoint do backend esta indisponivel, sem interromper o restante da tela.

## Rotas funcionais

- `/dashboard`: visao executiva da simulacao e monitoramento agregado
- `/sensores`: grade consolidada de sensores e metricas recentes
- `/sensores/[group]/[sensor]`: detalhe operacional de um sensor
- `/grupos`: resumo por grupo hospitalar
- `/grupos/[group]`: diagnostico detalhado de um grupo
- `/gateways`: status e sinais operacionais dos gateways
- `/politicas`: operacao das politicas de rede
- `/logs`: inspeção textual de logs do ambiente
- `/diagnostico`: inventario tecnico do compose e das rotas

## Estrategia de atualizacao

O dashboard principal usa `DashboardAutoRefresh` para disparar `router.refresh()` em intervalos regulares quando a aba esta visivel. Isso mantem a leitura server-side atualizada sem forcar polling em todos os componentes client-side.

## Estrategia de visualizacao

- cards resumem saude e capacidade;
- data grids organizam entidades operacionais em listas navegaveis;
- graficos de serie temporal mostram tendencia recente;
- graficos radiais com normalizacao comparam metricas heterogeneas por grupo;
- drawers e tabs organizam configuracoes de politicas sem sobrecarregar a pagina.

## Decisoes de manutencao

- concentrar tipos do backend em `src/lib/api/types.ts`;
- evitar fetch direto em componentes client-side quando o dado e apenas de leitura;
- manter componentes de UI base em `src/components/ui` sem adicionar regras de dominio;
- usar `src/components/shared` para estados de erro, esqueleto e metricas comuns;
- documentar logica de agregacao onde houver normalizacao, derivacao ou interpretacao semantica dos dados.
