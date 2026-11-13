# TL-14 · Compartilhar minha volta

- **Status:** rascunho (nova, 13/11/2026; aguarda revisão do Lucas) · **Depende do tempo (D-22)** · **Rota Expo Router prevista:** `/(app)/compartilhar/[rotaId]` (modal) + indicador global
- **Objetivo:** iniciar, acompanhar e encerrar uma sessão de compartilhamento do trajeto e da localização ao vivo com um contato (D-19).
- **US/AC e funcionalidades cobertas:** US-21 AC1–AC5, AC7, AC9; US-05 AC3 (exceção); US-19 AC4 · FN-15 · **RNF aplicáveis:** RNF-01, RNF-05, RNF-06, RNF-07
- **Entradas:** botão "Compartilhar minha volta" na TL-08; toque no indicador global "Compartilhando".
- **Saídas:** folha de compartilhar do sistema (link); TL-08; fim da sessão.

## Wireframe

**Estado confirmar** (antes de iniciar, US-21 AC2)

```
┌──────────────────────────────┐
│ ✕  Compartilhar minha volta  │
│                              │
│ A pessoa que receber o link  │
│ vai ver, pelo app VoltaSegura│
│  · o trajeto desta opção     │
│  · sua posição durante a     │
│    viagem                    │
│  · a chegada estimada: 23:36 │
│                      EXEMPLO │
│                              │
│ Termina quando você chegar,  │
│ quando tocar em Parar ou às  │
│ 00:06 (tempo máximo).        │
│                              │
│ Sua localização é usada só   │
│ durante o compartilhamento e │
│ apagada do servidor ao fim.  │
│                              │
│ A pessoa precisa ter o app.  │
│ ┌──────────────────────────┐ │
│ │  Compartilhar o link     │ │
│ └──────────────────────────┘ │
│          Cancelar            │
└──────────────────────────────┘
```

**Estado permissão de segundo plano negada** (US-21 AC5, `[HIPÓTESE]`)

```
│ ⓘ Sem acesso à localização   │
│ em segundo plano. A pessoa   │
│ verá só o trajeto e a        │
│ chegada estimada, sem sua    │
│ posição.                     │
│ [ Compartilhar só o trajeto ]│
│   Permitir nas configurações │
```

**Estado sessão ativa** (ao tocar no indicador)

```
┌──────────────────────────────┐
│ ✕  Compartilhando            │
│ ● Ativo desde 23:04          │
│ Chegada estimada 23:36       │
│ Última posição enviada 23:12 │
│                      EXEMPLO │
│ ┌──────────────────────────┐ │
│ │ Enviar o link de novo    │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │   Parar de compartilhar  │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

**Indicador global** (fixo no topo de todas as telas de `(app)` enquanto a sessão estiver ativa, US-21 AC3)

```
┌──────────────────────────────┐
│ ● Compartilhando sua volta · │
│   Parar                      │
├──────────────────────────────┤
│ (tela atual)                 │
```

**Estado perto do tempo máximo** (PL-20, `[HIPÓTESE]`)

```
│ ⓘ O compartilhamento termina │
│ em 10 min.                   │
│ [ Estender 30 min ] [ Ok ]   │
```

**Estado encerrado**

```
│ ⓘ Compartilhamento encerrado.│
│ Sua localização não é mais   │
│ enviada e o link expirou.    │
```

Variante "você chegou": "Compartilhamento encerrado: você chegou." (PL-22).

**Estado erro ao iniciar:** "Não foi possível iniciar o compartilhamento agora. Tentar de novo ›".

**Estado sem rede durante a sessão:** o indicador mostra "Compartilhando · sem conexão"; as posições vão quando a rede voltar.

## Estrutura e componentes

`Cabecalho` modal · `Texto` explicativo com `ListaMarcadores` · `SeloExemplo` nos horários · `Botao` primário "Compartilhar o link" · `Link` cancelar · `Aviso` (permissão, tempo máximo, encerrado, erro) · `IndicadorCompartilhamento` (global) · `Botao` destrutivo "Parar de compartilhar".

## Conteúdo e dados

Chegada estimada da rota (API), horários da sessão (local/API), link (API FN-15). Ver `09_dados_por_tela.md`, TL-14.

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| "Compartilhar o link" | Pede a permissão (se preciso), cria a sessão e abre a folha de compartilhar do sistema | Sistema → TL-08 com indicador |
| "Compartilhar só o trajeto" | Cria a sessão sem posição ao vivo | Sistema |
| "Cancelar" ou ✕ | Nada é criado | TL-08 |
| Toca no indicador | Abre o estado sessão ativa | TL-14 |
| "Parar" (indicador ou TL-14) | Encerra a sessão | Tela atual com aviso "encerrado" |
| "Enviar o link de novo" | Reabre a folha de compartilhar | Sistema |
| "Estender 30 min" | Adia o tempo máximo | Tela atual |

## Estados

confirmar · permissão de segundo plano negada · enviando (botão "Iniciando…") · sessão ativa · indicador global · perto do tempo máximo · encerrado (parado, chegou, tempo máximo) · erro ao iniciar · sem rede durante a sessão.

## Validações e mensagens de erro

Ver estados. Não há campos digitados.

## Textos

`compartilhar.*` (catálogo em `08_microcopy.md`).

## Acessibilidade

- O indicador global é anunciado ao aparecer ("Compartilhando sua volta") e tem o botão "Parar" com alvo ≥ 48 dp.
- O estado ativo não depende de cor: o ponto ● vem sempre com o texto "Ativo" ou "Compartilhando".
- O aviso de tempo máximo é anunciado.

## Privacidade e linguagem

- **GPS em segundo plano só com a sessão ativa** (D-20); o indicador é a prova visível disso, e nunca fica oculto.
- A tela diz o que é compartilhado, até quando e que os dados são apagados ao fim (US-21 AC2, D-21).
- **Proibido:** "volte em segurança", "fique protegida", "seu contato garante", ou qualquer promessa de proteção (US-21 AC9, RNF-01). Também não se sugere que quem acompanha é responsável pelo que acontecer (RNF-06).
- Nenhum dado da comparação de exposição vai no link (US-21 AC8).

## Critérios de pronto da tela

- [ ] Antes de iniciar, explica o que será visto e quando termina (US-21 AC2).
- [ ] Confirmar gera o link e abre a folha de compartilhar (US-21 AC1).
- [ ] Indicador sempre visível com "Parar"; parar encerra e expira o link (US-21 AC3, AC7).
- [ ] Encerramento automático na chegada e no tempo máximo (US-21 AC4).
- [ ] Sem permissão de segundo plano, compartilha só o trajeto (US-21 AC5).
- [ ] Varredura de termos limpa (US-21 AC9).
