import { memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { esp } from '@/theme/tokens';

import { Aviso } from '../Aviso';
import { Botao } from '../Botao';
import { CampoTexto } from '../CampoTexto';

/** Altura reservada para o campo com ajuda ou erro (rótulo, caixa e linha de apoio), para o layout não pular. */
const ALTURA_CAMPO = 104;

type Props = {
  rotuloCampo: string;
  ajuda: string;
  rotuloBotao: string;
  maximo: number;
  ocupado: boolean;
  limiteAtingido: boolean;
  avisoLimite: string;
  /** Devolve a mensagem de erro, ou null quando salvou. */
  onSalvar: (nome: string) => Promise<string | null>;
};

/**
 * Formulário de nova pessoa de contato. Guarda o próprio nome e o próprio erro, então digitar
 * não re-renderiza a lista de contatos da tela (memo). Só limpa o erro se ele existir.
 */
function FormularioContatoBase({ rotuloCampo, ajuda, rotuloBotao, maximo, ocupado, limiteAtingido, avisoLimite, onSalvar }: Props) {
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (enviando || ocupado) return;
    setEnviando(true);
    try {
      const mensagem = await onSalvar(nome);
      if (mensagem) setErro(mensagem);
      else { setNome(''); setErro(null); }
    } finally { setEnviando(false); }
  }

  return (
    <View style={estilos.base}>
      <View style={estilos.campo}>
        <CampoTexto
          rotulo={rotuloCampo}
          testID="contato-nome"
          value={nome}
          ajuda={ajuda}
          erro={erro ?? undefined}
          onChangeText={(valor) => { setNome(valor); if (erro) setErro(null); }}
          maxLength={maximo}
        />
      </View>
      {limiteAtingido ? <Aviso texto={avisoLimite} variante="erro" /> : null}
      <Botao rotulo={rotuloBotao} carregando={enviando || ocupado} desabilitado={limiteAtingido} onPress={() => { void enviar(); }} />
    </View>
  );
}

export const FormularioContato = memo(FormularioContatoBase);

const estilos = StyleSheet.create({
  base: { gap: esp[2] },
  campo: { minHeight: ALTURA_CAMPO, justifyContent: 'flex-start' },
});
