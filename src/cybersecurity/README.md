# VoltaSegura — Cybersecurity

Módulo de segurança do VoltaSegura: regras de tratamento de **PII** (dados de localização), evidências de **Taint Analysis** e dashboard do indicador **Risco Cidadão**.

> **Definição acordada (item 36 do grupo, 11/11/2026)**: "Risco Cidadão" é o risco de **exposição dos dados pessoais do usuário** (materia de Taint Analysis/LGPD) — **nunca** uma descrição de risco de ruas, bairros ou rotas (guardrails de [`docs/05_regras_linguagem_etica.md`](../../docs/05_regras_linguagem_etica.md)).

> ⚠️ Em construção. Alinhado aos princípios de [`docs/03_projeto_documento_vivo.md`](../../docs/03_projeto_documento_vivo.md) (seção Ética/privacidade) e à LGPD (Lei nº 13.709/2018).
>
> Entrega em ZIP: (1) código do módulo com regras PII; (2) evidências de Taint Analysis; (3) vídeo + print do dashboard gerando o indicador.

## Principais (do documento vivo)

- Privacidade desde a concepção e minimização de dados;
- Não vender histórico individual de localização;
- Relatórios institucionais apenas agregados e anonimizados.
