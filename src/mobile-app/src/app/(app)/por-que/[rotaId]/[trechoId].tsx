import { Redirect, Stack, router, useLocalSearchParams } from 'expo-router';

import { Botao, Link, SeloExemplo, Tela, Texto } from '@/components';
import { Indicativo, RotuloFoco, TabelaNumeros } from '@/components/resultado';
import { useConsulta } from '@/consulta';
import type { FocoRota, RespostaConsulta, Rota } from '@/services';
import { textos } from '@/textos';
import { hipotesesDetalhes as h } from '@/textos/hipotesesDetalhes';

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

  const vencedor = resposta.caso === 'CONCLUSIVO' && !rota.focos.includes('MENOR_EXPOSICAO')
    ? resposta.rotas.find((item) => item.focos.includes('MENOR_EXPOSICAO')) : null;
  const faixa = trecho.faixaDoDia ? textos.modos.faixa[trecho.faixaDoDia.toLowerCase() as keyof typeof textos.modos.faixa] : null;
  const exposicao = rota.exposicao;
  const linhas = resposta.caso === 'INDISPONIVEL' ? [] : [
    { rotulo: textos.porQue.registros, valor: exposicao.registros },
    { rotulo: textos.porQue.km, valor: numero(exposicao.kmAPe) },
    { rotulo: textos.porQue.porKm, valor: exposicao.kmAPe === 0 ? textos.porQue.naoAplicavel : exposicao.registrosPorKm === null ? null : numero(exposicao.registrosPorKm) },
  ];

  return <Tela>
    <Stack.Screen options={{ title: textos.porQue.titulo }} />
    <Botao variante="texto" rotulo={h.fecharExplicacao} onPress={() => router.back()} />
    <Texto accessibilityRole="header" variante="secao">{textos.porQue.trecho({ i: trecho.ordem, distancia: distancia(trecho.distanciaKm) })}</Texto>
    {rota.focos.map((foco) => <RotuloFoco key={foco} foco={foco} rotulo={focos[foco]} />)}
    {resposta.exemplo && <SeloExemplo />}
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
    {resposta.caso === 'INSUFICIENTE' && <Texto cor="texto2">{textos.porQue.semOrdenar}</Texto>}
    <Texto cor="texto2">{textos.porQue.limitacao}</Texto>
    <Link variante="dado" rotulo={textos.porQue.linkSobre} onPress={() => router.push('/sobre-os-dados')} />
    <Link variante="dado" rotulo={textos.porQue.linkConsiderados} onPress={() => router.push({ pathname: '/dados-considerados', params: { rotaId: rota.id } })} />
  </Tela>;
}
