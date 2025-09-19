// pdfTemplate.js
import jsPDF from "jspdf";
import "jspdf-autotable";

// Utility to load image as Base64
const getBase64Image = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpg"));
    };
    img.onerror = reject;
  });

/**
 * Generate Users PDF report with logo + header + footer
 * @param {Array} users - Array of user objects
 */
export const generateUsersPDF = async (users) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1️⃣ Load logo
  const logoBase64 = await getBase64Image("../../../public/images/logo2.jpg");

  // 2️⃣ Add Logo (centered at top)
  doc.addImage(logoBase64, "JPG", pageWidth / 2 - 23, 8, 50, 25);

  // 3️⃣ Company Name
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Yong Smart (Pvt) LTD", pageWidth / 2, 38, { align: "center" });

  // 4️⃣ Company Address & Contact
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    "281/A Cemetery Road, Sea Road, Matara, Sri Lanka",
    pageWidth / 2,
    44,
    { align: "center" }
  );
  doc.text("Contact: +94 123 456 789", pageWidth / 2, 50, { align: "center" });

  // 5️⃣ Report Title
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("User Management Report", pageWidth / 2, 60, { align: "center" });

  // 6️⃣ Horizontal line after header
  doc.setLineWidth(0.5);
  doc.line(20, 65, pageWidth - 20, 65);

  // 7️⃣ Table Content
  const tableColumn = [
    "First Name",
    "Last Name",
    "Address",
    "Phone",
    "Email",
    "Role",
  ];
  const tableRows = users.map((user) => [
    user.firstName,
    user.lastName,
    user.address,
    user.phoneNumber,
    user.email,
    user.role,
  ]);

  // 7️⃣ Table with user-friendly colors (white + yellow)
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 72,
    styles: {
      fontSize: 10,
      halign: "center",
      textColor: [0, 0, 0], // Black text
    },
    headStyles: {
      fillColor: [255, 215, 0], // Header: gold/yellow
      textColor: [0, 0, 0],     // Black text
      halign: "center",
    },
    bodyStyles: {
      fillColor: [255, 255, 255], // Body: white
      textColor: [0, 0, 0],       // Black text
    },
    alternateRowStyles: {
      fillColor: [255, 250, 205], // Light yellow for alternate rows
    },
    theme: "grid",
    margin: { left: 20, right: 20 },
  });

  // 8️⃣ Footer with line + page number
  const addFooter = () => {
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.8);
      doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);

      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10, {
        align: "right",
      });

      // Add report generation date
      const today = new Date();
      const dateStr = today.toLocaleDateString();
      doc.text(`Generated on: ${dateStr}`, 20, pageHeight - 10, {
        align: "left",
      });
    }
  };

  addFooter();

  return doc;
};
