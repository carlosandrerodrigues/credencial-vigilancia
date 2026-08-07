/**
 * log.js
 * Saída padronizada no terminal, com cores ANSI e sem dependências.
 */
'use strict';

const suportaCor = process.stdout.isTTY && process.env.NO_COLOR === undefined;

/**
 * Aplica cor ANSI quando o terminal suporta.
 * @param {string} codigo
 * @param {string} texto
 * @returns {string}
 */
const cor = (codigo, texto) => (suportaCor ? `[${codigo}m${texto}[0m` : texto);

const Log = {
  azul: (t) => cor('36', t),
  verde: (t) => cor('32', t),
  amarelo: (t) => cor('33', t),
  vermelho: (t) => cor('31', t),
  cinza: (t) => cor('90', t),
  negrito: (t) => cor('1', t),

  /** Cabeçalho de seção. */
  titulo(texto) {
    console.log('\n' + Log.negrito(Log.azul(`▌ ${texto}`)));
  },

  /** Passo concluído. */
  ok(texto) {
    console.log(`  ${Log.verde('✓')} ${texto}`);
  },

  /** Informação neutra. */
  info(texto) {
    console.log(`  ${Log.cinza('•')} ${Log.cinza(texto)}`);
  },

  /** Alerta que não interrompe a execução. */
  aviso(texto) {
    console.log(`  ${Log.amarelo('!')} ${Log.amarelo(texto)}`);
  },

  /** Falha. */
  erro(texto) {
    console.error(`  ${Log.vermelho('✗')} ${Log.vermelho(texto)}`);
  },

  /** Faixa de abertura do gerador. */
  banner(titulo, subtitulo) {
    const largura = Math.max(titulo.length, subtitulo.length) + 4;
    const linha = '─'.repeat(largura);
    console.log(Log.azul(`\n┌${linha}┐`));
    console.log(Log.azul('│  ') + Log.negrito(titulo.padEnd(largura - 4)) + Log.azul('  │'));
    console.log(Log.azul('│  ') + Log.cinza(subtitulo.padEnd(largura - 4)) + Log.azul('  │'));
    console.log(Log.azul(`└${linha}┘`));
  },

  /** Resumo final. */
  resumo(linhas) {
    console.log('');
    linhas.forEach((l) => console.log(`  ${Log.verde('›')} ${l}`));
    console.log('');
  }
};

module.exports = Log;
