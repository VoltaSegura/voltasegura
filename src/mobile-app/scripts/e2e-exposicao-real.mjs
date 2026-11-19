// B-58: teste REAL da cadeia roteamento → variações de caminhada → exposição estimada, com o código do app
// (transpilado, sem reescrever) contra o OTP2 local e a Data API da branch `dev` do Neon.
// Não roda no Jest (o jest-expo simula o `fetch`). Cria UM usuário descartável no Neon Auth: use só a `dev`.
//
//   E2E_OTP2_URL=http://localhost:8080 \
//   E2E_NEON_AUTH_URL=<NEON_AUTH_BASE_URL da dev> \
//   E2E_DATA_API_URL=<URL da Data API da dev, termina em /rest/v1> \
//   node scripts/e2e-exposicao-real.mjs
//
// Opcional: E2E_ORIGEM (padrão http://localhost:8081), E2E_COBERTURA (padrão proxy_pontos), E2E_SAIDA (ISO com fuso).
// Saída: só nome do trajeto (pontos públicos), caso, motivo e, por rota, tempo, km a pé, registros, D e cobertura.
// Nunca imprime token, cookie, URL nem geometria. Código de saída 0 se pelo menos um trajeto tiver destaque de menor exposição estimada.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import ts from 'typescript';

const semBarra = (u) => (u ?? '').trim().replace(/\/+$/, '');
const otp2 = semBarra(process.env.E2E_OTP2_URL || 'http://localhost:8080');
const auth = semBarra(process.env.E2E_NEON_AUTH_URL);
const dataApi = semBarra(process.env.E2E_DATA_API_URL);
const origemHttp = process.env.E2E_ORIGEM ?? 'http://localhost:8081';
const cobertura = process.env.E2E_COBERTURA ?? 'proxy_pontos';
if (!auth || !dataApi) {
  console.error('Defina E2E_NEON_AUTH_URL e E2E_DATA_API_URL (valores da branch dev; veja o cabeçalho).');
  process.exit(2);
}

// Transpila os serviços reais para uma pasta temporária (como scripts/e2e-neon-auth.mjs).
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'exposicao-e2e-'));
for (const nome of ['erros', 'geometria', 'validar', 'otp2', 'token', 'exposicao', 'variantesCaminhada', 'rotaDosDados']) {
  const fonte = fs.readFileSync(path.join('src', 'services', `${nome}.ts`), 'utf8');
  const { outputText } = ts.transpileModule(fonte, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  fs.writeFileSync(path.join(tmp, `${nome}.js`), outputText);
}
const exigir = createRequire(import.meta.url);
const { criarConsultaOtp2 } = exigir(path.join(tmp, 'otp2.js'));
const { comPrioridadeDosDados } = exigir(path.join(tmp, 'rotaDosDados.js'));
const { ultimoMotivoExposicao } = exigir(path.join(tmp, 'exposicao.js'));

// Conta descartável na dev e o cookie da sessão (o app faz o mesmo em contaNeonAuth.ts).
const email = `e2e-exposicao-${Date.now()}@exemplo.invalid`;
const res = await fetch(`${auth}/sign-up/email`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json', Origin: origemHttp },
  body: JSON.stringify({ email, password: 'Senha-E2E-Valida-1', name: 'E2E' }),
});
const cookies = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie().join(', ') : (res.headers.get('set-cookie') ?? '');
const sessao = /([\w.-]*session_token=[^;,\s]+)/.exec(cookies)?.[1];
if (!res.ok || !sessao) {
  console.error(`Não foi possível criar a sessão de teste (HTTP ${res.status}).`);
  process.exit(1);
}

// B-59 (D-33): o mesmo pipeline do app (rota desenhada pelos dados → comparação → prioridade com confiança)
const servico = comPrioridadeDosDados(criarConsultaOtp2(otp2), {
  urlOtp2: otp2, urlDataApi: dataApi, urlNeonAuth: auth, origemNeonAuth: origemHttp, modoCobertura: cobertura,
  tempoLimiteMs: 30_000, tempoLimiteMotorMs: 40_000, obterSessao: () => sessao,
});

// Pontos PÚBLICOS (praças, largos e parques a algumas quadras das estações), nunca endereço de alguém.
// Ficam longe o bastante das estações para haver trechos a pé de verdade (o caso de uso: caminhar até a condução).
const P = {
  'Praça Buenos Aires': [-23.5468, -46.6589], 'Praça Roosevelt': [-23.5487, -46.6466], 'Parque da Aclimação': [-23.5730, -46.6310],
  'Praça Benedito Calixto': [-23.5568, -46.6820], 'Praça Vilaboim': [-23.5440, -46.6623], 'Largo do Arouche': [-23.5426, -46.6449],
  'Praça do Pôr do Sol': [-23.5508, -46.7024], 'Largo da Batata': [-23.5664, -46.6930], 'Parque da Água Branca': [-23.5276, -46.6683],
  'Praça Charles Miller': [-23.5476, -46.6650], 'Praça da Liberdade': [-23.5560, -46.6352], 'Praça da Sé': [-23.5503, -46.6339],
};
// Cenários de demonstração (17/11/2026, saída 22h30 de dia útil): pontos de uma grade determinística no
// centro expandido, arredondados a 3 casas (~100 m), que deram CONCLUSIVO com a cadeia completa do app.
Object.assign(P, {
  'Grade #2 origem': [-23.537, -46.652], 'Grade #2 destino': [-23.558, -46.662],
  'Grade #4 origem': [-23.540, -46.686], 'Grade #4 destino': [-23.558, -46.695],
  'Grade #22 origem': [-23.525, -46.675], 'Grade #22 destino': [-23.537, -46.686],
});
const pracas = [
  ['Praça Buenos Aires', 'Praça da Liberdade'], ['Parque da Aclimação', 'Praça Roosevelt'], ['Praça Benedito Calixto', 'Praça Roosevelt'],
  ['Praça Vilaboim', 'Praça da Sé'], ['Praça do Pôr do Sol', 'Praça Charles Miller'], ['Parque da Água Branca', 'Praça Roosevelt'],
  ['Praça Charles Miller', 'Praça da Liberdade'], ['Largo do Arouche', 'Parque da Aclimação'], ['Largo da Batata', 'Praça Buenos Aires'],
  ['Praça da Sé', 'Praça Benedito Calixto'],
];
const demonstracao = [['Grade #2 origem', 'Grade #2 destino'], ['Grade #4 origem', 'Grade #4 destino'], ['Grade #22 origem', 'Grade #22 destino']];
// Trajetos do tipo testado no aparelho em 17/11 (Paulista → Centro e Paulista → Ibirapuera), entre pontos públicos.
Object.assign(P, { MASP: [-23.5614, -46.6559], 'Mercado Municipal': [-23.5417, -46.6297], 'Parque Ibirapuera (portão 10)': [-23.585, -46.657] });
const aparelho = [['MASP', 'Mercado Municipal'], ['MASP', 'Parque Ibirapuera (portão 10)']];

// E2E_MODO: `demonstracao` (padrão, 3 trajetos), `aparelho` (2), `pracas` (10), `todos` (15) ou `grade` (E2E_GRADE pares de
// 1,5 a 3 km numa grade determinística, semente fixa: o mesmo levantamento de 17/11, 24 pares → 3 CONCLUSIVO).
const modo = process.env.E2E_MODO ?? 'demonstracao';
let trajetos = modo === 'pracas' ? pracas : modo === 'aparelho' ? aparelho : modo === 'todos' ? [...demonstracao, ...aparelho, ...pracas] : demonstracao;
if (modo === 'grade') {
  let semente = 7;
  const rnd = () => (semente = (semente * 16807) % 2147483647) / 2147483647;
  trajetos = [];
  for (let k = 0; k < Number(process.env.E2E_GRADE ?? 24); k += 1) {
    const o = [-23.575 + rnd() * 0.05, -46.69 + rnd() * 0.07];
    const ang = rnd() * 2 * Math.PI;
    const dkm = 1.5 + rnd() * 1.5;
    P[`Grade #${k} origem`] = o;
    P[`Grade #${k} destino`] = [o[0] + (Math.sin(ang) * dkm) / 110.5, o[1] + (Math.cos(ang) * dkm) / 102];
    trajetos.push([`Grade #${k} origem`, `Grade #${k} destino`]);
  }
}
const proximoDiaUtil = () => {
  const d = new Date(Date.now() + 24 * 3600_000);
  while ([0, 6].includes(d.getDay())) d.setDate(d.getDate() + 1);
  return `${d.toISOString().slice(0, 10)}T22:30:00-03:00`;
};
const saida = process.env.E2E_SAIDA ?? proximoDiaUtil();
const f = (n, c = 0) => (n === null || n === undefined ? '—' : Number(n).toFixed(c));

console.log(`Saída ${saida} · cobertura ${cobertura}\n`);
const contagem = {};
const conclusivos = [];
for (const [de, para] of trajetos) {
  const [la, lo] = P[de];
  const [lb, lob] = P[para];
  const t0 = Date.now();
  let r;
  try {
    r = await servico.consultarRotas({ origem: { lat: la, lon: lo }, destino: { lat: lb, lon: lob }, saida, sentido: 'volta' });
  } catch (e) {
    console.log(`${de} → ${para}: ERRO ${e?.tipo ?? e?.name ?? 'desconhecido'}`);
    continue;
  }
  const ms = Date.now() - t0;
  const destaque = r.rotas.find((x) => x.destaqueExposicao);
  const caso = `${r.caso}${r.motivo ? `/${r.motivo}` : ''} → ${destaque ? `destaque ${destaque.destaqueExposicao.confianca}` : 'sem destaque'}`;
  contagem[caso] = (contagem[caso] ?? 0) + 1;
  const dosDados = r.rotas.filter((x) => x.variante?.origem === 'dados').length;
  console.log(`${de} → ${para}: ${caso} · ${r.rotas.length} opções (${dosDados} desenhadas pelos dados) · ${ms} ms · motivo ${ultimoMotivoExposicao()}`);
  for (const x of r.rotas) {
    const e = x.exposicao;
    const tipo = x.variante?.origem === 'dados' ? 'dos dados' : x.variante ? 'variação ' : 'roteador ';
    console.log(`   ${x.focos.includes('MENOR_EXPOSICAO') ? '◆' : ' '} ${tipo} ${x.duracaoMin} min · ${f(x.caminhadaKm, 2)} km a pé · N=${f(e.registros)} · D=${f(e.registrosPorKm)}/km · cobertura ${f(e.cobertura, 2)}`);
  }
  if (destaque) conclusivos.push(`${de} → ${para} (${destaque.destaqueExposicao.confianca})`);
}
console.log(`\nResumo: ${JSON.stringify(contagem)}`);
console.log(conclusivos.length ? `Destaque de menor exposição estimada em: ${conclusivos.join('; ')}` : 'Nenhum destaque nesta rodada.');
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(conclusivos.length ? 0 : 1);
