/**
 * config.js
 * API Configuration with localStorage support
 */

var CONFIG = (function() {
  
  var STORAGE_KEY = 'procurement_api_url';
  var DEFAULT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
  
  function getApiUrl() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored.trim() !== '') {
        return stored.trim();
      }
    } catch (e) {}
    return DEFAULT_URL;
  }
  
  function setApiUrl(url) {
    try {
      if (url && url.trim() !== '') {
        localStorage.setItem(STORAGE_KEY, url.trim());
        return true;
      }
    } catch (e) {}
    return false;
  }
  
  function clearApiUrl() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (e) {}
    return false;
  }
  
  function isConfigured() {
    var url = getApiUrl();
    return url && url.indexOf('YOUR_DEPLOYMENT_ID') === -1;
  }
  
  return {
    get API_URL() { return getApiUrl(); },
    setApiUrl: setApiUrl,
    clearApiUrl: clearApiUrl,
    isConfigured: isConfigured,
    DEFAULT_URL: DEFAULT_URL
  };
  
})();
