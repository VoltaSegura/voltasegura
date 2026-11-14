# VoltaSegura — app mobile

Protótipo acadêmico de apoio à comparação de trajetos de ida e volta para estudantes do período noturno. O app apresenta alternativas com **exposição estimada** e **confiança dos dados** em dimensões separadas. A escolha do trajeto cabe à pessoa usuária. As respostas do modo mock são identificadas como **EXEMPLO**.

## Ficha da CitizenTech

| Campo | Resposta |
|---|---|
| Nome | **VoltaSegura** — nome do produto; CitizenTech é o tema da GS FIAP |
| Cidade e bairro | Município de São Paulo; todos os bairros estão no escopo planejado, sujeitos à cobertura e à qualidade dos dados locais `[DECISÃO]` |
| Cidadão beneficiado | Estudante universitário do período noturno que volta para casa de transporte público e a pé. Ágatha Santos, 24, é uma proto-persona ainda não validada com usuários `[HIPÓTESE]` |
| Problema | Apps de mobilidade priorizam tempo e distância, mas não reúnem condições urbanas e limitações dos dados para apoiar uma escolha consciente entre trajetos |
| Como funciona | A pessoa informa origem, destino e horário; o protótipo mostra alternativas de ida ou volta, seus tempos e trechos, a comparação de exposição estimada quando conclusiva e a origem, o período e a confiança dos dados |
| O que cada parte faz | **Mobile:** consulta e apresentação das alternativas. **SOA/C#:** APIs e comparação. **ML:** estudo com dados públicos. **OS:** infraestrutura. **QA:** critérios e testes. **Cybersecurity:** tratamento de dados pessoais e auditoria. **Physical Computing:** circuito da entrega da disciplina, fora do produto `[DECISÃO]` |
| Repositório | [VoltaSegura/mobile-app](https://github.com/VoltaSegura/mobile-app); [monorepo](https://github.com/VoltaSegura/voltasegura) |
| Indicador de impacto | `[EM ABERTO]` — propostas: utilidade percebida da comparação, intenção de uso recorrente e adesão ao planejamento de ida e volta; não foram medidos |
| ODS conectado | **ODS 11 — Cidades e comunidades sustentáveis** (metas 11.2 e 11.7): apoiar decisões informadas de deslocamento noturno por transporte público e caminhada com dados abertos e limites explícitos `[DECISÃO]` |

O VoltaSegura **não garante segurança, não prevê crimes e não classifica bairros**. A comparação trata apenas das alternativas avaliadas e pode concluir que os dados são insuficientes. Consulte [as regras de linguagem](../../docs/05_regras_linguagem_etica.md).

## Estado do protótipo

Há 13 telas implementadas (TL-01 a TL-13), 11 cenários de exemplo, serviços para modo mock/API e cadastro/login pelo Neon Auth. TL-14 e TL-15, de compartilhamento, continuam provisórias. Histórico e locais salvos, integração da API de trajetos, validação em aparelho e checklist de acessibilidade seguem `[EM ABERTO]` ou pendentes. A sessão na web usa memória; o login Neon Auth pelo navegador ainda não conclui por causa da leitura de `Set-Cookie`. A demonstração web deve usar o modo mock sem `EXPO_PUBLIC_NEON_AUTH_URL`.

## Como rodar

Pré-requisitos: Node.js 22.13+ e npm. Para testar no celular, instale o Expo Go e conecte computador e celular à mesma rede; a abertura no aparelho ainda precisa ser validada.

```bash
cd src/mobile-app
npm ci
npx expo start
```

O modo padrão é `mock` e não exige arquivo `.env`. Para testar no navegador, use `npx expo start --web`. O Expo Router carrega as telas de `src/app/`.

Para usar o Neon Auth em um aparelho, copie `.env.example` para `.env` e preencha **somente** a URL pública `EXPO_PUBLIC_NEON_AUTH_URL` e a origem confiável `EXPO_PUBLIC_NEON_AUTH_ORIGIN`. Esse fluxo ainda precisa de teste no React Native. Nunca coloque `DATABASE_URL` ou outro segredo em `EXPO_PUBLIC_*`. O modo `api` para trajetos depende da conciliação do contrato com o backend (PL-18). No celular, use o IP da máquina na rede local em `EXPO_PUBLIC_API_URL`, não `localhost`.

| Verificação | Comando |
|---|---|
| Tipos | `npx tsc --noEmit` |
| Lint | `npx eslint src` |
| Testes | `npx jest --runInBand` |
| Dependências Expo | `npx expo-doctor` |
| Exportação | `npx expo export --platform web` ou `--platform android` |

Em 14/11/2026: TypeScript e ESLint sem erros, **312 testes em 24 suítes**, exportações web e Android concluídas e Expo Doctor **20/20**. Veja [ARQUITETURA.md](./ARQUITETURA.md) e [todo-mobile.md](./todo-mobile.md) neste espelho; no monorepo, os dois arquivos ficam em `src/mobile-app/`.

## Evidências para a entrega

- **Prints das telas:** pendentes; serão incluídos após a validação visual no aparelho.
- **Vídeo de até 3 minutos:** pendente; link a acrescentar depois da gravação.
- **Registro de uso de IA:** [prompts.md](../../prompts.md).

Prazo da GS: **19/11/2026, 23h55**. O envio no Teams cabe a um integrante da equipe.
