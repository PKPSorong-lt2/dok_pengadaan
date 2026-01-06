/**
 * ROUTER.GS
 * ==========
 * SINGLE ENTRY POINT API
 * CORS-SAFE VERSION
 */

// ============================================================
// MAIN ENTRY POINTS
// ============================================================

/**
 * doGet - Handle all GET requests
 */
function doGet(e) {
  return handleRequest_('GET', e);
}

/**
 * doPost - Handle all POST requests
 */
function doPost(e) {
  return handleRequest_('POST', e);
}

// ============================================================
// INTERNAL: REQUEST HANDLER
// ============================================================

function handleRequest_(method, e) {
  
  var result;
  
  try {
    
    if (!e) {
      result = { success: false, error: 'Invalid request: no event object' };
      return jsonResponse_(result);
    }
    
    // GET request
    if (method === 'GET') {
      
      var params = e.parameter || {};
      var action = params.action || '';
      
      if (!action) {
        result = {
          success: true,
          data: {
            service: 'Procurement API',
            version: '1.0',
            method: 'GET',
            message: 'Specify action parameter'
          }
        };
        return jsonResponse_(result);
      }
      
      result = DocumentService_handleAPIGet(action, params);
      return jsonResponse_(result);
    }
    
    // POST request
    if (method === 'POST') {
      
      var body = parseBody_(e);
      
      if (!body) {
        result = { success: false, error: 'Invalid request: could not parse body' };
        return jsonResponse_(result);
      }
      
      var action = body.action || '';
      var data = body.data || {};
      
      if (!action) {
        result = { success: false, error: 'Missing action in request body' };
        return jsonResponse_(result);
      }
      
      result = DocumentService_handleAPIPost(action, data);
      return jsonResponse_(result);
    }
    
    result = { success: false, error: 'Unsupported method: ' + method };
    return jsonResponse_(result);
    
  } catch (err) {
    result = {
      success: false,
      error: 'Internal error: ' + (err.message || err.toString())
    };
    return jsonResponse_(result);
  }
}

// ============================================================
// INTERNAL: HELPERS
// ============================================================

/**
 * parseBody_ - Parse POST body safely
 * Handles both application/json and text/plain
 */
function parseBody_(e) {
  
  try {
    
    if (!e) return null;
    if (!e.postData) return null;
    
    var contents = e.postData.contents;
    
    if (!contents) return null;
    if (typeof contents !== 'string') return null;
    if (contents.trim().length === 0) return null;
    
    var parsed = JSON.parse(contents);
    
    if (typeof parsed !== 'object' || parsed === null) return null;
    
    return parsed;
    
  } catch (err) {
    Logger.log('parseBody_ error: ' + err.message);
    return null;
  }
}

/**
 * jsonResponse_ - Create JSON response
 */
function jsonResponse_(obj) {
  
  var output;
  
  try {
    output = JSON.stringify(obj);
  } catch (err) {
    output = JSON.stringify({
      success: false,
      error: 'Failed to serialize response'
    });
  }
  
  return ContentService
    .createTextOutput(output)
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// VERIFICATION
// ============================================================

function testRouter_() {
  
  var checks = {
    doGet: typeof doGet === 'function',
    doPost: typeof doPost === 'function',
    handleRequest_: typeof handleRequest_ === 'function',
    parseBody_: typeof parseBody_ === 'function',
    jsonResponse_: typeof jsonResponse_ === 'function'
  };
  
  Logger.log('========================================');
  Logger.log('ROUTER VERIFICATION');
  Logger.log('========================================');
  
  var allOk = true;
  
  for (var key in checks) {
    var ok = checks[key];
    Logger.log('[' + (ok ? 'OK' : 'FAIL') + '] ' + key);
    if (!ok) allOk = false;
  }
  
  Logger.log('========================================');
  Logger.log(allOk ? 'ROUTER OK' : 'ROUTER ISSUES');
  
  return allOk;
}
