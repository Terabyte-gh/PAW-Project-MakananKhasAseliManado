import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const request = require('supertest');
process.env.GEMINI_API_KEY = 'test-api-key';
const app = require('../../app');
const pool = require('../../config/database');
const products = require('../fixtures/products');
let query;

describe('API integration: chat and order routes', () => {
  beforeEach(() => {
    query = vi.spyOn(pool, 'query').mockImplementation(async (sql) => {
      if (sql.includes('WHERE id_makanan')) return { rows: [products[0]] };
      if (sql.includes('INSERT INTO pesanan')) return { rows: [{
        id_pesanan: 11, kode_pesanan: 'MAN-TEST123', nama_pelanggan: 'Ayu',
        makanan: 'Tinutuan', jumlah_porsi: 2, total_harga: 50000,
      }] };
      return { rows: products };
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: 'Tinutuan seharga Rp25.000.' }] } }] }),
    }));
  });

  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it('accepts a casual greeting and returns a friendly menu prompt', async () => {
    const response = await request(app).post('/api/chat').send({ message: 'halo bang' });
    expect(response.status).toBe(200);
    expect(response.body.reply).toMatch(/Halo, bro/i);
    expect(response.body.reply).toMatch(/lihat menu|pesan makanan/i);
    expect(query).not.toHaveBeenCalled();
  });

  it('validates chat input before searching or calling Gemini', async () => {
    const response = await request(app).post('/api/chat').send({ message: '   ' });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/wajib diisi/);
    expect(query).not.toHaveBeenCalled();
  });

  it('passes a catalog question through controller and model response formatting', async () => {
    const response = await request(app).post('/api/chat').send({ message: 'harga Tinutuan' });
    expect(response.status).toBe(200);
    expect(response.body.reply).toBe('Tinutuan seharga Rp25.000.');
    expect(query).toHaveBeenCalledWith(expect.stringContaining('SELECT id_makanan'));
    expect(fetch).toHaveBeenCalledOnce();
  });

  it('rejects invalid orders and saves valid orders with the computed total', async () => {
    const invalid = await request(app).post('/api/pesanan').send({ nama: '', jumlah: 0 });
    expect(invalid.status).toBe(400);
    expect(query).not.toHaveBeenCalled();

    const response = await request(app).post('/api/pesanan').send({
      nama: 'Ayu', id_makanan: 1, jumlah: 2, tanggal_acara: '2026-12-25', alamat: 'Manado',
    });
    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({ nama_pelanggan: 'Ayu', makanan: 'Tinutuan', total_harga: 50000 });
    expect(query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO pesanan'), expect.arrayContaining(['Ayu', 'Tinutuan', 2, expect.any(String), 'Manado', 50000]));
  });
});
