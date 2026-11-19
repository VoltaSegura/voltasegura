import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { Aviso, EstadoVazio, GrupoLinhas, LinhaGrupo, Tela, Texto } from '@/components';
import { FormularioContato } from '@/components/contatos/FormularioContato';
import { gravarContatos, lerContatos, MAX_CONTATOS, normalizarNomeContato, type Contato } from '@/contatos';
import { abas } from '@/textos/abas';

const t = abas.contatos;

/** TL-27: aba Contatos. Só nomes, no aparelho. A lista não envia nada (o envio é sempre uma ação da pessoa). */
export default function Contatos() {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [erroLista, setErroLista] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    let ativo = true;
    void lerContatos().then((lidos) => { if (ativo) { setContatos(lidos); setCarregado(true); } });
    return () => { ativo = false; };
  }, []);

  async function persistir(proximos: Contato[]) {
    await gravarContatos(proximos);
    setContatos(proximos);
  }

  /** Devolve a mensagem de erro, ou null quando a pessoa foi salva. */
  const adicionar = useCallback(async (digitado: string): Promise<string | null> => {
    if (ocupado) return null;
    const limpo = normalizarNomeContato(digitado);
    if (!limpo) { AccessibilityInfo.announceForAccessibility(t.nomeVazio); return t.nomeVazio; }
    if (contatos.length >= MAX_CONTATOS) return t.limite(MAX_CONTATOS);
    setOcupado(true);
    try {
      await persistir([...contatos, { id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`, nome: limpo }]);
      setErroLista(null);
      AccessibilityInfo.announceForAccessibility(t.adicionado);
      return null;
    } catch {
      return t.erro;
    } finally { setOcupado(false); }
  }, [contatos, ocupado]);

  async function remover(id: string) {
    if (ocupado) return;
    setOcupado(true);
    try {
      await persistir(contatos.filter((c) => c.id !== id));
      setErroLista(null);
      AccessibilityInfo.announceForAccessibility(t.removido);
    } catch {
      setErroLista(t.erro);
    } finally { setOcupado(false); }
  }

  return (
    <Tela abas>
      <Texto variante="titulo" accessibilityRole="header">{t.titulo}</Texto>
      <Texto variante="corpo" cor="texto2">{t.intro}</Texto>
      <Texto variante="apoio" cor="texto2">{t.notaEnvio}</Texto>
      {carregado && contatos.length === 0 ? <EstadoVazio texto={t.vazio} /> : null}
      {contatos.length > 0 ? (
        <GrupoLinhas titulo={t.titulo}>
          {contatos.map((c, i) => (
            <LinhaGrupo
              key={c.id}
              testID={`contato-${c.id}`}
              icone="account-outline"
              titulo={c.nome}
              rotuloAcessibilidade={`${c.nome}. ${t.remover}`}
              acao={{ icone: 'trash-can-outline', rotulo: `${t.remover}: ${c.nome}`, onPress: () => { void remover(c.id); } }}
              ultima={i === contatos.length - 1}
            />
          ))}
        </GrupoLinhas>
      ) : null}
      {erroLista ? <Aviso texto={erroLista} variante="erro" /> : null}
      <FormularioContato
        rotuloCampo={t.campoNome}
        ajuda={t.ajudaNome}
        rotuloBotao={t.salvar}
        maximo={30}
        ocupado={ocupado}
        limiteAtingido={contatos.length >= MAX_CONTATOS}
        avisoLimite={t.limite(MAX_CONTATOS)}
        onSalvar={adicionar}
      />
    </Tela>
  );
}
