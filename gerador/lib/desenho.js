/**
 * desenho.js
 * Primitivas de desenho vetorial reutilizáveis para o PDFKit.
 *
 * Tudo aqui é vetorial (exceto foto e QR Code, que são imagens):
 * o brasão, o avatar de fallback e as marcas de corte são desenhados
 * ponto a ponto, o que garante nitidez total em qualquer resolução de
 * impressão e dispensa arquivos binários no repositório.
 */
'use strict';

const fs = require('node:fs');
const Format = require('../../assets/js/format.js');

const Desenho = {
  /**
   * Brasão institucional (sol, serras e rio) desenhado em um quadrado.
   * @param {PDFDocument} doc
   * @param {number} x
   * @param {number} y
   * @param {number} tamanho lado do quadrado em pontos
   */
  brasao(doc, x, y, tamanho) {
    const e = tamanho / 100; // fator de escala do sistema 100x100 do desenho
    doc.save();
    doc.translate(x, y).scale(e);

    // Moldura externa
    doc.roundedRect(0, 0, 100, 100, 22).fill('#0B3C8C');

    // Recorte interno: tudo que vier a seguir fica dentro da moldura
    doc.save();
    doc.roundedRect(4, 4, 92, 92, 19).clip();

    // Céu
    const ceu = doc.linearGradient(0, 4, 0, 96).stop(0, '#7FC5F5').stop(1, '#DCEFFC');
    doc.rect(4, 4, 92, 92).fill(ceu);

    // Sol
    const sol = doc.linearGradient(0, 26, 0, 66).stop(0, '#FFC42E').stop(1, '#F3701B');
    doc.circle(50, 46, 17).fill(sol);

    // Serras
    doc.path('M 4 62 Q 27 40 50 62 Q 73 40 96 62 L 96 96 L 4 96 Z').fill('#12864B');

    // Rio
    doc.path('M 4 74 Q 30 62 50 74 Q 70 86 96 74 L 96 96 L 4 96 Z').fill('#0B5FA5');

    // Aves estilizadas
    doc.lineWidth(2.2).strokeColor('#0B3C8C').lineCap('round');
    doc.path('M 22 28 q 5 -5 10 0').stroke();
    doc.path('M 32 28 q 5 -5 10 0').stroke();
    doc.path('M 60 22 q 4 -4 8 0').stroke();
    doc.path('M 68 22 q 4 -4 8 0').stroke();

    doc.restore(); // fim do recorte

    // Contorno
    doc.lineWidth(2).roundedRect(1, 1, 98, 98, 22).stroke('#08306F');
    doc.restore();
  },

  /**
   * Selo circular de situação com um símbolo interno.
   * @param {PDFDocument} doc
   * @param {number} cx centro X
   * @param {number} cy centro Y
   * @param {number} raio
   * @param {string} cor
   * @param {'check'|'alerta'|'erro'} tipo
   */
  selo(doc, cx, cy, raio, cor, tipo = 'check') {
    doc.circle(cx, cy, raio).fill(cor);
    doc.save();
    doc.lineWidth(raio * 0.26).strokeColor('#FFFFFF').lineCap('round').lineJoin('round');
    const r = raio;
    if (tipo === 'check') {
      doc.path(`M ${cx - r * 0.42} ${cy + r * 0.02} L ${cx - r * 0.1} ${cy + r * 0.36} L ${cx + r * 0.45} ${cy - r * 0.34}`).stroke();
    } else if (tipo === 'erro') {
      doc.path(`M ${cx - r * 0.35} ${cy - r * 0.35} L ${cx + r * 0.35} ${cy + r * 0.35}`).stroke();
      doc.path(`M ${cx + r * 0.35} ${cy - r * 0.35} L ${cx - r * 0.35} ${cy + r * 0.35}`).stroke();
    } else {
      doc.path(`M ${cx} ${cy - r * 0.42} L ${cx} ${cy + r * 0.12}`).stroke();
      doc.path(`M ${cx} ${cy + r * 0.36} L ${cx} ${cy + r * 0.38}`).stroke();
    }
    doc.restore();
  },

  /**
   * Foto do servidor com cantos arredondados; cai para o avatar
   * vetorial quando o arquivo não existe.
   * @param {PDFDocument} doc
   * @param {object} opcoes
   * @param {string} opcoes.arquivo caminho absoluto da foto
   * @param {string} opcoes.nome    nome do servidor (para as iniciais)
   * @param {number} opcoes.x
   * @param {number} opcoes.y
   * @param {number} opcoes.largura
   * @param {number} opcoes.altura
   * @param {number} [opcoes.raio=3]
   */
  foto(doc, { arquivo, nome, x, y, largura, altura, raio = 3 }) {
    doc.save();
    doc.roundedRect(x, y, largura, altura, raio).clip();

    let desenhou = false;
    if (arquivo && fs.existsSync(arquivo)) {
      try {
        doc.image(arquivo, x, y, { cover: [largura, altura], align: 'center', valign: 'center' });
        desenhou = true;
      } catch (erro) {
        // Formato não suportado: segue para o avatar vetorial.
        desenhou = false;
      }
    }

    if (!desenhou) {
      const fundo = doc.linearGradient(x, y, x, y + altura).stop(0, '#E8F0FB').stop(1, '#CBDDF3');
      doc.rect(x, y, largura, altura).fill(fundo);
      doc.circle(x + largura / 2, y + altura * 0.39, largura * 0.22).fill('#9FBEE2');
      doc
        .path(
          `M ${x + largura * 0.1} ${y + altura} ` +
          `C ${x + largura * 0.16} ${y + altura * 0.66} ${x + largura * 0.84} ${y + altura * 0.66} ${x + largura * 0.9} ${y + altura} Z`
        )
        .fill('#9FBEE2');
      doc
        .font('Helvetica-Bold')
        .fontSize(largura * 0.3)
        .fillColor('#0B3C8C')
        .text(Format.iniciais(nome), x, y + altura * 0.32, {
          width: largura,
          align: 'center',
          lineBreak: false
        });
    }

    doc.restore();

    // Moldura sutil por cima
    doc.lineWidth(0.6).roundedRect(x, y, largura, altura, raio).stroke('#FFFFFF');
    doc.lineWidth(0.4).roundedRect(x - 0.4, y - 0.4, largura + 0.8, altura + 0.8, raio + 0.4).stroke('#C9D8EE');
  },

  /**
   * Par rótulo + valor, alinhados à esquerda.
   * @param {PDFDocument} doc
   * @param {object} o
   * @param {string} o.rotulo
   * @param {string} o.valor
   * @param {number} o.x
   * @param {number} o.y
   * @param {number} o.largura
   * @param {object} o.tema  { fontes, tamanhos, cores }
   * @param {number} [o.linhas=1] quantidade máxima de linhas do valor
   * @returns {number} altura ocupada em pontos
   */
  campo(doc, { rotulo, valor, x, y, largura, tema, linhas = 1 }) {
    const { fontes, tamanhos, cores } = tema;
    const alturaRotulo = tamanhos.rotulo * 1.25;
    const alturaLinha = tamanhos.valor * 1.22;

    doc
      .font(fontes.negrito)
      .fontSize(tamanhos.rotulo)
      .fillColor(cores.rotulo)
      .text(String(rotulo).toUpperCase(), x, y, {
        width: largura,
        characterSpacing: 0.35,
        lineBreak: false,
        ellipsis: true
      });

    doc
      .font(fontes.negrito)
      .fontSize(tamanhos.valor)
      .fillColor(cores.texto)
      .text(valor || '—', x, y + alturaRotulo, {
        width: largura,
        height: alturaLinha * linhas + 0.5,
        lineGap: -0.4,
        ellipsis: true,
        lineBreak: linhas > 1
      });

    return alturaRotulo + alturaLinha * linhas;
  },

  /**
   * Texto simples com controle de fonte, cor e recorte.
   * @param {PDFDocument} doc
   * @param {string} conteudo
   * @param {object} o
   * @returns {PDFDocument}
   */
  texto(doc, conteudo, { x, y, largura, fonte, tamanho, cor, alinhamento = 'left', espacamento = 0, quebrar = false }) {
    return doc
      .font(fonte)
      .fontSize(tamanho)
      .fillColor(cor)
      .text(conteudo, x, y, {
        width: largura,
        align: alinhamento,
        characterSpacing: espacamento,
        lineBreak: quebrar,
        ellipsis: true
      });
  },

  /**
   * Texto que se ajusta sozinho à largura disponível: reduz o corpo da
   * fonte até caber em uma única linha (respeitando um mínimo) e, no
   * limite, corta com reticências. Evita que nomes longos invadam o
   * campo seguinte do crachá.
   * @param {PDFDocument} doc
   * @param {string} conteudo
   * @param {object} o
   * @param {number} o.tamanhoMin corpo mínimo aceitável
   * @returns {number} corpo de fonte efetivamente usado
   */
  textoAjustado(doc, conteudo, { x, y, largura, fonte, tamanho, cor, tamanhoMin = 6, alinhamento = 'left' }) {
    let corpo = tamanho;
    doc.font(fonte);
    while (corpo > tamanhoMin && doc.fontSize(corpo).widthOfString(conteudo) > largura) {
      corpo -= 0.25;
    }
    Desenho.texto(doc, conteudo, { x, y, largura, fonte, tamanho: corpo, cor, alinhamento });
    return corpo;
  },

  /**
   * Marcas de corte (crop marks) desenhadas na área de sangria.
   * Orientam a guilhotina da gráfica no formato final do cartão.
   * @param {PDFDocument} doc
   * @param {object} o
   * @param {number} o.x        canto superior esquerdo do corte
   * @param {number} o.y
   * @param {number} o.largura  largura final (trim)
   * @param {number} o.altura   altura final (trim)
   * @param {number} o.sangria
   * @param {string} [o.cor='#000000']
   */
  marcasDeCorte(doc, { x, y, largura, altura, sangria, cor = '#000000' }) {
    const traco = Math.min(sangria * 0.75, 6);
    const folga = sangria * 0.25;
    doc.save().lineWidth(0.35).strokeColor(cor);

    const cantos = [
      [x, y, -1, -1],
      [x + largura, y, 1, -1],
      [x, y + altura, -1, 1],
      [x + largura, y + altura, 1, 1]
    ];

    for (const [cx, cy, dx, dy] of cantos) {
      doc.moveTo(cx + dx * folga, cy).lineTo(cx + dx * (folga + traco), cy).stroke();
      doc.moveTo(cx, cy + dy * folga).lineTo(cx, cy + dy * (folga + traco)).stroke();
    }
    doc.restore();
  },

  /**
   * Faixa decorativa tricolor usada como assinatura visual do documento.
   * @param {PDFDocument} doc
   * @param {number} x
   * @param {number} y
   * @param {number} largura
   * @param {number} altura
   */
  faixaTricolor(doc, x, y, largura, altura) {
    const partes = [
      ['#F3701B', 0.32],
      ['#FFC42E', 0.30],
      ['#16A34A', 0.38]
    ];
    let cursor = x;
    for (const [cor, fracao] of partes) {
      const w = largura * fracao;
      doc.rect(cursor, y, w, altura).fill(cor);
      cursor += w;
    }
  },

  /**
   * Linha divisória fina.
   * @param {PDFDocument} doc
   */
  linha(doc, x1, y1, x2, y2, cor = '#D1D5DB', espessura = 0.4) {
    doc.save().lineWidth(espessura).strokeColor(cor).moveTo(x1, y1).lineTo(x2, y2).stroke().restore();
  }
};

module.exports = Desenho;
