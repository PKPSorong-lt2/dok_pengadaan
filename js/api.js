/**
 * api.js
 * Fetch wrapper for Google Apps Script API
 * Using text/plain to avoid CORS preflight
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
    if (!response.ok) {
      return Promise.resolve({
        success: false,
        error: 'HTTP Error: ' + response.status
      });
    }

    return response.text()
      .then(function(text) {
        try {
          var result = JSON.parse(text);
          if (typeof result !== 'object' || result === null) {
            return { success: false, error: 'Invalid response format' };
          }
          return result;
        } catch (e) {
          return { success: false, error: 'Failed to parse response: ' + text.substring(0, 100) };
        }
      })
      .catch(function() {
        return { success: false, error: 'Failed to read response' };
      });
  }

  function handleNetworkError(err) {
    return {
      success: false,
      error: 'Network error: ' + (err.message || 'Unable to connect')
    };
  }

  function get(action, params) {
    var queryParams = { action: action };
    
    if (params) {
      for (var key in params) {
        if (params.hasOwnProperty(key)) {
          queryParams[key] = params[key];
        }
      }
    }

    var url = CONFIG.API_URL + buildQueryString(queryParams);

    return fetch(url, {
      method: 'GET',
      redirect: 'follow'
    })
    .then(handleResponse)
    .catch(handleNetworkError);
  }

  function post(action, data) {
    var body = {
      action: action,
      data: data || {}
    };

    // Use text/plain to avoid CORS preflight
    // GAS will still receive JSON in e.postData.contents
    return fetch(CONFIG.API_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(body)
    })
    .then(handleResponse)
    .catch(handleNetworkError);
  }

  return {
    get: get,
    post: post
  };

})();
