/**
 * DOCUMENTSERVICE.GS
 * ==================
 * Business Logic Layer - Item Management
 * 
 * HANYA BOLEH memanggil fungsi dari Database.gs
 * TIDAK BOLEH akses SpreadsheetApp langsung
 */

// ============================================================
// API HANDLERS
// ============================================================

/**
 * Handle GET requests
 */
function DocumentService_handleAPIGet(action, params) {
  
  switch (action) {
    
    case 'getProjects':
      return DocumentService_getProjects();
    
    case 'getProjectDetail':
      return DocumentService_getProjectDetail(params.projectId);
    
    case 'getDashboardStats':
      return DocumentService_getDashboardStats();
    
    default:
      return { success: false, error: 'Unknown action: ' + action };
  }
}

/**
 * Handle POST requests
 */
function DocumentService_handleAPIPost(action, data) {
  
  switch (action) {
    
    case 'createProject':
      return DocumentService_createProject(data);
    
    case 'addItem':
      return DocumentService_addItem(data);
    
    case 'deleteItem':
      return DocumentService_deleteItem(data);
    
    default:
      return { success: false, error: 'Unknown action: ' + action };
  }
}

// ============================================================
// PROJECT FUNCTIONS
// ============================================================

/**
 * Get all projects with stats
 */
function DocumentService_getProjects() {
  
  try {
    var projects = fetchAllProjects();
    
    if (!projects) {
      return { success: true, data: [] };
    }
    
    // Enrich with item counts
    var enriched = [];
    for (var i = 0; i < projects.length; i++) {
      var p = projects[i];
      var totalItems = getProjectItemCount(p.projectId);
      var surveyDone = getProjectSurveyCount(p.projectId);
      
      enriched.push({
        projectId: p.projectId,
        namaProject: p.namaProject,
        unit: p.unit,
        status: p.status || 'Active',
        createdAt: p.createdAt,
        totalItems: totalItems,
        surveyDone: surveyDone
      });
    }
    
    return { success: true, data: enriched };
    
  } catch (err) {
    return { success: false, error: 'Failed to get projects: ' + err.message };
  }
}

/**
 * Get single project with items
 */
function DocumentService_getProjectDetail(projectId) {
  
  if (!projectId) {
    return { success: false, error: 'Project ID is required' };
  }
  
  try {
    var project = fetchProjectById(projectId);
    
    if (!project) {
      return { success: false, error: 'Project not found' };
    }
    
    var items = fetchProjectItems(projectId);
    var totalItems = items ? items.length : 0;
    var surveyDone = 0;
    
    if (items) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].status === 'Survey Done' || items[i].status === 'Selesai') {
          surveyDone++;
        }
      }
    }
    
    return {
      success: true,
      data: {
        projectId: project.projectId,
        namaProject: project.namaProject,
        unit: project.unit,
        status: project.status || 'Active',
        createdAt: project.createdAt,
        totalItems: totalItems,
        surveyDone: surveyDone,
        items: items || []
      }
    };
    
  } catch (err) {
    return { success: false, error: 'Failed to get project: ' + err.message };
  }
}

/**
 * Create new project
 */
function DocumentService_createProject(data) {
  
  if (!data) {
    return { success: false, error: 'Data is required' };
  }
  
  if (!data.namaProject || String(data.namaProject).trim() === '') {
    return { success: false, error: 'Nama project is required' };
  }
  
  if (!data.unit || String(data.unit).trim() === '') {
    return { success: false, error: 'Unit is required' };
  }
  
  try {
    var projectId = _generateProjectId();
    
    var project = {
      projectId: projectId,
      namaProject: String(data.namaProject).trim(),
      unit: String(data.unit).trim(),
      status: 'Active',
      createdAt: new Date().toISOString()
    };
    
    var inserted = insertProject(project);
    
    if (!inserted) {
      return { success: false, error: 'Failed to insert project' };
    }
    
    // Log audit
    insertAuditLog({
      timestamp: new Date().toISOString(),
      action: 'CREATE_PROJECT',
      user: _getUserEmail(),
      details: 'Created project: ' + projectId
    });
    
    return { success: true, data: project };
    
  } catch (err) {
    return { success: false, error: 'Failed to create project: ' + err.message };
  }
}

/**
 * Get dashboard stats
 */
function DocumentService_getDashboardStats() {
  
  try {
    var projects = fetchAllProjects();
    var totalProjects = projects ? projects.length : 0;
    var totalItems = 0;
    var surveyDone = 0;
    
    if (projects) {
      for (var i = 0; i < projects.length; i++) {
        totalItems += getProjectItemCount(projects[i].projectId);
        surveyDone += getProjectSurveyCount(projects[i].projectId);
      }
    }
    
    return {
      success: true,
      data: {
        totalProjects: totalProjects,
        totalItems: totalItems,
        surveyDone: surveyDone
      }
    };
    
  } catch (err) {
    return { success: false, error: 'Failed to get stats: ' + err.message };
  }
}

// ============================================================
// ITEM FUNCTIONS
// ============================================================

/**
 * Add item to project
 */
function DocumentService_addItem(data) {
  
  if (!data) {
    return { success: false, error: 'Data is required' };
  }
  
  if (!data.projectId) {
    return { success: false, error: 'Project ID is required' };
  }
  
  if (!data.namaBarang || String(data.namaBarang).trim() === '') {
    return { success: false, error: 'Nama barang is required' };
  }
  
  if (!data.volume || isNaN(data.volume) || Number(data.volume) <= 0) {
    return { success: false, error: 'Volume must be greater than 0' };
  }
  
  if (!data.satuan || String(data.satuan).trim() === '') {
    return { success: false, error: 'Satuan is required' };
  }
  
  try {
    // Verify project exists
    var project = fetchProjectById(data.projectId);
    if (!project) {
      return { success: false, error: 'Project not found' };
    }
    
    var itemId = _generateItemId(data.projectId);
    
    var item = {
      itemId: itemId,
      projectId: data.projectId,
      namaBarang: String(data.namaBarang).trim(),
      volume: Number(data.volume),
      satuan: String(data.satuan).trim(),
      hps: data.hps ? Number(data.hps) : 0,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    
    var inserted = insertItem(item);
    
    if (!inserted) {
      return { success: false, error: 'Failed to insert item' };
    }
    
    // Log audit
    insertAuditLog({
      timestamp: new Date().toISOString(),
      action: 'ADD_ITEM',
      user: _getUserEmail(),
      details: 'Added item ' + itemId + ' to project ' + data.projectId
    });
    
    return { success: true, data: item };
    
  } catch (err) {
    return { success: false, error: 'Failed to add item: ' + err.message };
  }
}

/**
 * Delete item from project
 */
function DocumentService_deleteItem(data) {
  
  if (!data) {
    return { success: false, error: 'Data is required' };
  }
  
  if (!data.projectId) {
    return { success: false, error: 'Project ID is required' };
  }
  
  if (!data.itemId) {
    return { success: false, error: 'Item ID is required' };
  }
  
  try {
    var deleted = deleteItem(data.itemId);
    
    if (!deleted) {
      return { success: false, error: 'Failed to delete item or item not found' };
    }
    
    // Log audit
    insertAuditLog({
      timestamp: new Date().toISOString(),
      action: 'DELETE_ITEM',
      user: _getUserEmail(),
      details: 'Deleted item ' + data.itemId + ' from project ' + data.projectId
    });
    
    return { success: true, data: { itemId: data.itemId } };
    
  } catch (err) {
    return { success: false, error: 'Failed to delete item: ' + err.message };
  }
}

// ============================================================
// PRIVATE HELPERS
// ============================================================

function _generateProjectId() {
  var date = new Date();
  var y = date.getFullYear();
  var m = String(date.getMonth() + 1).padStart(2, '0');
  var d = String(date.getDate()).padStart(2, '0');
  var rand = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return 'PRJ-' + y + m + d + '-' + rand;
}

function _generateItemId(projectId) {
  var count = getProjectItemCount(projectId) + 1;
  return projectId + '-ITM-' + String(count).padStart(3, '0');
}

function _getUserEmail() {
  try {
    return Session.getActiveUser().getEmail() || 'anonymous';
  } catch (e) {
    return 'anonymous';
  }
}
