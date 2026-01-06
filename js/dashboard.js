/**
 * dashboard.js
 * Dashboard page logic
 */

(function() {

  function init() {
    loadProjects();
  }

  function loadProjects() {
    Utils.show('loadingState');
    Utils.hide('errorState');
    Utils.hide('emptyState');
    Utils.hide('tableContainer');

    API.get('getProjects')
      .then(function(result) {
        Utils.hide('loadingState');

        if (!result.success) {
          showError(result.error || 'Gagal memuat data');
          return;
        }

        var projects = result.data || [];

        if (projects.length === 0) {
          Utils.show('emptyState');
          renderStats(0, 0, 0, 0);
          return;
        }

        renderStats(projects);
        renderTable(projects);
        Utils.show('tableContainer');
      });
  }

  function renderStats(projects) {
    var totalProjects = 0;
    var totalItems = 0;
    var surveyDone = 0;
    var progressPercent = 0;

    if (Array.isArray(projects)) {
      totalProjects = projects.length;
      for (var i = 0; i < projects.length; i++) {
        totalItems += projects[i].totalItems || 0;
        surveyDone += projects[i].surveyDone || 0;
      }
      if (totalItems > 0) {
        progressPercent = Math.round((surveyDone / totalItems) * 100);
      }
    }

    setTextContent('statTotalProjects', totalProjects);
    setTextContent('statTotalItems', totalItems);
    setTextContent('statSurveyDone', surveyDone);
    setTextContent('statProgress', progressPercent + '%');
  }

  function renderTable(projects) {
    var tbody = document.getElementById('projectsTableBody');
    if (!tbody) {
      return;
    }

    var html = '';

    for (var i = 0; i < projects.length; i++) {
      var p = projects[i];
      var projectId = Utils.escapeHtml(p.projectId || '');
      var namaProject = Utils.escapeHtml(p.namaProject || '');
      var unit = Utils.escapeHtml(p.unit || '');
      var status = Utils.escapeHtml(p.status || '');
      var totalItems = p.totalItems || 0;
      var surveyDone = p.surveyDone || 0;
      var detailUrl = 'detail.html?projectId=' + encodeURIComponent(p.projectId || '');

      html += '<tr>';
      html += '<td>' + (i + 1) + '</td>';
      html += '<td>' + namaProject + '</td>';
      html += '<td>' + unit + '</td>';
      html += '<td>' + status + '</td>';
      html += '<td>' + totalItems + '</td>';
      html += '<td>' + surveyDone + '</td>';
      html += '<td><a href="' + detailUrl + '">Detail</a></td>';
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
