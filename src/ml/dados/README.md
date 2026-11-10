# Dados — disciplina IA & ML (documentação de fontes)

> Exigência da GS: pergunta de ML respondida com **dados reais e públicos**, documentando **fonte, link e período**. **Dados simulados NÃO são aceitos.** Evidências coletadas na 1ª auditoria de fontes de 10/11/2026 (`docs/04_dados_fontes.md` do monorepo).

## Fontes candidatas (auditar e baixar)

| Fonte | Link | Período sugerido | Licença | Status |
|---|---|---|---|---|
| SSP-SP — Dados mensais / Consultas | https://www.ssp.sp.gov.br/estatistica/dados-mensais · https://www.ssp.sp.gov.br/estatistica/consultas | Série 2023–2026 | CC-BY-4.0 (via CKAN `dadosabertos.sp.gov.br`) | ⚠️ baixar manualmente (site bloqueia crawlers) |
| Infosiga SP — sinistros com óbitos | https://infosiga.detran.sp.gov.br/ (Dados Abertos) · CKAN org DETRAN-SP | Histórico 2023–2025 | CC-BY-4.0 | ⚠️ baixar arquivo consolidado |
| GeoSampa — iluminação pública (**feature de contexto urbano**, não alvo do modelo) | WFS: `wfs.geosampa.prefeitura.sp.gov.br/geoserver/geoportal/wfs?…typeName=geoportal:iluminacao_publica&outputFormat=application/json` | carga vigente (última carga 21/10/2026) | acesso sem restrições (uso: licença a confirmar) | ✅ verificada ao vivo (662.945 pontos) |
| GTFS SPTrans (**feature de transporte**, não alvo do modelo) | https://www.sptrans.com.br/umbraco/Surface/PerfilDesenvolvedor/BaixarGTFS?memberName=sptrans | versão 09/11/2026 | redistribuição a validar | ✅ verificado (1.365 rotas: 1.349 ônibus + 9 Metrô + 7 CPTM; 22.273 paradas) |

## Pergunta de ML candidata `[HIPÓTESE — escolher e justificar]`

> Dado município/distrito e franja temporal (dia da semana + faixa de horário) da SSP-SP, treinar um modelo (XGBoost ou Random Forest) para **estimar a frequência relativa de ocorrências relevantes para o deslocamento noturno** por recorte territorial-temporal — e avaliar onde os **dados são insuficientes** para qualquer conclusão.

**Imperativos (documento vivo + guardrails)**:
- A saída **não pode** gerar rótulos "distrito seguro/perigoso" — comparativa, contextualizada, sempre com confiança dos dados (`docs/05_regras_linguagem_etica.md`).
- Zero registros ≠ seguro (subnotificação) — tratar explicitamente na seção de limitações do relatório.
- Requisitos da disciplina: ≥10 combinações de 3 hiperparâmetros, validação cruzada **só no treino**, métricas treino/teste lado a lado com gráficos, discussão de overfitting e conclusão do significado para o cidadão em `RELATORIO_ML.md`.

## Padrão de anotação de datasets baixados

Ao baixar qualquer arquivo para esta pasta, registrar aqui:

| Arquivo | Fonte (link exato do recurso) | Período coberto | Data do download | SHA256 |
|---|---|---|---|---|
| *(vazio — preencher ao baixar)* |
