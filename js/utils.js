/**
 * utils.js
 * Helper utility functions
 */

var Utils = (function() {

  function escapeHtml(str) {
    if (str === null || str === undefined) {
      return '';
    }
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatRupiah(num) {
    if (num === null || num === undefined || isNaN(num)) {
      return '-';
    }
    var rounded = Math.round(num);
    var formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return 'Rp ' + formatted;
  }

  function formatDate(date) {
    if (!date) {
      return '-';
    }
    try {
      var d = new Date(date);
      if (isNaN(d.getTime())) {
        return '-';
      }
      var day = d.getDate();
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      var month = months[d.getMonth()];
      var year = d.getFullYear();
      return day + ' ' + month + ' ' + year;
    } catch (e) {
      return '-';
    }
  }

  function getUrlParam(name) {
    try {
      var search = window.location.search;
      if (!search) {
        return null;
      }
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
      if (el) {
        el.style.display = 'block';
      }
    } catch (e) {
      // fail silently
    }
  }

  function hide(id) {
    try {
      var el = document.getElementById(id);
      if (el) {
        el.style.display = 'none';
      }
    } catch (e) {
      // fail silently
    }
  }

  return {
    escapeHtml: escapeHtml,
    formatRupiah: formatRupiah,
    formatDate: formatDate,
    getUrlParam: getUrlParam,
    show: show,
    hide: hide
  };

})();
