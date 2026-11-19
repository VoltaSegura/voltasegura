import { useState } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { Aviso, Botao, Interruptor, Segmentado, Tela, Texto } from '@/components';
import { CartaoLocal, SeletorHorario } from '@/components/planejar';
import { useLocais, type LocalSalvo } from '@/locais';
import {
  ANTECEDENCIA_PADRAO,
  ANTECEDENCIAS,
  MAX_ROTINAS,
  normalizarHora,
  useRotinas,
  validarRotina,
  type PontoRotina,
  type ProblemaRotina,
  type Rotina,
} from '@/rotina';
import { horaLocal, isoDeHoraHoje } from '@/plus';
import { rotina as t } from '@/textos/rotina';
import { esp, raio, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

const TODOS_OS_DIAS = [1, 2, 3, 4, 5, 6, 7];

/** TL-17: criar ou editar uma rotina (origem e destino entre os lugares salvos, dias, horário e antecedência). */
export default function EditarRotina() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { rotinas, carregado } = useRotinas();
  const existente = id ? rotinas.find((r) => r.id === id) : undefined;
  if (!carregado) return <Tela><Stack.Screen options={{ title: t.nova }} /></Tela>;
  // A chave remonta o formulário se a rotina mudar de dentro; os campos começam dos valores salvos.
  return <Formulario key={existente?.id ?? 'nova'} existente={existente} />;
}

function ehLugar(p: PontoRotina | null, l: LocalSalvo): boolean {
  return !!p && p.ponto.lat === l.ponto.lat && p.ponto.lon === l.ponto.lon;
}

function Formulario({ existente }: { existente?: Rotina }) {
  const { locais } = useLocais();
  const { rotinas, salvar, apagar } = useRotinas();
  const { cores } = useTema();
  const [origem, setOrigem] = useState<PontoRotina | null>(existente?.origem ?? null);
  const [destino, setDestino] = useState<PontoRotina | null>(existente?.destino ?? null);
  const [dias, setDias] = useState<number[]>(existente?.dias ?? []);
  // O seletor de rodas sempre entrega um horário válido: a saída padrão é a hora atual (sem teclado, D-35).
  const [hora, setHora] = useState(existente?.hora ?? horaLocal(new Date()));
  const [antecedencia, setAntecedencia] = useState(existente?.antecedencia ?? ANTECEDENCIA_PADRAO);
  const [ativa, setAtiva] = useState(existente?.ativa ?? true);
  const [problemas, setProblemas] = useState<ProblemaRotina[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  const limite = !existente && rotinas.length >= MAX_ROTINAS;
  const poucosLugares = locais.length < 2 && !existente;

  function alternarDia(dia: number) {
    setDias((atuais) => (atuais.includes(dia) ? atuais.filter((d) => d !== dia) : [...atuais, dia].sort((a, b) => a - b)));
    setProblemas((p) => p.filter((x) => x !== 'SEM_DIAS'));
  }

  function escolher(campo: 'origem' | 'destino', l: LocalSalvo) {
    const valor = { ponto: l.ponto, rotulo: l.nome };
    if (campo === 'origem') setOrigem(valor); else setDestino(valor);
    setProblemas((p) => p.filter((x) => x !== (campo === 'origem' ? 'SEM_ORIGEM' : 'SEM_DESTINO') && x !== 'MESMO_LUGAR'));
    AccessibilityInfo.announceForAccessibility(t.selecionado(l.nome));
  }

  async function enviar() {
    if (ocupado) return;
    const encontrados = validarRotina({ origem, destino, dias, hora });
    setProblemas(encontrados);
    setErro(null);
    if (encontrados.length > 0) {
      const primeiro = encontrados[0];
      AccessibilityInfo.announceForAccessibility(mensagem(primeiro));
      return;
    }
    if (!origem || !destino) return;
    setOcupado(true);
    try {
      const resultado = await salvar({ origem, destino, dias, hora: normalizarHora(hora) ?? hora, antecedencia, ativa }, existente?.id);
      if (resultado === 'erro' || resultado === 'invalida') { setErro(t.erroSalvar); return; }
      if (resultado === 'limite') { setErro(t.limite(MAX_ROTINAS)); return; }
      // A rotina foi salva. Sem permissão ou sem agendamento, voltamos à lista e o aviso fica na própria lista (AC4).
      AccessibilityInfo.announceForAccessibility(t.salva);
      if (resultado === 'sem_permissao' || resultado === 'erro_aviso') {
        router.replace({ pathname: '/rotina', params: { aviso: resultado } });
      } else router.back();
    } finally { setOcupado(false); }
  }

  async function confirmarApagar() {
    if (!existente || ocupado) return;
    setOcupado(true);
    try {
      await apagar(existente.id);
      AccessibilityInfo.announceForAccessibility(t.apagada);
      router.back();
    } catch { setErro(t.erroSalvar); }
    finally { setOcupado(false); }
  }

  return (
    <Tela>
      <Stack.Screen options={{ title: existente ? t.editar : t.nova }} />
      <Texto variante="rotulo" cor="acaoLink">{t.selo}</Texto>
      {limite ? <Aviso texto={t.limite(MAX_ROTINAS)} /> : null}
      {poucosLugares ? (
        <>
          <Aviso texto={t.poucosLugares} />
          <Botao rotulo={t.irParaInicio} variante="secundario" onPress={() => router.navigate('/planejar')} />
        </>
      ) : null}
      {!poucosLugares && !limite ? (
        <>
          <SeletorLugar campo="origem" rotulo={t.origem} lugares={locais} valor={origem} erro={problemas.includes('SEM_ORIGEM') ? t.erroOrigem : undefined} onEscolher={escolher} />
          <SeletorLugar campo="destino" rotulo={t.destino} lugares={locais} valor={destino} erro={problemas.includes('SEM_DESTINO') ? t.erroDestino : undefined} onEscolher={escolher} />
          {problemas.includes('MESMO_LUGAR') ? <Aviso texto={t.erroMesmoLugar} variante="erro" /> : null}
          <View style={estilos.grupo}>
            <Texto variante="corpoForte" accessibilityRole="header">{t.dias}</Texto>
            <View style={estilos.dias}>
              {TODOS_OS_DIAS.map((d) => {
                const marcado = dias.includes(d);
                return (
                  <Pressable
                    key={d}
                    testID={`dia-${d}`}
                    accessibilityRole="checkbox"
                    accessibilityLabel={t.diasCompletos[d - 1]}
                    accessibilityState={{ checked: marcado }}
                    onPress={() => alternarDia(d)}
                    style={[estilos.dia, { backgroundColor: marcado ? cores.acao : cores.superficie2, borderColor: marcado ? cores.acao : cores.borda }]}
                  >
                    <Texto variante="rotulo" style={{ color: marcado ? cores.acaoTexto : cores.texto }}>{t.diasCurtos[d - 1]}</Texto>
                  </Pressable>
                );
              })}
            </View>
            {problemas.includes('SEM_DIAS') ? <Texto variante="apoio" cor="erro" accessibilityRole="alert">{t.erroDias}</Texto> : null}
          </View>
          <SeletorHorario
            rotulo={t.hora}
            saida={isoDeHoraHoje(hora)}
            onChange={(iso) => { setHora(horaLocal(new Date(iso))); setProblemas((p) => p.filter((x) => x !== 'HORA_INVALIDA')); }}
          />
          <Segmentado
            rotuloGrupo={t.antecedencia}
            opcoes={ANTECEDENCIAS.map((m) => ({ valor: String(m), rotulo: t.antecedenciaOpcao(m) }))}
            valor={String(antecedencia)}
            onChange={(v) => setAntecedencia(Number(v))}
          />
          <Interruptor rotulo={t.ativarLembrete} ligado={ativa} onChange={setAtiva} />
          <Texto variante="apoio" cor="texto2">{t.lembreteSoHorario}</Texto>
          <Texto variante="apoio" cor="texto2">{t.privacidade}</Texto>
          {erro ? <Aviso texto={erro} variante="erro" /> : null}
          <Botao rotulo={t.salvar} carregando={ocupado} onPress={() => { void enviar(); }} />
        </>
      ) : null}
      {existente ? (
        confirmando ? (
          <View style={estilos.grupo}>
            <Texto accessibilityLiveRegion="polite">{t.confirmarApagar}</Texto>
            <Botao rotulo={t.confirmarApagarSim} variante="destrutivo" desabilitado={ocupado} onPress={() => { void confirmarApagar(); }} />
            <Botao rotulo={t.cancelar} variante="texto" onPress={() => setConfirmando(false)} />
          </View>
        ) : <Botao rotulo={t.apagar} variante="secundario" onPress={() => setConfirmando(true)} />
      ) : null}
      <Botao rotulo={t.cancelar} variante="texto" onPress={() => router.back()} />
    </Tela>
  );
}

function mensagem(p: ProblemaRotina): string {
  switch (p) {
    case 'SEM_ORIGEM': return t.erroOrigem;
    case 'SEM_DESTINO': return t.erroDestino;
    case 'MESMO_LUGAR': return t.erroMesmoLugar;
    case 'SEM_DIAS': return t.erroDias;
    case 'HORA_INVALIDA': return t.erroHora;
  }
}

function SeletorLugar({ campo, rotulo, lugares, valor, erro, onEscolher }: {
  campo: 'origem' | 'destino';
  rotulo: string;
  lugares: LocalSalvo[];
  valor: PontoRotina | null;
  erro?: string;
  onEscolher: (campo: 'origem' | 'destino', l: LocalSalvo) => void;
}) {
  const { cores } = useTema();
  return (
    <View style={estilos.grupo}>
      <Texto variante="corpoForte" accessibilityRole="header">{rotulo}</Texto>
      <Texto variante="apoio" cor="texto2">{valor ? t.selecionado(valor.rotulo) : t.escolherLugar}</Texto>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.faixa}>
        {lugares.map((l) => (
          <View
            key={l.id}
            accessibilityState={{ selected: ehLugar(valor, l) }}
            style={[estilos.moldura, { borderColor: ehLugar(valor, l) ? cores.acao : 'transparent' }]}
          >
            <CartaoLocal testID={`${campo}-${l.id}`} local={l} onPress={() => onEscolher(campo, l)} />
          </View>
        ))}
      </ScrollView>
      {erro ? <Texto variante="apoio" cor="erro" accessibilityRole="alert">{erro}</Texto> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: { gap: esp[2] },
  faixa: { gap: esp[2], paddingRight: esp[4] },
  moldura: { borderWidth: 3, borderRadius: raio.grande + 4, padding: 2 },
  dias: { flexDirection: 'row', flexWrap: 'wrap', gap: esp[2] },
  dia: { minWidth: toque.minimo, minHeight: toque.minimo, borderRadius: raio.pilula, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: esp[3] },
});
