document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const viewList = document.getElementById('view-list');
  const viewForm = document.getElementById('view-form');
  const viewDetails = document.getElementById('view-details');
  const employeeListEl = document.getElementById('employee-list');
  
  const btnAddNew = document.getElementById('btn-add-new');
  const btnBackForm = document.getElementById('btn-back-form');
  const btnBackDetails = document.getElementById('btn-back-details');
  const employeeForm = document.getElementById('employee-form');
  const formTitle = document.getElementById('form-title');
  
  const employeeTypeSelect = document.getElementById('employee_type');
  const deleteModal = document.getElementById('delete-modal');
  const btnCancelDelete = document.getElementById('btn-cancel-delete');
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');

  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const pageInfo = document.getElementById('page-info');

  // State
  let employees = [];
  let employeeTypes = [];
  let currentPage = 1;
  const itemsPerPage = 6; 
  let employeeToDelete = null;

  // Initialization
  async function init() {
    await fetchEmployeeTypes();
    await fetchEmployees();
  }

  // --- API Calls ---

  async function fetchEmployeeTypes() {
    try {
      const res = await fetch('/api/employee/get-employee-type');
      if (res.ok) {
        employeeTypes = await res.json();
        // Populate select
        employeeTypeSelect.innerHTML = '<option value="" disabled selected>Select Employee Role</option>';
        employeeTypes.forEach(type => {
          const opt = document.createElement('option');
          opt.value = type.code;
          opt.textContent = type.value;
          employeeTypeSelect.appendChild(opt);
        });
      }
    } catch (e) {
      console.error('Failed to load employee types', e);
    }
  }

  async function fetchEmployees() {
    try {
      const res = await fetch('/api/employee');
      if (res.ok) {
        employees = await res.json();
        employees.sort((a,b) => b.employee_id - a.employee_id); // latest first
        currentPage = 1;
        renderList();
      }
    } catch (e) {
      console.error('Failed to load employees', e);
    }
  }

  // --- UI Rendering ---

  function renderList() {
    employeeListEl.innerHTML = '';
    
    // Client-side pagination logic
    const totalPages = Math.ceil(employees.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedEmployees = employees.slice(start, end);

    if (paginatedEmployees.length === 0) {
      employeeListEl.innerHTML = '<div style="text-align:center; padding: 3rem 1rem; color: var(--text-secondary)"><i class="fa-solid fa-users-slash" style="font-size:3rem; margin-bottom:1rem; opacity:0.5"></i><br>No employees found. Tap the + button to add someone.</div>';
      
      btnPrev.disabled = true;
      btnNext.disabled = true;
      pageInfo.textContent = `Page 0 of 0`;
      return;
    }

    paginatedEmployees.forEach(emp => {
      const typeObj = employeeTypes.find(w => w.code == emp.employee_type);
      const typeText = typeObj ? typeObj.value : 'Unknown';
      const statusText = emp.status == 1 ? 'Active' : 'Inactive';
      const statusClass = emp.status == 1 ? '' : 'inactive';

      const card = document.createElement('div');
      card.className = 'employee-card';
      card.innerHTML = `
        <div class="employee-card-header">
          <div>
            <div class="employee-title"><i class="fa-regular fa-user" style="color:var(--text-secondary); margin-right:5px"></i> ${escapeHTML(emp.employee_name)}</div>
            <div class="text-muted" style="font-size: 0.875rem"><i class="fa-solid fa-phone"></i> ${escapeHTML(emp.contact_number || 'N/A')}</div>
          </div>
          <span class="employee-badge ${statusClass}">${statusText}</span>
        </div>
        
        <div class="employee-details-grid">
          <div class="detail-item">
            <span class="detail-label">Role</span>
            <span class="detail-value">${typeText}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Salary</span>
            <span class="detail-value" style="color:var(--accent)">₹${emp.salary.toLocaleString()}</span>
          </div>
        </div>

        <div class="card-actions" style="margin-top: 0.5rem; justify-content: flex-end; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem;">
          <button class="btn btn-outline" onclick="viewEmployee(${emp.employee_id})"><i class="fa-solid fa-eye"></i> View</button>
          <button class="btn btn-outline" onclick="editEmployee(${emp.employee_id})"><i class="fa-solid fa-pen"></i> Edit</button>
          <button class="btn btn-danger" onclick="promptDeleteEmployee(${emp.employee_id})"><i class="fa-solid fa-trash"></i></button>
        </div>
      `;
      employeeListEl.appendChild(card);
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
    formTitle.textContent = "Add Employee";
    employeeForm.reset();
    document.getElementById('employee_id').value = '';
    // Hide status for creating
    document.getElementById('status-group').style.display = 'none';
    document.getElementById('status').required = false;
    document.getElementById('status').value = '1';
    showSection('view-form');
  });

  btnBackForm.addEventListener('click', () => showSection('view-list'));
  btnBackDetails.addEventListener('click', () => showSection('view-list'));

  // Form submission
  employeeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Gather logic
    const id = document.getElementById('employee_id').value;
    const isEdit = id !== '';
    
    const payload = {
      employee_name: document.getElementById('employee_name').value,
      contact_number: document.getElementById('contact_number').value || null,
      employee_type: parseInt(document.getElementById('employee_type').value),
      salary: parseInt(document.getElementById('salary').value),
      status: parseInt(document.getElementById('status').value)
    };

    try {
      const url = isEdit ? `/api/employee/${id}` : '/api/employee';
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if(res.ok) {
        await fetchEmployees();
        showSection('view-list');
      } else {
        const error = await res.json();
        alert('Error saving: ' + (error.error || 'Unknown error'));
      }
    } catch(err) {
      alert('Network error saving employee');
    }
  });

  // Expose methods directly onto window since they are called from onclick inline
  window.viewEmployee = function(id) {
    const emp = employees.find(p => p.employee_id === id);
    if (!emp) return;
    
    const typeObj = employeeTypes.find(w => w.code == emp.employee_type);
    const typeText = typeObj ? typeObj.value : 'Unknown';
    const statusText = emp.status == 1 ? 'Active' : 'Inactive';
    
    document.getElementById('details-container').innerHTML = `
      <div class="details-card">
        <div class="details-header">
          <h3 style="font-size: 1.3rem;">${escapeHTML(emp.employee_name)}</h3>
          <span class="employee-badge ${emp.status == 1 ? '' : 'inactive'}">${statusText}</span>
        </div>
        
        <div class="details-row">
          <span class="detail-label">Contact</span>
          <span class="detail-value">${escapeHTML(emp.contact_number || '-')}</span>
        </div>
        <div class="details-row">
          <span class="detail-label">Role</span>
          <span class="detail-value">${typeText}</span>
        </div>
        <div class="details-row">
          <span class="detail-label">Daily Salary</span>
          <span class="detail-value" style="color:var(--accent); font-size:1.1rem">₹${emp.salary.toLocaleString()}</span>
        </div>
        <div class="details-row">
          <span class="detail-label">Joined On</span>
          <span class="detail-value" style="font-size: 0.9em">${new Date(emp.created_at).toLocaleString()}</span>
        </div>
        <div class="details-row">
          <span class="detail-label">Profile Updated</span>
          <span class="detail-value" style="font-size: 0.9em">${emp.updated_at ? new Date(emp.updated_at).toLocaleString() : '-'}</span>
        </div>
      </div>
    `;
    
    showSection('view-details');
  };

  window.editEmployee = function(id) {
    const emp = employees.find(p => p.employee_id === id);
    if (!emp) return;

    formTitle.textContent = "Edit Employee";
    document.getElementById('status-group').style.display = 'block';
    document.getElementById('status').required = true;
    
    document.getElementById('employee_id').value = emp.employee_id;
    document.getElementById('employee_name').value = emp.employee_name;
    document.getElementById('contact_number').value = emp.contact_number || '';
    document.getElementById('employee_type').value = emp.employee_type;
    document.getElementById('salary').value = emp.salary;
    document.getElementById('status').value = emp.status;

    showSection('view-form');
  };

  window.promptDeleteEmployee = function(id) {
    employeeToDelete = id;
    deleteModal.classList.add('show');
  };

  btnCancelDelete.addEventListener('click', () => {
    deleteModal.classList.remove('show');
    employeeToDelete = null;
  });

  btnConfirmDelete.addEventListener('click', async () => {
    if(!employeeToDelete) return;

    try {
      const res = await fetch(`/api/employee/${employeeToDelete}`, { method: 'DELETE' });
      if(res.ok) {
        deleteModal.classList.remove('show');
        await fetchEmployees();
      } else {
        const error = await res.json();
        alert('Error deleting: ' + (error.error || 'Unknown error'));
      }
    } catch(err) {
      alert('Network error deleting employee');
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
    const totalPages = Math.ceil(employees.length / itemsPerPage);
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
