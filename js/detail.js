/**
 * detail.js
 * Project detail page logic with item management
 */

(function() {

  var currentProjectId = null;

  function init() {
    var projectId = Utils.getUrlParam('projectId');

    if (!projectId) {
      showError('Project ID tidak ditemukan di URL');
      return;
    }

    currentProjectId = projectId;
    loadProjectDetail(projectId);
    
    // Setup add item button
    var addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) {
      addItemBtn.addEventListener('click', handleAddItem);
    }
    
    // Enter key on inputs
    var inputs = ['namaBarang', 'volume', 'satuan', 'hps'];
    inputs.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            handleAddItem();
          }
        });
      }
    });
  }

  function loadProjectDetail(projectId) {
    Utils.show('loadingState');
    Utils.hide('errorState');
    Utils.hide('contentContainer');

    API.get('getProjectDetail', { projectId: projectId })
      .then(function(result) {
        Utils.hide('loadingState');

        if (!result.success) {
          showError(result.error || 'Gagal memuat data project');
          return;
        }

        var project = result.data;

        if (!project) {
          showError('Project tidak ditemukan');
          return;
        }

        renderProjectInfo(project);
        renderItemsTable(project.items || []);
        Utils.show('contentContainer');
      });
  }

  function renderProjectInfo(project) {
    setTextContent('infoProjectId', project.projectId || '-');
    setTextContent('infoNamaProject', project.namaProject || '-');
    setTextContent('infoUnit', project.unit || '-');
    setTextContent('infoStatus', project.status || '-');
    setTextContent('infoCreatedAt', Utils.formatDate(project.createdAt));

    var totalItems = project.totalItems || 0;
    var surveyDone = project.surveyDone || 0;
    var progress = totalItems > 0 ? Math.round((surveyDone / totalItems) * 100) : 0;

    setTextContent('infoTotalItems', totalItems);
    setTextContent('infoSurveyDone', surveyDone);
    setTextContent('infoProgress', progress + '%');

    var progressBar = document.getElementById('progressBar');
    if (progressBar) {
      progressBar.style.width = progress + '%';
    }

    var pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
      pageTitle.textContent = Utils.escapeHtml(project.namaProject || 'Detail Project');
    }
  }

  function renderItemsTable(items) {
    var tbody = document.getElementById('itemsTableBody');
    var emptyState = document.getElementById('itemsEmptyState');
    var tableContainer = document.getElementById('itemsTableContainer');

    if (!tbody) {
      return;
    }

    if (items.length === 0) {
      if (emptyState) {
        emptyState.style.display = 'block';
      }
      if (tableContainer) {
        tableContainer.style.display = 'none';
      }
      return;
    }

    if (emptyState) {
      emptyState.style.display = 'none';
    }
    if (tableContainer) {
      tableContainer.style.display = 'block';
    }

    var html = '';

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var itemId = Utils.escapeHtml(item.itemId || '');
      var namaBarang = Utils.escapeHtml(item.namaBarang || '');
      var volume = item.volume || 0;
      var satuan = Utils.escapeHtml(item.satuan || '');
      var status = Utils.escapeHtml(item.status || 'Pending');
      var hps = item.hps ? Utils.formatRupiah(item.hps) : '-';

      html += '<tr>';
      html += '<td>' + (i + 1) + '</td>';
      html += '<td>' + itemId + '</td>';
      html += '<td>' + namaBarang + '</td>';
      html += '<td class="text-right">' + volume + '</td>';
      html += '<td>' + satuan + '</td>';
      html += '<td>' + status + '</td>';
      html += '<td class="text-right">' + hps + '</td>';
      html += '<td class="text-center"><button class="btn-delete" onclick="deleteItem(\'' + itemId + '\')" title="Hapus">🗑️</button></td>';
      html += '</tr>';
    }

    tbody.innerHTML = html;
  }

  function handleAddItem() {
    hideItemAlert();
    
    var namaBarang = document.getElementById('namaBarang').value.trim();
    var volume = document.getElementById('volume').value.trim();
    var satuan = document.getElementById('satuan').value.trim();
    var hps = document.getElementById('hps').value.trim();
    
    // Validate
    if (!namaBarang) {
      showItemAlert('error', 'Nama barang wajib diisi');
      return;
    }
    
    if (!volume || isNaN(volume) || parseInt(volume) <= 0) {
      showItemAlert('error', 'Volume harus berupa angka lebih dari 0');
      return;
    }
    
    if (!satuan) {
      showItemAlert('error', 'Satuan wajib diisi');
      return;
    }
    
    var btn = document.getElementById('addItemBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Menambah...';
    }
    
    API.post('addItem', {
      projectId: currentProjectId,
      namaBarang: namaBarang,
      volume: parseInt(volume),
      satuan: satuan,
      hps: hps ? parseFloat(hps) : 0
    })
    .then(function(result) {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '+ Tambah';
      }
      
      if (!result.success) {
        showItemAlert('error', result.error || 'Gagal menambah item');
        return;
      }
      
      showItemAlert('success', 'Item berhasil ditambahkan');
      
      // Clear form
      document.getElementById('namaBarang').value = '';
      document.getElementById('volume').value = '';
      document.getElementById('satuan').value = '';
      document.getElementById('hps').value = '';
      
      // Focus back to nama barang
      document.getElementById('namaBarang').focus();
      
      // Reload project detail
      loadProjectDetail(currentProjectId);
    });
  }
  
  // Global function for delete button
  window.deleteItem = function(itemId) {
    if (!confirm('Hapus item ini?')) {
      return;
    }
    
    API.post('deleteItem', {
      projectId: currentProjectId,
      itemId: itemId
    })
    .then(function(result) {
      if (!result.success) {
        showItemAlert('error', result.error || 'Gagal menghapus item');
        return;
      }
      
      showItemAlert('success', 'Item berhasil dihapus');
      loadProjectDetail(currentProjectId);
    });
  };

  function showError(message) {
    var errorEl = document.getElementById('errorMessage');
    if (errorEl) {
      errorEl.textContent = message;
    }
    Utils.show('errorState');
  }
  
  function showItemAlert(type, message) {
    var alertEl = document.getElementById('itemAlert');
    if (alertEl) {
      alertEl.className = 'alert alert-' + type;
      alertEl.textContent = message;
      alertEl.style.display = 'block';
      
      // Auto hide after 3 seconds
      setTimeout(function() {
        alertEl.style.display = 'none';
      }, 3000);
    }
  }
  
  function hideItemAlert() {
    var alertEl = document.getElementById('itemAlert');
    if (alertEl) {
      alertEl.style.display = 'none';
    }
  }

  function setTextContent(id, value) {
    var el = document.getElementById(id);
    if (el) {
      el.textContent = value;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
