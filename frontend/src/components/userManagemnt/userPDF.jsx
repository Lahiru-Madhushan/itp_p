// pdfTemplate.js
import jsPDF from "jspdf";
import "jspdf-autotable";

/**
 * Generate Users PDF report with company header
 * @param {Array} users - Array of user objects
 * @param {Object} company - { name, logoBase64, contact }
 */
export const generateUsersPDF = (users, company) => {
  const doc = new jsPDF();

  // 1️⃣ Add logo if available
  if (company.logoBase64) {
    doc.addImage(company.logoBase64, "PNG", 10, 10, 40, 15); // x, y, width, height
  }

  // 2️⃣ Add company name
  doc.setFontSize(18);
  doc.text(company.name || "Yong Smart", 105, 15, { align: "center" });

  // 3️⃣ Add contact number
  doc.setFontSize(10);
  doc.text(`Contact: ${company.contact || ""}`, 105, 22, { align: "center" });

  // 4️⃣ Add report title
  doc.setFontSize(12);
  doc.text("Registered Users Report", 105, 30, { align: "center" });

  // 5️⃣ Prepare table columns and rows
  const tableColumn = ["First Name", "Last Name", "Address", "Phone", "Email", "Role"];
  const tableRows = users.map((user) => [
    user.firstName,
    user.lastName,
    user.address,
    user.phoneNumber,
    user.email,
    user.role,
  ]);

  // 6️⃣ Add table
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 35,
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [52, 152, 219], textColor: 255, halign: "center" },
    theme: "grid",
  });

  return doc;
};
