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

Pré-requisitos: Node.js 22.13+ e npm. No celular, o Expo Go, com computador e celular na mesma rede Wi-Fi.

### Jeito rápido: dados de exemplo (sem servidor)

```bash
cd src/mobile-app
npm run setup -- --modo mock
npm run celular
```

Os trajetos e números são fixtures rotuladas como **EXEMPLO**, não dados reais.

### Trajetos reais (OTP2) e exposição estimada (Neon)

```bash
cd src/mobile-app
npm run setup        # uma vez: dependências, .env.local com o IP da rede, Java 25, OTP2 e grafo
npm run otp2         # terminal 1: servidor de trajetos na porta 8080 (deixe aberto)
npm run celular      # terminal 2: confere o IP e abre o Expo com cache limpo
```

O que o `npm run setup` faz (scripts em `scripts/setup/`):

1. roda `npm install` se faltar;
2. descobre o IPv4 do computador na rede local, ignorando adaptadores virtuais (WSL, Hyper-V, VirtualBox), e grava no `.env.local` as variáveis `EXPO_PUBLIC_*`: modo `otp2`, URL do OTP2 e URLs públicas do Neon (`scripts/setup/neon-publico.json`, sem segredo). Chaves que já existem no `.env.local` ficam como estão;
3. procura Java 25+ (exigido pelo OTP 2.10) e, no Windows, oferece instalar com o `winget`;
4. baixa o OTP2, o GTFS da SPTrans e o OpenStreetMap do Sudeste, recorta o mapa para o município (Python 3 + osmium, num ambiente isolado) e monta o grafo. Na primeira vez leva de 20 a 40 minutos e pede uns 12 GB de RAM; depois, o `graph.obj` é reaproveitado.

Os arquivos do OTP2 ficam em `src/mobile-app/.otp2/` (fora do git). No monorepo, se `scripts/otp2/dados/graph.obj` já existir, o script usa essa pasta. Opções: `--dados <pasta>`, `--memoria 6G`, `--porta 8080` no `npm run otp2`, e `--ip <IPv4>` no `npm run setup` se a detecção errar. Trocou de Wi-Fi? `npm run celular` já atualiza o IP.

Para ver a exposição estimada, crie uma conta no app e entre. Sem login, o app mostra só os trajetos ("só roteamento"). Se o celular não abrir `http://<IP>:8080/graphiql`, libere o Java no Firewall do Windows para redes privadas. Em desenvolvimento, o terminal do Expo mostra cada consulta ao OTP2 (`[otp2] ...`), sem coordenadas da pessoa.

Para testar no navegador, use `npx expo start --web`. Nunca coloque `DATABASE_URL` ou outro segredo em `EXPO_PUBLIC_*`. O modo `api` para trajetos depende da conciliação do contrato com o backend (PL-18).

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
