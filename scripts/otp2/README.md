# Roteiro — teste local do OpenTripPlanner 2

Executor: **Lucas Simidu** (assumiu em 11/11/2026). Tarefa: `TODO.md` T12; checklist em `docs/04` §6.2.

**Objetivo:** subir o OTP2 na máquina local com o grafo de São Paulo, medir memória e tempo e rodar o teste 1 (trabalho → FIAP às 18h; FIAP → casa por volta das 23h). O resultado esperado é a **geometria dos trechos a pé** de cada alternativa, que alimenta a regra de `docs/08`.

O OTP2 é um programa Java que roda como servidor local. Ninguém precisa programar em Java: os scripts deste roteiro são em Python e falam com o servidor por HTTP.

Versões verificadas em 11/11/2026: **OTP 2.10.0**, que pede **Java 25** (a documentação oficial diz "compatible with Java 25 or later"; o `docs/04` falava em Java 21, o que ficou desatualizado).

---

## Passo 1 — Instalar o Java 25 (uns 5 minutos)

No PowerShell:

```powershell
winget install EclipseAdoptium.Temurin.25.JDK
```

Feche e reabra o terminal e confira com `java -version`. Deve aparecer `25.x`. O Java 8 que já existe na máquina pode continuar instalado. Se `java -version` ainda mostrar 1.8, use o caminho completo nos comandos abaixo, por exemplo `& "C:\Program Files\Eclipse Adoptium\jdk-25*\bin\java.exe"`, ou coloque essa pasta no início do `PATH`.

## Passo 2 — Baixar o OTP2

```powershell
cd scripts/otp2
New-Item -ItemType Directory -Force dados
curl.exe -L -o dados/otp-shaded-2.10.0.jar https://repo1.maven.org/maven2/org/opentripplanner/otp-shaded/2.10.0/otp-shaded-2.10.0.jar
```

## Passo 3 — Baixar e preparar os dados

```powershell
pip install -r scripts/otp2/requirements.txt
python scripts/otp2/preparar_dados.py
```

O script:

1. baixa o GTFS da SPTrans (~15 MB; inclui Metrô e CPTM, `docs/04` §2.1);
2. baixa o OpenStreetMap do Sudeste da Geofabrik (~860 MB);
3. recorta o OSM pelo retângulo do município de São Paulo e grava `dados/sao-paulo.osm.pbf`. Isso leva alguns minutos.

Depois do recorte, o `sudeste-latest.osm.pbf` pode ser apagado. Para atualizar só o GTFS: `python scripts/otp2/preparar_dados.py --so-gtfs` (apague o `.zip` antigo antes).

Os nomes dos arquivos importam: o OTP2 reconhece o GTFS por ter `gtfs` no nome e o OSM pela extensão `.pbf`. A pasta `dados/` deve ficar só com esses dois arquivos de entrada e o `.jar`.

## Passo 4 — Montar o grafo (anotar tempo e memória)

```powershell
cd scripts/otp2/dados
Measure-Command { java -Xmx10G -jar otp-shaded-2.10.0.jar --build --save . | Out-Default }
```

- `-Xmx10G` permite ao OTP usar até 10 GB dos 16 GB da máquina. Se der `OutOfMemoryError`, feche outros programas e tente `-Xmx12G`. Anote o valor que funcionou.
- Enquanto roda, acompanhe a memória do processo `java` no Gerenciador de Tarefas e anote o **pico**.
- No fim, `Measure-Command` mostra o **tempo total**. Anote também o tamanho do `graph.obj` gerado.

## Passo 5 — Subir o servidor

```powershell
cd scripts/otp2/dados
java -Xmx10G -jar otp-shaded-2.10.0.jar --load .
```

Espere aparecer a mensagem de que o servidor está pronto e deixe esse terminal aberto. Teste no navegador:

- `http://localhost:8080/`: mapa de depuração do OTP; dá para clicar origem e destino e ver as rotas;
- `http://localhost:8080/graphiql`: console da API GraphQL (`/otp/gtfs/v1`), útil se a consulta do script der erro.

Anote a memória do `java` com o servidor parado, sem consultas.

## Passo 6 — Rodar o teste 1

1. Copie `pontos.exemplo.json` para `pontos.local.json` (este fica fora do git).
2. Preencha origem e destino de cada trajeto com **pontos de referência aproximados**, como uma esquina próxima, no formato `[latitude, longitude]`. Para obter as coordenadas: clique com o botão direito no Google Maps e copie o primeiro item. **Não use o endereço exato** (`docs/05` e decisão de 11/11 em `docs/06`).
3. Em outro terminal, com o servidor do passo 5 aberto:

```powershell
python scripts/otp2/consultar_teste.py
```

O padrão é o próximo dia útil e 3 alternativas por trajeto. Para mudar: `--data 2026-11-12 --alternativas 5`.

Saídas em `dados/saida/` (fora do git, porque têm coordenadas perto de casa e do trabalho):

- `<trajeto>.resposta.json`: resposta completa do OTP2;
- `<trajeto>.trechos_a_pe.geojson`: uma linha por trecho a pé, com alternativa, distância, horários e **período da SSP** (madrugada 0–5h, manhã 6–11h, tarde 12–17h, noite 18–23h). Um trecho que atravessa a meia-noite aparece como `noite/madrugada`. Dá para abrir o arquivo em `geojson.io` para conferir no mapa, mas o site recebe as coordenadas; prefira o mapa local do OTP ou o QGIS.

## Passo 7 — O que conferir e anotar

Preencher e devolver ao grupo (vai para `docs/04` §6.2 e `TODO.md` T12):

| Item | Resultado |
|---|---|
| `java -version` usado | |
| Memória (`-Xmx`) que funcionou na montagem | |
| Pico de memória na montagem | |
| Tempo de montagem do grafo | |
| Tamanho do `graph.obj` | |
| Memória do servidor parado | |
| Tempo de resposta de uma consulta (aprox.) | |
| Ida: nº de alternativas, modos, a pé (m) | |
| Volta: nº de alternativas, modos, a pé (m) | |
| Os trechos a pé têm geometria? (sim/não) | |
| Baldeações e horários plausíveis? | |
| Algum trecho a pé da volta caiu na madrugada? | |
| Problemas encontrados | |

Pontos de atenção:

- **Metrô 6 e 17**: no feed só operam de dia (`docs/04` §5); é esperado que não apareçam às 18h ou 23h.
- **Horários vêm de intervalos** (`frequencies.txt`), então são estimativas da programação, não horários exatos.
- Se a consulta das 23h não devolver nada, teste 22h para descobrir se é falta de serviço ou erro de configuração.
- **Licença do OSM (ODbL)**: qualquer mapa ou dado derivado mostrado no pitch ou no app precisa do crédito "© OpenStreetMap contributors".

## Arquivos

| Arquivo | Vai para o git? |
|---|---|
| `README.md`, `preparar_dados.py`, `consultar_teste.py`, `requirements.txt`, `pontos.exemplo.json` | sim |
| `pontos.local.json`, `dados/` (jar, GTFS, OSM, `graph.obj`, `saida/`) | **não** (`.gitignore`) |
