import { useState } from 'react';
import { formatarHora } from '@/components/resultado/formatos';
import { Redirect, Stack, router, useLocalSearchParams } from 'expo-router';

import { Botao, SeloExemplo, Tela, Texto } from '@/components';
import { MapaResultado } from '@/components/mapa';
import { LinhaSobreOsDados, RotuloFoco, focosVisiveis, formatarPeriodo, selosExemplo, soRoteamento, type RotulosTrecho, type RotulosModos } from '@/components/resultado';
import { ListaTrechosDetalhada } from '@/components/detalhes';
import { useConsulta } from '@/consulta';
import type { FocoRota } from '@/services';
import { textos } from '@/textos';
import { hipotesesDetalhes as h } from '@/textos/hipotesesDetalhes';
import { hipotesesPrioridade } from '@/textos/hipotesesPrioridade';
import { hipotesesResultado } from '@/textos/hipotesesResultado';

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


const rotulos: RotulosTrecho & { modos: RotulosModos } = {
  modos,
  resumo: (trecho, total, modo) => `${trecho.ordem}/${total}, ${textos.resultado.detalhes.trecho({ modo, distancia: distancia(trecho.distanciaKm), duracao: `${trecho.duracaoMin} min` })}`,
  detalhe: (trecho, modo) => textos.resultado.detalhes.trecho({ modo, distancia: distancia(trecho.distanciaKm), duracao: `${trecho.duracaoMin} min` }),
  embarque: (trecho) => {
    if (trecho.modo === 'A_PE') return null;
    const previsto = trecho.partidaPrevista ? textos.resultado.detalhes.embarque(formatarHora(trecho.partidaPrevista)) : null;
    return [previsto, trecho.embarque].filter(Boolean).join(' · ') || null;
  },
  desembarque: (trecho) => trecho.desembarque ? `${h.desembarque} · ${trecho.desembarque}` : null,
};

export default function DetalhesRota() {
  const { rotaId } = useLocalSearchParams<{ rotaId?: string }>();
  const { resposta, estado } = useConsulta();
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const rota = resposta?.rotas.find((item) => item.id === rotaId);
  if (!resposta) return <Redirect href="/planejar" />;
  if (!rota) return <Redirect href="/planejar" />;

  const trechos = [...rota.trechos].sort((a, b) => a.ordem - b.ordem);
  const semExposicao = soRoteamento(resposta);
  const selos = selosExemplo(resposta);
  const temTrechoAPe = rota.exposicao.kmAPe > 0;
  // "Por que esta rota?" explica registros; sem exposição estimada não há o que explicar (B-08).
  const podeExplicar = temTrechoAPe && !semExposicao;
  const { fonte, periodo } = resposta.sobreOsDados;
  const periodoCurto = formatarPeriodo(periodo.inicio, periodo.fim);
  const linhaDados = semExposicao
    ? textos.soRoteamento.linhaDados
    : textos.comuns.linhaDados({ fonte, periodo: periodoCurto });

  return <Tela rodape={<LinhaSobreOsDados texto={linhaDados} rotuloAcessivel={linhaDados} indisponivel={semExposicao} onPress={() => router.push('/sobre-os-dados')} />}>
    <Stack.Screen options={{ title: estado.consulta.sentido === 'volta' ? textos.resultado.cabecalhoVolta : textos.resultado.cabecalhoIda }} />
    <MapaResultado rotas={[rota]} rotaSelecionadaId={rota.id} onSelecionar={() => {}} expandido exemplo={resposta.fontes.roteamento === 'exemplo'} />
    {(selos.roteamento || (selos.exposicao && rota.focos.includes('MENOR_EXPOSICAO'))) && <SeloExemplo />}
    {focosVisiveis(rota.focos, resposta).map((foco) => <RotuloFoco key={foco} foco={foco} rotulo={focos[foco]} />)}
    {!semExposicao && rota.destaqueExposicao && <Texto testID="detalhe-confianca">{hipotesesPrioridade.confianca[rota.destaqueExposicao.confianca]}</Texto>}
    {rota.variante && <Texto cor="texto2" testID="detalhe-variante">{rota.variante.origem === 'dados' ? hipotesesPrioridade.rotaDosDados : hipotesesResultado.varianteCaminhada}</Texto>}
    <Texto>{`${rota.duracaoMin} min · ${textos.resultado.kmAPe(distancia(rota.caminhadaKm))} · ${textos.resultado.trocas(rota.trocas)}`}</Texto>
    <ListaTrechosDetalhada trechos={trechos} modos={modos} detalhe={rotulos.detalhe} embarque={rotulos.embarque}
      selecionadoId={selecionadoId} onSelecionar={setSelecionadoId}
      onExplicar={podeExplicar ? (trecho) => router.push({ pathname: '/por-que/[rotaId]/[trechoId]', params: { rotaId: rota.id, trechoId: trecho.id } }) : undefined} />
    {semExposicao && <Texto testID="aviso-so-roteamento">{textos.soRoteamento.aviso}</Texto>}
    {!temTrechoAPe && <Texto>{textos.resultado.detalhes.semTrechoAPe}</Texto>}
    <Texto cor="texto2">{textos.comuns.horariosPrevistos}</Texto>
    {!semExposicao && <Botao variante="texto" rotulo={textos.porQue.linkConsiderados} onPress={() => router.push({ pathname: '/dados-considerados', params: { rotaId: rota.id } })} />}
    {/* Item 7 (T25-B): o detalhe termina em "Seguir rota". Compartilhar fica só em seguir/[rotaId]. */}
    <Botao rotulo={textos.seguir.botaoEntrada} onPress={() => router.push({ pathname: '/seguir/[rotaId]', params: { rotaId: rota.id } })} testID="botao-seguir-rota" />
  </Tela>;
}
