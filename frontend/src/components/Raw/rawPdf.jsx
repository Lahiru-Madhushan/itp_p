// frontend/src/utils/rawPdf.js
import jsPDF from "jspdf";
import "jspdf-autotable";

// Optional logo loader
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

export const generateRawPDF = async (rawData) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Logo
  try {
    const logo = await getBase64Image("/images/logo2.jpg");
    doc.addImage(logo, "PNG", pageWidth / 2 - 23, 8, 46, 23);
  } catch (e) {
    console.warn("Logo not found, skipping.");
  }

  // Company Header
  doc.setFontSize(16).setFont("helvetica", "bold");
  doc.text("Yong Smart (Pvt) LTD", pageWidth / 2, 38, { align: "center" });

  doc.setFontSize(10).setFont("helvetica", "normal");
  doc.text("281/A Cemetery Road, Matara, Sri Lanka", pageWidth / 2, 44, {
    align: "center",
  });
  doc.text("Contact: +94 123 456 789", pageWidth / 2, 50, { align: "center" });

  // Report Title
  doc.setFontSize(12).setFont("helvetica", "bold");
  doc.text("Raw Materials Report", pageWidth / 2, 62, { align: "center" });

  doc.line(20, 67, pageWidth - 20, 67);

  // Table
  let totalPrice = 0;
  const tableRows = rawData.map((r) => {
    const rowTotal = Number(r.price) || 0;
    totalPrice += rowTotal;

    // ✅ Stock Level calculation
    const stockLevel = r.quantity <= 10 ? "Low Stock" : "In Stock";

    return [
      r.name,
      r.unit,
      r.quantity,
      `Rs. ${rowTotal.toFixed(2)}`, // ✅ Total price
      r.suppliers,
      stockLevel,
    ];
  });

  doc.autoTable({
    head: [["Name", "Unit", "Quantity", "Total Price", "Suppliers", "Stock Level"]],
    body: tableRows,
    startY: 72,
    theme: "grid",
    styles: { fontSize: 9, halign: "center" },
    headStyles: { fillColor: [76, 175, 80], textColor: [255, 255, 255] },
    margin: { left: 15, right: 15 },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber;

      doc.setFontSize(9).setTextColor(100);

      doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
      doc.text(
        `Page ${currentPage} of ${pageCount}`,
        pageWidth - 20,
        pageHeight - 10,
        { align: "right" }
      );
      doc.text(
        `Generated on: ${new Date().toLocaleDateString()}`,
        20,
        pageHeight - 10
      );
    },
  });

  // ✅ Show Total at bottom
  doc.setFontSize(12).setFont("helvetica", "bold");
  doc.text(
    `Grand Total: Rs. ${totalPrice.toFixed(2)}`,
    pageWidth - 20,
    doc.lastAutoTable.finalY + 10,
    { align: "right" }
  );

  doc.save("Raw_Materials_Report.pdf");
};
