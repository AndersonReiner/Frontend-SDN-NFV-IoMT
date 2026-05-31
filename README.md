# Frontend SDN/NFV IoMT

Aplicacao web para operacao e observabilidade da simulacao hospitalar IoMT com SDN e NFV. O projeto consome a API backend da atividade e apresenta visoes de rede, sensores, gateways, politicas e diagnostico operacional em uma interface unica.

## Objetivo da aplicacao

O frontend foi estruturado para acompanhar o estado da simulacao em tempo real e expor os principais fluxos operacionais:

- saude geral do ambiente
- trafego e metricas por grupo hospitalar
- leituras e historico de sensores clinicos
- estado dos gateways VNF
- execucao de politicas de rede
- diagnostico de containers, rotas e logs

## Stack

- Next.js 16 com App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Base UI
- REUI Data Grid
- Recharts
- TanStack Query

## Arquitetura

O projeto segue uma separacao simples entre rotas, componentes de interface e camada de acesso ao backend:

- `src/app`: rotas, layouts e handlers HTTP do App Router
- `src/components`: blocos visuais reutilizaveis por dominio
- `src/lib`: integracoes, tipos e utilitarios
- `src/config`: metadados de grupos e configuracoes de exibicao
- `public`: ativos estaticos

### Fluxo de dados

1. O backend da simulacao responde em `API_BASE_URL`.
2. O frontend usa `src/app/api/backend/[...path]/route.ts` como proxy interno.
3. A camada `src/lib/api` centraliza tipos e chamadas server-side.
4. As paginas do dashboard consomem esses dados e distribuem para cards, tabelas e graficos.

Essa abordagem reduz acoplamento direto entre as telas e a API, facilita evolucao da tipagem e evita expor a aplicacao a problemas locais de CORS durante o desenvolvimento.

## Estrutura funcional

As principais areas da aplicacao sao:

- `/dashboard`: visao executiva com indicadores agregados e monitoramento geral
- `/sensores`: leitura recente, metricas e detalhe por sensor
- `/grupos`: consolidado por grupo hospitalar e paginas detalhadas
- `/gateways`: estado dos gateways e acoes operacionais
- `/politicas`: acionamento das politicas disponiveis no backend
- `/logs`: acompanhamento de eventos e saidas operacionais
- `/diagnostico`: inventario tecnico do ambiente monitorado

## Estrutura de pastas

```text
src/
  app/
    (dashboard)/
    api/backend/[...path]/
  components/
    dashboard/
    gateways/
    logs/
    policies/
    sensors/
    shared/
    ui/
  config/
  hooks/
  lib/
    api/
```

## Configuracao local

Crie um arquivo `.env.local` na raiz do projeto com as variaveis abaixo:

```env
API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=SDN NFV IoMT Dashboard
```

## Execucao

Instalacao:

```bash
npm install
```

Desenvolvimento:

```bash
npm run dev
```

Aplicacao local:

```text
http://localhost:3000
```

## Validacao

```bash
npm run lint
npm run build
```

## Backend esperado

Por padrao, o frontend espera o backend em:

```text
http://localhost:8000
```

Documentacao da API:

```text
http://localhost:8000/docs
```

## Documentacao adicional

- [Aplicacao](./docs/aplicacao.md)
- [Arquitetura](./docs/arquitetura.md)
- [Rotas e contratos](./docs/rotas-e-contratos.md)
