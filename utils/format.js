function formatRupiah(angka) {
  const teks = String(angka);
  const digit = teks.replace(/[^0-9]/g, '');
  if (typeof angka !== 'number' && !digit) return teks;
  const nilai = typeof angka === 'number' ? angka : Number(digit);

  if (Number.isNaN(nilai)) {
    return String(angka);
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(nilai);
}

module.exports = { formatRupiah };
