/**
 * utils.js
 * Helper utility functions
 */

var Utils = (function() {

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatRupiah(num) {
    if (num === null || num === undefined || isNaN(num)) return '-';
    var rounded = Math.round(num);
    var formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return 'Rp ' + formatted;
  }
  
  function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function formatDate(date) {
    if (!date) return '-';
    try {
      var d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      var day = d.getDate();
      var months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      var month = months[d.getMonth()];
      var year = d.getFullYear();
      return day + ' ' + month + ' ' + year;
    } catch (e) {
      return '-';
    }
  }
  
  function formatDateShort(date) {
    if (!date) return '-';
    try {
      var d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      var day = String(d.getDate()).padStart(2, '0');
      var month = String(d.getMonth() + 1).padStart(2, '0');
      var year = d.getFullYear();
      return day + '-' + month + '-' + year;
    } catch (e) {
      return '-';
    }
  }
  
  function terbilang(angka) {
    var bilangan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
    
    if (angka < 12) {
      return bilangan[angka];
    } else if (angka < 20) {
      return terbilang(angka - 10) + ' belas';
    } else if (angka < 100) {
      return terbilang(Math.floor(angka / 10)) + ' puluh ' + terbilang(angka % 10);
    } else if (angka < 200) {
      return 'seratus ' + terbilang(angka - 100);
    } else if (angka < 1000) {
      return terbilang(Math.floor(angka / 100)) + ' ratus ' + terbilang(angka % 100);
    } else if (angka < 2000) {
      return 'seribu ' + terbilang(angka - 1000);
    } else if (angka < 1000000) {
      return terbilang(Math.floor(angka / 1000)) + ' ribu ' + terbilang(angka % 1000);
    } else if (angka < 1000000000) {
      return terbilang(Math.floor(angka / 1000000)) + ' juta ' + terbilang(angka % 1000000);
    } else if (angka < 1000000000000) {
      return terbilang(Math.floor(angka / 1000000000)) + ' miliar ' + terbilang(angka % 1000000000);
    } else {
      return terbilang(Math.floor(angka / 1000000000000)) + ' triliun ' + terbilang(angka % 1000000000000);
    }
  }
  
  function formatTerbilang(angka) {
    if (!angka || isNaN(angka)) return '';
    var hasil = terbilang(Math.round(angka)).trim();
    // Capitalize first letter
    return hasil.charAt(0).toUpperCase() + hasil.slice(1) + ' rupiah';
  }

  function getUrlParam(name) {
    try {
      var search = window.location.search;
      if (!search) return null;
      var params = search.substring(1).split('&');
      for (var i = 0; i < params.length; i++) {
        var pair = params[i].split('=');
        if (decodeURIComponent(pair[0]) === name) {
          return pair[1] ? decodeURIComponent(pair[1]) : '';
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  function show(id) {
    try {
      var el = document.getElementById(id);
      if (el) el.style.display = 'block';
    } catch (e) {}
  }

  function hide(id) {
    try {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    } catch (e) {}
  }
  
  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }
  
  function setHtml(id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }
  
  function getValue(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }
  
  function setValue(id, value) {
    var el = document.getElementById(id);
    if (el) el.value = value || '';
  }
  
  // Generate nomor dokumen
  function generateNomorDokumen(prefix, kodeSatker, bulan, tahun) {
    var seq = Math.floor(Math.random() * 9000) + 1000;
    var bln = bulan || (new Date().getMonth() + 1);
    var thn = tahun || new Date().getFullYear();
    var romawi = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    return prefix + '-' + seq + '/PPK/' + kodeSatker + '/' + romawi[bln] + '/' + thn;
  }
  
  // Hitung pajak
  function hitungPajak(nilai, jenisPajak) {
    var hasil = {
      dpp: 0,
      ppn: 0,
      pph21: 0,
      pph22: 0,
      pph23: 0,
      total: nilai
    };
    
    if (nilai <= 0) return hasil;
    
    // PPN 11%
    if (jenisPajak === 'ppn' || jenisPajak === 'all') {
      hasil.dpp = Math.round(nilai / 1.11);
      hasil.ppn = nilai - hasil.dpp;
    }
    
    // PPh 22 (1.5% untuk belanja barang)
    if (jenisPajak === 'pph22' || jenisPajak === 'all') {
      hasil.pph22 = Math.round(hasil.dpp * 0.015);
    }
    
    // PPh 23 (2% untuk jasa)
    if (jenisPajak === 'pph23') {
      hasil.pph23 = Math.round(hasil.dpp * 0.02);
    }
    
    return hasil;
  }

  return {
    escapeHtml: escapeHtml,
    formatRupiah: formatRupiah,
    formatNumber: formatNumber,
    formatDate: formatDate,
    formatDateShort: formatDateShort,
    formatTerbilang: formatTerbilang,
    terbilang: terbilang,
    getUrlParam: getUrlParam,
    show: show,
    hide: hide,
    setText: setText,
    setHtml: setHtml,
    getValue: getValue,
    setValue: setValue,
    generateNomorDokumen: generateNomorDokumen,
    hitungPajak: hitungPajak
  };

})();
