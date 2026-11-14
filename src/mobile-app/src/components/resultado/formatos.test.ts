import { describe, expect, it } from '@jest/globals';

import { formatarPeriodo } from './formatos';

describe('formatarPeriodo', () => {
  it('formata o período da fixture como na TL-07', () => {
    expect(formatarPeriodo('2026-01-01', '2026-09-30')).toBe('jan-set/2026');
  });

  it('usa o ano do fim do período', () => {
    expect(formatarPeriodo('2025-11-01', '2026-02-28')).toBe('nov-fev/2026');
  });
});
