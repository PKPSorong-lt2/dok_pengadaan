/**
 * create.js
 * Create project page logic
 */

(function() {

  var form;
  var submitBtn;
  var originalBtnText;

  function init() {
    form = document.getElementById('createForm');
    submitBtn = document.getElementById('submitBtn');

    if (submitBtn) {
      originalBtnText = submitBtn.textContent;
    }

    if (form) {
      form.addEventListener('submit', handleSubmit);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    hideMessages();
    clearValidationErrors();

    var namaProject = getInputValue('namaProject');
    var unit = getInputValue('unit');

    var isValid = true;

    if (!namaProject) {
      showValidationError('namaProject', 'Nama project wajib diisi');
      isValid = false;
    }

    if (!unit) {
      showValidationError('unit', 'Unit wajib diisi');
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    disableSubmit();

    API.post('createProject', {
      namaProject: namaProject,
      unit: unit
    })
    .then(function(result) {
      if (!result.success) {
        enableSubmit();
        showError(result.error || 'Gagal membuat project');
        return;
      }

      showSuccess('Project berhasil dibuat');

      setTimeout(function() {
        window.location.href = 'index.html';
      }, 1500);
    });
  }

  function getInputValue(id) {
    var el = document.getElementById(id);
    if (!el) {
      return '';
    }
    return el.value.trim();
  }

  function showValidationError(fieldId, message) {
    var errorEl = document.getElementById(fieldId + 'Error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }

    var inputEl = document.getElementById(fieldId);
    if (inputEl) {
      inputEl.classList.add('input-error');
    }
  }

  function clearValidationErrors() {
    var errorEls = ['namaProjectError', 'unitError'];
    for (var i = 0; i < errorEls.length; i++) {
      var el = document.getElementById(errorEls[i]);
      if (el) {
        el.textContent = '';
        el.style.display = 'none';
      }
    }

    var inputEls = ['namaProject', 'unit'];
    for (var j = 0; j < inputEls.length; j++) {
      var inputEl = document.getElementById(inputEls[j]);
      if (inputEl) {
        inputEl.classList.remove('input-error');
      }
    }
  }

  function showError(message) {
    var el = document.getElementById('errorMessage');
    if (el) {
      el.textContent = message;
    }
    Utils.show('errorAlert');
  }

  function showSuccess(message) {
    var el = document.getElementById('successMessage');
    if (el) {
      el.textContent = message;
    }
    Utils.show('successAlert');
  }

  function hideMessages() {
    Utils.hide('errorAlert');
    Utils.hide('successAlert');
  }

  function disableSubmit() {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Menyimpan...';
    }
  }

  function enableSubmit() {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
