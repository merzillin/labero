document.addEventListener('DOMContentLoaded', async () => {
  // Fetch basic stats to populate the dashboard cards
  try {
    const [projectsRes, employeesRes, attendancesRes] = await Promise.all([
      fetch('/api/project'),
      fetch('/api/employee'),
      fetch('/api/attendance')
    ]);

    if(projectsRes.ok) {
      const projects = await projectsRes.json();
      document.getElementById('stats-projects').innerText = projects.length;
    }
    
    if(employeesRes.ok) {
      const employees = await employeesRes.json();
      document.getElementById('stats-employees').innerText = employees.length;
    }

    if(attendancesRes.ok) {
      const attendances = await attendancesRes.json();
      document.getElementById('stats-attendance').innerText = attendances.length;
    }
    
    const debitsRes = await fetch('/api/debit');
    if(debitsRes.ok) {
      const debits = await debitsRes.json();
      const totalExpense = debits.reduce((acc, curr) => acc + curr.debit_amount, 0);
      document.getElementById('stats-expense').innerText = '₹' + totalExpense.toLocaleString();
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
  }
});
