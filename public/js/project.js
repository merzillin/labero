document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const viewList = document.getElementById('view-list');
  const viewForm = document.getElementById('view-form');
  const viewDetails = document.getElementById('view-details');
  const projectListEl = document.getElementById('project-list');
  
  const btnAddNew = document.getElementById('btn-add-new');
  const btnBackForm = document.getElementById('btn-back-form');
  const btnBackDetails = document.getElementById('btn-back-details');
  const projectForm = document.getElementById('project-form');
  const formTitle = document.getElementById('form-title');
  
  const typeOfWorkSelect = document.getElementById('type_of_work');
  const deleteModal = document.getElementById('delete-modal');
  const btnCancelDelete = document.getElementById('btn-cancel-delete');
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');

  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const pageInfo = document.getElementById('page-info');

  // State
  let projects = [];
  let workTypes = [];
  let currentPage = 1;
  const itemsPerPage = 5; // Good size for mobile pagination
  let projectToDelete = null;

  // Initialization
  async function init() {
    await fetchWorkTypes();
    await fetchProjects();
  }

  // --- API Calls ---

  async function fetchWorkTypes() {
    try {
      const res = await fetch('/api/project/get-work-type');
      if (res.ok) {
        workTypes = await res.json();
        // Populate select
        typeOfWorkSelect.innerHTML = '<option value="" disabled selected>Select Work Type</option>';
        workTypes.forEach(type => {
          const opt = document.createElement('option');
          opt.value = type.code;
          opt.textContent = type.value;
          typeOfWorkSelect.appendChild(opt);
        });
      }
    } catch (e) {
      console.error('Failed to load work types', e);
    }
  }

  async function fetchProjects() {
    try {
      const res = await fetch('/api/project');
      if (res.ok) {
        projects = await res.json();
        projects.sort((a,b) => b.project_id - a.project_id); // latest first
        currentPage = 1;
        renderList();
      }
    } catch (e) {
      console.error('Failed to load projects', e);
    }
  }

  // --- UI Rendering ---

  function renderList() {
    projectListEl.innerHTML = '';
    
    // Client-side pagination logic
    const totalPages = Math.ceil(projects.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedProjects = projects.slice(start, end);

    if (paginatedProjects.length === 0) {
      projectListEl.innerHTML = '<div style="text-align:center; padding: 3rem 1rem; color: var(--text-secondary)"><i class="fa-solid fa-folder-open" style="font-size:3rem; margin-bottom:1rem; opacity:0.5"></i><br>No projects found. Tap the + button to add your first project.</div>';
      
      btnPrev.disabled = true;
      btnNext.disabled = true;
      pageInfo.textContent = `Page 0 of 0`;
      return;
    }

    paginatedProjects.forEach(proj => {
      const workTypeObj = workTypes.find(w => w.code == proj.type_of_work);
      const workTypeText = workTypeObj ? workTypeObj.value : 'Unknown';
      const statusText = proj.status == 1 ? 'Active' : 'Completed';
      const statusClass = proj.status == 1 ? '' : 'inactive';

      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <div class="project-card-header">
          <div>
            <div class="project-title">${escapeHTML(proj.project_name)}</div>
            <div class="text-muted" style="font-size: 0.875rem"><i class="fa-solid fa-map-location-dot"></i> ${escapeHTML(proj.address)}</div>
          </div>
          <span class="project-badge ${statusClass}">${statusText}</span>
        </div>
        
        <div class="project-details-grid">
          <div class="detail-item">
            <span class="detail-label">Owner</span>
            <span class="detail-value">${escapeHTML(proj.owner_name)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Type</span>
            <span class="detail-value">${workTypeText}</span>
          </div>
        </div>

        <div class="card-actions" style="margin-top: 0.5rem; justify-content: flex-end; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem;">
          <button class="btn btn-outline" onclick="viewProject(${proj.project_id})"><i class="fa-solid fa-eye"></i> View</button>
          <button class="btn btn-outline" onclick="editProject(${proj.project_id})"><i class="fa-solid fa-pen"></i> Edit</button>
          <button class="btn btn-danger" onclick="promptDeleteProject(${proj.project_id})"><i class="fa-solid fa-trash"></i></button>
        </div>
      `;
      projectListEl.appendChild(card);
    });

    // Update Pagination controls
    btnPrev.disabled = currentPage === 1;
    btnNext.disabled = currentPage === totalPages || totalPages === 0;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  }

  // --- Navigation & View logic ---

  function showSection(sectionId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    window.scrollTo(0,0);
  }

  btnAddNew.addEventListener('click', () => {
    formTitle.textContent = "Add Project";
    projectForm.reset();
    document.getElementById('project_id').value = '';
    document.getElementById('status-group').style.display = 'none';
    document.getElementById('status').required = false;
    document.getElementById('status').value = '1';
    showSection('view-form');
  });

  btnBackForm.addEventListener('click', () => showSection('view-list'));
  btnBackDetails.addEventListener('click', () => showSection('view-list'));

  // Form submission
  projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Gather logic
    const id = document.getElementById('project_id').value;
    const isEdit = id !== '';
    
    const payload = {
      project_name: document.getElementById('project_name').value,
      owner_name: document.getElementById('owner_name').value,
      contractor_name: document.getElementById('contractor_name').value || null,
      address: document.getElementById('address').value,
      type_of_work: parseInt(document.getElementById('type_of_work').value),
      status: parseInt(document.getElementById('status').value)
    };

    try {
      const url = isEdit ? `/api/project/${id}` : '/api/project';
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if(res.ok) {
        await fetchProjects();
        showSection('view-list');
      } else {
        const error = await res.json();
        alert('Error saving: ' + (error.error || 'Unknown error'));
      }
    } catch(err) {
      alert('Network error saving project');
    }
  });

  // Expose methods directly onto window since they are called from onclick inline
  window.viewProject = function(id) {
    const proj = projects.find(p => p.project_id === id);
    if (!proj) return;
    
    const workTypeObj = workTypes.find(w => w.code == proj.type_of_work);
    const workTypeText = workTypeObj ? workTypeObj.value : 'Unknown';
    const statusText = proj.status == 1 ? 'Active' : 'Completed';
    
    document.getElementById('details-container').innerHTML = `
      <div class="details-card">
        <div class="details-header">
          <h3 style="font-size: 1.3rem;">${escapeHTML(proj.project_name)}</h3>
          <span class="project-badge ${proj.status == 1 ? '' : 'inactive'}">${statusText}</span>
        </div>
        
        <div class="details-row">
          <span class="detail-label">Owner Name</span>
          <span class="detail-value">${escapeHTML(proj.owner_name)}</span>
        </div>
        <div class="details-row">
          <span class="detail-label">Contractor Name</span>
          <span class="detail-value">${escapeHTML(proj.contractor_name || '-')}</span>
        </div>
        <div class="details-row">
          <span class="detail-label">Address</span>
          <span class="detail-value" style="text-align:right">${escapeHTML(proj.address)}</span>
        </div>
        <div class="details-row">
          <span class="detail-label">Type of Work</span>
          <span class="detail-value">${workTypeText}</span>
        </div>
        <div class="details-row">
          <span class="detail-label">Created on</span>
          <span class="detail-value" style="font-size: 0.9em">${new Date(proj.created_at).toLocaleString()}</span>
        </div>
      </div>
    `;
    
    showSection('view-details');
  };

  window.editProject = function(id) {
    const proj = projects.find(p => p.project_id === id);
    if (!proj) return;

    formTitle.textContent = "Edit Project";
    document.getElementById('status-group').style.display = 'block';
    document.getElementById('status').required = true;
    document.getElementById('project_id').value = proj.project_id;
    document.getElementById('project_name').value = proj.project_name;
    document.getElementById('owner_name').value = proj.owner_name;
    document.getElementById('contractor_name').value = proj.contractor_name || '';
    document.getElementById('address').value = proj.address;
    document.getElementById('type_of_work').value = proj.type_of_work;
    document.getElementById('status').value = proj.status;

    showSection('view-form');
  };

  window.promptDeleteProject = function(id) {
    projectToDelete = id;
    deleteModal.classList.add('show');
  };

  btnCancelDelete.addEventListener('click', () => {
    deleteModal.classList.remove('show');
    projectToDelete = null;
  });

  btnConfirmDelete.addEventListener('click', async () => {
    if(!projectToDelete) return;

    try {
      const res = await fetch(`/api/project/${projectToDelete}`, { method: 'DELETE' });
      if(res.ok) {
        deleteModal.classList.remove('show');
        await fetchProjects();
      } else {
        const error = await res.json();
        alert('Error deleting: ' + (error.error || 'Unknown error'));
      }
    } catch(err) {
      alert('Network error deleting project');
    }
  });

  // Pagination Handlers
  btnPrev.addEventListener('click', () => {
    if(currentPage > 1) {
      currentPage--;
      renderList();
      window.scrollTo(0,0);
    }
  });

  btnNext.addEventListener('click', () => {
    const totalPages = Math.ceil(projects.length / itemsPerPage);
    if(currentPage < totalPages) {
      currentPage++;
      renderList();
      window.scrollTo(0,0);
    }
  });

  // Utility
  const escapeHTML = (str) => {
    if(!str) return '';
    return str.toString().replace(/[&<>'"]/g, 
      tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag]));
  };

  init();
});
