# Frontend SDN/NFV IoMT

Aplicacao Next.js para integrar a API FastAPI da simulacao "Rede Hospitalar IoMT com SDN, NFV e API REST".

## Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui com template `dashboard-01`
- REUI com registro `@reui` e componentes `data-grid`
- Base UI
- Recharts
- TanStack Query

## Backend Esperado

A API deve estar rodando em:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```

O frontend usa um proxy interno em `/api/backend/[...path]`, porque a API local nao libera CORS para `http://localhost:3000`.

## Configuracao

Crie o `.env.local` a partir do exemplo:

```bash
cp .env.example .env.local
```

Variaveis:

```env
API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=SDN NFV IoMT Dashboard
```

## Executar

Instalar dependencias:

```bash
npm install
```

Rodar em desenvolvimento:

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

## Validacao

```bash
npm run lint
npm run build
```

## Rotas

- `/dashboard`: saude geral, containers, gateways, metricas agregadas e sensores clinicos.
- `/sensores`: leituras recentes e metricas por sensor clinico.
- `/sensores/[group]/[sensor]`: detalhe de sensor clinico.
- `/grupos`: grupos hospitalares e sensores associados.
- `/grupos/[group]`: metricas, rotas e logs do grupo.
- `/gateways`: status e diagnostico dos gateways VNF.
- `/politicas`: execucao das politicas VNF disponiveis no backend.
- `/logs`: logs gerais e logs filtrados por grupo.
- `/diagnostico`: inventario de containers e rotas.

## Documentacao do Planejamento

O escopo e replanejamento ficam em:

```text
docs/escopo-frontend.md
```

O README original do backend foi preservado como snapshot em:

```text
docs/backend-readme-snapshot.md
```
