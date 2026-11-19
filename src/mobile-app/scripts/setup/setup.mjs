// Setup do app VoltaSegura numa máquina nova: dependências, .env.local com o IP da rede e OTP2.
//
//   npm run setup                 tudo (modo otp2: trajetos reais + exposição estimada do Neon)
//   npm run setup -- --modo mock  só o app com dados de exemplo (sem Java, sem OTP2)
//   npm run setup -- --so-ip      só atualiza o IP no .env.local (trocou de rede)
//   npm run setup -- --ip 192.168.0.20   força um IP quando a detecção errar
//
// Nunca grava segredo: o .env.local recebe só variáveis EXPO_PUBLIC_* (vão para o app de qualquer jeito).
// Chaves que já existem no .env.local e não são do setup ficam como estão.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ARQUIVO_ENV,
  PASTA_APP,
  atualizarEnv,
  aviso,
  detectarIpLocal,
  falhar,
  lerArgumentos,
  lerEnv,
  ok,
  passo,
} from './comum.mjs';

const PASTA_SCRIPT = path.dirname(fileURLToPath(import.meta.url));
const args = lerArgumentos();
const modo = args.modo === 'mock' ? 'mock' : 'otp2';
const PORTA_OTP2 = 8080;

/** URLs públicas do Neon (branch dev): login e Data API. Não são segredo; o app as embute no bundle. */
function lerNeonPublico() {
  const arquivo = path.join(PASTA_SCRIPT, 'neon-publico.json');
  return fs.existsSync(arquivo) ? JSON.parse(fs.readFileSync(arquivo, 'utf8')) : {};
}

async function definirIp() {
  passo('IP do computador na rede local (o celular precisa alcançá-lo)');
  if (typeof args.ip === 'string') {
    ok(`IP informado: ${args.ip}`);
    return args.ip;
  }
  const local = await detectarIpLocal();
  if (!local) falhar('Não achei um IP de rede local. Conecte-se ao Wi-Fi ou informe: npm run setup -- --ip <seu IPv4>');
  ok(`${local.ip} (adaptador: ${local.nome})`);
  return local.ip;
}

function garantirNode() {
  const [principal, secundaria] = process.versions.node.split('.').map(Number);
  if (principal < 22 || (principal === 22 && secundaria < 13)) {
    falhar(`Node ${process.versions.node} é antigo; instale o Node 22.13 ou mais novo (https://nodejs.org).`);
  }
}

function garantirDependencias() {
  passo('Dependências do app (npm install)');
  if (fs.existsSync(path.join(PASTA_APP, 'node_modules', 'expo'))) {
    ok('node_modules já instalado');
    return;
  }
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const r = spawnSync(npm, ['install'], { cwd: PASTA_APP, stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) falhar('npm install falhou; veja as mensagens acima.');
  ok('dependências instaladas');
}

function escreverEnv(ip, soIp) {
  passo(`Variáveis do app em ${path.relative(process.cwd(), ARQUIVO_ENV) || ARQUIVO_ENV}`);
  const atual = lerEnv();
  const urlOtp2 = `http://${ip}:${PORTA_OTP2}`;
  if (soIp) {
    atualizarEnv({ EXPO_PUBLIC_OTP2_URL: urlOtp2 });
    ok(`EXPO_PUBLIC_OTP2_URL=${urlOtp2}`);
    return;
  }
  const neon = lerNeonPublico();
  const valores = { EXPO_PUBLIC_API_MODE: modo, EXPO_PUBLIC_OTP2_URL: urlOtp2 };
  // Preenche o Neon só se estiver vazio: quem já configurou outra branch não perde a configuração.
  const seVazio = (chave, padrao) => {
    if (!atual[chave] && padrao) valores[chave] = padrao;
  };
  seVazio('EXPO_PUBLIC_NEON_AUTH_URL', neon.EXPO_PUBLIC_NEON_AUTH_URL);
  seVazio('EXPO_PUBLIC_DATA_API_URL', neon.EXPO_PUBLIC_DATA_API_URL);
  seVazio('EXPO_PUBLIC_NEON_AUTH_ORIGIN', 'http://localhost:8081');
  seVazio('EXPO_PUBLIC_EXPOSICAO_COBERTURA', neon.EXPO_PUBLIC_EXPOSICAO_COBERTURA);
  atualizarEnv(valores);
  for (const [chave, valor] of Object.entries(valores)) ok(`${chave}=${valor.replace(/^(https:\/\/[^.]{6})[^/]*/, '$1…')}`);
  const final = lerEnv();
  if (!final.EXPO_PUBLIC_NEON_AUTH_URL || !final.EXPO_PUBLIC_DATA_API_URL) {
    aviso('Sem as URLs do Neon: o app mostra trajetos, mas sem a exposição estimada (modo "só roteamento").');
  }
}

function prepararOtp2() {
  const r = spawnSync(process.execPath, [path.join(PASTA_SCRIPT, 'otp2.mjs'), 'preparar'], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

async function main() {
  console.log('VoltaSegura · setup do app');
  garantirNode();
  const soIp = args['so-ip'] === true;
  if (!soIp) garantirDependencias();
  const ip = await definirIp();
  escreverEnv(ip, soIp);
  if (soIp) return;
  if (modo === 'otp2') prepararOtp2();

  console.log('\n==> Pronto. Para rodar:');
  if (modo === 'otp2') {
    console.log('  Terminal 1:  npm run otp2       (sobe o servidor de trajetos; deixe aberto)');
    console.log('  Terminal 2:  npm run celular    (confere o IP e abre o Expo com cache limpo)');
  } else {
    console.log('  npm run celular');
  }
  console.log('  No celular: Expo Go no mesmo Wi-Fi, leia o QR code. Para a exposição estimada, crie uma conta e entre.');
}

main().catch((e) => falhar(e?.message ?? String(e)));
