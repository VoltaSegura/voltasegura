# Publicar a entrega de SOA

[DECISÃO] Os arquivos foram preparados e verificados localmente. Nenhum commit, push ou envio ao portal foi feito pelo assistente.

## 1. Conferir a demonstração

Na raiz do monorepo ou do pacote extraído, abrir o PowerShell:

```powershell
cd src/csharp-backend
powershell -ExecutionPolicy Bypass -File scripts/preparar-demo.ps1
powershell -ExecutionPolicy Bypass -File scripts/iniciar-soa.ps1
```

Abrir http://localhost:5031/swagger e seguir a demonstração do [README](README.md). A restauração exige internet e SDK/runtime .NET 8. Não precisa de OTP2, Python ou planilha SSP. As rotas são simuladas e os 80 registros são fictícios, identificados na resposta.

## 2. Publicar a fonte da verdade

No GitHub Desktop, selecionar o repositório `VoltaSegura/voltasegura`, revisar as alterações e criar um commit, por exemplo `fix: regulariza demonstração e entrega de SOA`. Publicar a branch e integrar à branch usada pelo grupo conforme o fluxo habitual.

Os bancos, binários e pacotes em `output/` estão ignorados. Os arquivos de código, migrações, documentação e evidências devem entrar no commit.

## 3. Atualizar o espelho de SOA

O pacote `output/entregas/soa-backend.zip` contém uma pasta `soa-backend`. Clonar ou abrir [VoltaSegura/soa-backend](https://github.com/VoltaSegura/soa-backend) no GitHub Desktop e copiar **o conteúdo interno dessa pasta** para a raiz do clone, mantendo sua pasta `.git`. Revisar o diff e fazer commit/push.

Na raiz do GitHub devem aparecer `README.md`, `prompts.md`, `docs/` e `src/`, com `src/csharp-backend/VoltaSegura.sln` presente. Não colocar o ZIP como único arquivo de entrega nem criar uma pasta adicional envolvendo tudo. Se o clone já tiver mudanças de outro integrante, conciliá-las antes da cópia.

Também foi preparado `output/entregas/csharp-backend.zip` para [VoltaSegura/csharp-backend](https://github.com/VoltaSegura/csharp-backend), porque as duas APIs compartilham a solution. Seu uso não substitui a conferência dos demais critérios da disciplina C#; o foco desta regularização foi SOA.

Para sincronizações posteriores, o script `scripts/sync_mirrors.sh` do monorepo foi ajustado para incluir a solution compartilhada. Ele pode publicar todos os espelhos configurados; revisar seu escopo antes de executar. Não é necessário executá-lo para publicar os pacotes acima.

## 4. Enviar a tarefa

1. Abrir o repositório SOA no GitHub e conferir código, equipe/RMs, README e `src/soa-backend/evidencias/`.
2. Garantir acesso do professor ao repositório privado.
3. Um integrante envia o link do repositório na tarefa de SOA até **19/11/2026, 23h55**.

[EM ABERTO] Publicação e envio dependem do grupo. A integração com OTP2 ao vivo e a carga SSP real não foram validadas nesta regularização; as evidências comprovam a demonstração identificada como fictícia.
