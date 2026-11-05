function formatRupiah(angka) {
  const nilai =
    typeof angka === 'number' ? angka : Number(String(angka).replace(/[^0-9]/g, ''));

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
