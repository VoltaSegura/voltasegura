/**
 * Varredura automática de linguagem (I-15; RNF-01 / RNF-09; T-R01 / T-R09).
 * Fonte das regras: docs/05_regras_linguagem_etica.md.
 *
 * Como funciona (heurística por regex/varredura de caracteres, sem AST):
 *  1. Um mini-tokenizador percorre o código ignorando comentários (// e /* *​/)
 *     e coleta literais de string ('...', "...", `...`) com a linha de início.
 *  2. Os literais e comentários são apagados do fonte (preservando quebras de
 *     linha) e o que sobra é procurado por texto de JSX (`>texto<`).
 *  3. Cada texto é normalizado (minúsculas, sem acentos) e testado contra os
 *     padrões proibidos.
 *
 * LIMITES conhecidos:
 *  - Identificadores e comentários são ignorados de propósito.
 *  - Strings que NÃO são texto exibível (chaves, rotas, imports) também são
 *    varridas; se algum dia gerar falso positivo, ajuste o texto, não o teste.
 *  - Template literal é lido como texto bruto (inclui o conteúdo de `${}`);
 *    backtick aninhado dentro de `${}` não é tratado.
 *  - Texto de JSX com `>`/`<` ou `{}` no meio é quebrado nesses pontos, e
 *    genéricos (`Array<string>`) podem produzir "texto" espúrio (só importa se
 *    contiver um termo proibido).
 *  - Frases montadas por concatenação ("rota " + "segura") não são detectadas.
 *  - "zero ocorrências" e LGPD/conformidade dependem de contexto na mesma
 *    string/frase; o detector é conservador e pode errar em casos ambíguos.
 */
/// <reference types="jest" />
/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';

export type Achado = { linha: number; termo: string; trecho: string };

const SRC = path.resolve(__dirname, '..');

/** Exceções aprovadas ("arquivo:linha:termo"). Deve permanecer vazia. */
const EXCECOES: string[] = [];

type Padrao = { termo: string; regex: RegExp };

const PROIBIDOS: Padrao[] = [
  { termo: 'rota segura', regex: /\brotas?\s+seguras?\b/ },
  { termo: 'rota mais segura', regex: /\brotas?\s+mais\s+seguras?\b/ },
  { termo: 'por segurança', regex: /\bpor\s+seguranca\b/ },
  { termo: 'bairro perigoso', regex: /\bbairros?\s+perigos[oa]s?\b/ },
  { termo: 'rua perigosa', regex: /\bruas?\s+perigos[oa]s?\b/ },
  { termo: 'área de risco', regex: /\bareas?\s+de\s+risco\b/ },
  { termo: 'zona vermelha', regex: /\bzonas?\s+vermelhas?\b/ },
  { termo: 'garantimos', regex: /\bgarantimos\b/ },
  { termo: 'prevemos', regex: /\bprevemos\b/ },
  { termo: 'lotação', regex: /\blotacao\b/ },
];

const NEGACAO = /\b(nao|nunca|sem|nenhum[a]?|pendente|ainda nao|nao ha)\b|≠/;

function normalizar(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/** Aplica as regras a um texto exibível (já isolado). Devolve os termos achados. */
export function detectar(texto: string): string[] {
  const n = normalizar(texto);
  const termos: string[] = [];

  for (const p of PROIBIDOS) {
    if (p.regex.test(n)) termos.push(p.termo);
  }

  // "zero ocorrências" como conclusão de segurança (sem negação na string).
  if (/\bzero\s+ocorrencias?\b/.test(n) && /seguran|segur[oa]\b|tranquil|sem\s+risco/.test(n) && !NEGACAO.test(n)) {
    termos.push('zero ocorrências (como conclusão de segurança)');
  }

  // T-R09: LGPD/conformidade em frase afirmativa.
  const AFIRMATIVA =
    /em\s+conformidade|conformidade\s+(com|a|à)\b|compativel\s+com\s+(a\s+)?lgpd|lgpd[\s-]*compliant|compliant|conforme\s+(a\s+)?lgpd|aderente\s+a\s+lgpd|adequad[oa]\s+a\s+lgpd|(atende|cumpre|respeita|segue)\s+(a\s+)?lgpd|100%\s*lgpd|certificad[oa]\s+lgpd|totalmente\s+conforme/;
  for (const frase of n.split(/[.!?;\n]+/)) {
    if (!/lgpd|conformidade|compliant/.test(frase)) continue;
    if (AFIRMATIVA.test(frase) && !NEGACAO.test(frase)) {
      termos.push('conformidade/LGPD afirmativa');
      break;
    }
  }
  return termos;
}

type Texto = { linha: number; texto: string };

/** Extrai literais de string e texto de JSX, ignorando comentários. */
export function extrairTextos(fonte: string): Texto[] {
  const textos: Texto[] = [];
  let resto = '';
  let linha = 1;
  let i = 0;
  const n = fonte.length;

  while (i < n) {
    const c = fonte[i];
    const d = fonte[i + 1];
    if (c === '/' && d === '/') {
      while (i < n && fonte[i] !== '\n') i++;
    } else if (c === '/' && d === '*') {
      i += 2;
      while (i < n && !(fonte[i] === '*' && fonte[i + 1] === '/')) {
        if (fonte[i] === '\n') {
          linha++;
          resto += '\n';
        }
        i++;
      }
      i += 2;
    } else if (c === "'" || c === '"' || c === '`') {
      const inicio = linha;
      let s = '';
      i++;
      while (i < n && fonte[i] !== c) {
        if (fonte[i] === '\\' && i + 1 < n) {
          s += fonte[i + 1];
          i += 2;
          continue;
        }
        if (fonte[i] === '\n') {
          if (c !== '`') break; // string não fechada: aborta
          linha++;
          resto += '\n';
        }
        s += fonte[i];
        i++;
      }
      i++;
      textos.push({ linha: inicio, texto: s });
      resto += ' ';
    } else {
      if (c === '\n') linha++;
      resto += c;
      i++;
    }
  }

  // Texto de JSX: >texto< no que sobrou (sem strings nem comentários).
  const jsx = /([>}])([^<>{}]+)(?=[<{])/g;
  let m: RegExpExecArray | null;
  while ((m = jsx.exec(resto)) !== null) {
    const t = m[2];
    if (!/[A-Za-zÀ-ÿ]{2}/.test(t)) continue;
    const offset = m.index + 1;
    const lead = t.length - t.trimStart().length;
    const l = resto.slice(0, offset + lead).split('\n').length;
    textos.push({ linha: l, texto: t });
  }
  return textos;
}

export function varrer(fonte: string): Achado[] {
  const achados: Achado[] = [];
  for (const { linha, texto } of extrairTextos(fonte)) {
    for (const termo of detectar(texto)) {
      achados.push({ linha, termo, trecho: texto.trim().slice(0, 80) });
    }
  }
  return achados;
}

function listarArquivos(dir: string): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === '__tests__' || e.name === 'node_modules') continue;
      out.push(...listarArquivos(p));
    } else if (/\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) {
      out.push(p);
    }
  }
  return out;
}

describe('varredura de linguagem do código-fonte (RNF-01 / RNF-09)', () => {
  it('encontra arquivos para varrer', () => {
    expect(listarArquivos(SRC).length).toBeGreaterThan(10);
  });

  it('não usa termos proibidos de docs/05 nem afirma conformidade LGPD', () => {
    const violacoes: string[] = [];
    for (const arq of listarArquivos(SRC)) {
      const rel = path.relative(SRC, arq).split(path.sep).join('/');
      for (const a of varrer(fs.readFileSync(arq, 'utf8'))) {
        if (EXCECOES.includes(`${rel}:${a.linha}:${a.termo}`)) continue;
        violacoes.push(`${rel}:${a.linha} [${a.termo}] "${a.trecho}"`);
      }
    }
    expect(violacoes).toEqual([]);
  });
});

describe('detector de linguagem (anti-tautologia)', () => {
  const deveBloquear = [
    'Encontre a rota segura para voltar',
    'A ROTA MAIS SEGURA da noite',
    'Escolhida por segurança',
    'Evite este bairro perigoso',
    'Rua perigosa à frente',
    'Você está em área de risco',
    'Zona vermelha neste trecho',
    'Zero ocorrências: lugar seguro',
    'Garantimos o seu trajeto',
    'Prevemos crimes na região',
    'Mostra a lotação do ônibus',
    'Estamos em conformidade com a LGPD',
    'App compatível com a LGPD',
    'VoltaSegura é LGPD compliant',
  ];
  it.each(deveBloquear)('pega: %s', (texto) => {
    expect(detectar(texto).length).toBeGreaterThan(0);
  });

  const devePermitir = [
    'Rota com menor exposição estimada entre as alternativas avaliadas',
    'Atenção a determinados fatores neste trecho',
    'Dados insuficientes para comparar',
    'Zero ocorrências registradas não significa que o lugar seja seguro',
    'Tratamos seus dados com base na LGPD',
    'Ainda não afirmamos conformidade com a LGPD',
    'Não estamos em conformidade com a LGPD ainda',
    'Segurança e privacidade dos seus dados',
    'Rota',
  ];
  it.each(devePermitir)('não pega: %s', (texto) => {
    expect(detectar(texto)).toEqual([]);
  });

  it('ignora identificadores e comentários, mas pega strings e JSX', () => {
    const fonte = [
      'const rotaSegura = 1; // rota segura (comentário)',
      '/* bairro perigoso */',
      "const a = 'rota segura';",
      'const b = <Text>zona vermelha</Text>;',
    ].join('\n');
    const achados = varrer(fonte);
    expect(achados.map((x) => [x.linha, x.termo])).toEqual([
      [3, 'rota segura'],
      [4, 'zona vermelha'],
    ]);
  });

  it('reporta a linha correta em template literal multilinha', () => {
    const achados = varrer('const x = 1;\nconst t = `linha\ngarantimos tudo`;');
    expect(achados).toEqual([{ linha: 2, termo: 'garantimos', trecho: 'linha\ngarantimos tudo' }]);
  });
});
