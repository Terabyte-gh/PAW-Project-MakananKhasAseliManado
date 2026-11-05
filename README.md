Makanan Khas Aseli Manado - Website Product
Tugas PAW Week 7 | Syah Jehan Wonopatih — 20240140188

Tech Stack
    Backend : Node.js + Express.js (v5.3.0)
    View Engine : EJS
    Package Manager : NPM
    Arsitektur : MVC (Model-View-Controller)
    Module System : CommonJS

Struktur Project
<img width="705" height="433" alt="image" src="https://github.com/user-attachments/assets/4f92bd95-87d2-4583-ae8b-cad9a9762198" />


Fitur Aplikasi
    Katalog Makanan Khas Manado — Menampilkan daftar makanan beserta nama, deskripsi, kategori, dan harga.
    Data Produk Terpusat — Informasi produk disimpan dalam models/produkModel.js agar dapat digunakan oleh halaman website maupun API.
    REST API — Menyediakan endpoint JSON untuk mengambil informasi status server dan daftar produk.
    HTTP Request Logger — Mencatat informasi request, status HTTP, dan durasi pemrosesan ke terminal.
    404 Handler — Menampilkan response JSON ketika pengguna mengakses endpoint yang tidak tersedia.

Data Product
Aplikasi menyediakan makanan khas aseli manado.
| No | Nama Produk | Kategori |
|---|---|---|
| 1 | Tinutuan | Makanan Utama |
| 2 | Cakalang Fufu | Lauk |
| 3 | Klappertaart | Dessert |
| 4 | Panada | Camilan |
| 5 | Brenebon | Makanan Utama |
| 6 | Dabu-dabu | Sambal |

Cara Nge run
    npm install    - Install dependencies
    npm run dev    - Jalankan server (mode development dengan auto-reload)
    npm start      - run biasa
Server default akan jalan di : http://localhost:8000
Port juga dapat diubah menggunakan environment variable PORT.

Endpoint
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | / | Halaman utama katalog makanan (EJS) |
| GET | /api/status | Informasi status dan uptime server (JSON) |
| GET | /api/produk | Mengambil seluruh data produk makanan (JSON) |

Middleware Logger
Middleware logger.js digunakan untuk memantau setiap HTTP request yang masuk ke server.
Informasi yang dicatat meliputi:
    Timestamp — Waktu ketika request diterima.
    HTTP Method — Jenis request seperti GET atau POST.
    Request URL — Alamat endpoint yang diakses.
    Status Code — Status response dari server.
    Duration — Waktu yang dibutuhkan untuk memproses request dalam milidetik.
Contoh output terminal:
    [2026-11-01T11:52:25.081Z] GET /api/status -> 200 (0ms)
    [2026-11-01T11:52:26.512Z] GET /api/produk -> 304 (1ms)
Logger saat ini mencatat aktivitas request ke terminal dan belum menggunakan penyimpanan file log.
