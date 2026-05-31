# Rotas e Contratos Consumidos

## Rotas da interface

### `/dashboard`

Consolida saude da API, status do compose, disponibilidade de gateways, persistencia de snapshots e visoes de monitoramento temporal.

### `/sensores`

Lista sensores com:

- ultima leitura;
- volume de mensagens;
- throughput;
- delay;
- jitter;
- perda;
- ultimo timestamp observado.

### `/sensores/[group]/[sensor]`

Exibe detalhe de um sensor por grupo, focando leitura atual, estatisticas derivadas e contexto temporal.

### `/grupos`

Apresenta a visao resumida das redes hospitalares com navegacao para detalhes.

### `/grupos/[group]`

Detalha metricas, sensores e informacoes operacionais do grupo escolhido.

### `/gateways`

Mostra o estado dos gateways VNF, incluindo sinais de politicas ativas e dados de diagnostico.

### `/politicas`

Agrupa rotas fixas e parametrizadas para limitacao de banda e emulacao de rede.

### `/logs`

Renderiza logs de containers e grupos para inspeção textual.

### `/diagnostico`

Expõe uma visao tecnica complementar sobre containers e ambiente monitorado.

## Contratos principais do backend

### `GET /health`

Usado para saude geral da API e status basico do ambiente Docker.

### `GET /status`

Usado para total de containers, containers ativos e mapa de servicos.

### `GET /containers`

Retorna inventario detalhado de containers para cards e tabelas operacionais.

### `GET /gateways`

Retorna gateways indexados por grupo, incluindo:

- estado Docker;
- interfaces;
- status de `ip_forward`;
- politicas ativas.

### `GET /metrics/traffic`

Fornece metricas agregadas de trafego por grupo. O frontend usa esses dados para cards, tabelas e comparacoes radiais.

### `GET /sensors/metrics`

Fornece metricas detalhadas por sensor, consumidas em grades e paginas de detalhe.

### `GET /timeseries/stats`

Informa disponibilidade e volume da base temporal local.

### `GET /timeseries/series`

Entrega series historicas por metrica, agregadas pelo frontend para compor graficos.

### `GET /timeseries/sensors/latest`

Retorna o snapshot mais recente de cada sensor para classificacao de saude.

### `GET /policies`

Exibe politicas fixas anunciadas pelo backend.

### `GET /openapi.json`

Permite inferir dinamicamente quais rotas parametrizadas de politica estao disponiveis.

## Derivacoes feitas no frontend

### Radar de trafego por grupo

O radar compara metricas com unidades diferentes. Para isso, o frontend:

1. preserva o valor bruto para tooltip;
2. normaliza o valor por atributo em escala 0-100;
3. renderiza um radar por grupo com a mesma base comparativa.

### Estado de saude dos sensores

O dashboard classifica snapshots em `healthy`, `warning` ou `critical` a partir de:

- perda de pacotes;
- delay medio;
- delay maximo;
- jitter.

### Politicas parametrizadas

O frontend nao depende apenas de uma lista fixa. Ele combina:

- OpenAPI do backend;
- defaults locais para payloads;
- estado atual dos gateways.

Isso permite adaptar a tela a capacidades ativas do backend sem reescrever a interface a cada mudanca de rota.
