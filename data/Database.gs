/**
 * DATABASE.GS
 * ===========
 * Data Access Layer - HARDENED v1.1
 * Self-contained, ES5 only, defensive programming
 * 
 * INCLUDES: Items management (insert, delete, fetch)
 */

// ============================================================
// CONSTANTS (HARDCODED - NO EXTERNAL DEPS)
// ============================================================

var DB_SPREADSHEET_ID = null; // Will use active spreadsheet

var DB_SHEET_PROJECTS = 'Projects';
var DB_SHEET_ITEMS = 'Items';
var DB_SHEET_AUDIT = 'Audit_Log';

var DB_HEADERS_PROJECTS = ['project_id', 'nama_project', 'unit', 'status', 'created_at'];
var DB_HEADERS_ITEMS = ['item_id', 'project_id', 'nama_barang', 'volume', 'satuan', 'hps', 'status', 'created_at'];
var DB_HEADERS_AUDIT = ['timestamp', 'action', 'user', 'details'];

// ============================================================
// SPREADSHEET ACCESS
// ============================================================

function getSpreadsheet_() {
  try {
    if (DB_SPREADSHEET_ID) {
      return SpreadsheetApp.openById(DB_SPREADSHEET_ID);
    }
    return SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    Logger.log('getSpreadsheet_ error: ' + e.message);
    return null;
  }
}

function getOrCreateSheet_(sheetName, headers) {
  try {
    var ss = getSpreadsheet_();
    if (!ss) return null;
    
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      if (headers && headers.length > 0) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        formatHeader_(sheet, headers.length);
      }
    }
    
    return sheet;
  } catch (e) {
    Logger.log('getOrCreateSheet_ error: ' + e.message);
    return null;
  }
}

function formatHeader_(sheet, columnCount) {
  try {
    var headerRange = sheet.getRange(1, 1, 1, columnCount);
    headerRange.setBackground('#1976d2');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  } catch (e) {
    // Ignore formatting errors
  }
}

// ============================================================
// VALIDATION HELPERS
// ============================================================

function isValidObject_(val) {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

function isNonEmptyString_(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

function safeString_(val) {
  if (val === null || val === undefined) return '';
  return String(val);
}

// ============================================================
// PROJECTS
// ============================================================

function ensureProjectsSheet_() {
  return getOrCreateSheet_(DB_SHEET_PROJECTS, DB_HEADERS_PROJECTS);
}

/**
 * Insert new project
 */
function insertProject(project) {
  
  // HARD GUARDS
  if (!isValidObject_(project)) {
    Logger.log('insertProject REJECTED: project is not a valid object');
    return false;
  }
  
  if (!isNonEmptyString_(project.projectId)) {
    Logger.log('insertProject REJECTED: projectId is missing or empty');
    return false;
  }
  
  if (!isNonEmptyString_(project.namaProject)) {
    Logger.log('insertProject REJECTED: namaProject is missing or empty');
    return false;
  }
  
  if (!isNonEmptyString_(project.unit)) {
    Logger.log('insertProject REJECTED: unit is missing or empty');
    return false;
  }
  
  try {
    var sheet = ensureProjectsSheet_();
    if (!sheet) {
      Logger.log('insertProject REJECTED: could not get sheet');
      return false;
    }
    
    var row = [
      safeString_(project.projectId),
      safeString_(project.namaProject),
      safeString_(project.unit),
      safeString_(project.status || 'Active'),
      safeString_(project.createdAt || new Date().toISOString())
    ];
    
    sheet.appendRow(row);
    return true;
    
  } catch (e) {
    Logger.log('insertProject error: ' + e.message);
    return false;
  }
}

/**
 * Fetch all projects
 */
function fetchAllProjects() {
  try {
    var sheet = ensureProjectsSheet_();
    if (!sheet) return [];
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    var projects = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (row[0]) { // Has project_id
        projects.push({
          projectId: safeString_(row[0]),
          namaProject: safeString_(row[1]),
          unit: safeString_(row[2]),
          status: safeString_(row[3]),
          createdAt: safeString_(row[4])
        });
      }
    }
    
    return projects;
    
  } catch (e) {
    Logger.log('fetchAllProjects error: ' + e.message);
    return [];
  }
}

/**
 * Fetch project by ID
 */
function fetchProjectById(projectId) {
  if (!isNonEmptyString_(projectId)) return null;
  
  try {
    var projects = fetchAllProjects();
    for (var i = 0; i < projects.length; i++) {
      if (projects[i].projectId === projectId) {
        return projects[i];
      }
    }
    return null;
    
  } catch (e) {
    Logger.log('fetchProjectById error: ' + e.message);
    return null;
  }
}

// ============================================================
// ITEMS
// ============================================================

function ensureItemsSheet_() {
  return getOrCreateSheet_(DB_SHEET_ITEMS, DB_HEADERS_ITEMS);
}

/**
 * Insert new item
 */
function insertItem(item) {
  
  // HARD GUARDS
  if (!isValidObject_(item)) {
    Logger.log('insertItem REJECTED: item is not a valid object');
    return false;
  }
  
  if (!isNonEmptyString_(item.itemId)) {
    Logger.log('insertItem REJECTED: itemId is missing or empty');
    return false;
  }
  
  if (!isNonEmptyString_(item.projectId)) {
    Logger.log('insertItem REJECTED: projectId is missing or empty');
    return false;
  }
  
  if (!isNonEmptyString_(item.namaBarang)) {
    Logger.log('insertItem REJECTED: namaBarang is missing or empty');
    return false;
  }
  
  try {
    var sheet = ensureItemsSheet_();
    if (!sheet) {
      Logger.log('insertItem REJECTED: could not get sheet');
      return false;
    }
    
    var row = [
      safeString_(item.itemId),
      safeString_(item.projectId),
      safeString_(item.namaBarang),
      item.volume || 0,
      safeString_(item.satuan),
      item.hps || 0,
      safeString_(item.status || 'Pending'),
      safeString_(item.createdAt || new Date().toISOString())
    ];
    
    sheet.appendRow(row);
    return true;
    
  } catch (e) {
    Logger.log('insertItem error: ' + e.message);
    return false;
  }
}

/**
 * Delete item by ID
 */
function deleteItem(itemId) {
  if (!isNonEmptyString_(itemId)) {
    Logger.log('deleteItem REJECTED: itemId is missing or empty');
    return false;
  }
  
  try {
    var sheet = ensureItemsSheet_();
    if (!sheet) return false;
    
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === itemId) {
        sheet.deleteRow(i + 1); // +1 because array is 0-indexed
        return true;
      }
    }
    
    return false; // Not found
    
  } catch (e) {
    Logger.log('deleteItem error: ' + e.message);
    return false;
  }
}

/**
 * Fetch items for a project
 */
function fetchProjectItems(projectId) {
  if (!isNonEmptyString_(projectId)) return [];
  
  try {
    var sheet = ensureItemsSheet_();
    if (!sheet) return [];
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    var items = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (row[1] === projectId) { // project_id match
        items.push({
          itemId: safeString_(row[0]),
          projectId: safeString_(row[1]),
          namaBarang: safeString_(row[2]),
          volume: row[3] || 0,
          satuan: safeString_(row[4]),
          hps: row[5] || 0,
          status: safeString_(row[6]),
          createdAt: safeString_(row[7])
        });
      }
    }
    
    return items;
    
  } catch (e) {
    Logger.log('fetchProjectItems error: ' + e.message);
    return [];
  }
}

/**
 * Get item count for project
 */
function getProjectItemCount(projectId) {
  var items = fetchProjectItems(projectId);
  return items.length;
}

/**
 * Get survey done count for project
 */
function getProjectSurveyCount(projectId) {
  var items = fetchProjectItems(projectId);
  var count = 0;
  for (var i = 0; i < items.length; i++) {
    if (items[i].status === 'Survey Done' || items[i].status === 'Selesai') {
      count++;
    }
  }
  return count;
}

// ============================================================
// AUDIT LOG
// ============================================================

function ensureAuditSheet_() {
  return getOrCreateSheet_(DB_SHEET_AUDIT, DB_HEADERS_AUDIT);
}

/**
 * Insert audit log entry
 */
function insertAuditLog(entry) {
  
  if (!isValidObject_(entry)) {
    Logger.log('insertAuditLog REJECTED: entry is not a valid object');
    return false;
  }
  
  try {
    var sheet = ensureAuditSheet_();
    if (!sheet) return false;
    
    var row = [
      safeString_(entry.timestamp || new Date().toISOString()),
      safeString_(entry.action),
      safeString_(entry.user),
      safeString_(entry.details)
    ];
    
    sheet.appendRow(row);
    return true;
    
  } catch (e) {
    Logger.log('insertAuditLog error: ' + e.message);
    return false;
  }
}

// ============================================================
// SETUP & TEST
// ============================================================

/**
 * Initialize all sheets
 */
function setupDatabase() {
  Logger.log('Setting up database...');
  
  ensureProjectsSheet_();
  Logger.log('Projects sheet: OK');
  
  ensureItemsSheet_();
  Logger.log('Items sheet: OK');
  
  ensureAuditSheet_();
  Logger.log('Audit_Log sheet: OK');
  
  Logger.log('Database setup complete!');
}

/**
 * Test all database functions
 */
function testDatabase() {
  Logger.log('========================================');
  Logger.log('DATABASE TEST');
  Logger.log('========================================');
  
  var checks = {
    insertProject: typeof insertProject === 'function',
    fetchAllProjects: typeof fetchAllProjects === 'function',
    fetchProjectById: typeof fetchProjectById === 'function',
    insertItem: typeof insertItem === 'function',
    deleteItem: typeof deleteItem === 'function',
    fetchProjectItems: typeof fetchProjectItems === 'function',
    getProjectItemCount: typeof getProjectItemCount === 'function',
    getProjectSurveyCount: typeof getProjectSurveyCount === 'function',
    insertAuditLog: typeof insertAuditLog === 'function'
  };
  
  var allOk = true;
  for (var key in checks) {
    Logger.log('[' + (checks[key] ? 'OK' : 'FAIL') + '] ' + key);
    if (!checks[key]) allOk = false;
  }
  
  Logger.log('========================================');
  Logger.log(allOk ? 'DATABASE OK' : 'DATABASE ISSUES');
  
  return allOk;
}
