# 🧪 Laporan QA Website Akasha Yoga Academy
**Tanggal run:** 12 Nov 2026 · **Tool:** Playwright (automation)
**Cakupan:** course.akashayogaacademy.com & www.akashayogaacademy.com
- 349 halaman dari sitemap
- 8 produk checkout ThriveCart (course site)
- 50 produk Wix Store + 14 halaman enroll
- Menu navigasi desktop & mobile

> Tidak ada transaksi nyata. Test berhenti di form checkout, dan tombol Pay/Continue hanya diklik dengan form kosong untuk mengecek validasi.

## 📊 Ringkasan
- **439** test dijalankan → **416 lulus**, **23 gagal**
- 🔴 Critical: **1** · 🟠 High: **2** · 🟡 Medium: **3** · 🔵 Low: **4**
- Semua temuan Critical & High sudah dicek ulang manual di browser.

---

## 🔴 CRITICAL

### AKS-001 · Halaman promo US$119 tidak bisa dipakai untuk membeli
**Halaman:** <https://www.akashayogaacademy.com/200-hr-online-enroll-now-special>
- Tombol **ENROLL NOW** di kartu paket mengarah ke **homepage**, bukan ke produk/checkout.
- Tombol ENROLL NOW lainnya hanya scroll ke `#en2` di halaman yang sama.
- FAQ di halaman ini membahas "India pilgrimage" (kemungkinan hasil copy dari halaman retreat).

**Langkah reproduksi**
1. Buka halaman di atas
2. Klik ENROLL NOW di salah satu kartu paket
3. Pengunjung mendarat di homepage, tidak ada jalan ke checkout

**Saran:** arahkan tombol kartu ke product page yang sesuai, atau keluarkan halaman dari sitemap kalau promonya sudah berakhir.

---

## 🟠 HIGH

### AKS-002 · ENROLL NOW mengarah ke homepage, bukan ke checkout (17 halaman)
Ada tombol ENROLL NOW yang link-nya hanya ke homepage, sehingga calon pembeli harus mencari lagi dari awal.

**→ homepage www (15 halaman)**
- <https://www.akashayogaacademy.com/ytt>
- <https://www.akashayogaacademy.com/online-200-hr-v2>
- <https://www.akashayogaacademy.com/200-hr-ttc-special>
- <https://www.akashayogaacademy.com/200-hr-online-enroll-now-special>
- <https://www.akashayogaacademy.com/200-hour-online-curriculum>
- <https://www.akashayogaacademy.com/testimonial-online-200-hour>
- <https://www.akashayogaacademy.com/dates-and-prices>
- <https://www.akashayogaacademy.com/bali-bliss>
- <https://www.akashayogaacademy.com/bali-retreat-enroll-now>
- <https://www.akashayogaacademy.com/intro-videos>
- <https://www.akashayogaacademy.com/guided-to-shoulderstand>
- <https://www.akashayogaacademy.com/warrior-2>
- <https://www.akashayogaacademy.com/brochure-download> (2 tombol)
- <https://www.akashayogaacademy.com/design-your-schedule>
- <https://www.akashayogaacademy.com/giving-back>

**→ homepage course site (2 halaman)**
- <https://www.akashayogaacademy.com/200hr-yoga-teacher-training-online>
- <https://www.akashayogaacademy.com/200hr-yoga-teacher-training-online-old>

**Saran:** kemungkinan ini satu section/komponen Wix yang dipakai bersama, jadi cukup perbaiki link-nya di satu tempat. Di `/dates-and-prices` dan `/bali-bliss`, tombol lain di halaman yang sama sudah benar dan bisa dijadikan acuan.

### AKS-003 · Tombol terlihat tapi tidak bisa diklik (tertutup elemen lain)
- <https://www.akashayogaacademy.com/ytt-meet-the-teachers> → tombol **ENROLL NOW** pertama
- <https://www.akashayogaacademy.com/breath-challenge> → tombol **SIGN UP NOW** pertama

Browser melaporkan ada elemen lain yang menangkap klik ("intercepts pointer events"). Tombol kedua di halaman yang sama masih berfungsi.
**Saran:** di Wix Editor, cek elemen transparan yang menumpuk di atas tombol, lalu pakai *Arrange → Bring to front* pada tombolnya.

---

## 🟡 MEDIUM

### AKS-004 / AKS-006 · Checkout tanpa produk yang valid diam-diam menjual kursus 200hr
- <https://course.akashayogaacademy.com/checkout?product=this-product-does-not-exist> → tetap tampil checkout **200hr Essential** yang siap dibayar
- Dua tombol ENROLL NOW di homepage <https://course.akashayogaacademy.com/> memakai `/checkout` tanpa `?product=`

Hasilnya saat ini kebetulan benar (200hr), tapi rawan salah: typo di link iklan atau email bisa menjual kursus yang salah tanpa ada yang sadar.
**Saran:** validasi parameter `product` dan tampilkan "Kursus tidak ditemukan". Ubah link homepage menjadi `/checkout?product=essential`.

### AKS-005 · "Go to the app" berakhir di 404 di desktop
- <https://www.akashayogaacademy.com/challenge-page/33418045-401b-4a21-91fa-b3185daf7a5b>

Link redirect ke `fitness.wix.app`, dan hasilnya HTTP 404 di desktop.
**Saran:** sembunyikan tombol ini di desktop atau ganti teksnya, atau keluarkan halaman dari sitemap kalau challenge-nya sudah tidak aktif.

---

## 🔵 LOW

- **AKS-015 · Judul tab checkout salah:** checkout Yin, Meditation, Hatha & Pranayama, 300hr, Kundalini India, dan Feminine Wisdom semuanya berjudul "Secure Checkout, 200-Hour Yoga Teacher Training". Produknya sudah benar, tapi data analytics per kursus jadi tercampur.
- **AKS-017 · Redirect aneh di sitemap:** `/calendar-sign-up` & `/akasha-calendar` → redirect ke **/podcast**. `/200hr-yoga-teacher-training-online-old` masih tercantum di sitemap.
- **Widget Elfsight tidak tampil** di 109 halaman Wix (`APP_VIEWS_LIMIT_REACHED`, kuota views habis). Cek dashboard Elfsight.
- **React error** di 12 halaman course (blog & /15th-anniversary), **Mixpanel dimuat dua kali** di 62 halaman Wix (event analytics berpotensi terhitung ganda).

---

## ✅ Yang sudah berjalan dengan benar
- **Course site:** 8 produk checkout memuat produk ThriveCart yang benar, form + kolom kartu Stripe muncul, validasi "can't be blank" jalan, dan tombol ✕ kembali ke halaman kursus.
- **Course site:** ENROLL NOW di 11 halaman kursus membuka checkout produk yang sesuai. `/200h-essential/enroll` redirect dengan benar.
- **Wix Store:** 50 produk lolos Add to Cart → Side cart → Checkout → form Customer details. Total harga sama dengan product page.
- **Navigasi:** semua menu header di kedua situs berfungsi, menu mobile course site normal, dan tidak ada halaman sitemap yang 404.

---

## 🔁 Cara menjalankan ulang
Folder: `test-automation-akasha`
```
npm run test:smoke      # cek cepat ±10 menit
npm test                # semua halaman ±60 menit (laptop jangan sampai sleep)
npm run test:checkout   # hanya flow checkout
```
Laporan otomatis tersimpan di `reports/findings-report.html` dan `reports/findings-report.md`.
