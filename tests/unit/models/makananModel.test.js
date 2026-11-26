import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const pool = require('../../../config/database');
const { searchMakananForChat } = require('../../../models/makananModel');
const products = require('../../fixtures/products');
let query;

describe('searchMakananForChat', () => {
  beforeEach(() => { query = vi.spyOn(pool, 'query').mockResolvedValue({ rows: products }); });
  afterEach(() => vi.restoreAllMocks());

  it('finds products explicitly named in the question, case-insensitively', async () => {
    await expect(searchMakananForChat('Berapa harga TINUTUAN?')).resolves.toEqual([products[0]]);
  });

  it('returns all products for catalog questions', async () => {
    await expect(searchMakananForChat('menu apa saja')).resolves.toEqual(products);
  });

  it('does not match unrelated questions or requests for unsupported recipes', async () => {
    await expect(searchMakananForChat('bagaimana cuaca hari ini')).resolves.toEqual([]);
    await expect(searchMakananForChat('resep Tinutuan')).resolves.toEqual([products[0]]);
  });

  it('returns an empty list when the catalog is empty', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    await expect(searchMakananForChat('menu apa saja')).resolves.toEqual([]);
  });
});
