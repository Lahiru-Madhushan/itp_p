// productPDF.js
import jsPDF from "jspdf";
import "jspdf-autotable";

// Utility: Load image as Base64 (from public folder)
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
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
  });

/**
 * Generate Products PDF report
 * @param {Array} products - Array of product objects
 */
export const generateProductsPDF = async (products) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1️⃣ Logo
  let logoBase64 = null;
  try {
    logoBase64 = await getBase64Image("/images/logo2.jpg");
  } catch (e) {
    console.warn("Logo not found, skipping logo.");
  }
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", pageWidth / 2 - 23, 8, 46, 23);
  }

  // 2️⃣ Company Details
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Yong Smart (Pvt) LTD", pageWidth / 2, 38, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    "281/A Cemetery Road, Sea Road, Matara, Sri Lanka",
    pageWidth / 2,
    44,
    { align: "center" }
  );
  doc.text("Contact: +94 123 456 789", pageWidth / 2, 50, {
    align: "center",
  });

  // 3️⃣ Report Title
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Product Management Report", pageWidth / 2, 62, {
    align: "center",
  });

  doc.setLineWidth(0.5);
  doc.line(20, 67, pageWidth - 20, 67);

  // 4️⃣ Table Columns & Rows (✅ includes SIZE)
  const tableColumn = [
    "Name",
    "Category",
    "Size",
    "Price (Rs.)",
    "Stock",
    "Description",
  ];

  const tableRows = products.map((p) => [
    p.name || "",
    p.category || "",
    p.size || "-", // Ensure size shows
    p.price ? `Rs. ${p.price}` : "",
    p.stockQuantity?.toString() || "",
    p.description || "",
  ]);

  // 5️⃣ AutoTable
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 72,
    theme: "grid",
    styles: {
      fontSize: 9,
      halign: "center",
      valign: "middle",
      textColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [255, 215, 0],
      textColor: [0, 0, 0],
      halign: "center",
    },
    bodyStyles: { fillColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [255, 250, 205] },
    margin: { left: 15, right: 15 },
    didDrawPage: () => {
      const pageCount = doc.internal.getNumberOfPages();
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber;

      doc.setFontSize(9);
      doc.setTextColor(100);

      // Footer line
      doc.setDrawColor(200);
      doc.setLineWidth(0.5);
      doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);

      // Page number
      doc.text(
        `Page ${currentPage} of ${pageCount}`,
        pageWidth - 20,
        pageHeight - 10,
        { align: "right" }
      );

      // Date
      const today = new Date().toLocaleDateString();
      doc.text(`Generated on: ${today}`, 20, pageHeight - 10, {
        align: "left",
      });
    },
  });

  return doc;
};
