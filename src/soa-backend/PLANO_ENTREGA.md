# SOA — diagnóstico e passo a passo de entrega

> **Registro histórico, anterior às correções.** A regularização técnica posterior está descrita no [README atual](README.md) e nas [evidências](evidencias/README.md). A demonstração usa carga sintética e mock identificados; a implantação OTP e a carga SSP reais permanecem fora da verificação local. As pendências abaixo representam o diagnóstico inicial, não uma lista atualizada de trabalho restante.

Data: 18/11/2026. Prazo oficial: 19/11/2026, 23h55 (São Paulo).

Pedido: conferir a implementação contra a página 27 do PDF `GS CitizenTech - 3ES Fev - FIAP 2026 -  (1).pdf` e explicar o que falta. Esta revisão não implementa as correções nem publica no GitHub.

## 1. Resultado da verificação

`[DECISÃO existente]` A entrega usa a solution de `../csharp-backend/`, com domínio e infraestrutura compartilhados. A API SOA é `VoltaSegura.Servicos`. Não é necessário começar outro backend.

Evidências executadas nesta revisão:

- `dotnet build VoltaSegura.sln --no-restore --nologo --verbosity minimal`: solution compilada, zero erros e zero avisos nessa execução.
- `dotnet test VoltaSegura.sln --nologo --verbosity minimal`: **20 aprovados, zero falhas, zero ignorados**. Houve aviso xUnit1013: `ComparacaoPontaAPontaTests` tem `Dispose()`, mas não implementa `IDisposable`.
- Ambiente usado: SDK 10.0.303 com runtime .NET 8.0.30; projetos direcionados a `net8.0`.
- Não foram executados nesta revisão: migrações em banco novo, API por HTTP, importação SSP, conexão OTP2, sincronização remota ou envio no Teams.
- O banco `src/csharp-backend/dados/voltasegura.db` e a planilha `utils/ssp/SPDadosCriminais_2026.xlsx` **não existem nesta cópia**. Isso não invalida as cargas históricas registradas pelo grupo em outra máquina.
- O Git remoto local aponta para `https://github.com/VoltaSegura/voltasegura.git`. Conteúdo e permissões atuais do espelho remoto não foram inspecionados.

## 2. Rubrica e pendências

| Critério oficial | Peso | Evidência existente | O que falta conferir/concluir |
|---|---:|---|---|
| Estruturação do domínio | 3,0 | Entidades, interfaces, avaliador, teste binomial, estabilidade | Corrigir divergências de cálculo descritas abaixo; explicar as responsabilidades no README |
| Banco de dados | 3,0 | EF Core + SQLite, repositório, gravação de auditoria, ETL SSP | Criar o banco nesta máquina e demonstrar leitura/escrita persistente via API |
| Migrações | 1,5 | `20261112030004_MigracaoInicial` e snapshot versionados | Aplicar em banco novo; verificar tabelas e `__EFMigrationsHistory` |
| Documentação automática | 1,5 | Swagger registrado no serviço | Abrir `/swagger`, conferir os três endpoints e registrar evidência |
| Testes automatizados | 1,0 | 20 testes passaram nesta revisão | Guardar resultado reproduzível e acrescentar testes das correções e da API/migração |

`[EM ABERTO]` Entregáveis: nomes da equipe, README correto e completo, evidências, empacotamento do código completo no GitHub e acesso do professor. A página 27 pede **link do GitHub**; não explicita vídeo próprio de SOA, hospedagem pública, linguagem específica, SOAP ou CRUD completo. Isso não elimina os requisitos de funcionamento e integração com a proposta.

## 3. Pendências prioritárias

### A. Código completo no repositório de entrega

`[EM ABERTO — confirmado por leitura]` `scripts/sync_mirrors.sh` copia somente `src/$dir/`. Para `soa-backend`, copia o README e este plano, mas **não inclui `src/csharp-backend/`**, onde estão a solution e os projetos. O README promete uma cópia que o script atual não faz.

Como resolver antes da publicação:

1. No caso `soa-backend`, copiar também `src/csharp-backend/` para o mesmo caminho no espelho, preservando referências entre projetos.
2. Excluir da cópia `bin/`, `obj/`, bancos e caches gerados. O `.gitignore` atual não exclui `src/csharp-backend/dados/`; adicionar essa regra antes de gerar/publicar os dados locais. Copiar a pasta inteira com `rsync` não respeita automaticamente o `.gitignore`.
3. Corrigir os links do README raiz gerado: de lá, o código estará em `src/csharp-backend/`, e não em `../csharp-backend`.
4. Levar a Ficha completa e atual do README do monorepo. O texto gerado hoje ainda cita ODS 10 e público apenas universitário; a base vigente define ODS 11 e inclui trabalhadores noturnos.
5. Incluir o registro de uso de IA e a referência de dados necessária para reproduzir o ETL. O script atual deliberadamente não sincroniza `prompts.md`.
6. Testar um clone limpo do repositório que efetivamente será entregue.

Alternativa operacional, se necessário: a página 27 aceita link de repositório GitHub; o monorepo já contém o código. Entregar o monorepo completo é uma contingência possível, com README apontando claramente para SOA, sem afirmar que o espelho foi concluído. A escolha do grupo por espelhos permanece registrada.

### B. Correções do cálculo e do contrato

`[EM ABERTO — achados de leitura, ainda sem correção]` Os 20 testes atuais não cobrem estas divergências:

- **Corredor espacial:** `OcorrenciaRepositorio` mede distância aos pontos da geometria. Isso deixa lacunas entre vértices afastados; não equivale a distância ao trecho inteiro. Implementar distância ponto–segmento ou buffer da linha em projeção adequada; manter os trechos WALK separados para não criar linha fictícia sobre o percurso de ônibus. Ajustar também a margem de longitude do pré-filtro geográfico. Testar um BO perto do meio de um segmento longo e longe das pontas.
- **Coordenadas e faixa:** a cobertura testa latitude, mas não longitude; sem filtro de faixas, a contagem pode incluir BO sem período. Exigir latitude e longitude válidas e período utilizável conforme `docs/08`; preservar a ausência no denominador da cobertura. Testar longitude ausente e faixa nula.
- **`L = 0`:** o avaliador retorna `D = 0`. A especificação exige indicador não aplicável. Usar valor anulável/estado explícito e garantir ausência de destaque.
- **Limite estatístico:** a regra exige `p < 0,05`; o avaliador rejeita apenas `p > 0,05`. Ajustar para rejeitar também a igualdade.
- **Validação de entrada:** validar coordenadas, origem/destino distintos, início ≤ fim, faixas 1–4 e sentido permitido. Retornar erro 400 compreensível em vez de processar valores inválidos.

A cobertura por circunscrição é inferida a partir dos BOs próximos, e não da interseção com polígonos oficiais. Documentar essa aproximação; não apresentá-la como medição territorial exata.

### C. Roteamento e integração com o produto

`[EM ABERTO]` `Program.cs` registra `RoteadorMock`: as alternativas são simuladas. Identificar isso no README e na demonstração, mesmo quando as ocorrências forem reais.

O adaptador `Otp2Roteador` usa `/otp/routers/default/plan`. A API REST legada foi removida no OTP 2.8; portanto não basta descomentar a injeção de dependência para usar o OTP 2.10 do projeto. Fonte primária: [changelog oficial, versão 2.8](https://docs.opentripplanner.org/en/v2.10.0/Changelog/#280-2025-09-10).

Para concluir a integração real:

1. Adaptar o C# ao GraphQL usado em `src/mobile-app/src/services/otp2.ts` e `scripts/otp2/consultar_teste.py`.
2. Receber data/hora de saída com fuso e enviá-la ao roteador. Hoje `IRoteador` não recebe horário; o filtro `faixas` não substitui horário de viagem.
3. Preservar horários e geometrias por trecho; associar cada caminhada à faixa em que ocorre.
4. Comparar até cinco candidatas em pares, como em `docs/08`. Hoje o controller só usa `Take(2)`; uma única alternativa gera 503, em vez de resultado sem comparação.
5. Tratar indisponibilidade/tempo limite do OTP e informar a fonte do roteamento na resposta.
6. Testar o contrato com o app. A existência de código OTP no mobile não prova integração deste backend.

`[HIPÓTESE — recomendação para o prazo]` Primeiro fechar a demonstração reproduzível de SOA com as limitações declaradas; depois concluir a integração OTP. O PDF não cita OTP nominalmente, mas exige ligação com a proposta. Não há garantia de nota para uma demonstração limitada ao mock.

Autenticação, compartilhamento e contrato completo do mobile continuam pendências de integração, não critérios adicionais inventados para a rubrica de SOA. Não afirmar que estão implementados neste serviço. A API C# irmã tem persistência de trajetos; não usá-la como histórico de pessoas reais, pois isso conflita com a decisão de histórico apenas no aparelho.

## 4. Execução no Windows, passo a passo

### Passo 1 — Preparar ferramentas e compilar

Abrir PowerShell na pasta do backend:

```powershell
Set-Location 'C:\Users\ferna\Documents\GitHub\voltasegura\src\csharp-backend'
dotnet --list-sdks
dotnet --list-runtimes
dotnet restore VoltaSegura.sln
dotnet build VoltaSegura.sln --no-restore
dotnet test VoltaSegura.sln --no-restore
```

A documentação do projeto pede SDK .NET 8. Nesta máquina, SDK 10 + runtime 8 já compilaram e executaram os testes. Não é necessário trocar a linguagem nem migrar a versão-alvo para finalizar SOA.

### Passo 2 — Preparar a ferramenta de migrações

O `dotnet-ef` não apareceu na lista de ferramentas globais desta máquina. Preferir uma ferramenta local, versionada com o projeto:

```powershell
# Executar new tool-manifest apenas se ainda não existir manifesto local.
dotnet new tool-manifest
dotnet tool install dotnet-ef --version 8.0.11
```

Se o manifesto já existir, usar `dotnet tool restore`. A versão 8.0.11 corresponde às referências EF Core atuais. Incluir o manifesto no repositório.

### Passo 3 — Criar o banco com a migração existente

```powershell
New-Item -ItemType Directory -Force dados | Out-Null
$env:VOLTASEGURA_DB = Join-Path (Get-Location) 'dados\voltasegura.db'
dotnet ef migrations list --project VoltaSegura.Infrastructure --startup-project VoltaSegura.Servicos
dotnet ef database update --project VoltaSegura.Infrastructure --startup-project VoltaSegura.Servicos
```

Não criar outra migração inicial. O critério de pronto é a aplicação da migração existente, com as tabelas e uma linha em `__EFMigrationsHistory`. Reexecutar `database update` deve informar que o banco está atualizado. Os testes atuais usam `EnsureCreated()` em memória; eles não provam a aplicação das migrações.

### Passo 4 — Iniciar e demonstrar os endpoints

```powershell
dotnet run --project VoltaSegura.Servicos --launch-profile http
```

Abrir `http://localhost:5031/swagger`. A porta 5031 vem do perfil atual; o exemplo com porta 5000 no README está desalinhado.

No Swagger, executar:

1. `GET /api/dados/situacao`: banco recém-criado deve responder `carregado: false`.
2. `POST /api/comparacoes/trajetos`, com o JSON abaixo: deve responder com dados insuficientes enquanto o banco estiver vazio.
3. `GET /api/dados/auditoria`: deve conter o registro da consulta, sem origem, destino ou conta.
4. Parar e reiniciar a API, depois consultar auditoria novamente: comprovar persistência.

```json
{
  "origem": { "latitude": -23.5629, "longitude": -46.6544 },
  "destino": { "latitude": -23.5379, "longitude": -46.6295 },
  "sentido": "volta",
  "inicio": "2026-01-01",
  "fim": "2026-09-30",
  "faixas": [4]
}
```

Pontos de exemplo públicos, não endereços pessoais. As datas são o período dos BOs; não são a data de partida da viagem.

### Passo 5 — Demonstrar com a base SSP

Recuperar do grupo a planilha já auditada e colocá-la em `utils/ssp/SPDadosCriminais_2026.xlsx`, na raiz do monorepo. Conferir o SHA256 contra `src/ml/dados/README.md`. Se for outra versão, registrar versão/período/contagens; não reproduzir automaticamente os números históricos.

Com Python e pip disponíveis, na pasta `src/csharp-backend`:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install pandas openpyxl python-calamine pyarrow
.\.venv\Scripts\python.exe scripts/carga_ocorrencias.py
```

O ETL usa um caminho fixo para `dados/voltasegura.db`, não lê `VOLTASEGURA_DB`; por isso o passo 3 aponta exatamente para esse banco. Não usar `--force` sem intenção de apagar e recarregar as ocorrências.

Repetir os três endpoints. `carregado` deve passar a `true`; guardar contagem e período efetivamente retornados. Uma comparação ainda pode retornar dados insuficientes: não forçar destaque. A página de SOA não exige explicitamente dados reais como a de ML, mas este projeto já tem ETL real e essa é a demonstração mais coerente com o que o README anuncia.

### Passo 6 — Testar as correções e registrar evidências

Depois dos ajustes da seção 3, executar os testes novamente. Acrescentar testes que falhem com os defeitos encontrados, além de um teste de migração em SQLite novo e testes HTTP de comparação, validação e auditoria. Corrigir o aviso de descarte implementando `IDisposable` na classe de testes.

Criar `src/soa-backend/evidencias/` e guardar:

- captura do build e do resultado dos testes;
- aplicação da migração e tabela de histórico;
- Swagger com os endpoints;
- resposta de situação do acervo;
- requisição/resposta da comparação;
- auditoria antes/depois de reiniciar a API.

Os prints devem ser de execução real, com dados de exemplo na consulta. Guardar o relatório dos testes, se desejado:

```powershell
dotnet test VoltaSegura.sln --logger 'trx;LogFileName=soa.trx' --results-directory ../soa-backend/evidencias/testes
```

### Passo 7 — Fechar README e pacote GitHub

Preencher nomes completos dos integrantes (RMs se a tarefa da turma pedir). Atualizar a quantidade de testes, porta, instalação do EF, carga de dados, mapa da rubrica, limitações do mock e links para evidências. O README raiz do repositório entregue deve permitir execução sem depender de links relativos quebrados ou de arquivos não enviados.

Após corrigir o sync da seção 3A, em ambiente Bash com Git e rsync, na raiz do monorepo:

```bash
DRY_RUN=1 bash scripts/sync_mirrors.sh soa-backend
# Conferir os arquivos preparados antes de publicar.
bash scripts/sync_mirrors.sh soa-backend
```

Atenção operacional: o `DRY_RUN` atual faz clone/pull e copia arquivos no cache do espelho; apenas pula commit/push. O comando sem essa variável faz commit e push. Git Bash pode não trazer `rsync`; verificar `command -v rsync` ou usar o ambiente Linux/WSL que o grupo já utiliza. Não editar manualmente só o espelho: o próximo sync sobrescreve essas mudanças.

### Passo 8 — Conferência final e envio

`[EM ABERTO]` Clonar o repositório final em outra pasta, seguir o README do zero e conferir acesso do professor ao repositório privado. Enviar o link da raiz do repositório na tarefa de SOA, por um integrante, até **19/11/2026 às 23h55**. Guardar o comprovante e só então fechar T05/T18 com evidência.

## 5. Fontes da revisão

- PDF fornecido pelo usuário: página 27 (SOA), conferida em texto e imagem.
- `docs/01` a `docs/10`: regras, decisões, método e backlog; as decisões de produto não foram alteradas.
- `src/soa-backend/README.md`, `src/csharp-backend/README.md`, projetos Domain/Infrastructure/Servicos/Tests, migração e ETL.
- `scripts/sync_mirrors.sh`, `.gitignore`, `TODO.md`.
- Changelog oficial do OTP citado na seção 3C.
