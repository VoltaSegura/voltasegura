import { useEffect, useState } from 'react';
import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { BackHandler } from 'react-native';

import { Aviso, LinhaLista, SeloExemplo, Tela, Texto, Botao } from '@/components';
import { LinhaCategoria } from '@/components/resultado';
import { SeletorOpcoes } from '@/components/detalhes';
import { useConsulta } from '@/consulta';
import type { FocoRota, Rota, TotaisCategoria } from '@/services';
import { textos } from '@/textos';
import { hipotesesDetalhes as h } from '@/textos/hipotesesDetalhes';

const focos: Record<FocoRota, string> = {
  MENOR_TEMPO: textos.modos.foco.menorTempo,
  MENOS_CAMINHADA: textos.modos.foco.menosCaminhada,
  MENOR_EXPOSICAO: textos.modos.foco.menorExposicaoCompleto,
  OUTRA_OPCAO: textos.modos.foco.outraOpcao,
};

function periodo(inicio: string, fim: string): string {
  const mes = (data: string) => new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' }).format(new Date(`${data}T12:00:00Z`)).replace('.', '');
  return `${mes(inicio)}-${mes(fim)}/${fim.slice(0, 4)}`;
}

function numero(valor: number | null | undefined): string {
  return valor == null ? textos.dadosConsiderados.insuficiente : String(valor);
}

function faixa(rota: Rota): string {
  const faixas = [...new Set(rota.trechos.filter((trecho) => trecho.modo === 'A_PE').map((trecho) => trecho.faixaDoDia))];
  if (faixas.length === 0) return textos.porQue.naoAplicavel;
  if (faixas.includes(null)) return h.faixaNaoInformada;
  const nomes = faixas.map((item) => textos.modos.faixa[item!.toLowerCase() as keyof typeof textos.modos.faixa]);
  return nomes.length === 1 ? nomes[0] : h.faixaMista(nomes.join(' e '));
}

function Grupo({ tipo, totais }: { tipo: 'furto' | 'roubo'; totais: TotaisCategoria }) {
  const [aberto, setAberto] = useState(false);
  const t = textos.dadosConsiderados;
  const itens = tipo === 'furto'
    ? [[t.furtoOutros, totais.outros], [t.furtoCarga, totais.carga], [t.furtoVeiculo, totais.veiculo]] as const
    : [[t.rouboOutros, totais.outros], [t.rouboCarga, totais.carga], [t.rouboVeiculo, totais.veiculo], [t.latrocinio, totais.latrocinio]] as const;
  return (
    <>
      <LinhaCategoria
        rotulo={tipo === 'furto' ? t.furto : t.roubo}
        valor={numero(totais.total)}
        expandida={aberto}
        onPress={() => setAberto((valor) => !valor)}
        detalhes={itens.map(([titulo, valor], indice) => (
        <LinhaLista key={titulo} titulo={titulo} detalhe={indice === 0 ? t.entraComparacao : undefined} valor={numero(valor)} />
      ))}
      />
    </>
  );
}

export default function DadosConsiderados() {
  const { rotaId } = useLocalSearchParams<{ rotaId?: string }>();
  const { resposta, rotaSelecionadaId } = useConsulta();
  const [selecao, setSelecao] = useState<string | null>(null);
  const [panorama, setPanorama] = useState(false);
  useEffect(() => {
    if (!panorama) return;
    const assinatura = BackHandler.addEventListener('hardwareBackPress', () => { setPanorama(false); return true; });
    return () => assinatura.remove();
  }, [panorama]);

  if (!resposta) return <Redirect href="/planejar" />;
  const rota = resposta.rotas.find((item) => item.id === selecao)
    ?? resposta.rotas.find((item) => item.id === rotaId)
    ?? resposta.rotas.find((item) => item.id === rotaSelecionadaId)
    ?? resposta.rotas[0];
  const t = textos.dadosConsiderados;
  const janela = resposta.sobreOsDados.periodo;
  const panoramaPeriodo = resposta.panoramaMunicipal.periodo;

  return (
    <Tela>
      <Stack.Screen options={{ title: panorama ? t.panoramaTitulo : t.titulo }} />
      {resposta.exemplo ? <SeloExemplo /> : null}
      {panorama ? (
        <>
          <Botao variante="texto" rotulo={textos.comuns.voltar} onPress={() => setPanorama(false)} />
          <Texto variante="secao" accessibilityRole="header">{t.panoramaTitulo}</Texto>
          <Aviso texto={t.panoramaAviso(periodo(panoramaPeriodo.inicio, panoramaPeriodo.fim))} />
          <LinhaLista titulo={t.homicidio} valor={numero(resposta.panoramaMunicipal.homicidioDoloso)} />
          <LinhaLista titulo={t.tentativa} valor={numero(resposta.panoramaMunicipal.tentativaHomicidio)} />
          <LinhaLista titulo={t.estupro} valor={numero(resposta.panoramaMunicipal.estupro)} />
          <LinhaLista titulo={t.estuproVulneravel} valor={numero(resposta.panoramaMunicipal.estuproVulneravel)} />
          <Texto>{h.creditosFontes}</Texto>
        </>
      ) : rota ? (
        <>
          <SeletorOpcoes
            rotuloGrupo={t.titulo}
            opcoes={resposta.rotas.map((item, indice) => ({ valor: item.id, rotulo: h.opcaoComFoco(indice + 1, item.focos.map((foco) => focos[foco]).join(', ')) }))}
            valor={rota.id}
            onChange={setSelecao}
          />
          <Texto>{t.contexto({ fonte: resposta.sobreOsDados.fonte, periodo: periodo(janela.inicio, janela.fim), faixa: faixa(rota) })}</Texto>
          <Aviso texto={h.avisoRecorteAntes} />
          <Texto variante="secao" accessibilityRole="header">{h.totaisCategoria}</Texto>
          <Grupo key={`${rota.id}-furto`} tipo="furto" totais={rota.categorias.furto} />
          <Grupo key={`${rota.id}-roubo`} tipo="roubo" totais={rota.categorias.roubo} />
          <LinhaLista titulo={t.transito} valor={numero(rota.categorias.transito.total)} />
          <LinhaLista titulo={t.panoramaLink} onPress={() => setPanorama(true)} />
        </>
      ) : null}
    </Tela>
  );
}

