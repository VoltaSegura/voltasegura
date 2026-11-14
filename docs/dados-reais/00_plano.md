# Dados reais no app (B): plano consolidado

**Data:** 14/11/2026 · **Escopo:** só Mobile (D-27) · **Entrega:** 19/11 23h55; código congelado na noite de 18/11.
**Origem:** `01_inventario_e_contrato.md`, `02_roteamento.md`, `03_exposicao_neon.md` (analistas) + síntese do lead. Tudo `[HIPÓTESE]` até o Lucas decidir.

## 1. Em poucas linhas
1. O app precisa de **duas coisas reais**: (R) itinerários com geometria, do **OTP2 próprio** (já decidido, `docs/04` §6); (E) exposição estimada, da **SSP-SP jan–set/2026** carregada no **Neon**.
2. O `RespostaConsulta` atual exige mais que o OTP2 entrega (`caso`, `exposicao`, `categorias`, `panoramaMunicipal`). Nada disso pode ser derivado do roteamento nem inventado.
3. N, L, D, p-valor, estabilidade 50/100/150 m, cobertura e `caso` ficam **num serviço**, nunca no app (US-12 AC1). Recomendação: função SQL/PostGIS no Neon exposta como RPC autenticada (opção A do D3); se a Data API, o PostGIS ou a região não permitirem, API fina própria hospedada (opção E). Functions do Neon provavelmente não existem na região do projeto (sa-east-1).
4. Cabe até 18/11 com folga só o que **não depende de infraestrutura**: adaptador OTP2→`Rota`, validação do JSON em tempo de execução, esquema SQL, script de carga e testes. Ligar tudo de ponta a ponta depende de você rodar coisas.
5. Se qualquer etapa falhar até 17/11, a entrega segue **EXEMPLO** (honesto) e o relatório diz o que ficou real e o que não. Mock nunca vira "dado real".

## 2. O que o código já pode receber (sem você)
Ordem por dependência. Itens 1 a 4 não exigem decisão nem infraestrutura.

| # | Entrega | Onde | Estado |
|---|---|---|---|
| 1 | `mapearOtp2(resposta, entrada)`: puro, GraphQL do OTP2 → `Rota`/`Trecho` (ids, minutos, km, modo, linha, polyline 5, faixa do dia, focos de tempo e caminhada) + testes com fixture sintética | `src/services/otp2.ts` | a fazer |
| 2 | Validação do JSON da API antes do cast (falha de formato vira `INDISPONIVEL`, nunca número inventado) | `src/services/consulta.ts`, `validar.ts` | a fazer |
| 3 | Esquema SQL (`ssp_boletim`, `ssp_cobertura`, `ssp_panorama`), índices GiST, função de exposição por rota, testes SQL em arquivo | `scripts/sql/` | a fazer (só escrever) |
| 4 | Script de carga do XLSX (streaming, hash, contagens, deduplicação por boletim) | `scripts/importar-ssp.py` | a fazer (só escrever) |
| 5 | Rodar T12 do OTP2 no seu notebook e anotar medidas | você | bloqueia o resto |
| 6 | Provar no `dev`: região, PostGIS, Data API, RPC com JWT | você + eu | bloqueia o resto |
| 7 | Carga no `dev`, relatório de cobertura, RPC testada | você + eu | depende de 6 |
| 8 | Ligar o app (OTP2 + RPC) e testar no celular | você + eu | depende de 5 a 7 |

## 3. Decisões que são suas
| # | Decisão | Recomendação `[HIPÓTESE]` |
|---|---|---|
| B1 | Onde calcula N/L/D, p, estabilidade, caso | No **serviço** (SQL no Neon ou API fina), nunca no aparelho; a US-12 AC1 fica como está |
| B2 | Opção A (RPC pela Data API) ou E (API própria) | Tentar A no `dev` primeiro; cair para E se PostGIS, Data API ou isolamento falharem |
| B3 | OTP2 só no seu notebook (Wi-Fi) ou hospedado | Notebook até a demonstração; hospedar só se medir RAM e sobrar tempo |
| B4 | HTTP puro nos aparelhos (Android/iPhone) | Testar `fetch` em cada aparelho; se barrar, HTTPS ou túnel |
| B5 | Regra de supressão de contagens pequenas (US-19/US-20) | Sem contagem fina até revisão; panorama só do município inteiro |
| B6 | Janela de dados | Manter jan–set/2026 (nove meses), dizendo isso na tela |
| B7 | Prazo de corte | Sem itinerário com geometria até 16/11, ou sem adaptador no aparelho até 17/11: congelar em EXEMPLO e usar 18/11 para o relato |
| B8 | Autenticação da consulta | Provar JWT do Neon Auth (`/token`) na chamada protegida antes de conectar a SSP; o cookie de sessão não serve como Bearer |

## 4. O que você executa (roteiro curto)
1. **Java 25**: `winget install EclipseAdoptium.Temurin.25.JDK`, reabrir o PowerShell, `java -version`.
2. **OTP2**: seguir `scripts/otp2/README.md` (JAR 2.10.0, `preparar_dados.py`, montar grafo com `-Xmx10G`, servir). Anotar RAM, tempo, tamanho do grafo e latência na tabela do README.
3. **Rede**: IPv4 do Wi-Fi (`ipconfig`), regra de entrada TCP 8080 só em rede privada, abrir `http://IP:8080/graphiql` no celular. O OTP2 precisa escutar na LAN, não só em `localhost`.
4. **Neon (dev)**: conferir no console a **região** do projeto, plano/cotas, e se existem PostGIS e Data API. Não mexer na `production`.
5. Me avisar o resultado de 2 a 4. Com isso eu fecho os itens 6 a 8.

Nada disso é executado por mim sem você: baixa arquivos grandes, abre porta no firewall e consome cota do Neon.

## 5. Riscos principais
- OTP2 em 16 GB de RAM com o recorte de SP: medir antes de prometer.
- Região sa-east-1 sem Functions e talvez sem Data API: muda B2.
- `exposicao` e `categorias` não vêm do roteamento: sem a carga SSP validada, a resposta real é `INDISPONIVEL` para esses blocos e a tela deve dizer isso.
- Trecho que atravessa meia-noite não cabe em um só `faixaDoDia`: o serviço divide o trecho para a conta.
- Licença/redistribuição do GTFS e crédito OSM: confirmar antes de publicar.

## 6. Linguagem
Continua valendo `docs/05`: "exposição estimada", confiança dos dados separada, nada de "rota segura", "perigoso" ou nota. Dados reais não mudam isso.
