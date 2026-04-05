// Elements
const viewList = document.getElementById("view-list");
const viewForm = document.getElementById("view-form");
const viewDetails = document.getElementById("view-details");
const creditList = document.getElementById("credit-list");
const detailsContainer = document.getElementById("details-container");
const creditForm = document.getElementById("credit-form");
const projectSelect = document.getElementById("project_id");
const btnAddNew = document.getElementById("btn-add-new");
const btnBackForm = document.getElementById("btn-back-form");
const btnBackDetails = document.getElementById("btn-back-details");

const deleteModal = document.getElementById("delete-modal");
const btnCancelDelete = document.getElementById("btn-cancel-delete");
const btnConfirmDelete = document.getElementById("btn-confirm-delete");

let credits = [];
let selectedCreditId = null;

// Helper: Show a view
function showView(view) {
  [viewList, viewForm, viewDetails].forEach((v) =>
    v.classList.remove("active"),
  );
  view.classList.add("active");
}

// Fetch projects for dropdown
async function loadProjects() {
  try {
    const res = await fetch("/api/project/dropdown");
    const data = await res.json();
    projectSelect.innerHTML = "";
    data.forEach((p) => {
      const option = document.createElement("option");
      option.value = p.project_id;
      option.textContent = p.project_name;
      projectSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error loading projects", err);
  }
}

// Render credits list in card format
function renderCredits() {
  creditList.innerHTML = "";
  credits.forEach((c) => {
    const card = document.createElement("div");
    card.className = "credit-card";
    const date = new Date(c.date);

    const result = `${date.getFullYear()}, ${date.toLocaleString("en-US", { month: "long" })} ${String(date.getDate()).padStart(2, "0")},${date.toLocaleString("en-US", { weekday: "long" })}`;
    card.innerHTML = `
      <div class="credit-card-header">
        <div class="credit-title">₹ ${c.credit_amount}</div>
        <div class="card-actions">
          <button class="btn btn-icon btn-view" data-id="${c.credit_id}"><i class="fa-solid fa-eye"></i></button>
          <button class="btn btn-icon btn-edit" data-id="${c.credit_id}"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-icon btn-delete" data-id="${c.credit_id}"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
      <div class="credit-details-grid">
        <div class="detail-item">
          <div class="detail-label">Pay By</div>
          <div class="detail-value">${c.pay_by || "nill"}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Project</div>
          <div class="detail-value">${c.project_name}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Date & Time</div>
          <div class="detail-value">${result}</div>
        </div>
      </div>
    `;
    creditList.appendChild(card);
  });
}

// Load credits from API
async function loadCredits() {
  try {
    const res = await fetch("/api/credit");
    credits = await res.json();
    renderCredits();
  } catch (err) {
    console.error("Error loading credits", err);
  }
}

// Set default date to today
function setDefaultDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  document.getElementById("credit_date").value = `${yyyy}-${mm}-${dd}`;
}

// Handle form submit (create/edit)
creditForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("credit_id").value;
  const credit_amount = document.getElementById("credit_amount").value;
  let pay_by = document.getElementById("pay_by").value;
  const project_id = document.getElementById("project_id").value;
  const date = document.getElementById("credit_date").value;
  const time = document.getElementById("credit_time").value;

  // Pay_by can be null
  if (!pay_by || pay_by.trim() === "") pay_by = "nill";

  // Combine date and optional time
  let date_time = date;
  if (time && time.trim() !== "") {
    date_time = `${date}T${time}`;
  }

  const payload = { credit_amount, pay_by, project_id, date: date_time };

  try {
    if (id) {
      // Edit
      const res = await fetch(`/api/credit/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const updated = await res.json();
      const index = credits.findIndex((c) => c.id == id);
      credits[index] = updated;
    } else {
      // Create
      const res = await fetch("/api/credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const newCredit = await res.json();
      credits.push(newCredit);
    }

    renderCredits();
    showView(viewList);
    creditForm.reset();
    setDefaultDate(); // Reset default date
    selectedCreditId = null;
  } catch (err) {
    console.error("Error saving credit", err);
  }
});

// Show credit details
function viewCredit(id) {
  const c = credits.find((cr) => cr.id == id);
  if (!c) return;
  detailsContainer.innerHTML = `
    <div class="credit-card">
      <div class="credit-title">₹ ${c.credit_amount}</div>
      <div class="credit-details-grid">
        <div class="detail-item">
          <div class="detail-label">Pay By</div>
          <div class="detail-value">${c.pay_by || "nill"}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Project</div>
          <div class="detail-value">${c.project_name}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Date & Time</div>
          <div class="detail-value">${c.date}</div>
        </div>
      </div>
    </div>
  `;
  showView(viewDetails);
}

// Edit credit
function editCredit(id) {
  const c = credits.find((cr) => cr.id == id);
  if (!c) return;

  document.getElementById("credit_id").value = c.id;
  document.getElementById("credit_amount").value = c.credit_amount;
  document.getElementById("pay_by").value = c.pay_by === "nill" ? "" : c.pay_by;
  document.getElementById("project_id").value = c.project_id;

  const dt = new Date(c.date_time);
  document.getElementById("credit_date").value = dt.toISOString().slice(0, 10);
  if (c.date_time.includes("T")) {
    document.getElementById("credit_time").value = dt
      .toTimeString()
      .slice(0, 5);
  } else {
    document.getElementById("credit_time").value = "";
  }

  showView(viewForm);
}

// Delete credit
function deleteCredit(id) {
  selectedCreditId = id;
  deleteModal.classList.add("show");
}

// Confirm delete
btnConfirmDelete.addEventListener("click", async () => {
  if (!selectedCreditId) return;
  try {
    await fetch(`/api/credit/${selectedCreditId}`, { method: "DELETE" });
    credits = credits.filter((c) => c.id != selectedCreditId);
    renderCredits();
    deleteModal.classList.remove("show");
    selectedCreditId = null;
  } catch (err) {
    console.error("Error deleting credit", err);
  }
});

// Cancel delete
btnCancelDelete.addEventListener("click", () => {
  selectedCreditId = null;
  deleteModal.classList.remove("show");
});

// Event delegation for card buttons
creditList.addEventListener("click", (e) => {
  const id = e.target.closest("button")?.dataset.id;
  if (!id) return;
  if (e.target.closest(".btn-view")) viewCredit(id);
  if (e.target.closest(".btn-edit")) editCredit(id);
  if (e.target.closest(".btn-delete")) deleteCredit(id);
});

// Button events
btnAddNew.addEventListener("click", () => {
  creditForm.reset();
  document.getElementById("credit_id").value = "";
  setDefaultDate();
  showView(viewForm);
});

btnBackForm.addEventListener("click", () => showView(viewList));
btnBackDetails.addEventListener("click", () => showView(viewList));

// Initialize
window.addEventListener("DOMContentLoaded", async () => {
  await loadProjects();
  await loadCredits();
  setDefaultDate();
});
