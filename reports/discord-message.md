## 🧪 QA Report: Website Akasha (12 Nov)
Hasil automation test untuk **course.akashayogaacademy.com** & **akashayogaacademy.com**: semua halaman sitemap, menu navigasi, dan tombol Enroll/Checkout.

**Hasil:** 439 test → ✅ 416 lulus · ❌ 23 gagal
Flow checkout utama aman: 8 produk ThriveCart & 50 produk Wix Store sampai ke form checkout dengan harga yang benar.

**Perlu diperbaiki:**
🔴 **Halaman promo US$119 tidak bisa dipakai membeli.** Tombol ENROLL NOW di kartu paket mengarah ke homepage. FAQ-nya juga membahas India pilgrimage.
<https://www.akashayogaacademy.com/200-hr-online-enroll-now-special>

🟠 **ENROLL NOW → homepage di 17 halaman**, antara lain /ytt, /dates-and-prices, /bali-bliss, /200-hour-online-curriculum, /bali-retreat-enroll-now. Kemungkinan satu section Wix yang dipakai bersama.

🟠 **Tombol tertutup elemen lain (tidak bisa diklik):** /ytt-meet-the-teachers (ENROLL NOW), /breath-challenge (SIGN UP NOW)

🟡 **Checkout course:** `?product=` yang kosong atau salah ketik tetap menampilkan checkout 200hr. Homepage course memakai link `/checkout` tanpa produk.
🟡 **"Go to the app"** di halaman challenge berakhir di 404 di desktop.

🔵 Minor: judul tab checkout selalu "200-Hour…" untuk semua produk; /calendar-sign-up redirect ke /podcast; widget Elfsight tidak tampil di 109 halaman (kuota habis).

Detail lengkap (link per halaman, langkah reproduksi, saran fix) ada di file terlampir 📎
