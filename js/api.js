/**
 * api.js
 * Fetch wrapper for Google Apps Script API
 */

var API = (function() {

  function buildQueryString(params) {
    var parts = [];
    for (var key in params) {
      if (params.hasOwnProperty(key) && params[key] !== undefined && params[key] !== null) {
        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
      }
    }
    return parts.length > 0 ? '?' + parts.join('&') : '';
  }

  function handleResponse(response) {
    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      return Promise.resolve({
        success: false,
        error: 'HTTP Error: ' + response.status
      });
    }

    return response.text()
      .then(function(text) {
        console.log('API Response text:', text.substring(0, 200));
        try {
          var result = JSON.parse(text);
          if (typeof result !== 'object' || result === null) {
            return { success: false, error: 'Invalid response format' };
          }
          return result;
        } catch (e) {
          console.log('JSON parse error:', e);
          return { success: false, error: 'Failed to parse response: ' + e.message };
        }
      });
  }

  function handleNetworkError(err) {
    console.log('Network error:', err);
    return {
      success: false,
      error: 'Network error: ' + (err.message || 'Failed to fetch')
    };
  }

  /**
   * Check if API is properly configured
   */
  function checkConfig() {
    if (!CONFIG.isConfigured()) {
      console.log('API not configured. Current URL:', CONFIG.API_URL);
      return {
        success: false,
        error: 'API belum dikonfigurasi. Silakan buka Pengaturan dan masukkan URL API.',
        notConfigured: true
      };
    }
    return null;
  }

  function get(action, params) {
    // Check config first
    var configError = checkConfig();
    if (configError) {
      return Promise.resolve(configError);
    }
    
    var queryParams = { action: action };
    if (params) {
      for (var key in params) {
        if (params.hasOwnProperty(key)) {
          queryParams[key] = params[key];
        }
      }
    }
    
    var url = CONFIG.API_URL + buildQueryString(queryParams);
    console.log('API GET:', url);
    
    return fetch(url, { 
      method: 'GET', 
      redirect: 'follow'
    })
    .then(handleResponse)
    .catch(handleNetworkError);
  }

  function post(action, data) {
    // Check config first
    var configError = checkConfig();
    if (configError) {
      return Promise.resolve(configError);
    }
    
    var body = { action: action, data: data || {} };
    console.log('API POST:', CONFIG.API_URL, 'Action:', action);
    
    return fetch(CONFIG.API_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body)
    })
    .then(handleResponse)
    .catch(handleNetworkError);
  }
  
  /**
   * Test API connection
   */
  function testConnection(url) {
    console.log('Testing connection to:', url);
    
    var testUrl = url + '?action=getProjects';
    
    return fetch(testUrl, { 
      method: 'GET', 
      redirect: 'follow'
    })
    .then(function(response) {
      console.log('Test response status:', response.status);
      return response.text();
    })
    .then(function(text) {
      console.log('Test response:', text.substring(0, 200));
      try {
        var result = JSON.parse(text);
        if (result.success !== undefined) {
          return { success: true, message: 'Koneksi berhasil!' };
        }
        return { success: false, message: 'Response tidak valid' };
      } catch (e) {
        return { success: false, message: 'Response bukan JSON: ' + e.message };
      }
    })
    .catch(function(err) {
      console.log('Test error:', err);
      return { success: false, message: 'Gagal terhubung: ' + err.message };
    });
  }

  return { 
    get: get, 
    post: post,
    testConnection: testConnection,
    isConfigured: function() { return CONFIG.isConfigured(); }
  };
})();
