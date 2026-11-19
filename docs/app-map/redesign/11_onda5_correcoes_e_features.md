# Onda 5: correções do vídeo da onda 3, VoltaSegura+ e compartilhar (15/11/2026)

**Executado por 3 workers (A correções, B VoltaSegura+, C compartilhar), integrado pelo lead.** Verificação: `tsc` limpo, ESLint limpo, 499 testes em 41 suítes. **Nada validado no aparelho.**

## A · Correções
- B1 teclado: `softwareKeyboardLayoutMode: "pan"` em `app.json` + deslocamento manual único em `useAlturaTeclado` (Expo Go ignora a chave; validar em dev build).
- Carrossel de lugares sangra até a borda com `snapToInterval` (`planejar.tsx`); `LARGURA_CARTAO_LOCAL` em `CartaoLocal.tsx`.
- Folha de resultado com `paddingBottom` da área segura e resumo recolhido em até 2 linhas; `useAjusteCamera` soma o inset superior.
- Sem mudança: aviso da busca (já tem fundo e fica fora do título) e rótulo "Minha localização" (não aparece no painel).

## B · VoltaSegura+ (F7.1, D-31)
Rotina da semana só no aparelho (`src/rotina/`), até 5 rotinas, lembrete local N min antes (5/10/15/30, padrão 15), `expo-notifications`; origem/destino só entre lugares salvos; selo "recurso em validação". Telas TL-16/TL-17, FL-17, FN-17. Gatilho registrado como `[DECISÃO]`.

## C · Compartilhar (F2.5, protótipo com mock)
`src/services/compartilhamento.ts` (mock e api hipotética), `src/compartilhamento/`, indicador global, TL-14, TL-15, botão em TL-08, deep link `voltasegura://acompanhar/<token>` com guarda de sessão. Sem backend (PL-18) nem GPS em segundo plano (PL-24).

## Checklist no aparelho (pendente)
1. Teclado ao salvar lugar a 100/130/200% (campo e Salvar visíveis).
2. Carrossel de lugares e cartão "Adicionar".
3. Folha de resultado em 3 alturas com barra de gestos.
4. Lembrete: permissão, disparo, toque abre home preenchida (Expo Go Android).
5. Compartilhar: indicador no topo (recuo de área segura), deep link aberto/fechado, logado/deslogado, folha do sistema.
6. Quadro preto R4 e endereço por geocodificação reversa.
