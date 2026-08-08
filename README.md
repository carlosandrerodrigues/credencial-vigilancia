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
dados/funcionarios.json          (fonte única de dados)
            │
            ▼   npm run gerar
   ┌────────┴─────────┬────────────────────────┐
   ▼                  ▼                        ▼
qrcodes/*.png    dados/funcionarios.js    painel.html
(300x300, H)     (espelho para uso        (resumo da
                  offline via file://)     geração)
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
| `npm run gerar` | Executa todo o pipeline: valida a base, gera os QR Codes e atualiza o JSON e o HTML. |
| `npm run cadastrar` | Cadastro guiado de um novo servidor pelo terminal, com validação de CPF. |
| `npm start` | Sobe um servidor local em `http://localhost:4173`. O painel administrativo fica em `/painel.html`. |
| `npm run dev` | Gera tudo e já abre o servidor local. |
| `npm run limpar` | Apaga apenas os artefatos gerados (QR Codes e o espelho de dados). |

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

Abra `http://localhost:4173/painel.html`, preencha o formulário **“Cadastrar novo servidor”** e clique em **Gerar registro**. Você pode:

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
  "status": "valida"
}
```

O campo `id` é o número que vai no QR Code (`?id=000008`) e deve ter **6 dígitos e ser único**.

---

## 5. Gerar os QR Codes

```bash
npm run gerar
```

Produz:

| Saída | Descrição |
| --- | --- |
| `qrcodes/000001.png` | PNG 300 × 300 px, correção de erro **H** (30%), margem de 2 módulos. |
| `dados/funcionarios.js` | Espelho da base que faz as páginas funcionarem mesmo abertas via `file://`. |
| `painel.html` | Bloco “Última geração” atualizado automaticamente. |

Para testar antes de publicar:

```bash
npm start
```

Depois abra `http://localhost:4173/verificar.html?id=000001`.
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
│   │   ├── format.js             Formatação (CPF, datas) — usado no navegador E no Node
│   │   ├── icones.js             Selos de situação e ícones de campo em SVG inline
│   │   ├── dados.js              Carregamento da base (fetch + fallback file://)
│   │   ├── credencial.js         Componente visual da credencial
│   │   ├── verificar.js          Controlador de verificar.html
│   │   └── painel.js             Controlador de painel.html
│   └── img/
│       └── logo.png              Brasão da prefeitura
├── dados/
│   ├── funcionarios.json         FONTE ÚNICA DE DADOS
│   └── funcionarios.js           Espelho gerado automaticamente
├── gerador/
│   ├── index.js                  npm run gerar — orquestrador do pipeline
│   ├── cadastrar.js              npm run cadastrar
│   ├── limpar.js                 npm run limpar
│   ├── servidor.js               npm start
│   └── lib/
│       ├── config.js             Caminhos e leitura de configuração
│       ├── log.js                Saída colorida no terminal
│       ├── dados.js              Normalização e validação da base
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
| `id` | Sim | 6 dígitos, único. É o `?id=` do QR Code. |
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
| `/verificar.html?id=000001` | Sim | Uma credencial por vez, com CPF mascarado. |
| `/dados/funcionarios.json` | Sim | **A base inteira.** Ver aviso abaixo. |
| `/painel.html` | **Não** | Lista de servidores e cadastro. Só local. |

> **Aviso.** A página de validação precisa ler `dados/funcionarios.json` pelo
> navegador, então esse arquivo é obrigatoriamente público. Quem digitar esse
> endereço vê os dados dos servidores — nome, CPF, endereço, cargo, matrícula.
> Isso é limitação de hospedagem estática, não do sistema. Para eliminar,
> seria necessário um servidor com autenticação.

---

## 12. Solução de problemas

| Sintoma | Causa e solução |
| --- | --- |
| QR Code abre "CREDENCIAL NÃO ENCONTRADA" | O `id` não existe em `dados/funcionarios.json`, ou o `npm run gerar` não foi executado depois do cadastro. |
| QR Code aponta para `SEU_USUARIO` | Falta trocar `githubUser` em `config.json` e rodar `npm run gerar` de novo. |
| Página em branco no GitHub Pages | Aguarde 2 minutos após o push e confira em *Settings → Pages* se a branch é `main` / root. |
| Alterou o JSON e o site não mudou | Rode `npm run gerar` e faça `git push`. O GitHub Pages serve o que está commitado. |
| "CPF não passa na validação" | Aviso, não erro. Confira os dígitos verificadores do CPF digitado. |
| `EADDRINUSE` ao rodar `npm start` | Porta ocupada. Use `PORT=4174 npm start`. |
| `npm start` não encontra o package.json | Você está na pasta errada. Entre em `credencial-vigilancia/` antes de rodar. |
| Página abre pelo Explorer mas sem dados | Normal em `file://`. O espelho `dados/funcionarios.js` resolve — basta ter rodado `npm run gerar`. |

---

## Licença

MIT — livre para uso pela administração pública.

**Prefeitura Municipal de Taguatinga/TO — Vigilância Sanitária**
*Esta credencial é de uso pessoal e intransferível.*
