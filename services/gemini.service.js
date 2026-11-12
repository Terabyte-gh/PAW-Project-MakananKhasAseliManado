const config = require('../config/config');

async function jawabTentangMakanan(pertanyaan, produk) {
  if (!config.geminiApiKey) {
    const error = new Error('API belum dikonfigurasi. Isi API di file .env.');
    error.status = 503;
    throw error;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': config.geminiApiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: [
          'Kamu adalah chatbot katalog Makanan Khas Aseli Manado.',
          'Jawab hanya berdasarkan DATA PRODUK yang diberikan dalam percakapan ini.',
          'Jangan menambah fakta, bahan, resep, asal, sejarah, kategori, atau harga yang tidak tertulis di data.',
          'Jika pertanyaan tidak dapat dijawab dari data yang tersedia, jawab persis: "Maaf, informasi itu tidak ada di data makanan kami."',
          'Untuk pertanyaan yang cocok, gunakan nama, harga, stok, serta jika pelanggan menanyakan makanan ini seperti apa jawab seperti itu. Jawab dalam bahasa Indonesia.',
          'kalo user nanya ini makanan apa, jawab dengan deskripsi makanan ini seperti apa, misal: "Makanan ini adalah ..." serta kalo user nanya makanan ini rasanya kek apa jawab makanan ini rasanya seperti ini gitu ya kalo bisa cari tau sedikit tentang rasa nya baru jawab.',
        ].join(' ') }],
      },
      contents: [{
        role: 'user',
        parts: [{ text: `DATA PRODUK (sumber kebenaran):\n${JSON.stringify(produk)}\n\nPERTANYAAN: ${pertanyaan}` }],
      }],
      generationConfig: { temperature: 0, maxOutputTokens: 300 },
    }),
  });

  const hasil = await response.json();
  if (!response.ok) {
    const error = new Error('Layanan Gemini sedang bermasalah. Coba lagi nanti.');
    error.status = 502;
    console.error('[gemini]', hasil.error?.message || response.status);
    throw error;
  }

  const jawaban = hasil.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join(' ')
    .trim();

  if (!jawaban) {
    const error = new Error('Gemini belum memberikan jawaban. Coba tanyakan dengan cara lain.');
    error.status = 502;
    throw error;
  }

  return jawaban;
}

module.exports = { jawabTentangMakanan };
