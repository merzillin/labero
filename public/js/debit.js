const viewList = document.getElementById("view-list");
const viewForm = document.getElementById("view-form");
const viewDetails = document.getElementById("view-details");

const debitList = document.getElementById("debit-list");
const debitForm = document.getElementById("debit-form");
const detailsContainer = document.getElementById("details-container");

const deleteModal = document.getElementById("delete-modal");

let debits = [];
let selectedId = null;

/* ---------------- VIEW SWITCH ---------------- */
function showView(view) {
  [viewList, viewForm, viewDetails].forEach((v) =>
    v.classList.remove("active"),
  );
  view.classList.add("active");
}

/* ---------------- LOAD PROJECTS ---------------- */
async function loadProjects() {
  const res = await fetch("/api/project/dropdown");
  const data = await res.json();

  const select = document.getElementById("project_id");
  select.innerHTML = "";

  data.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.project_id;
    opt.textContent = p.project_name;
    select.appendChild(opt);
  });
}

/* ---------------- LOAD DEBITS ---------------- */
async function loadDebits() {
  const res = await fetch("/api/debit");
  debits = await res.json();
  renderDebits();
}

/* ---------------- RENDER ---------------- */
function renderDebits() {
  debitList.innerHTML = "";

  debits.forEach((d) => {
    const card = document.createElement("div");
    card.className = "credit-card debit-card";

    const date = new Date(d.date);

    const result = `${date.getFullYear()}, ${date.toLocaleString("en-US", { month: "long" })} ${String(date.getDate()).padStart(2, "0")},${date.toLocaleString("en-US", { weekday: "long" })}`;

    card.innerHTML = `
      <div class="credit-card-header">
        <div class="debit-amount">₹ ${d.debit_amount}</div>
        <div class="card-actions">
          <button class="btn btn-icon btn-view" data-id="${d.debit_id}"><i class="fa fa-eye"></i></button>
          <button class="btn btn-icon btn-edit" data-id="${d.debit_id}"><i class="fa fa-pen"></i></button>
          <button class="btn btn-icon btn-delete" data-id="${d.debit_id}"><i class="fa fa-trash"></i></button>
        </div>
      </div>

      <div class="credit-details-grid">
        <div class="detail-item">
          <div class="detail-label">Project</div>
          <div>${d.project_name}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Date</div>
          <div>${result}</div>
        </div>

        <div class="detail-item">
          <div class="detail-label">Name</div>
          <div>${d.name}</div>
        </div>

        <div class="detail-item">
          <div class="detail-label">Description</div>
          <div>${d.description || "-"}</div>
        </div>
      </div>
    `;

    debitList.appendChild(card);
  });
}

/* ---------------- SUBMIT ---------------- */
debitForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("debit_id").value;

  const payload = {
    debit_amount: document.getElementById("debit_amount").value,
    project_id: document.getElementById("project_id").value,
    name: document.getElementById("name").value,
    description: document.getElementById("description").value,
    date: document.getElementById("date").value,
  };

  if (id) {
    await fetch(`/api/debit/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } else {
    await fetch("/api/debit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  await loadDebits();
  showView(viewList);
  debitForm.reset();
});

/* ---------------- VIEW ---------------- */
function viewDebit(id) {
  const d = debits.find((x) => x.id == id || x.debit_id == id);
  if (!d) return;

  const dateObj = new Date(d.date);
  const formattedDate = `${dateObj.getFullYear()}, ${dateObj.toLocaleString("en-US", { month: "long" })} ${String(dateObj.getDate()).padStart(2, "0")}, ${dateObj.toLocaleString("en-US", { weekday: "long" })}`;

  detailsContainer.innerHTML = `
    <div class="credit-card debit-card">
      
      <div class="credit-card-header">
        <div class="debit-amount">₹ ${d.debit_amount}</div>
      </div>

      <div class="credit-details-grid">

        <div class="detail-item">
          <div class="detail-label">Project</div>
          <div class="detail-value">${d.project_name || "-"}</div>
        </div>
            <div class="detail-item">
          <div class="detail-label">Date</div>
          <div class="detail-value">${formattedDate}</div>
        </div>

        <div class="detail-item">
          <div class="detail-label">Name</div>
          <div class="detail-value">${d.name || "-"}</div>
        </div>
      </div>
       <div class="detail-item">
          <div class="detail-label">Description</div>
          <div class="detail-value">${d.description || "-"}</div>
        </div>
    </div>
  `;

  showView(viewDetails);
}

/* ---------------- EDIT ---------------- */
function editDebit(id) {
  const d = debits.find((x) => x.debit_id == id);

  document.getElementById("debit_id").value = d.debit_id;
  document.getElementById("debit_amount").value = d.debit_amount;
  document.getElementById("project_id").value = d.project_id;
  document.getElementById("name").value = d.name;
  document.getElementById("description").value = d.description;
  document.getElementById("date").value = d.date;

  showView(viewForm);
}

/* ---------------- DELETE ---------------- */
function deleteDebit(id) {
  selectedId = id;
  deleteModal.classList.add("show");
}

document.getElementById("btn-confirm-delete").onclick = async () => {
  await fetch(`/api/debit/${selectedId}`, { method: "DELETE" });
  await loadDebits();
  deleteModal.classList.remove("show");
};

document.getElementById("btn-cancel-delete").onclick = () => {
  deleteModal.classList.remove("show");
};

/* ---------------- EVENTS ---------------- */
debitList.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const id = btn.dataset.id;

  if (btn.classList.contains("btn-view")) viewDebit(id);
  if (btn.classList.contains("btn-edit")) editDebit(id);
  if (btn.classList.contains("btn-delete")) deleteDebit(id);
});

document.getElementById("btn-add-new").onclick = () => {
  debitForm.reset();
  document.getElementById("debit_id").value = "";
  showView(viewForm);
};

document.getElementById("btn-back-form").onclick = () => showView(viewList);
document.getElementById("btn-back-details").onclick = () => showView(viewList);

/* ---------------- INIT ---------------- */
window.onload = async () => {
  await loadProjects();
  await loadDebits();
};
