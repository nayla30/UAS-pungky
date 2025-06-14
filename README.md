# ZakatPay

Aplikasi manajemen pembayar Zakat dengan fitur CRUD, tampilan modern, dan database SQLite.

## Cara Menjalankan (Windows)

1. **Install Python** (jika belum ada):
   - Download dari https://python.org dan pastikan sudah menambah ke PATH.

2. **Install dependensi**:
   ```powershell
   pip install -r requirements.txt
   ```

3. **Jalankan aplikasi**:
   ```powershell
   python app.py
   ```

4. **Akses aplikasi** di browser:
   - Buka http://127.0.0.1:5000

## Fitur
- CRUD pembayar Zakat (tambah, ubah, hapus, lihat)
- Validasi data
- Notifikasi aksi sukses/error
- UI modern, responsif, dan ramah pengguna

## Struktur File Penting
- `app.py` : Backend Flask
- `templates/` : HTML (Jinja2)
- `static/style.css` : CSS
- `static/main.js` : JavaScript
- `zakatpay.db` : Database SQLite (otomatis dibuat)

---
© 2025 ZakatPay. Membantu Anda menunaikan kewajiban.
