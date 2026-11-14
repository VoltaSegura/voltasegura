// Reanimated e Worklets exigem código nativo. Nos testes usamos um mock mínimo e próprio (D-28):
// valores compartilhados viram objetos simples e as animações terminam no valor final.
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View, Text, ScrollView } = require('react-native');
  const identidade = (v) => v;
  const Animated = { View, Text, ScrollView, createAnimatedComponent: (c) => c };
  return {
    __esModule: true,
    default: Animated,
    ...Animated,
    useSharedValue: (inicial) => React.useRef({ value: inicial }).current,
    useAnimatedStyle: (fn) => fn(),
    withSpring: identidade,
    withTiming: identidade,
    withRepeat: identidade,
    withDelay: (_ms, v) => v,
    withSequence: (...v) => v[v.length - 1],
    Easing: { out: identidade, cubic: identidade, inOut: identidade, quad: identidade },
    interpolate: (v, entrada, saida) => saida[0] + ((saida[saida.length - 1] - saida[0]) * (v - entrada[0])) / (entrada[entrada.length - 1] - entrada[0]),
  };
});
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));
