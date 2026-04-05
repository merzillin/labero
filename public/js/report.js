// Elements
const reportForm = document.getElementById("report-form");
const projectSelect = document.getElementById("project_id");
const statusSelect = document.getElementById("status_id");
const reportResults = document.getElementById("reportResults");
const downloadBtn = document.getElementById("downloadReportBtn");

// Load projects and statuses for dropdowns
async function loadDropdowns() {
  try {
    // Projects
    const projectRes = await fetch("/api/project/dropdown");
    const projects = await projectRes.json();
    projects.forEach((p) => {
      const option = document.createElement("option");
      option.value = p.project_id;
      option.textContent = p.project_name;
      projectSelect.appendChild(option);
    });

    // Statuses
    const statusRes = await fetch("/api/status/dropdown");
    const statuses = await statusRes.json();
    statuses.forEach((s) => {
      const option = document.createElement("option");
      option.value = s.status_id;
      option.textContent = s.status_name;
      statusSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error loading dropdowns:", err);
  }
}

// Handle form submission
reportForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    from_date: reportForm.from_date.value,
    to_date: reportForm.to_date.value,
    project_id: reportForm.project_id.value || null,
    status_id: reportForm.status_id.value || null,
  };

  try {
    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Get HTML response
    const htmlContent = await res.text();
    // Inject into reportResults container
    reportResults.innerHTML = htmlContent;
  } catch (err) {
    console.error("Error fetching report:", err);
  }
});

// Optional: Download functionality (CSV/Excel)
downloadBtn.addEventListener("click", () => {
  alert("Download feature not implemented yet!");
});

// Initialize
window.addEventListener("DOMContentLoaded", () => {
  loadDropdowns();
});
