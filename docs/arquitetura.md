# Arquitetura e Fluxos

## Fluxo HTTP

### Leitura server-side

Rotas em `src/app/(dashboard)` fazem chamadas diretas ao backend por meio de `apiGet()`. Esse fluxo e o caminho padrao para:

- metricas do dashboard;
- status de gateways;
- logs e diagnosticos;
- snapshots de series temporais;
- metadados OpenAPI usados para montar politicas dinamicas.

### Acao client-side

Acoes disparadas pelo usuario, como aplicacao de politicas, passam pelo proxy:

```text
Browser -> /api/backend/[...path] -> FastAPI backend
```

Isso preserva a mesma origem no frontend e simplifica o desenvolvimento local.

## Organizacao das rotas

### `src/app/layout.tsx`

Layout raiz responsavel por:

- carregar fontes locais;
- registrar `ThemeProvider`;
- disponibilizar `TooltipProvider`;
- montar o `Toaster` global.

### `src/app/(dashboard)/layout.tsx`

Layout operacional responsavel por:

- montar a sidebar da aplicacao;
- renderizar o cabecalho comum;
- aplicar `Suspense` para carregamento da navegacao;
- definir a area principal das paginas do dashboard.

## Modulos principais

### `src/lib/api`

- `types.ts`: contratos TypeScript do backend;
- `server.ts`: fetch server-side, parsing de erro e fallbacks.

### `src/components/dashboard`

Concentra transformacoes de metricas em visualizacoes. Esse modulo tem mais responsabilidade semantica que os componentes de UI base, porque converte dados brutos em comparacoes operacionais.

### `src/components/policies`

Agrupa a descoberta de rotas dinamicas de politicas, formularios de configuracao e disparo de comandos operacionais.

### `src/components/reui` e `src/components/ui`

Camada de primitives e widgets reutilizaveis. Em regra, esses componentes nao devem conhecer o dominio da simulacao.

## Fluxo da tela de politicas

1. `GET /policies` carrega acoes fixas expostas pelo backend.
2. `GET /openapi.json` revela quais rotas parametrizadas estao disponiveis.
3. `buildPolicyFamilies()` converte o contrato OpenAPI em familias operacionais por grupo.
4. `PolicyActions` mistura essas familias com o estado atual dos gateways.
5. O usuario configura a rota e a execucao segue pelo proxy `/api/backend`.
6. `router.refresh()` atualiza a tela apos sucesso.

## Fluxo do dashboard de monitoramento

1. `GET /timeseries/stats` informa janela e disponibilidade da base local.
2. A partir de `last_capture`, a tela calcula a janela recente.
3. Series de delay, throughput e jitter sao buscadas em paralelo.
4. Os dados sao agregados por timestamp e por grupo.
5. O frontend entrega graficos com leituras brutas e visoes normalizadas para comparacao.

## Estrategia de tolerancia a falhas

- cada chamada retorna `ApiResult<T>`;
- falhas nao derrubam a pagina inteira;
- componentes usam fallbacks seguros com `dataOr()`;
- avisos visuais sao emitidos por `ApiNotice`;
- dados faltantes sao exibidos com formatadores consistentes como `-`, `0 B` ou `0 bps`.

## Responsabilidades por camada

- `app/`: orquestracao de tela, leitura server-side e layouts
- `components/`: apresentacao e interacao
- `config/`: metadados estaveis de grupos
- `hooks/`: comportamento reutilizavel de interface
- `lib/`: integracao, contratos e funcoes puras

## Boas praticas para evolucao

- adicione novos endpoints primeiro em `src/lib/api/types.ts`;
- coloque formatacao reutilizavel em `src/lib/format.ts`;
- se a transformacao muda semantica do dado, documente-a no proprio modulo;
- evite colocar logica de negocio em `ui/`;
- preserve a distincao entre leitura server-side e acao client-side.
