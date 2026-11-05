module.exports = {
  port: process.env.PORT || 8000,
  appName: 'Makanan Khas Aseli Manado',
  db: {
    host: process.env.PGHOST || '127.0.0.1',
    port: Number(process.env.PGPORT) || 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'makanan_khas_aseli_manado',
  },
};
