# Sistema de Credenciais — Vigilância Sanitária

Emissão automatizada de credenciais funcionais da **Vigilância Sanitária da Prefeitura Municipal de Taguatinga/TO**.

Um único comando gera **QR Code**, **página de validação online** e **PDF do crachá pronto para a gráfica** (formato CR80, com sangria e marcas de corte).

> **100% gratuito e sem dependências externas.** Não usa banco de dados, Firebase, Supabase, API paga nem framework. Apenas Node.js, HTML, CSS, JavaScript e duas bibliotecas de código aberto (`qrcode` e `pdfkit`).

---

## Índice

1. [Como funciona](#1-como-funciona)
2. [Instalação](#2-instalação)
3. [Comandos](#3-comandos)
4. [Cadastrar um funcionário](#4-cadastrar-um-funcionário)
5. [Fotos dos servidores](#5-fotos-dos-servidores)
6. [Gerar QR Codes e PDFs](#6-gerar-qr-codes-e-pdfs)
7. [Publicar no GitHub Pages](#7-publicar-no-github-pages)
8. [Alterar o usuário do GitHub](#8-alterar-o-usuário-do-github)
9. [Enviar para a gráfica](#9-enviar-para-a-gráfica)
10. [Estrutura do projeto](#10-estrutura-do-projeto)
11. [Campos do funcionário](#11-campos-do-funcionário)
12. [Personalização visual](#12-personalização-visual)
13. [Solução de problemas](#13-solução-de-problemas)

---

## 1. Como funciona

```
dados/funcionarios.json          (fonte única de dados)
            │
            ▼   npm run gerar
   ┌────────┴─────────┬──────────────────┬────────────────────┐
   ▼                  ▼                  ▼                    ▼
qrcodes/*.png    pdf/*.pdf        dados/funcionarios.js    index.html
(300x300, H)     (CR80 frente     (espelho para uso        (resumo da
                  e verso)         offline via file://)     geração)
```

Ao escanear o QR Code, qualquer celular (Samsung, Motorola, Xiaomi, Realme, LG, iPhone, Poco…) abre:

```
https://SEU_USUARIO.github.io/credencial-vigilancia/verificar.html?id=000001
```

A página `verificar.html` — **uma só página para todos os servidores** — lê o `?id=` da URL, localiza o registro em `dados/funcionarios.json` e monta a credencial na tela.

---

## 2. Instalação

Pré-requisito: **Node.js 18 ou superior** ([nodejs.org](https://nodejs.org)).

```bash
npm install
```

Verifique a instalação:

```bash
node --version
```

---

## 3. Comandos

| Comando | O que faz |
| --- | --- |
| `npm run gerar` | Executa todo o pipeline: valida a base, gera QR Codes, atualiza JSON/HTML e produz os PDFs. |
| `npm run cadastrar` | Cadastro guiado de um novo servidor pelo terminal, com validação de CPF e datas. |
| `npm start` | Sobe um servidor local em `http://localhost:4173` para testar como ficará no GitHub Pages. |
| `npm run dev` | Gera tudo e já abre o servidor local. |
| `npm run limpar` | Apaga apenas os artefatos gerados (QR Codes, PDFs e o espelho de dados). |

---

## 4. Cadastrar um funcionário

### Opção A — pelo terminal (recomendada)

```bash
npm run cadastrar
```

O assistente pergunta cada campo, sugere o próximo registro livre, valida o CPF pelos dígitos verificadores e, ao final, oferece rodar a geração completa.

### Opção B — pelo painel no navegador

```bash
npm start
```

Abra `http://localhost:4173`, preencha o formulário **“Cadastrar novo servidor”** e clique em **Gerar registro**. Você pode:

- **Copiar registro** — cole o bloco dentro da lista `funcionarios` em `dados/funcionarios.json`;
- **Baixar funcionarios.json completo** — substitua o arquivo em `dados/`.

Depois, execute `npm run gerar`.

### Opção C — editando o JSON

Abra `dados/funcionarios.json` e acrescente um objeto ao final da lista `funcionarios`:

```json
{
  "id": "000008",
  "nome": "Nome Completo do Servidor",
  "cpf": "000.000.000-00",
  "endereco": "Rua Exemplo, nº 100, Centro - Taguatinga/TO - CEP 77.295-000",
  "cargo": "Fiscal Sanitário",
  "vinculo": "Efetivo",
  "matricula": "000130",
  "status": "valida",
  "foto": "funcionarios/000008.jpg"
}
```

O campo `id` é o número que vai no QR Code (`?id=000008`) e deve ter **6 dígitos e ser único**.

---

## 5. Fotos dos servidores

- Coloque os arquivos na pasta `funcionarios/`, nomeados pelo registro: `000001.jpg`, `000002.jpg`…
- Formatos aceitos: **JPG ou PNG** (o PDFKit não lê WEBP, HEIC ou SVG).
- Proporção **3x4**; tamanho mínimo recomendado **480 × 600 px** — abaixo disso o gerador avisa que a foto não alcança 300 dpi no tamanho impresso.
- Se a foto não existir, o sistema **não quebra**: usa um avatar vetorial com as iniciais do servidor, tanto na página quanto no PDF.

---

## 6. Gerar QR Codes e PDFs

```bash
npm run gerar
```

Produz:

| Saída | Descrição |
| --- | --- |
| `qrcodes/000001.png` | PNG 300 × 300 px, correção de erro **H** (30%), margem de 2 módulos. |
| `pdf/000001.pdf` | Crachá individual: página 1 = frente, página 2 = verso. |
| `pdf/_todos-os-crachas.pdf` | Todos os crachás em sequência, no mesmo arquivo. |
| `pdf/_folha-impressao-A4.pdf` | Folha A4 com 10 cartões por página (2 × 5), pronta para impressão duplex. |
| `dados/funcionarios.js` | Espelho da base que faz as páginas funcionarem mesmo abertas via `file://`. |
| `index.html` | Bloco “Última geração” atualizado automaticamente. |

Para testar antes de publicar:

```bash
npm start
```

Depois abra `http://localhost:4173/verificar.html?id=000001`.
O terminal também mostra o endereço na rede local (ex.: `http://192.168.0.10:4173/`) — útil para escanear o QR Code com o celular ainda na fase de testes.

---

## 7. Publicar no GitHub Pages

1. Crie um repositório **público** chamado `credencial-vigilancia`.
2. Ajuste o seu usuário em `config.json` (veja o item 8) e rode `npm run gerar` novamente.
3. Envie os arquivos:

```bash
git init
git add .
git commit -m "Sistema de credenciais da Vigilância Sanitária"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/credencial-vigilancia.git
git push -u origin main
```

4. No GitHub: **Settings → Pages → Build and deployment**
   - *Source*: `Deploy from a branch`
   - *Branch*: `main` / `/ (root)` → **Save**
5. Aguarde 1–2 minutos. O endereço será:

```
https://SEU_USUARIO.github.io/credencial-vigilancia/
```

6. Teste escaneando um QR Code de `qrcodes/`.

> O arquivo `.nojekyll` já está incluído — ele é necessário para o GitHub Pages servir arquivos que começam com `_` (como `pdf/_todos-os-crachas.pdf`).

---

## 8. Alterar o usuário do GitHub

Edite **apenas uma linha** em `config.json`:

```json
{
  "githubUser": "SEU_USUARIO",
  "repositorio": "credencial-vigilancia"
}
```

E rode:

```bash
npm run gerar
```

Todos os QR Codes são regravados apontando para o novo endereço. **Nenhum outro arquivo precisa ser alterado.**

Se você usa domínio próprio (ex.: `credencial.taguatinga.to.gov.br`), preencha:

```json
"baseUrlPersonalizada": "https://credencial.taguatinga.to.gov.br"
```

Esse campo tem prioridade sobre `githubUser`.

---

## 9. Enviar para a gráfica

Especificação técnica dos PDFs gerados:

| Item | Valor |
| --- | --- |
| Formato | **CR80 / ISO 7810 ID-1** — 85,60 × 53,98 mm |
| Sangria (bleed) | 3 mm em cada lado (página final: 91,60 × 59,98 mm) |
| Margem de segurança | 3 mm a partir da linha de corte |
| Marcas de corte | Sim, desenhadas na área de sangria |
| Resolução | Conteúdo vetorial (resolução infinita); foto e QR Code em 300 dpi ou mais |
| Cores | RGB — peça ao fornecedor a conversão para CMYK no RIP, se necessário |
| Páginas | Ímpares = frente, pares = verso |

**O que enviar:**

- Impressão em cartão PVC (uma peça por vez): `pdf/000001.pdf`, `pdf/000002.pdf`…
- Impressão em lote: `pdf/_todos-os-crachas.pdf`
- Impressão própria em papel/adesivo A4: `pdf/_folha-impressao-A4.pdf`
  *Duplex com virada pela borda longa — as colunas do verso já vão invertidas para casar com a frente.*

Ajuste a sangria e as marcas de corte, se a gráfica pedir outro padrão, em `templates/credencial.template.json`.

---

## 10. Estrutura do projeto

```
credencial-vigilancia/
├── assets/
│   ├── css/
│   │   ├── base.css              Reset, tokens de design e utilitários
│   │   ├── credencial.css        Documento oficial exibido na validação
│   │   └── painel.css            Painel administrativo
│   ├── js/
│   │   ├── core.js               Namespace VS e constantes
│   │   ├── format.js             Formatação (CPF, datas, iniciais) — usado no navegador E no Node
│   │   ├── icones.js             Brasão, selos e ícones em SVG inline
│   │   ├── dados.js              Carregamento da base (fetch + fallback file://)
│   │   ├── credencial.js         Componente visual da credencial
│   │   ├── verificar.js          Controlador de verificar.html
│   │   └── painel.js             Controlador de index.html
│   └── img/                      Imagens adicionais (opcional)
├── dados/
│   ├── funcionarios.json         FONTE ÚNICA DE DADOS
│   └── funcionarios.js           Espelho gerado automaticamente
├── funcionarios/                 Fotos 3x4 (000001.jpg, 000002.jpg…)
├── gerador/
│   ├── index.js                  npm run gerar — orquestrador do pipeline
│   ├── cadastrar.js              npm run cadastrar
│   ├── limpar.js                 npm run limpar
│   ├── servidor.js               npm start
│   └── lib/
│       ├── config.js             Caminhos, medidas e leitura de configuração
│       ├── log.js                Saída colorida no terminal
│       ├── dados.js              Normalização e validação da base
│       ├── qrcode.js             Geração dos PNGs
│       ├── desenho.js            Primitivas vetoriais (brasão, avatar, marcas de corte)
│       ├── pdf.js                Layout do crachá (frente, verso, lote, folha A4)
│       └── html.js               Atualização do index.html e do espelho de dados
├── pdf/                          PDFs gerados
├── qrcodes/                      QR Codes gerados
├── templates/
│   └── credencial.template.json  Medidas, cores e tipografia do crachá
├── config.json                   Usuário do GitHub e textos institucionais
├── index.html                    Painel administrativo
├── verificar.html                Página única de validação
├── .nojekyll                     Necessário para o GitHub Pages
├── package.json
└── README.md
```

---

## 11. Campos do funcionário

| Campo | Obrigatório | Observação |
| --- | --- | --- |
| `id` | Sim | 6 dígitos, único. É o `?id=` do QR Code. |
| `nome` | Sim | Nome completo. |
| `cpf` | Sim | Gravado completo; **exibido mascarado** (`817.***.***-34`). |
| `endereco` | Não | Endereço residencial. |
| `cargo` | Sim | Cargo ou função. |
| `vinculo` | Não | Efetivo, Comissionado, Contratado, Cedido… |
| `matricula` | Sim | Matrícula funcional. |
| `status` | Sim | `valida` ou `revogada`. |
| `foto` | Não | Caminho do arquivo. Padrão: `funcionarios/<id>.jpg`. |

**Situação exibida na validação:**

| Situação | Quando ocorre | Cor |
| --- | --- | --- |
| CREDENCIAL VÁLIDA | Status `valida` | Verde |
| CREDENCIAL REVOGADA | Status `revogada` | Vermelho |
| CREDENCIAL NÃO ENCONTRADA | `id` inexistente na base | Vermelho |

Para exibir o CPF completo, mude em `config.json`:

```json
"credencial": { "mascararCPF": false }
```

---

## 12. Personalização visual

| O que mudar | Onde |
| --- | --- |
| Textos institucionais e rodapé | `config.json` → `orgao` e `credencial` |
| Cores, fontes e medidas do crachá impresso | `templates/credencial.template.json` |
| Cores e espaçamentos das páginas web | `assets/css/base.css` → bloco `:root` |
| Brasão / marca | `assets/js/icones.js` (web) e `gerador/lib/desenho.js` (PDF) |
| Layout da credencial na tela | `assets/js/credencial.js` |

Paleta institucional padrão: azul `#0B3C8C`, verde `#16A34A`, âmbar `#D97706`.

---

## 13. Solução de problemas

| Sintoma | Causa e solução |
| --- | --- |
| QR Code abre "CREDENCIAL NÃO ENCONTRADA" | O `id` não existe em `dados/funcionarios.json`, ou o `npm run gerar` não foi executado depois do cadastro. |
| QR Code aponta para `SEU_USUARIO` | Falta trocar `githubUser` em `config.json` e rodar `npm run gerar` de novo. |
| Página em branco no GitHub Pages | Aguarde 2 minutos após o push e confira em *Settings → Pages* se a branch é `main` / root. |
| "foto ausente" no terminal | O arquivo não está em `funcionarios/` com o nome do registro. O crachá sai com o avatar de iniciais. |
| "CPF não passa na validação" | Aviso, não erro. Confira os dígitos verificadores do CPF digitado. |
| Foto sai serrilhada no PDF | Imagem menor que 480 × 600 px. Substitua por uma de maior resolução. |
| `EADDRINUSE` ao rodar `npm start` | Porta ocupada. Use `PORT=4174 npm start`. |
| Erro `Cannot find module 'pdfkit'` | Rode `npm install`. |
| Página abre pelo Explorer mas sem dados | Normal em `file://`. O espelho `dados/funcionarios.js` resolve — basta ter rodado `npm run gerar`. |

---

## Licença

MIT — livre para uso pela administração pública.

**Prefeitura Municipal de Taguatinga/TO — Vigilância Sanitária**
*Esta credencial é de uso pessoal e intransferível.*
