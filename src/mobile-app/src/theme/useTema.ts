import { useColorScheme } from 'react-native';

import { coresClaro, coresEscuro, type Cores } from './tokens';

/**
 * Tema escuro como padrão e tema claro quando o sistema estiver em modo claro
 * ([HIPÓTESE] de docs/app-map/07_design/tokens.md, seção "Temas").
 */
export function useTema(): { cores: Cores; escuro: boolean } {
  const esquema = useColorScheme();
  const escuro = esquema !== 'light';
  return { cores: escuro ? coresEscuro : coresClaro, escuro };
}
