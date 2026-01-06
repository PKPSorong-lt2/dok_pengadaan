/**
 * detail.js
 * Project detail page logic
 */

(function() {

  function init() {
    var projectId = Utils.getUrlParam('projectId');

    if (!projectId) {
      showError('Project ID tidak ditemukan di URL');
      return;
    }

    loadProjectDetail(projectId);
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
      var status = Utils.escapeHtml(item.status || '');
      var hps = item.hps ? Utils.formatRupiah(item.hps) : '-';

      html += '<tr>';
      html += '<td>' + (i + 1) + '</td>';
      html += '<td>' + itemId + '</td>';
      html += '<td>' + namaBarang + '</td>';
      html += '<td>' + volume + '</td>';
      html += '<td>' + satuan + '</td>';
      html += '<td>' + status + '</td>';
      html += '<td>' + hps + '</td>';
      html += '</tr>';
    }

    tbody.innerHTML = html;
  }

  function showError(message) {
    var errorEl = document.getElementById('errorMessage');
    if (errorEl) {
      errorEl.textContent = message;
    }
    Utils.show('errorState');
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
