# Buku Bulanan — Roadmap

## ✅ Sudah jadi
- Siklus bulanan dengan konfirmasi (Pending Cycle Validation) + riwayat siklus
- Master tagihan wajib (CRUD, soft delete, opsi "masukkan ke bulan ini")
- One-Click Pay + batal bayar
- Tagihan bertahap (misal uang makan 4× per minggu) + tombol **Lewati** per bagian
- Multi-income (pemasukan utama + ekstra)
- Pengeluaran harian dengan kategori
- Safe-to-Spend = Saldo (pemasukan − sudah dibayar − pengeluaran) − sisa tagihan
- Peringatan jatuh tempo, kerangka PWA & Web Push
- Tagihan nominal berubah-ubah / estimasi (konfirmasi nominal asli saat klik Bayar di Dashboard)
- Loading indicator & spinner di navigasi PWA dan semua tombol aksi
- Optimasi performa PWA (parallel query 1× jalan ke Turso, preload `tap`, Vercel region `sin1`)
- Tombol destruktif merah solid (`Hapus`, `Nonaktifkan`) lengkap dengan dialog konfirmasi
- Offline-read PWA cache + toast otomatis `Anda sedang offline` / `Kembali online`
- Daily Safe-to-Spend ("Jatah Aman Harian" & Countdown hari menuju reset siklus berikutnya)
- Native Web View Transitions API (`document.startViewTransition`) untuk perpindahan tab yang halus
- Soft Dark Mode (Dimmed Slate Charcoal) + Semantic Design Tokens (`pixel-perfect-consistency`)

## 🔜 Berikutnya
- [x] Poles UI mobile: ubah tampilan tabel (`Tagihan`, `Riwayat`) menjadi card list di layar HP
- [x] Ikon PWA (`static/icon-192.png`, `static/icon-512.png`)
- [x] Deploy: Turso + Vercel
- [x] Push notification dari server (`web-push` + VAPID + Vercel Cron)

## 💭 Dream features
- [ ] Multi-user dengan auth (`user_id` di semua tabel)
- [ ] Multi-language (i18n)
- [ ] Format jatuh tempo kompleks (minggu ke-N, hari tertentu) / input rumus
- [ ] Analitik tren pengeluaran per bulan + chart per kategori
- [ ] Export PDF/CSV rekap bulanan
- [x] Dark/Light mode (Soft Dimmed Slate Charcoal)
- [ ] Custom kategori pengeluaran
- [ ] Auto-expire tagihan (berlaku sampai bulan X, misal cicilan 6 bulan)
- [ ] Tagihan bertahap dengan nominal fleksibel per bagian (misal minggu ini 450rb, bukan 500rb)
- [ ] Single-User App Lock: PIN / Biometric Fingerprint & FaceID (Native WebAuthn API)
- [ ] Share Bukti Transfer dari HP (Web Share Target API + Auto-Extract Nominal via OCR / AI)
