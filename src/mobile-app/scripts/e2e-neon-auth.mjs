// Teste de integração REAL do adaptador de conta contra o Neon Auth. Não roda no Jest porque o
// jest-expo simula o `fetch` global. Cria usuários descartáveis: use só uma branch de desenvolvimento.
//
//   NEON_AUTH_E2E_URL=<NEON_AUTH_BASE_URL da branch dev> node scripts/e2e-neon-auth.mjs
//
// Opcional: NEON_AUTH_E2E_ORIGIN (padrão http://localhost:8081; precisa ser domínio confiável).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import ts from 'typescript';

const urlAuth = (process.env.NEON_AUTH_E2E_URL ?? '').replace(/\/+$/, '');
if (!urlAuth) {
  console.error('Defina NEON_AUTH_E2E_URL (NEON_AUTH_BASE_URL da branch dev).');
  process.exit(2);
}
const origem = process.env.NEON_AUTH_E2E_ORIGIN ?? 'http://localhost:8081';

// Transpila o adaptador real (sem reescrevê-lo) para uma pasta temporária.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'neon-e2e-'));
for (const nome of ['erros', 'contaNeonAuth']) {
  const fonte = fs.readFileSync(path.join('src', 'services', `${nome}.ts`), 'utf8');
  const { outputText } = ts.transpileModule(fonte, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  fs.writeFileSync(path.join(tmp, `${nome}.js`), outputText);
}
const { criarContaNeonAuth } = createRequire(import.meta.url)(path.join(tmp, 'contaNeonAuth.js'));
const conta = criarContaNeonAuth({ urlBase: urlAuth, origem });

const email = `e2e-${Date.now()}@exemplo.invalid`;
const senha = 'Senha-E2E-Valida-1';
let passos = 0;
const ok = (rotulo) => console.log(`  ok ${String(++passos).padStart(2)}  ${rotulo}`);

const lerSessao = async (cookie) => {
  const r = await fetch(`${urlAuth}/get-session`, { headers: { Cookie: cookie, Accept: 'application/json' } });
  const j = await r.json().catch(() => null);
  return { status: r.status, temSessao: !!j?.session, email: j?.user?.email };
};
const falha = async (promessa, esperado) => {
  try {
    await promessa;
  } catch (e) {
    assert.equal(e?.name, 'ErroServico', `esperava ErroServico, veio ${e}`);
    assert.deepEqual({ tipo: e.tipo, codigo: e.codigo }, esperado);
    return e;
  }
  assert.fail(`esperava falha ${JSON.stringify(esperado)}`);
};

try {
  console.log(`Neon Auth E2E (origem ${origem})`);
  const cad = await conta.cadastrar({ email, senha, aceiteAviso: true });
  assert.match(cad.token, /session_token=/);
  assert.equal(cad.email, email);
  ok('cadastrar: devolve o cookie de sessão como token');
  const dias = (Date.parse(cad.expiraEm) - Date.now()) / 86400000;
  assert.ok(dias > 6 && dias <= 7.01, `validade esperada ~7 dias, veio ${dias.toFixed(2)}`);
  ok(`cadastrar: expiraEm ~${dias.toFixed(1)} dias (Max-Age do cookie)`);
  assert.deepEqual(await lerSessao(cad.token), { status: 200, temSessao: true, email });
  ok('get-session com o cookie guardado: sessão válida e e-mail confere');

  await falha(conta.cadastrar({ email, senha, aceiteAviso: true }), { tipo: 'VALIDACAO', codigo: 'EMAIL_EXISTENTE' });
  ok('cadastrar e-mail repetido: VALIDACAO/EMAIL_EXISTENTE');
  await falha(conta.cadastrar({ email: `curta-${Date.now()}@exemplo.invalid`, senha: '1', aceiteAviso: true }), { tipo: 'VALIDACAO', codigo: 'SENHA_CURTA' });
  ok('cadastrar senha curta: VALIDACAO/SENHA_CURTA');
  await falha(conta.cadastrar({ email: `x-${Date.now()}@exemplo.invalid`, senha, aceiteAviso: false }), { tipo: 'VALIDACAO', codigo: 'ACEITE' });
  ok('cadastrar sem aceite do aviso: recusa antes de ir à rede');

  const login = await conta.entrar({ email, senha });
  assert.equal((await lerSessao(login.token)).temSessao, true);
  ok('entrar: nova sessão válida');
  await falha(conta.entrar({ email, senha: 'errada-errada' }), { tipo: 'NAO_AUTORIZADO', codigo: 'CREDENCIAIS' });
  ok('entrar senha errada: NAO_AUTORIZADO/CREDENCIAIS (mensagem genérica)');
  await falha(conta.entrar({ email: `inexistente-${Date.now()}@exemplo.invalid`, senha }), { tipo: 'NAO_AUTORIZADO', codigo: 'CREDENCIAIS' });
  ok('entrar e-mail inexistente: mesma resposta genérica');

  await conta.encerrarSessaoRemota(login.token);
  assert.equal((await lerSessao(login.token)).temSessao, false);
  ok('encerrarSessaoRemota: o cookie deixa de valer no servidor');

  await falha(conta.excluirConta(), { tipo: 'INDISPONIVEL', codigo: 'EXCLUSAO_NAO_SUPORTADA' });
  ok('excluirConta: falha explícita (Neon Auth gerenciado não exclui)');

  const semOrigem = criarContaNeonAuth({ urlBase: urlAuth, origem: 'https://nao-confiavel.exemplo.invalid' });
  await falha(semOrigem.entrar({ email, senha }), { tipo: 'INDISPONIVEL', codigo: 'ORIGEM' });
  ok('origem não confiável: INDISPONIVEL/ORIGEM (erro de configuração, não de senha)');
  console.log(`\n${passos} verificações passaram.`);
} catch (e) {
  console.error('\nFALHOU:', e?.message ?? e);
  process.exitCode = 1;
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
