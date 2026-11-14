import { useState } from 'react';

import { CampoTexto } from '@/components';
import { hipotesesPlanejar } from '@/textos/hipotesesPlanejar';

type Props = { rotulo: string; saida: string; onChange: (saida: string) => void; onValidadeChange?: (valida: boolean) => void; focar?: boolean };

function horaLocal(saida: string): string {
  const data = new Date(saida);
  return Number.isNaN(data.getTime()) ? '' : data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/** Entrada mínima de hora local; mantém a data da consulta até existir um seletor de data. */
export function SeletorHorario({ rotulo, saida, onChange, onValidadeChange, focar = false }: Props) {
  const [rascunho, setRascunho] = useState<{ base: string; hora: string } | null>(null);
  const [erro, setErro] = useState(false);
  const hora = rascunho?.base === saida ? rascunho.hora : horaLocal(saida);

  function confirmar() {
    const partes = /^(\d{1,2}):(\d{2})$/.exec(hora);
    if (!partes) { setErro(true); onValidadeChange?.(false); return; }
    const horas = Number(partes[1]);
    const minutos = Number(partes[2]);
    if (horas > 23 || minutos > 59) { setErro(true); onValidadeChange?.(false); return; }
    const data = new Date(saida);
    if (Number.isNaN(data.getTime())) { setErro(true); onValidadeChange?.(false); return; }
    setErro(false);
    onValidadeChange?.(true);
    data.setHours(horas, minutos, 0, 0);
    onChange(data.toISOString());
  }

  return <CampoTexto key={focar ? 'foco' : 'padrao'} rotulo={rotulo} testID="hora-saida" autoFocus={focar} value={hora} erro={erro ? hipotesesPlanejar.erroHora : undefined} onChangeText={(valor) => { setErro(false); setRascunho({ base: saida, hora: valor }); onValidadeChange?.(/^([01]?\d|2[0-3]):[0-5]\d$/.test(valor)); }} onBlur={confirmar} keyboardType="numbers-and-punctuation" />;
}
