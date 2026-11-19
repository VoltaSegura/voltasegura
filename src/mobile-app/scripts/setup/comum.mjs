// Funções compartilhadas pelos scripts de setup (setup.mjs e otp2.mjs). Só Node, sem dependências.
import dgram from 'node:dgram';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

export const PASTA_APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const ARQUIVO_ENV = path.join(PASTA_APP, '.env.local');

export const ok = (m) => console.log(`  [ok] ${m}`);
export const passo = (m) => console.log(`\n==> ${m}`);
export const aviso = (m) => console.log(`  [atenção] ${m}`);
export const falhar = (m) => {
  console.error(`\n  [erro] ${m}\n`);
  process.exit(1);
};

/** Lê `--nome valor` ou `--nome=valor` dos argumentos; `--flag` sozinha vira `true`. */
export function lerArgumentos(argv = process.argv.slice(2)) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const [chave, valor] = argv[i].replace(/^--/, '').split('=');
    if (valor !== undefined) args[chave] = valor;
    else if (argv[i + 1] && !argv[i + 1].startsWith('--')) args[chave] = argv[++i];
    else args[chave] = true;
  }
  return args;
}

/** Pergunta sim/não no terminal; sem terminal interativo, devolve o padrão. */
export async function confirmar(pergunta, padrao = true) {
  if (!process.stdin.isTTY) return padrao;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const resposta = await new Promise((r) => rl.question(`  ${pergunta} ${padrao ? '[S/n]' : '[s/N]'} `, r));
  rl.close();
  return resposta.trim() === '' ? padrao : /^s/i.test(resposta.trim());
}

// ---------------------------------------------------------------- IP da rede local

// Adaptadores virtuais que o celular não alcança (WSL, Hyper-V, VirtualBox, VMware, Docker, VPNs).
const VIRTUAL = /vethernet|wsl|hyper-v|virtualbox|vbox|vmware|vmnet|docker|loopback|bluetooth|tailscale|zerotier|utun|bridge|awdl|llw/i;

const ehPrivado = (ip) =>
  /^10\./.test(ip) || /^192\.168\./.test(ip) || /^172\.(1[6-9]|2\d|3[01])\./.test(ip);

/** 192.168.56.x é a rede host-only padrão do VirtualBox; 172.17+ costuma ser Docker. */
const ehRedeVirtualConhecida = (ip) => /^192\.168\.56\./.test(ip);

function nomeDoAdaptador(ip) {
  for (const [nome, enderecos] of Object.entries(os.networkInterfaces())) {
    if ((enderecos ?? []).some((e) => e.address === ip)) return nome;
  }
  return null;
}

/**
 * IP pelo qual o computador sai para a internet: "conecta" um socket UDP a um IP público.
 * Nada é enviado (UDP não tem handshake); o sistema só escolhe a rota e revela o IP local dela.
 */
function ipDaRotaPadrao() {
  return new Promise((resolve) => {
    const socket = dgram.createSocket('udp4');
    const encerrar = (ip) => {
      try { socket.close(); } catch { /* já fechado */ }
      resolve(ip);
    };
    socket.on('error', () => encerrar(null));
    socket.connect(53, '1.1.1.1', () => encerrar(socket.address().address));
    setTimeout(() => encerrar(null), 1500);
  });
}

/** Plano B sem rota: escolhe pelo nome do adaptador (Wi-Fi primeiro, depois Ethernet). */
function ipPorNomeDeAdaptador() {
  const candidatos = [];
  for (const [nome, enderecos] of Object.entries(os.networkInterfaces())) {
    if (VIRTUAL.test(nome)) continue;
    for (const e of enderecos ?? []) {
      if (e.family !== 'IPv4' || e.internal || !ehPrivado(e.address) || ehRedeVirtualConhecida(e.address)) continue;
      const nota = /wi-?fi|wlan|wireless|^en0$/i.test(nome) ? 3 : /ethernet|^en\d|^eth/i.test(nome) ? 2 : 1;
      candidatos.push({ ip: e.address, nome, nota });
    }
  }
  candidatos.sort((a, b) => b.nota - a.nota);
  return candidatos[0] ?? null;
}

/** IPv4 da rede local que o celular consegue alcançar (mesmo Wi-Fi). */
export async function detectarIpLocal() {
  const daRota = await ipDaRotaPadrao();
  if (daRota && ehPrivado(daRota) && !ehRedeVirtualConhecida(daRota)) {
    const nome = nomeDoAdaptador(daRota);
    if (!nome || !VIRTUAL.test(nome)) return { ip: daRota, nome: nome ?? 'rota padrão' };
  }
  return ipPorNomeDeAdaptador();
}

// ---------------------------------------------------------------- .env.local

/** Atualiza só as chaves pedidas no .env.local, preservando o resto (comentários e segredos). */
export function atualizarEnv(valores, arquivo = ARQUIVO_ENV) {
  const linhas = fs.existsSync(arquivo) ? fs.readFileSync(arquivo, 'utf8').split(/\r?\n/) : [];
  const pendentes = new Map(Object.entries(valores));
  const novas = linhas.map((linha) => {
    const chave = linha.match(/^\s*([A-Z0-9_]+)\s*=/)?.[1];
    if (!chave || !pendentes.has(chave)) return linha;
    const valor = pendentes.get(chave);
    pendentes.delete(chave);
    return `${chave}=${valor}`;
  });
  while (novas.length && novas[novas.length - 1] === '') novas.pop();
  for (const [chave, valor] of pendentes) novas.push(`${chave}=${valor}`);
  fs.writeFileSync(arquivo, `${novas.join('\n')}\n`, 'utf8');
}

export function lerEnv(arquivo = ARQUIVO_ENV) {
  if (!fs.existsSync(arquivo)) return {};
  const valores = {};
  for (const linha of fs.readFileSync(arquivo, 'utf8').split(/\r?\n/)) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=(.*)$/);
    if (m) valores[m[1]] = m[2].trim();
  }
  return valores;
}
