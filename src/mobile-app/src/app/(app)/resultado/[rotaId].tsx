import { useState } from 'react';
import { Redirect, Stack, router, useLocalSearchParams } from 'expo-router';

import { Botao, SeloExemplo, Tela, Texto } from '@/components';
import { MapaResultado } from '@/components/mapa';
import { LinhaSobreOsDados, RotuloFoco, formatarPeriodo, type RotulosTrecho, type RotulosModos } from '@/components/resultado';
import { ListaTrechosDetalhada } from '@/components/detalhes';
import { useConsulta } from '@/consulta';
import type { FocoRota } from '@/services';
import { textos } from '@/textos';
import { hipotesesDetalhes as h } from '@/textos/hipotesesDetalhes';

const modos: RotulosModos = {
  A_PE: textos.modos.modo.aPe,
  ONIBUS: textos.modos.modo.onibus,
  METRO: textos.modos.modo.metro,
  TREM: textos.modos.modo.trem,
};
const focos: Record<FocoRota, string> = {
  MENOR_TEMPO: textos.modos.foco.menorTempo,
  MENOS_CAMINHADA: textos.modos.foco.menosCaminhada,
  MENOR_EXPOSICAO: textos.modos.foco.menorExposicaoCompleto,
  OUTRA_OPCAO: textos.modos.foco.outraOpcao,
};
const numero = (valor: number) => valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
const distancia = (km: number) => km < 1 ? `${numero(km * 1000)} m` : `${numero(km)} km`;
const hora = (iso: string) => iso.slice(11, 16);

const rotulos: RotulosTrecho & { modos: RotulosModos } = {
  modos,
  resumo: (trecho, total, modo) => `${trecho.ordem}/${total}, ${textos.resultado.detalhes.trecho({ modo, distancia: distancia(trecho.distanciaKm), duracao: `${trecho.duracaoMin} min` })}`,
  detalhe: (trecho, modo) => textos.resultado.detalhes.trecho({ modo, distancia: distancia(trecho.distanciaKm), duracao: `${trecho.duracaoMin} min` }),
  embarque: (trecho) => {
    if (trecho.modo === 'A_PE') return null;
    const previsto = trecho.partidaPrevista ? textos.resultado.detalhes.embarque(hora(trecho.partidaPrevista)) : null;
    return [previsto, trecho.embarque].filter(Boolean).join(' · ') || null;
  },
  desembarque: (trecho) => trecho.desembarque ? `${h.desembarque} · ${trecho.desembarque}` : null,
};

export default function DetalhesRota() {
  const { rotaId } = useLocalSearchParams<{ rotaId?: string }>();
  const { resposta, estado, planejarVolta } = useConsulta();
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const rota = resposta?.rotas.find((item) => item.id === rotaId);
  if (!resposta) return <Redirect href="/planejar" />;
  if (!rota) return <Redirect href="/planejar" />;

  const trechos = [...rota.trechos].sort((a, b) => a.ordem - b.ordem);
  const podeExplicar = rota.exposicao.kmAPe > 0;
  const { fonte, periodo } = resposta.sobreOsDados;
  const periodoCurto = formatarPeriodo(periodo.inicio, periodo.fim);
  const linhaDados = resposta.caso === 'INDISPONIVEL'
    ? textos.comuns.linhaDadosIndisponivel
    : textos.comuns.linhaDados({ fonte, periodo: periodoCurto });

  return <Tela rodape={<LinhaSobreOsDados texto={linhaDados} rotuloAcessivel={linhaDados} indisponivel={resposta.caso === 'INDISPONIVEL'} onPress={() => router.push('/sobre-os-dados')} />}>
    <Stack.Screen options={{ title: estado.consulta.sentido === 'volta' ? textos.resultado.cabecalhoVolta : textos.resultado.cabecalhoIda }} />
    <MapaResultado rotas={[rota]} rotaSelecionadaId={rota.id} onSelecionar={() => {}} expandido />
    {resposta.exemplo && <SeloExemplo />}
    {rota.focos.map((foco) => <RotuloFoco key={foco} foco={foco} rotulo={focos[foco]} />)}
    <Texto>{`${rota.duracaoMin} min · ${textos.resultado.kmAPe(distancia(rota.caminhadaKm))} · ${textos.resultado.trocas(rota.trocas)}`}</Texto>
    <ListaTrechosDetalhada trechos={trechos} modos={modos} detalhe={rotulos.detalhe} embarque={rotulos.embarque}
      selecionadoId={selecionadoId} onSelecionar={setSelecionadoId}
      onExplicar={podeExplicar ? (trecho) => router.push({ pathname: '/por-que/[rotaId]/[trechoId]', params: { rotaId: rota.id, trechoId: trecho.id } }) : undefined} />
    {!podeExplicar && <Texto>{textos.resultado.detalhes.semTrechoAPe}</Texto>}
    <Texto cor="texto2">{textos.comuns.horariosPrevistos}</Texto>
    <Botao variante="texto" rotulo={textos.porQue.linkConsiderados} onPress={() => router.push({ pathname: '/dados-considerados', params: { rotaId: rota.id } })} />
    <Botao variante="secundario" rotulo={textos.resultado.planejarVolta} onPress={() => { planejarVolta(); router.push({ pathname: '/planejar', params: { sentido: 'volta' } }); }} />
  </Tela>;
}
