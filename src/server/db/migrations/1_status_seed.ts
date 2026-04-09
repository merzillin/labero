import db from "../connection";

const status = [
  { status_name: "Active" },
  { status_name: "Inactive" },
  { status_name: "Pending" },
  { status_name: "Completed" },
  { status_name: "Open" },
  { status_name: "Closed" },
  { status_name: "Credited" },
  { status_name: "Debited" },
  { status_name: "Paid" },
  { status_name: "Unpaid" },
];

status.forEach((s) => {
  db.prepare(`INSERT INTO status_master (status_name) VALUES (?)`).run(
    s.status_name,
  );
});
