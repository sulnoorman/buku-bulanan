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

## 🔜 Berikutnya
- [ ] Poles UI mobile: ubah tampilan tabel (`Tagihan`, `Riwayat`) menjadi card list di layar HP
- [x] Ikon PWA (`static/icon-192.png`, `static/icon-512.png`)
- [ ] Deploy: Turso + Vercel
- [ ] Push notification dari server (`web-push` + VAPID + Vercel Cron)

## 💭 Dream features
- [ ] Multi-user dengan auth (`user_id` di semua tabel)
- [ ] Multi-language (i18n)
- [ ] Format jatuh tempo kompleks (minggu ke-N, hari tertentu) / input rumus
- [ ] Analitik tren pengeluaran per bulan + chart per kategori
- [ ] Export PDF/CSV rekap bulanan
- [ ] Dark/Light mode
- [ ] Custom kategori pengeluaran
- [ ] Auto-expire tagihan (berlaku sampai bulan X, misal cicilan 6 bulan)
- [ ] Tagihan bertahap dengan nominal fleksibel per bagian (misal minggu ini 450rb, bukan 500rb)
