#!/usr/bin/env node
/**
 * cadastrar.js — Cadastro de servidor pelo terminal (`npm run cadastrar`).
 *
 * Pergunta os dados, valida na hora, grava em dados/funcionarios.json
 * e oferece executar a geração completa em seguida.
 */
'use strict';

const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const Log = require('./lib/log');
const Config = require('./lib/config');
const Dados = require('./lib/dados');
const Format = require('../assets/js/format.js');

/**
 * Cria um leitor de linhas que funciona tanto no terminal interativo
 * quanto com entrada redirecionada (`echo ... | npm run cadastrar`).
 *
 * O readline padrão emite todas as linhas de uma vez quando a entrada
 * não é um terminal, o que faria as respostas seguintes se perderem.
 * Aqui as linhas são enfileiradas e consumidas sob demanda.
 * @returns {{pergunta: (texto: string) => Promise<string|null>, fechar: () => void}}
 */
function criarLeitor() {
  const rl = readline.createInterface({ input: stdin, output: stdout, terminal: Boolean(stdin.isTTY) });
  const fila = [];
  const aguardando = [];
  let encerrado = false;

  rl.on('line', (linha) => {
    const proximo = aguardando.shift();
    if (proximo) proximo(linha);
    else fila.push(linha);
  });

  rl.on('close', () => {
    encerrado = true;
    while (aguardando.length) aguardando.shift()(null);
  });

  return {
    /**
     * Escreve o texto e devolve a próxima linha (ou null no fim da entrada).
     * @param {string} texto
     * @returns {Promise<string|null>}
     */
    pergunta(texto) {
      stdout.write(texto);
      if (fila.length) {
        const linha = fila.shift();
        if (!stdin.isTTY) stdout.write(`${linha}\n`); // ecoa quando a entrada vem de um arquivo/pipe
        return Promise.resolve(linha);
      }
      if (encerrado) return Promise.resolve(null);
      return new Promise((resolver) => aguardando.push(resolver));
    },
    fechar() {
      rl.close();
    }
  };
}

/**
 * Pergunta com valor padrão e validação opcional.
 * @param {{pergunta: Function}} rl
 * @param {string} rotulo
 * @param {object} [o]
 * @param {string} [o.padrao]
 * @param {boolean} [o.obrigatorio]
 * @param {(v: string) => true|string} [o.validar] devolve true ou a mensagem de erro
 * @returns {Promise<string>}
 */
async function perguntar(rl, rotulo, { padrao = '', obrigatorio = false, validar } = {}) {
  const sufixo = padrao ? Log.cinza(` [${padrao}]`) : '';
  for (;;) {
    const linha = await rl.pergunta(`  ${rotulo}${sufixo}: `);
    if (linha === null) {
      // Fim da entrada: aceita o padrão ou interrompe se o campo for obrigatório.
      if (padrao || !obrigatorio) return padrao;
      throw new Error(`Entrada encerrada antes de informar "${rotulo}".`);
    }
    const bruto = linha.trim();
    const valor = bruto || padrao;

    if (!valor && obrigatorio) {
      Log.erro('Campo obrigatório.');
      continue;
    }
    if (valor && validar) {
      const resultado = validar(valor);
      if (resultado !== true) {
        Log.erro(resultado);
        continue;
      }
    }
    return valor;
  }
}

async function principal() {
  Log.banner('Cadastro de servidor', 'Vigilância Sanitária · Taguatinga/TO');

  const { config } = Config.carregar();
  const rl = criarLeitor();

  try {
    const proximo = Dados.proximoId();
    const hoje = Format.paraISO(new Date());

    const registro = {
      id: await perguntar(rl, 'Registro (6 dígitos)', {
        padrao: proximo,
        validar: (v) => (/^\d{1,6}$/.test(v) ? true : 'Informe apenas números (até 6 dígitos).')
      }),
      nome: await perguntar(rl, 'Nome completo', { obrigatorio: true }),
      cpf: await perguntar(rl, 'CPF', {
        obrigatorio: true,
        validar: (v) => (Format.cpfValido(v) ? true : 'CPF inválido (confira os dígitos verificadores).')
      }),
      endereco: await perguntar(rl, 'Endereço completo'),
      cargo: await perguntar(rl, 'Cargo/Função', { obrigatorio: true }),
      vinculo: await perguntar(rl, 'Vínculo', { padrao: 'Efetivo' }),
      matricula: await perguntar(rl, 'Matrícula', { obrigatorio: true }),
      portaria: await perguntar(rl, 'Ato de nomeação (portaria)'),
      emissao: await perguntar(rl, 'Data de emissão (AAAA-MM-DD)', {
        padrao: hoje,
        validar: (v) => (Format.paraData(v) ? true : 'Data inválida. Use AAAA-MM-DD.')
      })
    };

    registro.validade = await perguntar(rl, 'Data de validade (AAAA-MM-DD)', {
      padrao: Format.somarAnosISO(registro.emissao, config.credencial.validadeAnos),
      validar: (v) => (Format.paraData(v) ? true : 'Data inválida. Use AAAA-MM-DD.')
    });
    registro.status = 'valida';
    registro.foto = await perguntar(rl, 'Arquivo da foto', {
      padrao: `funcionarios/${Format.normalizarId(registro.id)}.jpg`
    });

    const salvo = Dados.acrescentar(registro, config);

    Log.titulo('Servidor cadastrado');
    Log.ok(`Registro ${salvo.id} — ${salvo.nome}`);
    Log.info(`Coloque a foto 3x4 em ${salvo.foto} (JPG ou PNG, mínimo 480x600 px).`);
    Log.info(`Validação: ${Config.urlValidacao(Config.montarBaseUrl(config), salvo.id)}`);

    const gerar = await perguntar(rl, 'Executar "npm run gerar" agora? (s/n)', { padrao: 's' });
    rl.fechar();

    if (/^s/i.test(gerar)) {
      const resultado = spawnSync(process.execPath, [path.join(__dirname, 'index.js')], { stdio: 'inherit' });
      process.exitCode = resultado.status ?? 0;
    } else {
      Log.info('Lembre-se de executar "npm run gerar" para produzir QR Code e PDF.');
    }
  } catch (erro) {
    rl.fechar();
    Log.erro(erro.message);
    process.exitCode = 1;
  }
}

principal();
