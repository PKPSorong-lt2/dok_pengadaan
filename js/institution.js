/**
 * institution.js
 * Konfigurasi Data Institusi & Pejabat
 */

var INSTITUTION = {
  
  // Header Surat
  kementerian: 'KEMENTERIAN KELAUTAN DAN PERIKANAN',
  badan: 'BADAN PENYULUHAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA KELAUTAN DAN PERIKANAN',
  satker: 'POLITEKNIK KELAUTAN DAN PERIKANAN SORONG',
  alamat: 'JALAN KAPITAN PATTIMURA, TANJUNG KASUARI - SUPRAU',
  kotakPos: 'KOTAK POS 118 KOTA SORONG, PAPUA BARAT DAYA 98411',
  website: 'www.polikpsorong.ac.id',
  email: 'polteksorong@kkp.go.id',
  
  // Kode Satker
  kodeSatker: 'PL450',
  tahunAnggaran: '2025',
  
  // Pejabat Default
  ppinak: {
    nama: 'FIRDAUS DABAMONA',
    nip: '',
    jabatan: 'Pranata Keuangan Mahir',
    skJabatan: 'B.170/KPA POLTEK-SORONG/KU.110/VIII/2024'
  },
  
  kpa: {
    nama: '',
    nip: '',
    jabatan: 'Kuasa Pengguna Anggaran'
  },
  
  bendahara: {
    nama: '',
    nip: '',
    jabatan: 'Bendahara Pengeluaran'
  },
  
  pejabatPengadaan: {
    nama: '',
    nip: '',
    jabatan: 'Pejabat Pengadaan'
  }
};

// Freeze untuk mencegah perubahan tidak sengaja
if (Object.freeze) {
  Object.freeze(INSTITUTION);
}
