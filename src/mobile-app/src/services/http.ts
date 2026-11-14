import { ErroServico, erroDeStatus } from './erros';

/** Chamada HTTP única da camada. Não registra nada em log. */
export async function chamar<T>(
  url: string,
  metodo: 'POST' | 'DELETE',
  opcoes: { corpo?: unknown; token?: string | null; contexto: 'consulta' | 'conta'; signal?: AbortSignal },
): Promise<T | null> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opcoes.corpo !== undefined) headers['Content-Type'] = 'application/json';
  if (opcoes.token) headers.Authorization = `Bearer ${opcoes.token}`;

  let resposta: Response;
  try {
    resposta = await fetch(url, {
      method: metodo,
      headers,
      body: opcoes.corpo !== undefined ? JSON.stringify(opcoes.corpo) : undefined,
      signal: opcoes.signal,
    });
  } catch {
    throw new ErroServico('SEM_REDE');
  }

  if (!resposta.ok) {
    let codigo: string | null = null;
    try {
      const json = (await resposta.json()) as { erro?: unknown };
      if (typeof json?.erro === 'string') codigo = json.erro;
    } catch {
      // corpo ausente ou inválido: segue só com o status
    }
    throw erroDeStatus(resposta.status, codigo, opcoes.contexto);
  }

  if (resposta.status === 204) return null;
  try {
    return (await resposta.json()) as T;
  } catch {
    throw new ErroServico('INDISPONIVEL', null, resposta.status);
  }
}

export function atraso(ms: number): Promise<void> {
  return ms > 0 ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve();
}
