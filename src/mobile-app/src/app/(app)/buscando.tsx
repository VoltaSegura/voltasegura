import { useEffect, useRef } from 'react';
import { AccessibilityInfo } from 'react-native';
import { Stack, router } from 'expo-router';

import { Aviso, Botao, Cabecalho, Carregando, Link, Tela, Texto } from '@/components';
import { haptica } from '@/components/movimento';
import { useConsulta } from '@/consulta';
import { textos } from '@/textos';
import { hipotesesPlanejar } from '@/textos/hipotesesPlanejar';

export default function Buscando() {
  const { estado, buscar, cancelarBusca } = useConsulta();
  const { busca, consulta } = estado;
  const iniciou = useRef(false);
  const buscaInicial = useRef(busca);
  const repetindo = useRef(false);

  useEffect(() => {
    if (!iniciou.current) {
      iniciou.current = true;
      void buscar();
    }
  }, [buscar]);

  useEffect(() => {
    if (busca !== buscaInicial.current && busca.status === 'sucesso' && busca.resposta.rotas.length > 0) {
      haptica.sucesso();
      AccessibilityInfo.announceForAccessibility(hipotesesPlanejar.alternativasEncontradas);
      router.replace('/resultado');
    }
  }, [busca]);

  useEffect(() => {
    if (busca.status === 'erro' && busca.erro.tipo === 'NAO_AUTORIZADO') {
      AccessibilityInfo.announceForAccessibility(hipotesesPlanejar.sessaoExpirada);
      router.replace('/entrar');
    }
  }, [busca]);

  useEffect(() => {
    if (busca.status === 'erro' && busca.erro.tipo !== 'NAO_AUTORIZADO') haptica.erro();
  }, [busca]);

  const voltar = () => { cancelarBusca(); router.replace('/planejar'); };
  const mudarHorario = () => { cancelarBusca(); router.replace({ pathname: '/planejar', params: { foco: 'horario' } }); };
  const hora = Number.isNaN(Date.parse(consulta.saida)) ? '--:--' :
    new Date(consulta.saida).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const resumo = hipotesesPlanejar.buscarResumo(consulta.sentido === 'volta' ? textos.planejar.volta : textos.planejar.ida, hora);
  const semTransporte = busca.status === 'sucesso' && busca.resposta.rotas.length === 0;
  const mensagem = semTransporte ? textos.buscando.semTransporte : busca.status === 'erro'
    ? busca.erro.tipo === 'SEM_REDE' ? hipotesesPlanejar.semRede
      : busca.erro.tipo === 'FORA_DA_AREA' ? textos.planejar.foraArea
      : busca.erro.tipo === 'VALIDACAO' ? busca.problemas?.includes('ORIGEM_AUSENTE') ? textos.planejar.erroOrigem
        : busca.problemas?.includes('DESTINO_AUSENTE') ? textos.planejar.erroDestino
        : busca.problemas?.includes('ORIGEM_IGUAL_DESTINO') ? textos.planejar.mesmoLugar
        : busca.problemas?.includes('SAIDA_INVALIDA') ? hipotesesPlanejar.saidaInvalida : textos.comuns.erro.servidor
      : busca.erro.status === 504 ? textos.comuns.erro.tempoEsgotado
      : textos.comuns.erro.servidor
    : null;

  return (
    <Tela topo={<Cabecalho titulo={resumo} navegacao={{ rotulo: textos.comuns.voltar, onPress: voltar }} />}>
      <Stack.Screen options={{ title: textos.buscando.texto }} />
      {busca.status === 'ocioso' || busca.status === 'buscando' ? (
        <>
          <Carregando texto={textos.buscando.texto} />
          <Texto>{textos.buscando.privacidade}</Texto>
          <Botao rotulo={textos.comuns.cancelar} variante="secundario" onPress={voltar} />
        </>
      ) : null}
      {mensagem ? <Aviso texto={mensagem} variante={semTransporte ? 'informativo' : 'erro'} /> : null}
      {semTransporte ? <Botao rotulo={textos.buscando.mudarHorario} onPress={mudarHorario} /> : null}
      {busca.status === 'erro' ? (
        <>
          <Botao rotulo={textos.comuns.tentarDeNovo} onPress={() => { if (repetindo.current) return; repetindo.current = true; void buscar().finally(() => { repetindo.current = false; }); }} />
          <Link rotulo={textos.comuns.erro.voltarPlanejamento} onPress={voltar} />
        </>
      ) : null}
    </Tela>
  );
}
