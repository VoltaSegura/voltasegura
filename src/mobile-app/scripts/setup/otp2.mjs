// Prepara e sobe o OpenTripPlanner 2 (OTP2) com o grafo de São Paulo.
//
//   node scripts/setup/otp2.mjs preparar   Java 25 + OTP2 + dados + grafo (não sobe o servidor)
//   node scripts/setup/otp2.mjs            faz o que faltar do "preparar" e sobe o servidor na porta 8080
//
// Opções: --dados <pasta>   onde ficam jar, GTFS, OSM e graph.obj (padrão: abaixo)
//         --memoria 6G      memória máxima do Java (padrão: calculado pela RAM da máquina)
//         --porta 8080
//
// Pasta de dados, nesta ordem: --dados, variável OTP2_DADOS, ../../scripts/otp2/dados do monorepo
// (se já tiver graph.obj) e, por fim, src/mobile-app/.otp2/ (fora do git).
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { PASTA_APP, aviso, confirmar, detectarIpLocal, falhar, lerArgumentos, ok, passo } from './comum.mjs';

const VERSAO_OTP = '2.10.0';
const JAVA_MINIMO = 25; // o OTP 2.10 exige Java 25 ou mais novo
const URL_JAR = `https://repo1.maven.org/maven2/org/opentripplanner/otp-shaded/${VERSAO_OTP}/otp-shaded-${VERSAO_OTP}.jar`;
const URL_GTFS = 'https://www.sptrans.com.br/umbraco/Surface/PerfilDesenvolvedor/BaixarGTFS?memberName=sptrans';
const URL_OSM = 'https://download.geofabrik.de/south-america/brazil/sudeste-latest.osm.pbf';
const PASTA_SCRIPT = path.dirname(fileURLToPath(import.meta.url));

const args = lerArgumentos(process.argv.slice(2).filter((a) => a !== 'preparar'));
const soPreparar = process.argv.includes('preparar');
const porta = Number(args.porta ?? 8080);

// ---------------------------------------------------------------- pasta de dados

function escolherPastaDados() {
  if (typeof args.dados === 'string') return path.resolve(args.dados);
  if (process.env.OTP2_DADOS) return path.resolve(process.env.OTP2_DADOS);
  const doMonorepo = path.resolve(PASTA_APP, '..', '..', 'scripts', 'otp2', 'dados');
  if (fs.existsSync(path.join(doMonorepo, 'graph.obj'))) return doMonorepo;
  return path.join(PASTA_APP, '.otp2');
}

// ---------------------------------------------------------------- memória

/** Memória do Java: até 10 GB, sem passar de 65% da RAM e nunca abaixo de 4 GB. */
function memoriaJava() {
  if (typeof args.memoria === 'string') return args.memoria.toUpperCase();
  const totalGb = os.totalmem() / 1024 ** 3;
  return `${Math.max(4, Math.min(10, Math.floor(totalGb * 0.65)))}G`;
}

// ---------------------------------------------------------------- Java 25

function versaoDoJava(executavel) {
  const r = spawnSync(executavel, ['-version'], { encoding: 'utf8' });
  if (r.error || r.status !== 0) return null;
  const m = `${r.stderr}${r.stdout}`.match(/version "(\d+)(?:\.(\d+))?/);
  if (!m) return null;
  return m[1] === '1' ? Number(m[2]) : Number(m[1]); // "1.8" = Java 8
}

function candidatosJava() {
  const bin = process.platform === 'win32' ? 'java.exe' : 'java';
  const lista = [];
  if (process.env.JAVA_HOME) lista.push(path.join(process.env.JAVA_HOME, 'bin', bin));
  lista.push('java');
  const pastas = [
    path.join(os.homedir(), '.jdks'), // JDKs baixados pelo IntelliJ
    'C:\\Program Files\\Eclipse Adoptium',
    'C:\\Program Files\\Java',
    'C:\\Program Files\\Microsoft',
    'C:\\Program Files\\Zulu',
    '/Library/Java/JavaVirtualMachines',
    '/usr/lib/jvm',
  ];
  for (const pasta of pastas) {
    if (!fs.existsSync(pasta)) continue;
    for (const jdk of fs.readdirSync(pasta)) {
      lista.push(path.join(pasta, jdk, 'bin', bin));
      lista.push(path.join(pasta, jdk, 'Contents', 'Home', 'bin', bin)); // macOS
    }
  }
  return lista.filter((c) => c === 'java' || fs.existsSync(c));
}

function acharJava() {
  let melhor = null;
  for (const executavel of candidatosJava()) {
    const versao = versaoDoJava(executavel);
    if (versao && versao >= JAVA_MINIMO && (!melhor || versao > melhor.versao)) melhor = { executavel, versao };
  }
  return melhor;
}

async function garantirJava() {
  passo(`Java ${JAVA_MINIMO} ou mais novo`);
  let java = acharJava();
  if (java) {
    ok(`Java ${java.versao}: ${java.executavel}`);
    return java.executavel;
  }
  if (process.platform === 'win32') {
    aviso(`Não encontrei Java ${JAVA_MINIMO}+ (o OTP2 ${VERSAO_OTP} exige).`);
    if (await confirmar('Instalar o Temurin JDK 25 agora com o winget?')) {
      const r = spawnSync(
        'winget',
        ['install', '--id', 'EclipseAdoptium.Temurin.25.JDK', '-e', '--accept-source-agreements', '--accept-package-agreements'],
        { stdio: 'inherit' },
      );
      if (r.status !== 0) aviso('O winget terminou com erro; procurando o Java mesmo assim.');
      java = acharJava();
      if (java) {
        ok(`Java ${java.versao}: ${java.executavel}`);
        return java.executavel;
      }
    }
    falhar('Instale o Java 25 (winget install EclipseAdoptium.Temurin.25.JDK), feche e reabra o terminal e rode de novo.');
  }
  falhar(
    process.platform === 'darwin'
      ? 'Instale o Java 25 (brew install --cask temurin@25) e rode de novo.'
      : 'Instale o Java 25 (ex.: sudo apt install openjdk-25-jdk ou https://adoptium.net) e rode de novo.',
  );
}

// ---------------------------------------------------------------- downloads

async function baixar(url, destino, descricao) {
  if (fs.existsSync(destino)) {
    ok(`${path.basename(destino)} já existe (${(fs.statSync(destino).size / 1e6).toFixed(0)} MB)`);
    return;
  }
  console.log(`  [..] baixando ${descricao}`);
  const resposta = await fetch(url, { headers: { 'User-Agent': 'voltasegura-setup' } });
  if (!resposta.ok || !resposta.body) falhar(`Download falhou (HTTP ${resposta.status}): ${url}`);
  const total = Number(resposta.headers.get('content-length') ?? 0);
  let baixado = 0;
  let ultimo = 0;
  const parcial = `${destino}.parcial`;
  const corpo = Readable.fromWeb(resposta.body);
  corpo.on('data', (bloco) => {
    baixado += bloco.length;
    if (process.stdout.isTTY && Date.now() - ultimo > 500) {
      ultimo = Date.now();
      const progresso = total ? ` / ${(total / 1e6).toFixed(0)} MB` : ' MB';
      process.stdout.write(`\r       ${(baixado / 1e6).toFixed(0)}${progresso}   `);
    }
  });
  await pipeline(corpo, fs.createWriteStream(parcial));
  if (process.stdout.isTTY) process.stdout.write('\n');
  fs.renameSync(parcial, destino);
  ok(`${path.basename(destino)} (${(baixado / 1e6).toFixed(0)} MB)`);
}

// ---------------------------------------------------------------- recorte do OSM (Python + osmium)

function acharPython() {
  const opcoes = process.platform === 'win32' ? [['py', '-3'], ['python'], ['python3']] : [['python3'], ['python']];
  for (const [cmd, ...pre] of opcoes) {
    const r = spawnSync(cmd, [...pre, '--version'], { encoding: 'utf8' });
    if (r.status === 0 && /Python 3\.(\d+)/.test(`${r.stdout}${r.stderr}`)) return [cmd, ...pre];
  }
  return null;
}

/** Cria um ambiente Python isolado na pasta de dados só para o osmium (não mexe no Python global). */
function pythonComOsmium(pasta) {
  const venv = path.join(pasta, '.venv');
  const pyVenv = process.platform === 'win32' ? path.join(venv, 'Scripts', 'python.exe') : path.join(venv, 'bin', 'python');
  if (!fs.existsSync(pyVenv)) {
    const python = acharPython();
    if (!python) falhar('O recorte do mapa precisa de Python 3.10+ (https://python.org ou winget install Python.Python.3.12).');
    const [cmd, ...pre] = python;
    execFileSync(cmd, [...pre, '-m', 'venv', venv], { stdio: 'inherit' });
  }
  const temOsmium = spawnSync(pyVenv, ['-c', 'import osmium'], { stdio: 'ignore' }).status === 0;
  if (!temOsmium) {
    console.log('  [..] instalando osmium no ambiente isolado');
    execFileSync(pyVenv, ['-m', 'pip', 'install', '--quiet', 'osmium==4.3.2'], { stdio: 'inherit' });
  }
  return pyVenv;
}

async function garantirMapa(pasta) {
  const recorte = path.join(pasta, 'sao-paulo.osm.pbf');
  if (fs.existsSync(recorte)) {
    ok(`sao-paulo.osm.pbf já existe (${(fs.statSync(recorte).size / 1e6).toFixed(0)} MB)`);
    return;
  }
  const sudeste = path.join(pasta, 'sudeste-latest.osm.pbf');
  await baixar(URL_OSM, sudeste, 'OpenStreetMap do Sudeste (~860 MB, a parte mais demorada)');
  const python = pythonComOsmium(pasta);
  console.log('  [..] recortando o mapa para o município de São Paulo (alguns minutos)');
  execFileSync(python, [path.join(PASTA_SCRIPT, 'recortar_osm.py'), sudeste, recorte], { stdio: 'inherit' });
  fs.rmSync(sudeste); // o OTP2 leria os dois .pbf; só o recorte deve ficar na pasta
  ok('sao-paulo.osm.pbf pronto');
}

// ---------------------------------------------------------------- grafo e servidor

/** Roda o Java mostrando a saída no terminal e gravando em um .log na pasta de dados. */
function rodarJava(java, argumentos, pasta, nomeLog, aoLer) {
  const log = fs.createWriteStream(path.join(pasta, nomeLog));
  const processo = spawn(java, argumentos, { cwd: pasta });
  const repassar = (bloco) => {
    process.stdout.write(bloco);
    log.write(bloco);
    aoLer?.(bloco.toString());
  };
  processo.stdout.on('data', repassar);
  processo.stderr.on('data', repassar);
  const parar = () => processo.kill();
  process.on('SIGINT', parar);
  process.on('SIGTERM', parar);
  return new Promise((resolve) =>
    processo.on('close', (codigo) => {
      log.end();
      resolve(codigo);
    }),
  );
}

async function garantirGrafo(java, pasta, jar) {
  passo('Grafo de São Paulo (graph.obj)');
  if (fs.existsSync(path.join(pasta, 'graph.obj'))) {
    ok('graph.obj já existe; para refazer, apague o arquivo');
    return;
  }
  await baixar(URL_GTFS, path.join(pasta, 'sptrans-gtfs.zip'), 'GTFS da SPTrans (~15 MB)');
  await garantirMapa(pasta);
  const memoria = memoriaJava();
  if (os.totalmem() / 1024 ** 3 < 12) aviso('Menos de 12 GB de RAM: a montagem pode falhar por falta de memória. Feche outros programas.');
  console.log(`  [..] montando o grafo com -Xmx${memoria} (uns 5 a 20 minutos)`);
  const inicio = Date.now();
  const codigo = await rodarJava(java, [`-Xmx${memoria}`, '-jar', jar, '--build', '--save', '.'], pasta, 'build.log');
  if (codigo !== 0 || !fs.existsSync(path.join(pasta, 'graph.obj'))) {
    falhar(`A montagem falhou (veja ${path.join(pasta, 'build.log')}). Se foi OutOfMemoryError, rode de novo com --memoria 12G.`);
  }
  ok(`graph.obj montado em ${((Date.now() - inicio) / 60000).toFixed(1)} min`);
}

async function jaEstaRodando() {
  try {
    const r = await fetch(`http://127.0.0.1:${porta}/otp/gtfs/v1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' }),
      signal: AbortSignal.timeout(2000),
    });
    return r.ok;
  } catch {
    return false;
  }
}

async function subirServidor(java, pasta, jar) {
  passo(`Servidor OTP2 na porta ${porta}`);
  const local = await detectarIpLocal();
  const urlCelular = local ? `http://${local.ip}:${porta}` : null;
  if (await jaEstaRodando()) {
    ok(`Já tem um OTP2 respondendo na porta ${porta}; nada a fazer.`);
    if (urlCelular) ok(`No celular: ${urlCelular}/graphiql`);
    return;
  }
  const memoria = memoriaJava();
  console.log(`  [..] carregando o grafo com -Xmx${memoria} (uns 30 s a 2 min). Deixe este terminal aberto.\n`);
  let pronto = false;
  const codigo = await rodarJava(
    java,
    [`-Xmx${memoria}`, '-jar', jar, '--load', '--port', String(porta), '.'],
    pasta,
    'server.log',
    (texto) => {
      if (pronto || !texto.includes('Grizzly server running')) return;
      pronto = true;
      console.log('\n  ================================================================');
      console.log(`  OTP2 pronto. No computador: http://localhost:${porta}/graphiql`);
      if (urlCelular) {
        console.log(`  No celular (mesmo Wi-Fi):   ${urlCelular}/graphiql`);
        console.log(`  O app usa:                  EXPO_PUBLIC_OTP2_URL=${urlCelular}`);
      }
      console.log('  Se o celular não abrir, libere o Java no Firewall do Windows (rede privada).');
      console.log('  Para parar: Ctrl+C.');
      console.log('  ================================================================\n');
    },
  );
  if (!pronto) falhar(`O OTP2 parou antes de ficar pronto (código ${codigo}). Veja ${path.join(pasta, 'server.log')}.`);
}

// ---------------------------------------------------------------- principal

async function main() {
  const pasta = escolherPastaDados();
  fs.mkdirSync(pasta, { recursive: true });
  console.log(`VoltaSegura · OTP2 ${VERSAO_OTP} · dados em ${pasta}`);
  const java = await garantirJava();
  passo(`OpenTripPlanner ${VERSAO_OTP}`);
  const jar = path.join(pasta, `otp-shaded-${VERSAO_OTP}.jar`);
  await baixar(URL_JAR, jar, `OTP2 ${VERSAO_OTP} (~190 MB)`);
  await garantirGrafo(java, pasta, jar);
  if (soPreparar) {
    ok('OTP2 preparado. Para subir: npm run otp2');
    return;
  }
  await subirServidor(java, pasta, jar);
}

main().catch((e) => falhar(e?.message ?? String(e)));
