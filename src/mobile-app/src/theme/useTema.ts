import { useColorScheme } from 'react-native';

import { useModoPreferido } from './ModoTemaProvider';
import { coresClaro, coresEscuro, type Cores } from './tokens';

/**
 * Tema escuro como padrão e tema claro quando o sistema estiver em modo claro
 * ([HIPÓTESE] de docs/app-map/07_design/tokens.md, seção "Temas").
 * A preferência da aba Perfil (claro ou escuro) vence o sistema; `sistema` segue o aparelho.
 */
export function useTema(): { cores: Cores; escuro: boolean } {
  const esquema = useColorScheme();
  const preferido = useModoPreferido();
  const escuro = preferido === 'escuro' || (preferido === 'sistema' && esquema !== 'light');
  return { cores: escuro ? coresEscuro : coresClaro, escuro };
}
