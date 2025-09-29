// = FILE: frontend/src/pages/orderPDF.js
import jsPDF from "jspdf";
import "jspdf-autotable";

// Utility: Convert image to Base64
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

export const generateOrderPDF = async (order) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1️⃣ Logo
  let logoBase64 = null;
  try {
    logoBase64 = await getBase64Image("/images/logo2.jpg");
  } catch {}
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", pageWidth / 2 - 23, 8, 46, 23);
  }

  // 2️⃣ Company Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Yong Smart (Pvt) LTD", pageWidth / 2, 38, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("281/A Cemetery Road, Matara, Sri Lanka", pageWidth / 2, 44, {
    align: "center",
  });
  doc.text("Contact: +94 123 456 789", pageWidth / 2, 50, {
    align: "center",
  });

  // 3️⃣ Report Title
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Order Report - ${order._id.slice(-6)}`, pageWidth / 2, 62, {
    align: "center",
  });
  doc.setLineWidth(0.5);
  doc.line(20, 67, pageWidth - 20, 67);

  // 4️⃣ Customer Info
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Customer Information:", 20, 75);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Name: ${order.userId?.firstName || ""} ${order.userId?.lastName || ""}`,
    25,
    82
  );
  doc.text(`Email: ${order.userId?.email || ""}`, 25, 88);
  doc.text(`Phone: ${order.userId?.phoneNumber || ""}`, 25, 94);
  doc.text(`Address: ${order.userId?.address || ""}`, 25, 100);

  // 5️⃣ Products Table with Customizations
  const tableColumn = ["Product", "Qty", "Price", "Customizations"];
  const tableRows = (order.items || []).map((p) => [
    p.name,
    p.quantity,
    `Rs.${p.finalPrice}`,
    p.customizations
      ? Object.entries(p.customizations)
          .map(([k, v]) => `${k}: ${v.label}(+${v.price})`)
          .join(", ")
      : "-",
  ]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 110,
    theme: "grid",
    styles: { fontSize: 9, halign: "center" },
    headStyles: { fillColor: [255, 215, 0] },
  });

  // 6️⃣ Totals & Status
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Order Status: ${order.status}`, 20, finalY);
  doc.text(`Total Amount: Rs.${order.total}`, pageWidth - 20, finalY, {
    align: "right",
  });
  doc.setFont("helvetica", "normal");
  doc.text(
    `Date: ${new Date(order.createdAt).toLocaleDateString()}`,
    20,
    finalY + 8
  );

  // 7️⃣ Footer with Page Numbers + Generated Date
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10, {
      align: "right",
    });
    const today = new Date().toLocaleDateString();
    doc.text(`Generated on: ${today}`, 20, pageHeight - 10, {
      align: "left",
    });
  }

  return doc;
};
