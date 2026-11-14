import { AtkinsonHyperlegibleNext_400Regular, AtkinsonHyperlegibleNext_600SemiBold, AtkinsonHyperlegibleNext_700Bold } from '@expo-google-fonts/atkinson-hyperlegible-next';
import { Sora_600SemiBold, Sora_800ExtraBold } from '@expo-google-fonts/sora';
import { useFonts } from 'expo-font';

/** Fontes da identidade premium (D-28). Os nomes batem com `fonte` em `tokens.ts`. */
const arquivos = {
  Sora_600SemiBold,
  Sora_800ExtraBold,
  AtkinsonHyperlegibleNext_400Regular,
  AtkinsonHyperlegibleNext_600SemiBold,
  AtkinsonHyperlegibleNext_700Bold,
};

/** `true` quando as fontes carregaram **ou** falharam: com erro o app segue na fonte do sistema. */
export function useFontesPremium(): boolean {
  const [carregadas, erro] = useFonts(arquivos);
  return carregadas || erro !== null;
}
