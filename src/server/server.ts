import express from "express";
import path from "path";
import dotenv from "dotenv";

// Import routes
import userRoutes from "./routes/userRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";
import reportRoutes from "./routes/reportRoutes";
import projectRoutes from "./routes/projectRoutes";
import creditRoutes from "./routes/creditRoutes";
import debitRoutes from "./routes/debitRoutes";
import statusRoutes from "./routes/statusRoute";

// Load environment variables
dotenv.config();

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../../public")));

// Mount API routes
app.use("/api/users", userRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/credit", creditRoutes);
app.use("/api/debit", debitRoutes);
app.use("/api/status", statusRoutes);

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/index.html"));
});

// Error handling middleware (temporary)
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  },
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
