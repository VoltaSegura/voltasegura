import { useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { Aviso, Botao, EstadoVazio, GrupoLinhas, Interruptor, LinhaGrupo, Tela, Texto } from '@/components';
import { MAX_ROTINAS, resumoDias, useRotinas, type Rotina } from '@/rotina';
import { rotina as t } from '@/textos/rotina';
import { esp } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

/** TL-16: lista da Rotina da semana (VoltaSegura+, recurso em validação, D-31). */
export default function Rotinas() {
  const { rotinas, carregado, alternar } = useRotinas();
  const { aviso: avisoInicial } = useLocalSearchParams<{ aviso?: string }>();
  const [aviso, setAviso] = useState<'sem_permissao' | 'erro' | null>(avisoInicial === 'sem_permissao' ? 'sem_permissao' : avisoInicial === 'erro_aviso' ? 'erro' : null);
  const [ocupado, setOcupado] = useState(false);
  const { cores } = useTema();

  async function mudar(r: Rotina, ativa: boolean) {
    if (ocupado) return;
    setOcupado(true);
    setAviso(null);
    try {
      const resultado = await alternar(r.id, ativa);
      if (resultado === 'sem_permissao') setAviso('sem_permissao');
      else if (resultado !== 'ok') setAviso('erro');
      else AccessibilityInfo.announceForAccessibility(ativa ? t.lembreteAtivado : t.lembreteDesativado);
    } finally { setOcupado(false); }
  }

  const cheio = rotinas.length >= MAX_ROTINAS;

  return (
    <Tela>
      <Stack.Screen
        options={{
          title: t.titulo,
          // Se a tela for a primeira da pilha (sem histórico), o cabeçalho não tem seta: dá a saída para a home.
          headerLeft: router.canGoBack() ? undefined : () => <Botao variante="texto" rotulo={t.irParaInicio} onPress={() => router.replace('/planejar')} />,
        }}
      />
      <View accessible accessibilityRole="header" style={estilos.selo}>
        <Texto variante="rotulo" cor="acaoLink">{t.selo}</Texto>
      </View>
      <Texto variante="corpo">{t.intro}</Texto>
      <Texto variante="apoio" cor="texto2">{t.semPreco} {t.lembreteSoHorario}</Texto>
      <Texto variante="apoio" cor="texto2">{t.privacidade}</Texto>
      {aviso === 'sem_permissao' ? <Aviso texto={t.semPermissao} /> : null}
      {aviso === 'erro' ? <Aviso texto={t.erroAvisoAgendar} variante="erro" /> : null}
      {carregado && rotinas.length === 0 ? <EstadoVazio texto={t.vazio} /> : null}
      {rotinas.length > 0 ? (
        <GrupoLinhas titulo={t.secaoRotinas}>
          {rotinas.map((r, i) => {
            const trajeto = t.trajeto(r.origem.rotulo, r.destino.rotulo);
            return (
              <View key={r.id}>
                <LinhaGrupo
                  testID={`rotina-${r.id}`}
                  icone="calendar-clock-outline"
                  titulo={trajeto}
                  detalhe={t.detalhe(resumoDias(r.dias), r.hora)}
                  rotuloAcessibilidade={`${t.editar}. ${trajeto}. ${t.detalhe(resumoDias(r.dias), r.hora)}`}
                  onPress={() => router.push({ pathname: '/rotina/editar', params: { id: r.id } })}
                  ultima
                />
                <View style={[estilos.interruptor, i === rotinas.length - 1 ? null : { borderBottomWidth: 1, borderBottomColor: cores.divisoria }]}>
                  <Interruptor rotulo={t.alternar(trajeto)} ligado={r.ativa} desabilitado={ocupado} onChange={(ativa) => { void mudar(r, ativa); }} />
                </View>
              </View>
            );
          })}
        </GrupoLinhas>
      ) : null}
      {cheio ? <Texto variante="apoio" cor="texto2">{t.limite(MAX_ROTINAS)}</Texto> : null}
      <Botao rotulo={t.nova} desabilitado={cheio} onPress={() => router.push('/rotina/editar')} />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  selo: { alignSelf: 'flex-start' },
  interruptor: { paddingHorizontal: esp[3] },
});
