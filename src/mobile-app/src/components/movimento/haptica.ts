import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Háptica sutil (D-28): só em iOS e Android; na web e onde o aparelho não suporta, não faz nada.
 * Nunca lança erro e nunca bloqueia a ação do toque.
 */
const ativa = Platform.OS === 'ios' || Platform.OS === 'android';

function executar(acao: () => Promise<void>) {
  if (!ativa) return;
  try {
    acao().catch(() => { /* sem suporte: segue sem vibrar */ });
  } catch {
    /* idem */
  }
}

export const haptica = {
  /** Ação principal (botão). */
  leve: () => executar(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Troca de opção (rota selecionada, segmentado). */
  selecao: () => executar(() => Haptics.selectionAsync()),
  sucesso: () => executar(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  erro: () => executar(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
