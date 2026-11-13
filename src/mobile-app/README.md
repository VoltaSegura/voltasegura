# VoltaSegura — App Mobile (React Native/Expo)

App do cidadão (estudante do período noturno): consulta rotas, compara alternativas e recebe informações com indicação de confiança.

> ⚠️ Em construção. **Esqueleto pronto (13/11/2026):** Expo SDK 58 + TypeScript + Expo Router, com a árvore de rotas de `docs/app-map/05_navegacao.md` e telas provisórias. Ainda faltam as telas reais, a camada de serviços `mock|api`, o banco local (SQLite) e a sessão no armazenamento seguro. A jornada principal segue o fluxo "Planejar → Analisar → Comparar → Decidir → Revisar (ida e volta)" do documento vivo.

## Como rodar

**Pré-requisitos**
- **Node.js 22.13 ou mais novo** (exigência do Expo SDK 58; com o Node 20 o CLI mostra um aviso e não há suporte).
- App **Expo Go** no celular (Android ou iOS), na mesma rede Wi-Fi do computador. Outra opção é um emulador Android.

**Passos**

```bash
cd src/mobile-app        # no espelho de entrega, a pasta é a mesma
npm install
cp .env.example .env     # opcional: o padrão é o modo mock
npm start                # abre o Metro; leia o QR code com o Expo Go
```

Outros comandos:

| Comando | O que faz |
|---|---|
| `npm run android` / `npm run web` | Abre direto no emulador Android / no navegador |
| `npm run lint` | ESLint (`eslint-config-expo`) |
| `npm run typecheck` | TypeScript sem gerar arquivos |
| `npx expo-doctor` | Confere dependências e configuração do Expo |

**Variáveis de ambiente** (`.env`, ver `.env.example`):
- `EXPO_PUBLIC_API_MODE`: `mock` (padrão, com dados de exemplo rotulados) ou `api`.
- `EXPO_PUBLIC_API_URL`: endereço do backend no modo `api`. No celular, use o IP da máquina na rede local (`localhost` não funciona). No emulador Android, use `http://10.0.2.2:<porta>`.

Estrutura e decisões técnicas: [`ARQUITETURA.md`](./ARQUITETURA.md). Status e progresso do desenvolvimento: [`todo-mobile.md`](./todo-mobile.md).

## Requisitos do README da disciplina (neste app)

1. Ficha da CitizenTech — **copiar no corpo deste README**, não apenas linkar (PDF p. 34: "O README com a Ficha da CitizenTech" — como o espelho de entrega é um repo separado, o link para fora pode não ser lido pelo professor);
2. Instruções para rodar o app; ✅ (seção acima)
3. Prints das telas;
4. Link do vídeo de até 3 min.

## Cuidados

- Acessibilidade: contraste, letras legíveis, linguagem simples (o cidadão real não é especialista).
- Nunca rotular territórios; usar linguagem de `docs/05_regras_linguagem_etica.md`.
