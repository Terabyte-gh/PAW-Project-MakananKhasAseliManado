import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { formatRupiah } = require('../../../utils/format');

describe('formatRupiah', () => {
  it('formats numeric and string prices as Indonesian rupiah', () => {
    expect(formatRupiah(25000)).toBe('Rp\u00a025.000');
    expect(formatRupiah('8000')).toBe('Rp\u00a08.000');
  });

  it('returns the original value when it cannot be parsed', () => {
    expect(formatRupiah('harga belum diketahui')).toBe('harga belum diketahui');
  });
});
