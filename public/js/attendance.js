// public/js/attendance.js

document.addEventListener("DOMContentLoaded", () => {
  // ─── DOM Elements ─────────────────────────────────────────
  const viewList = document.getElementById("view-list");
  const viewForm = document.getElementById("view-form");
  const viewDetails = document.getElementById("view-details");

  const attendanceListEl = document.getElementById("attendance-list");
  const detailsContainer = document.getElementById("details-container");

  const btnAddNew = document.getElementById("btn-add-new");
  const btnBackForm = document.getElementById("btn-back-form");
  const btnBackDetails = document.getElementById("btn-back-details");

  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const pageInfo = document.getElementById("page-info");

  const deleteModal = document.getElementById("delete-modal");
  const btnCancelDelete = document.getElementById("btn-cancel-delete");
  const btnConfirmDelete = document.getElementById("btn-confirm-delete");

  // Form elements
  const form = document.getElementById("attendance-form");
  const dateInput = document.getElementById("attendance_date");
  const projectSelect = document.getElementById("project_select");
  const employeeSelect = document.getElementById("employee_select");
  const btnAddEmployee = document.getElementById("btn-add-employee");
  const employeeList = document.getElementById("employee-attendance-list");
  const emptyState = document.getElementById("empty-state");

  // ─── State ────────────────────────────────────────────────
  let attendances = [];
  let projects = [];
  let employees = [];
  let selectedEmployees = new Map();
  let currentPage = 1;
  const itemsPerPage = 5;
  let recordToDelete = null;

  // ─── Init ─────────────────────────────────────────────────
  async function init() {
    await fetchAttendances();
    await fetchProjects();
    await fetchEmployees();
  }

  // ─── API Calls ────────────────────────────────────────────

  async function fetchAttendances() {
    try {
      const res = await fetch("/api/attendance");
      if (res.ok) {
        attendances = await res.json();
        currentPage = 1;
        renderList();
      }
    } catch (e) {
      console.error("Failed to load attendances", e);
    }
  }

  async function fetchProjects() {
    try {
      const res = await fetch("/api/project/dropdown");
      if (res.ok) {
        projects = await res.json();
        populateProjectDropdown();
      }
    } catch (e) {
      console.error("Failed to load projects", e);
      projectSelect.innerHTML =
        '<option value="">Error loading projects</option>';
    }
  }

  async function fetchEmployees() {
    try {
      const res = await fetch("http://localhost:3000/api/employee/dropdown");
      const data = await res.json();
      employees = data.map((e) => ({
        id: e.employee_id,
        name: e.employee_name,
      }));
      populateEmployeeDropdown();
    } catch (e) {
      console.error("Failed to load employees", e);
      employeeSelect.innerHTML =
        '<option value="">Error loading employees</option>';
    }
  }

  // ─── List Rendering ───────────────────────────────────────

  function renderList() {
    attendanceListEl.innerHTML = "";

    const totalPages = Math.ceil(attendances.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;

    const start = (currentPage - 1) * itemsPerPage;
    const paged = attendances.slice(start, start + itemsPerPage);

    if (paged.length === 0) {
      attendanceListEl.innerHTML = `
        <div style="text-align:center; padding: 3rem 1rem; color: var(--text-secondary)">
          <i class="fa-solid fa-clipboard-user" style="font-size:3rem; margin-bottom:1rem; opacity:0.5"></i><br>
          No attendance records yet. Tap the + button to mark attendance.
        </div>`;
      btnPrev.disabled = true;
      btnNext.disabled = true;
      pageInfo.textContent = "Page 0 of 0";
      return;
    }

    paged.forEach((record) => {
      let empCount = 0;
      try {
        
      } catch {}

      const card = document.createElement("div");
      card.className = "attendance-record-card";
      card.innerHTML = `
        <div class="project-card-header">
          <div>
            <div class="project-title">
              <i class="fa-solid fa-folder-open" style="color:var(--primary); margin-right:6px; font-size:0.95em"></i>
              ${escapeHTML(record.project_name || "Unknown Project")}
            </div>
            <div class="text-muted" style="font-size: 0.875rem; margin-top: 4px">
              <i class="fa-regular fa-calendar"></i> ${formatDate(record.date)}
            </div>
          </div>
          <span class="attendance-emp-badge">
            <i class="fa-solid fa-users"></i> ${record.employee_count} emp${record.employee_count !== 1 ? "s" : ""}
          </span>
        </div>
        <div class="card-actions" style="justify-content: flex-end; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem; margin-top: 0.5rem;">
          <button class="btn btn-outline" onclick="viewAttendance(${record.attendance_id})">
            <i class="fa-solid fa-eye"></i> View
          </button>
          <button class="btn btn-danger" onclick="promptDeleteAttendance(${record.attendance_id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `;
      attendanceListEl.appendChild(card);
    });

    btnPrev.disabled = currentPage === 1;
    btnNext.disabled = currentPage === totalPages || totalPages === 0;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  }

  // ─── Detail View ──────────────────────────────────────────

window.viewAttendance = async function (id) {
  const res = await fetch("/api/attendance/" + id);
  const record = await res.json();

  if (!record) return;

  const attDetails = record.attendance_details || [];

  const empCards = attDetails
    .map((emp) => {
      return `
        <div class="employee-card view-mode">
          <div class="employee-card-header">
            <h4>
              <i class="fa-solid fa-user" style="color: var(--primary); margin-right: 8px;"></i>
              ${escapeHTML(emp.employee_name || `Employee #${emp.employee_id}`)}
            </h4>
          </div>

          <div class="employee-card-body">
                    <div class="info-row">
          <span class="label">Full day</span>
          <span class="value">
            ${emp.is_full ? "yes" : `no - worked ${emp.work_amount}`}
          </span>
        </div>

            <div class="info-row">
              <span class="label">Extra Hours</span>
              <span class="value">${emp.extra_hours ? emp.extra_hours + "h" : "—"}</span>
            </div>

            <div class="info-row">
              <span class="label">Amount</span>
              <span class="value">${emp.amount ? "₹" + emp.amount : "—"}</span>
            </div>

            <div class="info-row">
              <span class="label">Work Reference</span>
              <span class="value">${emp.work_ref ? escapeHTML(emp.work_ref) : "—"}</span>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  detailsContainer.innerHTML = `
    <div class="details-card">
      <div class="details-header">
        <div>
          <h3 style="font-size:1.2rem; margin-bottom:4px">
            ${escapeHTML(record.project_name || "Unknown Project")}
          </h3>
          <span class="text-muted" style="font-size:0.875rem">
            <i class="fa-regular fa-calendar"></i> ${formatDate(record.date)}
          </span>
        </div>

        <span class="attendance-emp-badge">
          <i class="fa-solid fa-users"></i> 
          ${attDetails.length} employee${attDetails.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div class="employee-card-container">
        ${
          empCards ||
          '<p style="text-align:center; color:var(--text-secondary)">No employee data</p>'
        }
      </div>
    </div>
  `;

  showSection("view-details");
};

  // ─── Delete ───────────────────────────────────────────────

  window.promptDeleteAttendance = function (id) {
    recordToDelete = id;
    deleteModal.classList.add("show");
  };

  btnCancelDelete.addEventListener("click", () => {
    deleteModal.classList.remove("show");
    recordToDelete = null;
  });

  btnConfirmDelete.addEventListener("click", async () => {
    if (!recordToDelete) return;
    try {
      const res = await fetch(`/api/attendance/${recordToDelete}`, {
        method: "DELETE",
      });
      if (res.ok) {
        deleteModal.classList.remove("show");
        recordToDelete = null;
        await fetchAttendances();
      } else {
        const err = await res.json();
        alert("Error deleting: " + (err.error || "Unknown error"));
      }
    } catch (e) {
      alert("Network error deleting record");
    }
  });

  // ─── Pagination ───────────────────────────────────────────

  btnPrev.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderList();
      window.scrollTo(0, 0);
    }
  });
  btnNext.addEventListener("click", () => {
    const total = Math.ceil(attendances.length / itemsPerPage);
    if (currentPage < total) {
      currentPage++;
      renderList();
      window.scrollTo(0, 0);
    }
  });

  // ─── Navigation ───────────────────────────────────────────

  function showSection(id) {
    document
      .querySelectorAll(".view-section")
      .forEach((el) => el.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    window.scrollTo(0, 0);
  }

  btnAddNew.addEventListener("click", () => {
    resetForm();
    showSection("view-form");
  });

  btnBackForm.addEventListener("click", () => showSection("view-list"));
  btnBackDetails.addEventListener("click", () => showSection("view-list"));

  // ─── Form Dropdowns ───────────────────────────────────────

  function populateProjectDropdown() {
    projectSelect.innerHTML =
      '<option value="" disabled selected>Select a project</option>';
    projects.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.project_id;
      opt.textContent = p.project_name;
      projectSelect.appendChild(opt);
    });
  }

  function populateEmployeeDropdown() {
    employeeSelect.innerHTML =
      '<option value="" disabled selected>Select an employee</option>';
    employees.forEach((emp) => {
      if (!selectedEmployees.has(emp.id.toString())) {
        const opt = document.createElement("option");
        opt.value = emp.id;
        opt.textContent = emp.name;
        employeeSelect.appendChild(opt);
      }
    });
    if (employeeSelect.options.length === 1) {
      employeeSelect.options[0].textContent = "No more available employees";
    }
  }

  // ─── Employee Cards ───────────────────────────────────────

  btnAddEmployee.addEventListener("click", () => {
    const empId = employeeSelect.value;
    if (!empId) return;
    const empData = employees.find((e) => e.id.toString() === empId);
    if (empData) {
      addEmployeeCard(empData);
      populateEmployeeDropdown();
    }
  });

function addEmployeeCard(empData) {
  if (emptyState) emptyState.style.display = "none";
  selectedEmployees.set(empData.id.toString(), empData);

  const card = document.createElement("div");
  card.className = "employee-card";
  card.id = `emp-card-${empData.id}`;
  card.dataset.id = empData.id;

  card.innerHTML = `
    <div class="employee-card-header">
      <h4><i class="fa-solid fa-user" style="color: var(--primary); margin-right: 8px;"></i>${empData.name}</h4>
      <button type="button" class="btn-remove" data-id="${empData.id}" title="Remove">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div class="employee-card-body">
      <div class="form-group">
        <label>Full Day?</label>
        <input type="checkbox" class="emp-is-full" checked>
      </div>
      <div class="form-group work-amount-group" style="display:none;">
        <label>Work Amount</label>
        <input type="number" class="form-control emp-work-amount" min="0" value="0">
      </div>
      
      <div class="form-group">
        <label>Extra Work (Hours)</label>
        <input type="number" class="form-control emp-extra-hours" step="0.5" min="0" value="0">
      </div>
      <div class="form-group">
        <label>Extra Amount (₹)</label>
        <input type="number" class="form-control emp-extra-amount" step="10" min="0" value="0">
      </div>
      <div class="form-group">
        <label>Work Reference</label>
        <textarea class="form-control emp-work-reference" rows="2"></textarea>
      </div>
    </div>
  `;

  // Remove button
  card.querySelector(".btn-remove").addEventListener("click", () => removeEmployeeCard(empData.id));

  // Toggle is_full logic
  const isFullToggle = card.querySelector(".emp-is-full");
  const workAmountGroup = card.querySelector(".work-amount-group");
  isFullToggle.addEventListener("change", () => {
    if (isFullToggle.checked) {
      workAmountGroup.style.display = "none";
    } else {
      workAmountGroup.style.display = "block";
    }
  });

  employeeList.appendChild(card);
}

  function removeEmployeeCard(employeeId) {
    const card = document.getElementById(`emp-card-${employeeId}`);
    if (card) card.remove();
    selectedEmployees.delete(employeeId.toString());
    populateEmployeeDropdown();
    if (selectedEmployees.size === 0 && emptyState)
      emptyState.style.display = "block";
  }

  function todayISO() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function resetForm() {
    form.reset();
    dateInput.value = todayISO();
    const keys = Array.from(selectedEmployees.keys());
    keys.forEach((k) => removeEmployeeCard(k));
    selectedEmployees.clear();
    if (emptyState) emptyState.style.display = "block";
    populateEmployeeDropdown();
  }

  // ─── Form Submit ──────────────────────────────────────────

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  const [year, month, day] = data.attendance_date.split("-");
  const formattedDate = `${year}/${month}/${day}`;
  const projectId = projectSelect.value;
  const date = formattedDate;

  if (!projectId || !date) {
    alert("Please select a valid date and project.");
    return;
  }
  if (selectedEmployees.size === 0) {
    alert("Please add at least one employee.");
    return;
  }

  const attendanceDetails = [];

  document.querySelectorAll(".employee-card").forEach((card) => {
    const id = parseInt(card.dataset.id);
    const empData = selectedEmployees.get(card.dataset.id);
    const empName = empData ? empData.name : `Employee #${id}`;

    const extraHours =
      parseFloat(card.querySelector(".emp-extra-hours").value) || 0;
    const extraAmount =
      parseFloat(card.querySelector(".emp-extra-amount").value) || 0;
    const workRef = card.querySelector(".emp-work-reference").value;

    // NEW: is_full toggle
    const isFull = card.querySelector(".emp-is-full").checked ? 1 : 0;
    // NEW: work_amount only if is_full = 0
    const workAmountInput = card.querySelector(".emp-work-amount");
    const workAmount = isFull === 0 && workAmountInput
      ? parseFloat(workAmountInput.value) || 0
      : null;

    attendanceDetails.push({
      employee_id: id,
      employee_name: empName,
      is_full: isFull,
      work_amount: workAmount,
      extra_hours: extraHours,
      amount: extraAmount,
      work_ref: workRef
    });
  });

  const payload = {
    project_id: parseInt(projectId),
    date: date,
    attendance_details: attendanceDetails,
  };

  console.log("payload", payload);

  try {
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to submit");

    await fetchAttendances();
    resetForm();
    showSection("view-list");
  } catch (err) {
    console.error(err);
    alert("An error occurred while submitting attendance.");
  }
});
  // ─── Utilities ────────────────────────────────────────────

  function formatDate(dateStr) {
    if (!dateStr) return "—";

    // Split the input "DD/MM/YYYY"
    const [year , month, day] = dateStr.split("/").map(Number);

    // Month is 0-indexed in JavaScript Date
    const d = new Date(year, month - 1, day);

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const escapeHTML = (str) => {
    if (!str) return "";
    return str.toString().replace(
      /[&<>'"]/g,
      (tag) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[tag],
    );
  };

  init();
});
