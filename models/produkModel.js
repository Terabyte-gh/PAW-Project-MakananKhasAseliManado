const produk = [
  {
    id: 1,
    nama: 'Tinutuan',
    deskripsi:
      'Bubur khas Manado dari beras, labu kuning, jagung, dan sayuran hijau. Disajikan hangat dengan sambal dabu-dabu.',
    harga: 15000,
    kategori: 'Makanan Utama',
  },
  {
    id: 2,
    nama: 'Cakalang Fufu',
    deskripsi:
      'Ikan cakalang yang diasap dan dibumbui, kemudian dipanggang. Cocok disantap bersama nasi hangat.',
    harga: 45000,
    kategori: 'Lauk',
  },
  {
    id: 3,
    nama: 'Klappertaart',
    deskripsi:
      'Kue panggang berbahan kelapa muda, susu, dan telur. Manis, lembut, dengan aroma khas kelapa.',
    harga: 25000,
    kategori: 'Dessert',
  },
  {
    id: 4,
    nama: 'Panada',
    deskripsi:
      'Roti goreng berisi ikan cakalang pedas. Camilan gurih yang mudah ditemukan di sepanjang jalan Manado.',
    harga: 10000,
    kategori: 'Camilan',
  },
  {
    id: 5,
    nama: 'Brenebon',
    deskripsi:
      'Sup kacang merah dengan daging dan rempah hangat. Kuahnya bening dengan rasa gurih yang ringan.',
    harga: 20000,
    kategori: 'Makanan Utama',
  },
  {
    id: 6,
    nama: 'Dabu-dabu',
    deskripsi:
      'Sambal segar dari tomat, cabai, bawang merah, dan perasan jeruk nipis. Pendamping wajib hidangan Manado.',
    harga: 8000,
    kategori: 'Sambal',
  },
];

function getAllProduk() {
  return produk;
}

module.exports = { getAllProduk };
