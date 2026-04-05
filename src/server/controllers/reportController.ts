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
  res: Response,
): Promise<void> => {
  try {
    const attendanceDetails = getAttendanceDetails(req.body);
    console.log("attendanceDetails", attendanceDetails);
    const employeeIds = attendanceDetails.flatMap((record: any) => {
      try {
        const details = JSON.parse(record.attendance_details);
        return details.map((emp: { employee_id: number }) => emp.employee_id);
      } catch {
        return []; // ignore invalid JSON
      }
    });

    // Optional: remove duplicates
    const uniqueEmployeeIds = Array.from(new Set(employeeIds));

    const employeeDetails = getEmployeeDetails({
      employee_ids: uniqueEmployeeIds,
    });
    console.log("employeeDetails", employeeDetails);
    // const creditDetails = getCreditDetails(req.body);
    // const debitDetails = getDebitDetails(req.body);

    res.status(200).send(htmlContent); // Sends HTML as response
  } catch (error) {
    console.error("Error sending HTML:", error);
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
