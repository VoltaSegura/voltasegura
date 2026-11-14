# Imagens do app (placeholders)

Hoje todos os espaços mostram um degradê com ícone. Para trocar por uma foto:

1. Salve o arquivo nesta pasta (JPG ou PNG; até ~300 KB cada, para o app não pesar).
2. Em `src/theme/imagens.ts`, troque `null` por `require('../../assets/imagens/ARQUIVO.jpg')`.

| Chave | Onde aparece | Proporção sugerida | O que mostrar |
|---|---|---|---|
| `heroAbertura` | Abertura (TL-01), tela cheia | 9:16 (1080x1920) | Cidade à noite, rua iluminada, sem rostos nem placas legíveis |
| `heroEntrar` | Topo da tela Entrar | 16:9 (1080x600) | Mesma família da abertura |
| `heroCriarConta` | Topo da tela Criar conta | 16:9 | Idem |
| `heroPlanejar` | Topo da home (Planejar) | 16:9 | Cidade, ponto de ônibus ou estação ao anoitecer |
| `localCasa` | Cartão do local salvo "Casa" | 4:3 (800x600) | Fachada/rua residencial genérica |
| `localTrabalho` | Cartão "Trabalho" | 4:3 | Prédio comercial genérico |
| `localEstudo` | Cartão "Estudo" | 4:3 | Campus/escola genérico |
| `localOutro` | Cartão de outros locais | 4:3 | Pin/mapa genérico |
| `vazioLocais` | Estado "nenhum local salvo" | 4:3 | Ilustração de mapa com pin |

Regras: sem pessoas reconhecíveis, sem placas ou endereços legíveis, sem imagem que sugira que um lugar é "seguro" ou "perigoso" (`docs/05_regras_linguagem_etica.md`). Confirme a licença da imagem antes de usar.
