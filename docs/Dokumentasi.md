# Dokumentasi Integrasi MFE - Sistem Penebusan Resep Apotek Tiarana Farma

Dokumentasi ini merangkum pengerjaan integrasi Micro Frontend (MFE) React ke dalam platform AlurKerja untuk studi kasus Sistem Penebusan Obat Kategori Khusus (Prekursor), mencakup Area 1 hingga Area 3.

---

## 1. README per Area

### Area 1 & 2: Form Dasar & Custom Detail View
* **Apa yang dibuat:** Menginisiasi *project* MFE React dan membuat komponen form dasar untuk input data, serta menampilkan data tersebut dalam format *Read-Only* (*Custom Detail View*) menggunakan parameter bawaan AlurKerja.
* **Cara Build & Publish:** 
  1. Buka terminal di direktori MFE (`/views`) dan jalankan perintah `npm run build`.
  2. Kembali ke *root* direktori *project* dan jalankan perintah `alurkerja addon publish`.
* **Cara Pakai:** Pasang komponen pada *User Task* di AlurKerja Studio via menu *Form Builder* -> *Add On*, lalu arahkan *Component Name* ke nama *file* MFE terkait.

### Area 3: Pemisahan Role (Eksternal & Internal) dan BPMN Gateway
* **Apa yang dibuat:** Membangun *End-to-End flow* dengan memisahkan antarmuka untuk Pasien dan Apoteker.
  * **Daftar Komponen Utama:**
    | Nama Komponen | Role / Posisi | Lokasi File | Deskripsi |
    | :--- | :--- | :--- | :--- |
    | `PatientPrescriptionForm` | React MFE (Sisi Eksternal) | `views/src/PatientPrescriptionForm.tsx` | Antarmuka formulir pemesanan untuk end-user (pasien) guna menginput identitas, pilihan obat, dan keluhan medis. |
    | `ApotekerReviewForm` | React MFE (Sisi Internal) | `views/src/ApotekerReviewForm.tsx` | Antarmuka verifikasi untuk apoteker dengan fitur baca data pasien dan tombol keputusan (Approve/Reject) dinamis. |
* **Cara Build & Publish:** Sama dengan instruksi pada Area 1 & 2.
* **Cara Pakai:** 
  1. `PatientPrescriptionForm` diakses via menu *Start a Process* oleh *end-user*.
  2. `ApotekerReviewForm` di-*embed* ke dalam *User Task* verifikasi di BPMN. Tombol pada form ini akan menulis nilai ke *process variable* yang secara otomatis menggerakkan *Exclusive Gateway* di BPMN.

---

## 2. Catatan Kendala & Solusi

Selama proses pengerjaan, terdapat beberapa kendala teknis yang berhasil diselesaikan:

1. **Kendala:** Form MFE terpotong (*cut off*) saat di-*render* di dalam AlurKerja Studio maupun App, sehingga tombol *submit* atau input area bawah tidak terlihat.
   * **Solusi:** Menyesuaikan konfigurasi komponen *Add On* di AlurKerja Studio. Menggunakan menu *Settings* (ikon kunci inggris) pada komponen, lalu mengubah nilai `Height` dari bawaan menjadi lebih besar (misal: `800px` - `900px`) agar *container* dapat menampung tinggi form React seutuhnya.

2. **Kendala:** *Error* TypeScript (*implicitly has an 'any' type*) saat mendeklarasikan *props* bawaan AlurKerja seperti `form` dan `alurkerjaParams` pada file `.tsx`.
   * **Solusi:** Menambahkan deklarasi tipe data (*Type Assertion*) khusus untuk *props* yang diterima oleh komponen React, contohnya dengan membuat `type ApotekerFormProps = { form?: any; alurkerjaParams?: any; };` untuk memastikan keamanan tipe dan mencegah *error* saat proses *build* Webpack.

---

## 3. Daftar Process Variable & Alur Baca/Tulis

Berikut adalah *process variables* yang mengalir di dalam *engine* BPMN dari awal hingga akhir proses:

| Nama Variabel | Tipe Data | Ditulis Oleh (Write) | Dibaca Oleh (Read) | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `nama_pasien` | String | Pasien (Area 3) | Apoteker (Area 3) | Nama pemesan obat |
| `kontak_pasien` | String | Pasien (Area 3) | Apoteker (Area 3) | No WA pemesan |
| `pilihan_obat` | String | Pasien (Area 3) | Apoteker (Area 3) | Obat prekursor yang dipilih (Tremenza/Rhinos) |
| `jumlah_obat` | String | Pasien (Area 3) | Apoteker (Area 3) | Jumlah pesanan obat |
| `keluhan_pasien` | String | Pasien (Area 3) | Apoteker (Area 3) | Indikasi medis dari pasien |
| `approval_status` | String | Apoteker (Area 3) | BPMN Gateway | Keputusan verifikasi (`approve` atau `reject`) |
| `total_harga` | Number | Apoteker (Area 3) | End Event / History | Input harga jika pesanan di-*approve* |
| `catatan_penolakan`| String | Apoteker (Area 3) | End Event / History | Alasan penolakan jika pesanan di-*reject* |

---