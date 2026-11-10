# Prompt — logo VoltaSegura (v1 · com wordmark)

Status: [EM ABERTO — versões de exploração; revisão da equipe pendente]

Modelo: `openai/gpt-image-2.5-sunburst` (OpenRouter Image API) · aspecto 1:1 · qualidade high

Prompt (em inglês, texto integral enviado ao modelo):

```
Minimalist flat vector logo for "VoltaSegura", a mobility-decision app that helps
university students plan the journey back home at night using public transport
and walking.

Symbol: a bold geometric letter "V" formed by a continuous route path — a map
route line that bends into the V shape and ends in a rounded map location pin
at the bottom vertex, suggesting arrival back home. Warm orange (#FF7A00) line
on a solid black background. Rounded line caps, clean geometry, generous
negative space.

Style: flat design, no gradients, no shadows, no 3D, no realistic details.
High contrast, strong silhouette, must stay legible at small app-icon size
(48px). Balanced composition, centered.

Wordmark: "VoltaSegura" below the symbol, white, modern rounded geometric
sans-serif, single word, correct spelling.

Explicitly avoid: shields, padlocks, locks, police or surveillance imagery,
traffic-warning triangles, skulls, red colors, gradients, text other than
"VoltaSegura".
```

Decisões de design (justificadas em conversa com o grupo, 10/11/2026):

- "V" como rota contínua terminando em pino — conta a história *a volta para
  casa* sem prometer proteção (regra de ouro de `docs/05_regras_linguagem_etica.md`).
- Exclusões explícitas = tradução visual das guardrails (sem escudo/cadeado/
  triângulo de alerta).
- Wordmark com grafia exata `VoltaSegura` (uma palavra, maiúscula interna S).
