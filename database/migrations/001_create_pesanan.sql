CREATE TABLE IF NOT EXISTS pesanan (
  id_pesanan BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kode_pesanan VARCHAR(16) NOT NULL UNIQUE,
  nama_pelanggan VARCHAR(100) NOT NULL,
  makanan VARCHAR(100) NOT NULL,
  jumlah_porsi INTEGER NOT NULL CHECK (jumlah_porsi > 0),
  tanggal_acara DATE NOT NULL,
  alamat TEXT NOT NULL,
  total_harga NUMERIC(12, 2) NOT NULL CHECK (total_harga >= 0),
  status VARCHAR(12) NOT NULL DEFAULT 'Baru'
    CHECK (status IN ('Baru', 'Diproses', 'Selesai')),
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pesanan_dibuat_pada_idx ON pesanan (dibuat_pada DESC);
