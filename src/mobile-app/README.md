# VoltaSegura — app mobile

O **VoltaSegura** ajuda quem volta para casa à noite em São Paulo, de transporte público e a pé, a comparar trajetos de ida e volta antes de sair. Para cada alternativa, o app mostra o tempo, os trechos, a **exposição estimada** (calculada com registros públicos da SSP-SP) e a **confiança dos dados**, que aparecem separadas. Quem decide o trajeto é a pessoa. Este repositório traz o app em React Native/Expo, entregue na disciplina Mobile Development & IoT da GS FIAP 2026. O tema da GS é "CitizenTech".

## Integrantes

| RM | Nome |
|---|---|
| 565065 | Augusto Barcelos Barros |
| 556197 | Caio Felipe de Lima Bezerra |
| 555541 | Juan Francisco Alves Muradas |
| 555931 | Lucas Derenze Simidu |
| 554873 | Sofia Fernandes |

## Ficha da CitizenTech

| Campo | Resposta |
|---|---|
| Nome | **VoltaSegura** — nome do produto; CitizenTech é o tema da GS FIAP |
| Cidade e bairro | Município de São Paulo; todos os bairros estão no escopo planejado, sujeitos à cobertura e à qualidade dos dados locais `[DECISÃO]` |
| Cidadão beneficiado | Quem volta para casa à noite de transporte público e a pé, incluindo estudantes universitários e trabalhadores noturnos. Ágatha Santos, 24, é uma proto-persona ainda não validada com usuários `[HIPÓTESE]` |
| Problema | Apps de mobilidade priorizam tempo e distância, mas não reúnem condições urbanas e limitações dos dados para apoiar uma escolha consciente entre trajetos |
| Como funciona | A pessoa informa origem, destino e horário; o protótipo mostra alternativas de ida ou volta, seus tempos e trechos, a comparação de exposição estimada quando conclusiva e a origem, o período e a confiança dos dados |
| O que cada parte faz | **Mobile:** consulta e apresentação das alternativas. **SOA/C#:** APIs e comparação. **ML:** estudo com dados públicos. **OS:** infraestrutura. **QA:** critérios e testes. **Cybersecurity:** tratamento de dados pessoais e auditoria. **Physical Computing:** circuito da entrega da disciplina, fora do produto `[DECISÃO]` |
| Repositório | [VoltaSegura/mobile-app](https://github.com/VoltaSegura/mobile-app); [monorepo](https://github.com/VoltaSegura/voltasegura) |
| Indicador de impacto | `[EM ABERTO]` — propostas: utilidade percebida da comparação, intenção de uso recorrente e adesão ao planejamento de ida e volta; não foram medidos |
| ODS conectado | **ODS 11 — Cidades e comunidades sustentáveis** (metas 11.2 e 11.7): apoiar decisões informadas de deslocamento noturno por transporte público e caminhada com dados abertos e limites explícitos `[DECISÃO]` |

O VoltaSegura **não garante segurança, não prevê crimes e não classifica bairros**. A comparação vale só para as alternativas avaliadas, e o resultado pode ser que os dados são insuficientes. Veja [as regras de linguagem](../../docs/05_regras_linguagem_etica.md).

## Estado do protótipo (19/11/2026)

- **Navegação por abas:** Planejar, Locais, Contatos, VoltaSegura+ e Perfil.
- **Jornada principal:** planejar a ida ou a volta, ver as alternativas com exposição estimada e confiança dos dados, abrir o detalhe e o "por que esta rota" e consultar a origem dos dados.
- **Acompanhamento:** seguir rota com recálculo quando a pessoa sai do trajeto.
- **Conta:** cadastro e login pelo Neon Auth.
- **Dados no aparelho:** lugares salvos, contatos e tema (Sistema, Claro ou Escuro).
- **VoltaSegura+:** em modo **simulação, sem cobrança**.
- **Dados de exemplo:** sem servidor, o app usa cenários marcados como **EXEMPLO**.

Na web, a sessão fica só em memória. O login pelo Neon Auth no navegador ainda não termina, porque o navegador não deixa ler o `Set-Cookie`. Para demonstrar na web, use o modo mock, sem `EXPO_PUBLIC_NEON_AUTH_URL`.

## Como rodar

O app roda de dois jeitos:

| Modo | O que você vê | O que precisa instalar | Tempo da 1ª vez |
|---|---|---|---|
| **Mock** (dados de exemplo) | Telas completas com trajetos e números fictícios, marcados como **EXEMPLO** | Node.js e o Expo Go no celular | ~5 min |
| **Real** (OTP2 + Neon) | Trajetos reais de ônibus, metrô e caminhada em São Paulo, e a exposição estimada calculada com os registros da SSP-SP | Node.js, Expo Go, Java 25 e Python 3.10+ (os scripts baixam o resto) | 20 a 40 min |

### Como as peças se ligam no modo real

```
Celular (Expo Go)
  ├── pede trajetos ──────────────► OTP2 no seu computador (Java, porta 8080)
  │                                  usa o GTFS da SPTrans + o mapa do OpenStreetMap
  └── login e exposição estimada ─► Neon (nuvem: Postgres + Neon Auth)
                                     guarda os registros da SSP-SP e faz a conta da exposição
```

O celular precisa alcançar o computador pela rede local. Por isso os dois têm de estar **no mesmo Wi-Fi**, e o app precisa saber o IP do computador.

### Por que instalamos cada coisa

| Item | Para que serve | Quem instala |
|---|---|---|
| **Node.js 22.13+ e npm** | Rodam o Expo (o servidor que entrega o app ao celular) e os scripts de setup | Você ([nodejs.org](https://nodejs.org)) |
| **Expo Go** (celular) | Abre o app no celular sem precisar compilar: basta ler o QR code | Você (Play Store ou App Store) |
| **Java 25+** | O **OpenTripPlanner 2 (OTP2)** é um programa Java. A versão 2.10 exige Java 25 | O `npm run setup` procura. No Windows, oferece instalar o Temurin JDK 25 com o `winget` |
| **OpenTripPlanner 2.10** (`otp-shaded-2.10.0.jar`, ~190 MB) | **Servidor de roteamento**. Recebe origem, destino e horário e devolve as alternativas de trajeto (ônibus, metrô, trem e caminhada), com horários e geometria. As alternativas que o app compara saem daqui | O script baixa do Maven Central |
| **GTFS da SPTrans** (~15 MB) | Linhas, pontos e horários do transporte público de São Paulo. Sem ele, o OTP2 não sabe quais ônibus existem | O script baixa do site da SPTrans |
| **OpenStreetMap do Sudeste** (~860 MB) | Ruas e calçadas, usadas para os trechos a pé e para ligar a pessoa aos pontos | O script baixa da Geofabrik |
| **Python 3.10+ e osmium** | **Recortam** o mapa do Sudeste para o município de São Paulo, o que reduz a memória e o tempo de montagem do grafo. O osmium vai num ambiente isolado (`.venv`), sem mexer no Python do sistema | Você instala o Python. O script cria o `.venv` e instala o `osmium` |
| **Grafo** (`graph.obj`) | Ruas e transporte já processados pelo OTP2. É montado uma vez e reaproveitado; servidor sobe em segundos | O script monta |
| **Neon** (nuvem, nada a instalar) | Login (Neon Auth) e Postgres com os registros públicos da SSP-SP e a função que calcula a exposição estimada de cada trajeto | Já está no ar. O setup grava as URLs públicas (`scripts/setup/neon-publico.json`, sem segredo) |

### Opção A: modo mock (sem servidor)

```bash
cd src/mobile-app
npm run setup -- --modo mock   # instala as dependências e grava o .env.local com o modo mock
npm run celular                # abre o Expo; leia o QR code com o Expo Go
```

### Opção B: modo real (trajetos e exposição estimada)

São três comandos. O primeiro roda **só uma vez**. Os outros dois rodam sempre que for usar o app, cada um no seu terminal.

```bash
cd src/mobile-app
npm run setup        # uma vez: prepara tudo (pode levar de 20 a 40 min)
npm run otp2         # terminal 1: sobe o servidor de trajetos (deixe aberto)
npm run celular      # terminal 2: abre o app para o celular
```

#### 1. `npm run setup`: prepara a máquina (uma vez)

Arquivo: `scripts/setup/setup.mjs`. O script segue estes passos e para com uma mensagem clara se algum falhar:

1. **Confere o Node.** Exige a versão 22.13 ou mais nova.
2. **Instala as dependências.** Roda `npm install` se ainda não houver `node_modules`.
3. **Descobre o IP do computador na rede local.** Ignora adaptadores virtuais que o celular não alcança: WSL, Hyper-V, VirtualBox, VMware, Docker e VPNs.
4. **Grava o `.env.local`** só com variáveis `EXPO_PUBLIC_*`, que vão dentro do app e não são segredo:
   - `EXPO_PUBLIC_API_MODE`, que vale `otp2` ou `mock`;
   - `EXPO_PUBLIC_OTP2_URL`, que fica `http://<seu IP>:8080`;
   - as URLs públicas do Neon (login e Data API) e o modo de cobertura da exposição.

   Chaves que você já tinha no `.env.local` não são sobrescritas.
5. **Prepara o OTP2.** Só no modo real. Chama `scripts/setup/otp2.mjs preparar`, que faz os passos 1 a 4 da próxima seção sem subir o servidor.

| Opção | Quando usar |
|---|---|
| `npm run setup -- --modo mock` | Só o app com dados de exemplo, sem Java e sem OTP2 |
| `npm run setup -- --so-ip` | Trocou de rede: atualiza só o IP no `.env.local` |
| `npm run setup -- --ip 192.168.0.20` | A detecção escolheu o IP errado |

#### 2. `npm run otp2`: sobe o servidor de trajetos (terminal 1)

Arquivo: `scripts/setup/otp2.mjs`. Ele faz o que faltar da preparação e depois sobe o servidor:

1. **Acha o Java 25+.** Procura no `JAVA_HOME`, no `PATH` e nas pastas comuns de JDK. No Windows, se não achar, oferece instalar com o `winget`.
2. **Baixa o OTP2 2.10.0**, se ainda não estiver na pasta de dados.
3. **Baixa o GTFS da SPTrans e o mapa do Sudeste** e recorta o mapa para São Paulo com `scripts/setup/recortar_osm.py`. Depois apaga o arquivo do Sudeste, porque o OTP2 leria os dois mapas.
4. **Monta o grafo** (`graph.obj`), o que leva de 5 a 20 minutos e pede uns 12 GB de RAM. O log fica em `build.log`. Se o grafo já existir, este passo é pulado.
5. **Sobe o servidor** na porta 8080 e carrega o grafo, em 30 s a 2 min. Quando estiver pronto, o terminal mostra o endereço para o computador e para o celular (`http://<IP>:8080/graphiql`). O log fica em `server.log`. Para parar, use `Ctrl+C`.

Se já houver um OTP2 respondendo na porta, o script avisa e não sobe outro.

**Memória do Java:** 65% da RAM, entre 4 e 10 GB.

**Pasta de dados**, na ordem em que o script procura:
1. `--dados`;
2. a variável `OTP2_DADOS`;
3. no monorepo, `scripts/otp2/dados`, se já tiver `graph.obj`;
4. `src/mobile-app/.otp2/`, que fica fora do git.

| Opção | Quando usar |
|---|---|
| `npm run otp2 -- --memoria 12G` | A montagem do grafo falhou com `OutOfMemoryError` |
| `npm run otp2 -- --porta 8081` | A porta 8080 já está em uso |
| `npm run otp2 -- --dados <pasta>` | Os arquivos do OTP2 estão em outra pasta |

Para refazer o grafo, por exemplo com um GTFS novo, apague o `graph.obj` e rode de novo.

#### 3. `npm run celular`: abre o app (terminal 2)

Roda `setup --so-ip` e depois `expo start -c`:

1. **Atualiza o IP** no `.env.local`, caso você tenha trocado de Wi-Fi.
2. **Abre o Expo com o cache limpo** (`-c`). As variáveis `EXPO_PUBLIC_*` entram no app na hora do empacotamento. Sem limpar o cache, o app continuaria com o IP antigo.
3. **Abra o app no celular:** leia o QR code com o Expo Go, no mesmo Wi-Fi do computador.
4. **Para ver a exposição estimada, crie uma conta no app e entre.** Sem login, o app mostra só os trajetos (modo "só roteamento").

### Problemas comuns

| Sintoma | O que fazer |
|---|---|
| "O servidor demorou para responder" ou o app não acha trajetos | Confira se o `npm run otp2` está aberto e mostrou "OTP2 pronto". Depois rode `npm run celular` de novo, para atualizar o IP |
| O celular não abre `http://<IP>:8080/graphiql` | No Firewall do Windows, libere o Java para redes privadas. Confira se o celular está no mesmo Wi-Fi |
| A detecção pegou o IP errado | `npm run setup -- --ip <seu IPv4>` (veja o IP com `ipconfig` no Windows) |
| A montagem do grafo parou com `OutOfMemoryError` | Feche outros programas e rode `npm run otp2 -- --memoria 12G` |
| O app mostra trajetos, mas sem a exposição estimada | Entre com uma conta. Confira se o `.env.local` tem `EXPO_PUBLIC_NEON_AUTH_URL` e `EXPO_PUBLIC_DATA_API_URL` |
| O Java não foi encontrado depois de instalar | Feche e reabra o terminal, para recarregar o `PATH`, e rode de novo |

Em desenvolvimento, o terminal do Expo mostra cada consulta ao OTP2 (`[otp2] ...`), sem as coordenadas da pessoa. Para testar no navegador, use `npx expo start --web`. Nunca coloque `DATABASE_URL` nem outro segredo em `EXPO_PUBLIC_*`. O modo `api` para trajetos depende de alinhar o contrato com o backend (PL-18).

### Teste de ponta a ponta, opcional

`scripts/e2e-exposicao-real.mjs` testa a cadeia real: roteamento no OTP2, variações de caminhada e exposição estimada no Neon. Ele usa o código do app, cria um usuário descartável e deve rodar **só na branch `dev` do Neon**. O modo de uso está no começo do arquivo.

## Verificação

| Verificação | Comando |
|---|---|
| Tipos | `npx tsc --noEmit` |
| Lint | `npx eslint src` |
| Testes | `npx jest --runInBand` |
| Dependências Expo | `npx expo-doctor` |
| Exportação | `npx expo export --platform web` ou `--platform android` |

Rodada de 19/11/2026: TypeScript e ESLint sem erros e **857 testes em 63 suítes** passando. A arquitetura está em [ARQUITETURA.md](./ARQUITETURA.md) e as pendências em [todo-mobile.md](./todo-mobile.md). No espelho os dois ficam neste repositório; no monorepo, em `src/mobile-app/`.

## Evidências para a entrega

- **Prints das telas:** pendentes; serão incluídos após a validação visual no aparelho.
- **Vídeo de até 3 minutos:** pendente; link a acrescentar depois da gravação.
- **Registro de uso de IA:** [prompts.md](../../prompts.md).

Prazo da GS: **19/11/2026, 23h55**. O envio no Teams cabe a um integrante da equipe.
