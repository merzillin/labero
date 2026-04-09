import { Request, Response } from "express";
import pdf from "html-pdf-node";
import {
  getAttendanceDetails,
  getCreditDetails,
  getDebitDetails,
  getEmployeeDetails,
} from "../models/reportModel";

interface PdfOptions {
  format?: string;
  margin?: { top?: string; bottom?: string; left?: string; right?: string };
}

// Example HTML content
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Report</title>
</head>
<body>
  <h1>Report</h1>
  <p>This is a sample PDF report.</p>
</body>
</html>
`;

export const getReports = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const attendanceDetails = getAttendanceDetails(req.body);

    // ✅ Group data
    const groupedData = groupAttendance(attendanceDetails);

    // ✅ Generate HTML
    const htmlContent = generateHTML(groupedData);

    // ✅ Send HTML (or later convert to PDF)
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(htmlContent);

  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).send("Internal Server Error");
  }
};
export const downloadReport = async (req: Request, res: Response) => {
  try {
    const { from_date, to_date, project_id, status_id, employee_id } = req.body;

    // Generate PDF as Buffer
    const buffer: Buffer = await htmlToPdf(htmlContent);

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to generate PDF");
  }
};

async function htmlToPdf(
  html: string,
  options: PdfOptions = { format: "A4" },
): Promise<Buffer> {
  const file = { content: html };
  const buffer: any = await pdf.generatePdf(file, options);
  return buffer;
}

const generateHTML = (data: any[]) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Attendance Report</title>

    <!-- ✅ Mobile Responsive -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 10px;
        margin: 0;
        background: #505050ff;
      }

      h1 {
        text-align: center;
        font-size: 20px;
      }

      .card {
        background: #414141ff;
        border-radius: 10px;
        padding: 12px;
        margin-bottom: 15px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      }

      .header {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 10px;
      }

      .employee {
        border-top: 1px solid #0f0e0eff;
        padding: 8px 0;
        font-size: 13px;
      }

      .employee:first-child {
        border-top: none;
      }

      .row {
        display: flex;
        justify-content: space-between;
        margin: 2px 0;
      }

      .label {
        color: #000000ff;
      }

      .value {
        font-weight: 500;
      }

      .total {
        margin-top: 10px;
        padding-top: 8px;
        border-top: 2px solid #000;
        font-weight: bold;
        text-align: right;
      }

      @media (min-width: 768px) {
        body {
          padding: 20px;
        }

        .card {
          max-width: 700px;
          margin: 0 auto 20px auto;
        }
      }
    </style>
  </head>

  <body>
    <h1>Attendance Report</h1>

    ${data.map(att => `
      <div class="card">
        <div class="header">
          📅 ${att.date} <br/>
          🏗️ ${att.project_name}
        </div>

        ${att.employees.map((emp: any) => `
          <div class="employee">
            <div class="row">
              <span class="label">Name</span>
              <span class="value">${emp.employee_name}</span>
            </div>
            <div class="row">
              <span class="label">Type</span>
              <span class="value">${emp.employee_type}</span>
            </div>
            <div class="row">
              <span class="label">Salary</span>
              <span class="value">₹${emp.salary}</span>
            </div>
            <div class="row">
              <span class="label">Full day</span>
              <span class="value">${emp.is_full ? 'yes' : 'no'}</span>
            </div>
            <div class="row">
              <span class="label">Hours</span>
              <span class="value">${emp.work_amount || 0}</span>
            </div>
            <div class="row">
              <span class="label">Extra</span>
              <span class="value">${emp.extra_hours}</span>
            </div>
            <div class="row">
              <span class="label">Total</span>
              <span class="value">₹${emp.total}</span>
            </div>
          </div>
        `).join("")}

        <div class="total">
          Total: ₹${att.total_amount}
        </div>
      </div>
    `).join("")}

  </body>
  </html>
  `;
};

const groupAttendance = (data: any[]) => {
  const grouped: Record<number, any> = {};

  data.forEach((row) => {
    if (!grouped[row.attendance_id]) {
      grouped[row.attendance_id] = {
        attendance_id: row.attendance_id,
        project_name: row.project_name,
        date: row.date,
        status_name: row.status_name,
        employees: [],
        total_amount: 0
      };
    }

   const calculatedAmount = row.is_full ? 
  (Number(row.salary || 0) * Number(row.is_full || 0)) +  
  (Number(row.extra_hours || 0) * Number(row.amount || 0))
  : 
  Number(row.work_amount || 0);

    grouped[row.attendance_id].employees.push({
      employee_name: row.employee_name,
      employee_type: row.employee_type_name,
      salary: row.salary,
      is_full:row.is_full,
      work_amount: row.working_hours,
      extra_hours: row.extra_hours,
      amount: row.amount, // per extra hour rate
      total: calculatedAmount
    });

    grouped[row.attendance_id].total_amount += calculatedAmount;
  });

  return Object.values(grouped);
};