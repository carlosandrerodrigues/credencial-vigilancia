# Sistema de Credenciais — Vigilância Sanitária

Emissão automatizada de credenciais funcionais da **Vigilância Sanitária da Prefeitura Municipal de Taguatinga/TO**.

Um único comando gera o **QR Code** de cada servidor e a **página de validação online** que aparece quando alguém escaneia esse QR Code pelo celular.

> **100% gratuito e sem dependências externas.** Não usa banco de dados, Firebase, Supabase, API paga nem framework. Apenas Node.js, HTML, CSS, JavaScript e uma biblioteca de código aberto (`qrcode`).

---

## Índice

1. [Como funciona](#1-como-funciona)
2. [Instalação](#2-instalação)
3. [Comandos](#3-comandos)
4. [Cadastrar um funcionário](#4-cadastrar-um-funcionário)
5. [Gerar os QR Codes](#5-gerar-os-qr-codes)
6. [Publicar no GitHub Pages](#6-publicar-no-github-pages)
7. [Alterar o usuário do GitHub](#7-alterar-o-usuário-do-github)
8. [Estrutura do projeto](#8-estrutura-do-projeto)
9. [Campos do funcionário](#9-campos-do-funcionário)
10. [Personalização visual](#10-personalização-visual)
11. [O que é público e o que não é](#11-o-que-é-público-e-o-que-não-é)
12. [Solução de problemas](#12-solução-de-problemas)

---

## 1. Como funciona

```
dados/<id>.json          (um arquivo por servidor — a base)
        │
        ▼   npm run gerar
   ┌────┴─────────────┬────────────────────┐
   ▼                  ▼                    ▼
qrcodes/<id>.png   dados/_painel.json   painel.html
(300x300, H)       (índice privado —    (resumo da
                    não publicado)       geração)
```

Cada servidor mora em seu próprio arquivo, nomeado pelo identificador dele:

```
dados/
├── if7zrn6l.json
├── g9c8vm7z.json
├── 1wamj2od.json
└── …
```

Ao escanear o QR Code, qualquer celular (Samsung, Motorola, Xiaomi, Realme, LG, iPhone, Poco…) abre:

```
https://SEU_USUARIO.github.io/credencial-vigilancia/verificar.html?id=if7zrn6l
```

A página `verificar.html` — **uma só página para todos os servidores** — lê o `?id=` da URL, busca **somente** `dados/<id>.json` e monta a credencial na tela.

É uma requisição só, e ela traz exatamente um servidor. Quem tem o QR Code de uma pessoa alcança o arquivo dela — e nada além.

### Os identificadores

São sorteados: 8 caracteres, letras minúsculas e números (`if7zrn6l`, `g9c8vm7z`).

Nunca sequenciais. Com `000001`, `000002`, `000003`, quem recebesse um único QR Code adivinharia os colegas trocando o número. Com 8 caracteres aleatórios são cerca de 2,8 trilhões de combinações.

**O identificador é permanente.** Depois de gerado, nunca mude: ele já está impresso nos crachás.

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
| `npm run gerar` | Executa todo o pipeline: valida a base, gera os QR Codes e atualiza o JSON e o HTML. |
| `npm run cadastrar` | Cadastro guiado de um novo servidor pelo terminal, com validação de CPF. |
| `npm start` | Sobe um servidor local em `http://localhost:4173`. O painel administrativo fica em `/painel.html`. |
| `npm run dev` | Gera tudo e já abre o servidor local. |
| `npm run limpar` | Apaga apenas os artefatos gerados (QR Codes e o índice). Não toca nos dados. |

---

## 4. Cadastrar um funcionário

### Opção A — pelo terminal (recomendada)

```bash
npm run cadastrar
```

O assistente pergunta cada campo, **sorteia o identificador**, valida o CPF pelos dígitos verificadores, grava `dados/<id>.json` e, ao final, oferece rodar a geração completa.

### Opção B — pelo painel no navegador

```bash
npm start
```

Abra `http://localhost:4173/painel.html`, preencha o formulário **“Cadastrar novo servidor”** e clique em **Gerar registro**. Você pode:

O identificador já vem sorteado no formulário. Depois:

- **Copiar registro** — cole em um arquivo novo;
- **Baixar o arquivo .json** — já vem com o nome certo.

Salve em `dados/` e execute `npm run gerar`.

### Opção C — criando o arquivo à mão

Crie `dados/<identificador>.json` com um único servidor dentro:

```json
{
  "id": "k91d8m2a",
  "nome": "Nome Completo do Servidor",
  "cpf": "000.000.000-00",
  "endereco": "Rua Exemplo, nº 100, Centro - Taguatinga/TO - CEP 77.295-000",
  "cargo": "Fiscal Sanitário",
  "vinculo": "Efetivo",
  "matricula": "000130",
  "status": "valida"
}
```

Duas regras que o gerador cobra:

1. O campo `id` tem de ser **igual ao nome do arquivo** (`k91d8m2a` ↔ `k91d8m2a.json`).
2. O identificador precisa ter **8 ou mais caracteres**, só letras minúsculas e números.

Se preferir não inventar, use o formulário do painel — ele sorteia para você.

> O bloco `meta` que aparece nos arquivos existentes é escrito pelo `npm run gerar`
> a partir do `config.json`. Não precisa criar, e não adianta editar à mão.

---

## 5. Gerar os QR Codes

```bash
npm run gerar
```

Produz:

| Saída | Descrição |
| --- | --- |
| `qrcodes/<id>.png` | PNG 300 × 300 px, correção de erro **H** (30%), margem de 2 módulos. |
| `dados/<id>.json` | Regravado normalizado, com os textos institucionais embutidos. |
| `dados/_painel.json` | Índice com todos os servidores, **só local** — ver item 11. |
| `painel.html` | Bloco “Última geração” atualizado automaticamente. |

O gerador varre a pasta `dados/`, valida cada arquivo e recusa a geração se algum
identificador estiver duplicado, malformado ou diferente do nome do arquivo.

Para testar antes de publicar:

```bash
npm start
```

Depois abra `http://localhost:4173/verificar.html?id=<identificador>` — o terminal imprime um exemplo pronto.
O terminal também mostra o endereço na rede local (ex.: `http://192.168.0.10:4173/`) — útil para escanear o QR Code com o celular ainda na fase de testes.

---

## 6. Publicar no GitHub Pages

1. Crie um repositório **público** chamado `credencial-vigilancia`.
2. Ajuste o seu usuário em `config.json` (veja o item 7) e rode `npm run gerar` novamente.
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

> O arquivo `.nojekyll` já está incluído — sem ele o GitHub Pages ignora arquivos e pastas que começam com `_`.

---

## 7. Alterar o usuário do GitHub

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

## 8. Estrutura do projeto

```
credencial-vigilancia/
├── assets/
│   ├── css/
│   │   ├── base.css              Reset, tokens de design e utilitários
│   │   ├── credencial.css        Documento oficial exibido na validação
│   │   └── painel.css            Painel administrativo
│   ├── js/
│   │   ├── core.js               Namespace VS e constantes
│   │   ├── format.js             CPF, datas e identificadores — navegador E Node
│   │   ├── icones.js             Selos de situação e ícones de campo em SVG inline
│   │   ├── dados.js              Busca de uma credencial (e do índice, no painel)
│   │   ├── credencial.js         Componente visual da credencial
│   │   ├── verificar.js          Controlador de verificar.html
│   │   └── painel.js             Controlador de painel.html
│   └── img/
│       └── logo.png              Brasão da prefeitura
├── dados/
│   ├── <id>.json                 UM ARQUIVO POR SERVIDOR — a base
│   └── _painel.json              Índice do painel — NÃO publicado (.gitignore)
├── gerador/
│   ├── index.js                  npm run gerar — orquestrador do pipeline
│   ├── cadastrar.js              npm run cadastrar
│   ├── limpar.js                 npm run limpar
│   ├── servidor.js               npm start
│   └── lib/
│       ├── config.js             Caminhos e leitura de configuração
│       ├── log.js                Saída colorida no terminal
│       ├── dados.js              Varredura, normalização e validação de dados/
│       ├── qrcode.js             Geração dos PNGs
│       └── html.js               Atualização do painel.html e do espelho de dados
├── qrcodes/                      QR Codes gerados
├── config.json                   Usuário do GitHub e textos institucionais
├── index.html                    Página pública da raiz (sem dados)
├── painel.html                   Painel administrativo — NÃO publicado (.gitignore)
├── verificar.html                Página única de validação
├── .nojekyll                     Necessário para o GitHub Pages
├── package.json
└── README.md
```

---

## 9. Campos do funcionário

| Campo | Obrigatório | Observação |
| --- | --- | --- |
| `id` | Sim | 8+ caracteres `[a-z0-9]`, único, **permanente**. É o `?id=` do QR Code e o nome do arquivo. |
| `nome` | Sim | Nome completo. |
| `cpf` | Sim | Gravado completo; **exibido mascarado** (`817.***.***-34`). |
| `endereco` | Não | Endereço exibido na credencial. |
| `cargo` | Sim | Cargo ou função. |
| `vinculo` | Não | Efetivo, Efetiva, Comissionado, Contratado, Cedido… |
| `matricula` | Sim | Matrícula funcional. |
| `status` | Sim | `valida` ou `revogada`. |

A credencial **não tem prazo de validade**: vale enquanto o `status` não for trocado para `revogada`.

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

## 10. Personalização visual

| O que mudar | Onde |
| --- | --- |
| Textos institucionais e rodapé | `config.json` → `orgao` e `credencial` |
| Cores e espaçamentos das páginas | `assets/css/base.css` → bloco `:root` |
| Aparência da credencial na tela | `assets/css/credencial.css` |
| Brasão / marca | `assets/img/logo.png` |
| Campos exibidos na credencial | `assets/js/credencial.js` |

Paleta institucional padrão: azul `#0B3C8C`, verde `#16A34A`, âmbar `#D97706`.

---

## 11. O que é público e o que não é

O GitHub Pages é hospedagem estática: **não existe login nem senha**. Tudo que
for publicado pode ser lido por qualquer pessoa que tenha o endereço.

Por isso o painel administrativo **não é publicado**. Ele está no `.gitignore`
e só roda na máquina do coordenador:

```bash
npm start
```

Depois abra `http://localhost:4173/painel.html`.

| Endereço | Publicado | Conteúdo |
| --- | --- | --- |
| `/` | Sim | Página institucional. Sem lista, sem dados, sem formulário. |
| `/verificar.html?id=<id>` | Sim | Uma credencial por vez, com CPF mascarado. |
| `/dados/<id>.json` | Sim | **Um** servidor. Só alcança quem já souber o identificador. |
| `/dados/_painel.json` | **Não** | O índice com todos. Só local. |
| `/painel.html` | **Não** | Lista de servidores e cadastro. Só local. |

> **Aviso.** Não existe mais uma lista pública para baixar de uma vez, mas cada
> `dados/<id>.json` continua sendo um arquivo público: quem tiver o
> identificador lê nome, CPF mascarado, endereço, cargo e matrícula daquela
> pessoa — o mesmo que ela já mostra no crachá. O que os identificadores
> sorteados impedem é **descobrir os outros servidores a partir de um só**.
>
> Sigilo de verdade exigiria um servidor com autenticação, o que sai do
> GitHub Pages gratuito.

---

## 12. Solução de problemas

| Sintoma | Causa e solução |
| --- | --- |
| QR Code abre "CREDENCIAL NÃO ENCONTRADA" | Não existe `dados/<id>.json` para esse identificador, ou o arquivo não foi publicado ainda. |
| QR Code aponta para `SEU_USUARIO` | Falta trocar `githubUser` em `config.json` e rodar `npm run gerar` de novo. |
| Página em branco no GitHub Pages | Aguarde 2 minutos após o push e confira em *Settings → Pages* se a branch é `main` / root. |
| Alterou o JSON e o site não mudou | Rode `npm run gerar` e faça `git push`. O GitHub Pages serve o que está commitado. |
| `renomeie o arquivo para <id>.json` | O nome do arquivo e o campo `id` têm de ser iguais. |
| Painel vazio, reclamando do índice | Rode `npm run gerar`. O `_painel.json` é gerado, não versionado. |
| "CPF não passa na validação" | Aviso, não erro. Confira os dígitos verificadores do CPF digitado. |
| `EADDRINUSE` ao rodar `npm start` | Porta ocupada. Use `PORT=4174 npm start`. |
| `npm start` não encontra o package.json | Você está na pasta errada. Entre em `credencial-vigilancia/` antes de rodar. |
| Página abre pelo Explorer mas sem dados | O navegador bloqueia `fetch` em `file://`. Use `npm start` e abra por `http://localhost:4173`. |

---

## Licença

MIT — livre para uso pela administração pública.

**Prefeitura Municipal de Taguatinga/TO — Vigilância Sanitária**
*Esta credencial é de uso pessoal e intransferível.*
