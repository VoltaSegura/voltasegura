---
titulo: Regras de linguagem, posicionamento e ética (restrições para agentes)
projeto: VoltaSegura (produto)
atualizado: 2026-11-10
tipo: guardrails
prioridade: maxima
regra: "Estas regras têm prioridade sobre qualquer outro documento. Verifique TODO texto gerado contra esta lista antes de entregar."
---

# Guardrails — o que pode e o que não pode ser dito/prometido

## Regra de ouro

> VoltaSegura **não** é um aplicativo que identifica bairros perigosos e **não** promete encontrar "a rota mais segura". Esse posicionamento é tecnicamente frágil, pode reforçar preconceitos e cria uma expectativa que os dados não conseguem garantir.

## Você deve sempre

- Usar **"exposição estimada"** como conceito central, com indicação comparativa e contextualizada.
- Distinguir e exibir **duas dimensões separadamente**: (a) exposição estimada e (b) **confiança/qualidade dos dados** (origem, data, cobertura).
- Especificar para toda estatística: **fonte, público, amostra, período** e o que o percentual mede.
- Sinalizar incerteza, cobertura insuficiente e possíveis vieses.
- Explicitar quando algo é hipótese, protótipo ou dado de exemplo (ex.: tempos 32/38 min do mockup = **exemplo visual**).
- Avisar quando dados forem insuficientes ("dados insuficientes" como saída válida do sistema).
- Aplicar LGPD: privacidade desde a concepção e minimização de dados.

## Você nunca deve dizer/escrever/apresentar

| ❌ Proibido | Por quê | ✅ Usar no lugar |
|---|---|---|
| "Rota segura" / "a rota mais segura" | Não há garantia possível | "Rota com menor exposição estimada entre as alternativas avaliadas" |
| "Bairro/rua perigoso/a" / "área de risco" | Estigmatiza territórios; reproduz vieses | "Atenção a determinados fatores neste trecho/horário" |
| "Zero ocorrências = lugar seguro" | Subnotificação; ausência de registro ≠ ausência de risco | Indicar cobertura e limitação dos dados |
| Índice/pontuação numérica de segurança "validado" | Metodologia ainda não definida | Critérios explícitos de comparação + indicação de confiança |
| "Prevemos crimes" / "garantimos segurança" | Falsas promessas | "Aplicado contexto e visibilidade para comparação consciente" |
| "Somos os primeiros a relacionar navegação e segurança" | Falso (Waze, SketchFactor etc.) | Descrever a integração específica: alternativa + exposição + confiança + ida/volta |
| Mencionar lotação de ônibus como dado do produto | Sem fonte validada | Omitir de MVP |
| Tratar o nome VoltaSegura como definitivo e pronto para uso comercial | Renomeação recente (10/11/2026); marca/domínio/anterioridade pendentes | "VoltaSegura" com checagens de marca marcadas como pendentes |
| "PL 1.169/2025 é lei vigente" | Ainda tramitaria | "Projeto de lei em tramitação; verificar estado atual na Câmara" |

## Restrições de produto (verificáveis em código/design)

- **Não** rotular bairros/territórios inteiros — investigar apenas trechos/segmentos com indicadores.
- **Não** transformar ausência de dados em pontuação positiva.
- **Não** vender histórico individual de localização **nem** permitir que patrocinadores alterem classificações.
- **Não** apresentar o produto como transferência de responsabilidade ao usuário por uma ocorrência futura.
- Em caso de hipótese não testada: rotular como hipótese (não como funcionalidade comprovada).

## Contexto de risco (precedentes que orientam estas regras)

SketchFactor (2014, criticado), patente Microsoft "avoid ghetto" (controvérsia), ACLU sobre discriminação algorítmica em navegação, Gstrein & Ritsema van Eck (2017) sobre dispositivos como sensores estigmatizantes, casos Waze no Brasil (2015, 2016, 2025) e lei municipal do Rio (2019). Leitura recomendada se for gerar texto sobre ética.

## Checklist rápida antes de entregar qualquer artefato

```
[ ] Tempos 32/38 min marcados como exemplo visual?
[ ] Toda estatística tem fonte + amostra + período?
[ ] Nenhum rótulo territorial absoluto ("perigoso", "seguro")?
[ ] "Exposição estimada" sempre qualificada como estimativa comparativa?
[ ] Confiança dos dados exibida/declarada separadamente?
[ ] Lotação não é prometida como recurso do MVP?
[ ] Nome aparece como "VoltaSegura"?
[ ] Nada de dados pessoais reais ou simulados sem aviso de origem?
```
