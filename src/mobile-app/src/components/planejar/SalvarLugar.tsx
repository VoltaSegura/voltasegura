import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import type { TipoLocal } from '@/locais';
import { hipotesesMapa as h } from '@/textos/hipotesesMapa';
import { esp, raio, tipo, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

import { Botao } from '../Botao';
import { Icone } from '../Icone';
import { Texto } from '../Texto';
import { infoTipo, tiposLocal } from './tiposLocal';

type Props = {
  onSalvar: (nome: string, tipo: TipoLocal) => Promise<string | null>;
  onCancelar: () => void;
};

/** Formulário curto para salvar o ponto marcado como lugar (nome + tipo). Fica só no aparelho. */
export function SalvarLugar({ onSalvar, onCancelar }: Props) {
  const { cores } = useTema();
  const [nome, setNome] = useState('');
  const [tipoEscolhido, setTipo] = useState<TipoLocal>('casa');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function confirmar() {
    if (salvando) return;
    setSalvando(true);
    const problema = await onSalvar(nome, tipoEscolhido);
    setSalvando(false);
    setErro(problema);
  }

  return (
    <View style={estilos.base}>
      <Texto variante="rotulo" cor="texto2">{h.tipoDoLugar}</Texto>
      <View accessibilityRole="radiogroup" accessibilityLabel={h.tipoDoLugar} style={estilos.tipos}>
        {tiposLocal.map((t) => {
          const marcado = t === tipoEscolhido;
          return (
            <Pressable
              key={t}
              accessibilityRole="radio"
              accessibilityLabel={infoTipo[t].rotulo}
              accessibilityState={{ checked: marcado, selected: marcado }}
              onPress={() => { setTipo(t); if (!nome) setNome(t === 'outro' ? '' : infoTipo[t].rotulo); }}
              style={[estilos.tipo, { borderColor: marcado ? cores.acao : cores.borda, backgroundColor: marcado ? cores.acao : 'transparent' }]}
            >
              <Icone nome={infoTipo[t].icone} tamanho={18} cor={marcado ? cores.acaoTexto : cores.texto} />
              <Texto variante="rotulo" cor={marcado ? 'acaoTexto' : 'texto'}>{infoTipo[t].rotulo}</Texto>
            </Pressable>
          );
        })}
      </View>
      <TextInput
        accessibilityLabel={h.nomeDoLugar}
        placeholder={h.nomeExemplo}
        placeholderTextColor={cores.texto2}
        selectionColor={cores.acao}
        value={nome}
        onChangeText={(v) => { setNome(v); setErro(null); }}
        maxLength={30}
        allowFontScaling
        maxFontSizeMultiplier={2}
        style={[estilos.campo, tipo.corpo, { color: cores.texto, backgroundColor: cores.superficie2, borderColor: erro ? cores.erro : cores.borda }]}
      />
      {erro ? <Texto variante="apoio" cor="erro" accessibilityRole="alert" accessibilityLiveRegion="polite">{erro}</Texto> : null}
      <View style={estilos.acoes}>
        <Botao rotulo={h.salvarCancelar} variante="texto" onPress={onCancelar} style={estilos.acao} />
        <Botao rotulo={h.salvarConfirmar} carregando={salvando} onPress={() => { void confirmar(); }} style={estilos.acao} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  base: { gap: esp[2] },
  tipos: { flexDirection: 'row', flexWrap: 'wrap', gap: esp[2] },
  tipo: { flexDirection: 'row', alignItems: 'center', gap: esp[1], minHeight: toque.minimo - 8, paddingHorizontal: esp[3], borderRadius: raio.pilula, borderWidth: 1 },
  campo: { minHeight: toque.minimo, borderRadius: raio.medio, borderWidth: 1, paddingHorizontal: esp[3] },
  acoes: { flexDirection: 'row', gap: esp[2] },
  acao: { flex: 1 },
});
