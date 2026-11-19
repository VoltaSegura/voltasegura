import { Redirect, Stack, router, useLocalSearchParams } from 'expo-router';

import { Cabecalho, Link, SeloExemplo, Tela, Texto } from '@/components';
import { BarraCobertura, Indicativo, RotuloFoco, TabelaNumeros, coberturaPorProxy, focosVisiveis, selosExemplo, soRoteamento } from '@/components/resultado';
import { useConsulta } from '@/consulta';
import type { FocoRota, RespostaConsulta, Rota } from '@/services';
import { textos } from '@/textos';
import { hipotesesDetalhes as h } from '@/textos/hipotesesDetalhes';
import { hipotesesPrioridade } from '@/textos/hipotesesPrioridade';

const numero = (valor: number) => valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
const distancia = (km: number) => km < 1 ? `${numero(km * 1000)} m` : `${numero(km)} km`;
const focos: Record<FocoRota, string> = {
  MENOR_TEMPO: textos.modos.foco.menorTempo,
  MENOS_CAMINHADA: textos.modos.foco.menosCaminhada,
  MENOR_EXPOSICAO: textos.modos.foco.menorExposicaoCompleto,
  OUTRA_OPCAO: textos.modos.foco.outraOpcao,
};

function indicativo(resposta: RespostaConsulta, rota: Rota): string {
  if (resposta.rotas.length === 1 || resposta.caso === 'SEM_COMPARACAO') return textos.porQue.indicativo.semComparacao;
  // B-59 (D-33): destaque com diferença pequena (menos registros, sem diferença estatística)
  const destaque = resposta.rotas.find((item) => item.destaqueExposicao?.confianca === 'pequena');
  if (destaque) {
    return destaque.id === rota.id
      ? hipotesesPrioridade.indicativoComFocoPequena
      : hipotesesPrioridade.indicativoSemFocoPequena(h.opcao(resposta.rotas.indexOf(destaque) + 1));
  }
  switch (resposta.caso) {
    case 'CONCLUSIVO': return rota.focos.includes('MENOR_EXPOSICAO')
      ? textos.porQue.indicativo.conclusivoComFoco
      : textos.porQue.indicativo.conclusivoSemFoco(textos.modos.foco.menorExposicaoCompleto);
    case 'INSUFICIENTE': {
      const motivo = resposta.motivo === 'AMOSTRA' ? textos.porQue.motivo.amostra
        : resposta.motivo === 'COBERTURA' ? textos.porQue.motivo.cobertura
          : textos.porQue.motivo.largura;
      return textos.porQue.indicativo.insuficiente(motivo);
    }
    case 'NAO_APLICAVEL': return textos.porQue.indicativo.naoAplicavel;
    case 'MISTOS': return textos.casosResultado.mistos;
    case 'INDISPONIVEL': return textos.porQue.indicativo.indisponivel;
    default: return textos.porQue.indicativo.semDiferenca;
  }
}

export default function PorQueEstaRota() {
  const { rotaId, trechoId } = useLocalSearchParams<{ rotaId?: string; trechoId?: string }>();
  const { resposta } = useConsulta();
  const rota = resposta?.rotas.find((item) => item.id === rotaId);
  const trecho = rota?.trechos.find((item) => item.id === trechoId && item.modo === 'A_PE');
  if (!resposta) return <Redirect href="/planejar" />;
  if (!rota || !trecho) return <Redirect href="/planejar" />;

  const semExposicao = soRoteamento(resposta);
  const comDestaque = resposta.caso === 'CONCLUSIVO' || resposta.rotas.some((item) => item.destaqueExposicao);
  const vencedor = comDestaque && !rota.focos.includes('MENOR_EXPOSICAO')
    ? resposta.rotas.find((item) => item.focos.includes('MENOR_EXPOSICAO')) : null;
  const faixa = trecho.faixaDoDia ? textos.modos.faixa[trecho.faixaDoDia.toLowerCase() as keyof typeof textos.modos.faixa] : null;
  const exposicao = rota.exposicao;
  const linhas = semExposicao ? [] : [
    { rotulo: textos.porQue.registros, valor: exposicao.registros },
    { rotulo: textos.porQue.km, valor: numero(exposicao.kmAPe) },
    { rotulo: textos.porQue.porKm, valor: exposicao.kmAPe === 0 ? textos.porQue.naoAplicavel : exposicao.registrosPorKm === null ? null : numero(exposicao.registrosPorKm) },
  ];

  // Cabeçalho do mockup 05: título à esquerda, "Fechar" à direita (sem cabeçalho nativo).
  const cabecalho = <Cabecalho titulo={textos.porQue.titulo} acaoDireita={{ rotulo: h.fecharExplicacao, onPress: () => router.back() }} />;

  if (semExposicao) {
    // Acesso direto (link ou rota salva): sem exposição estimada não há registros, cobertura nem foco para explicar.
    return <Tela topo={cabecalho}>
      <Stack.Screen options={{ title: textos.porQue.titulo, headerShown: false }} />
      <Texto accessibilityRole="header" variante="secao">{textos.porQue.trecho({ i: trecho.ordem, distancia: distancia(trecho.distanciaKm) })}</Texto>
      {selosExemplo(resposta).roteamento && <SeloExemplo />}
      <Indicativo texto={textos.soRoteamento.porQue} />
      <Link variante="dado" rotulo={textos.porQue.linkSobre} onPress={() => router.push('/sobre-os-dados')} />
    </Tela>;
  }

  return <Tela topo={cabecalho}>
    <Stack.Screen options={{ title: textos.porQue.titulo, headerShown: false }} />
    <Texto accessibilityRole="header" variante="secao">{textos.porQue.trecho({ i: trecho.ordem, distancia: distancia(trecho.distanciaKm) })}</Texto>
    {focosVisiveis(rota.focos, resposta).map((foco) => <RotuloFoco key={foco} foco={foco} rotulo={focos[foco]} />)}
    {(selosExemplo(resposta).roteamento || selosExemplo(resposta).exposicao) && <SeloExemplo />}
    <Texto>{textos.porQue.conta}</Texto>
    <Texto>{faixa ? textos.porQue.faixa(faixa) : h.faixaAusente}</Texto>
    <Indicativo texto={indicativo(resposta, rota)} />
    {vencedor && <Link rotulo={h.verOpcao(resposta.rotas.indexOf(vencedor) + 1)} onPress={() => router.push({ pathname: '/resultado/[rotaId]', params: { rotaId: vencedor.id } })} />}
    {linhas.length > 0 && <>
      <Texto variante="secao" accessibilityRole="header">{textos.porQue.nestaRota}</Texto>
      <TabelaNumeros linhas={linhas} dadosInsuficientes={textos.dadosConsiderados.insuficiente} />
    </>}
    <Texto variante="secao" accessibilityRole="header">{h.qualidadeDados}</Texto>
    <TabelaNumeros linhas={[{ rotulo: textos.porQue.cobertura, valor: exposicao.cobertura === null ? null : `${Math.round(exposicao.cobertura * 100)}%` }]} dadosInsuficientes={textos.dadosConsiderados.insuficiente} />
    {exposicao.cobertura !== null && <BarraCobertura rotulo={textos.porQue.cobertura} valor={exposicao.cobertura} />}
    {coberturaPorProxy(resposta) && <Texto testID="aviso-cobertura-proxy" cor="texto2">{textos.coberturaProxy.aviso}</Texto>}
    {resposta.caso === 'INSUFICIENTE' && <Texto cor="texto2">{textos.porQue.semOrdenar}</Texto>}
    <Texto cor="texto2">{textos.porQue.limitacao}</Texto>
    <Link variante="dado" rotulo={textos.porQue.linkSobre} onPress={() => router.push('/sobre-os-dados')} />
    <Link variante="dado" rotulo={textos.porQue.linkConsiderados} onPress={() => router.push({ pathname: '/dados-considerados', params: { rotaId: rota.id } })} />
  </Tela>;
}
