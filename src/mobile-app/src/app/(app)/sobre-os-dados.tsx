import { Redirect, Stack, router } from 'expo-router';

import { LinhaLista, Link, SeloExemplo, Tela, Texto } from '@/components';
import { useConsulta } from '@/consulta';
import type { FocoRota, RespostaConsulta, Rota } from '@/services';
import { textos } from '@/textos';
import { hipotesesDetalhes as h } from '@/textos/hipotesesDetalhes';

const focos: Record<FocoRota, string> = {
  MENOR_TEMPO: textos.modos.foco.menorTempo,
  MENOS_CAMINHADA: textos.modos.foco.menosCaminhada,
  MENOR_EXPOSICAO: textos.modos.foco.menorExposicaoCompleto,
  OUTRA_OPCAO: textos.modos.foco.outraOpcao,
};

function periodo(inicio: string, fim: string): string {
  if (!inicio || !fim) return h.dataAusente;
  const mes = (data: string) => new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' }).format(new Date(`${data}T12:00:00Z`)).replace('.', '');
  return `${mes(inicio)}-${mes(fim)}/${fim.slice(0, 4)}`;
}

function data(dataIso: string): string {
  if (!dataIso) return h.dataAusente;
  const [ano, mes, dia] = dataIso.split('-');
  return `${dia}/${mes}/${ano}`;
}

function situacao(resposta: RespostaConsulta): string {
  if (resposta.rotas.length === 1 || resposta.caso === 'SEM_COMPARACAO') return textos.porQue.indicativo.semComparacao;
  switch (resposta.caso) {
    case 'CONCLUSIVO': {
      const rota = resposta.rotas.find((item) => item.focos.includes('MENOR_EXPOSICAO'));
      return rota ? `${h.opcao(resposta.rotas.indexOf(rota) + 1)}: ${textos.porQue.indicativo.conclusivoComFoco}` : textos.porQue.indicativo.semDiferenca;
    }
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

function cobertura(rota: Rota): string {
  return rota.exposicao.cobertura === null
    ? textos.dadosConsiderados.insuficiente
    : `${Math.round(rota.exposicao.cobertura * 100)}%`;
}

export default function SobreOsDados() {
  const { resposta } = useConsulta();
  if (!resposta) return <Redirect href="/planejar" />;

  const { fonte, periodo: janela, atualizacao } = resposta.sobreOsDados;
  return (
    <Tela>
      <Stack.Screen options={{ title: textos.sobre.titulo }} />
      {resposta.exemplo ? <SeloExemplo /> : null}
      <Texto variante="secao" accessibilityRole="header">{textos.sobre.fonteTitulo}</Texto>
      <Texto>{textos.sobre.fonte({ fonte, periodo: periodo(janela.inicio, janela.fim), meses: janela.meses })}</Texto>
      <Texto>{textos.sobre.atualizacaoSsp(data(atualizacao.ssp))}</Texto>
      <Texto>{textos.sobre.atualizacaoGtfs(data(atualizacao.gtfs))}</Texto>
      <Texto variante="secao" accessibilityRole="header">{textos.sobre.coberturaTitulo}</Texto>
      {resposta.rotas.map((rota, indice) => (
        <LinhaLista key={rota.id} titulo={h.opcaoComFoco(indice + 1, rota.focos.map((foco) => focos[foco]).join(', '))} valor={cobertura(rota)} />
      ))}
      <Texto cor="texto2">{textos.sobre.coberturaExplica}</Texto>
      <Texto variante="secao" accessibilityRole="header">{textos.sobre.situacaoTitulo}</Texto>
      <Texto>{situacao(resposta)}</Texto>
      <Texto variante="secao" accessibilityRole="header">{textos.sobre.limitacoesTitulo}</Texto>
      {[textos.sobre.limSubnotificacao, textos.sobre.limCoordenadas, textos.sobre.limTiposLocal, textos.sobre.limNaturezas, textos.sobre.limHorarios].map((limite) => <Texto key={limite}>{`• ${limite}`}</Texto>)}
      <Link rotulo={textos.porQue.linkConsiderados} onPress={() => router.push('/dados-considerados')} />
      <Texto variante="secao" accessibilityRole="header">{textos.sobre.creditosTitulo}</Texto>
      <Texto>{h.creditosFontes}</Texto>
    </Tela>
  );
}

