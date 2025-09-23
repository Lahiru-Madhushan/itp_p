import jsPDF from "jspdf";

/**
 * Utility: Convert image URL → Base64 using fetch + FileReader
 * (avoids canvas tainting issues with cross-origin images)
 */
const getBase64Image = async (url) => {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result); // base64 string
    reader.readAsDataURL(blob);
  });
};

/**
 * Generate PDF for one customization order
 */
export const generateCustomizationPDF = async (order) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ---------- Logo ----------
  let logoBase64 = null;
  try {
    logoBase64 = await getBase64Image("/images/logo2.jpg"); // in public/images/
  } catch {
    console.warn("Logo not found, skipping logo.");
  }

  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", pageWidth / 2 - 23, 8, 46, 23);
  }

  // ---------- Company Info ----------
  doc.setFontSize(16).setFont("helvetica", "bold");
  doc.text("Yong Smart (Pvt) LTD", pageWidth / 2, 38, { align: "center" });

  doc.setFontSize(10).setFont("helvetica", "normal");
  doc.text(
    "281/A Cemetery Road, Sea Road, Matara, Sri Lanka",
    pageWidth / 2,
    44,
    { align: "center" }
  );
  doc.text("Contact: +94 123 456 789", pageWidth / 2, 50, {
    align: "center",
  });

  // ---------- Title ----------
  doc.setFontSize(12).setFont("helvetica", "bold");
  doc.text("Customization Order Report", pageWidth / 2, 62, {
    align: "center",
  });

  doc.setLineWidth(0.5);
  doc.line(20, 67, pageWidth - 20, 67);

  // ---------- Order Details ----------
  doc.setFont("helvetica", "normal").setFontSize(11);
  let y = 75;
  const addLine = (label, value) => {
    doc.text(`• ${label}: ${value || "N/A"}`, 25, y);
    y += 8;
  };

  addLine("First Name", order.user?.firstName);
  addLine("Last Name", order.user?.lastName);
  addLine("Email", order.user?.email);
  addLine("Contact Number", order.user?.phoneNumber);
  addLine("Clothing Type", order.clothingType);
  addLine("Fabric", order.fabric);
  addLine("Fabric Color", order.fabricColor);
  addLine("Size", order.size);
  addLine("Status", order.status);

  if (order.measurements) {
    Object.entries(order.measurements).forEach(([key, val]) => {
      addLine(key.charAt(0).toUpperCase() + key.slice(1), val);
    });
  }

  // ---------- Uploaded Design Image ----------
  if (order.designImage) {
    try {
      const imageUrl = `http://localhost:8070/uploads/customizations/${order.designImage}`;
      const base64Img = await getBase64Image(imageUrl);

      if (y > pageHeight - 80) {
        doc.addPage();
        y = 30;
      } else {
        y += 10;
      }

      doc.setFont("helvetica", "bold");
      doc.text("Uploaded Design:", 25, y);
      y += 5;

      doc.addImage(base64Img, "PNG", 25, y, 120, 120);
      y += 130;
    } catch (err) {
      console.error("Error loading uploaded design image:", err);
    }
  }

  // ---------- Footer ----------
  const today = new Date().toLocaleDateString();
  doc.setFontSize(9).setTextColor(100);

  doc.setDrawColor(200).setLineWidth(0.5);
  doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);

  doc.text(`Generated on: ${today}`, 20, pageHeight - 10, { align: "left" });

  const pageCount = doc.internal.getNumberOfPages();
  const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
  doc.text(
    `Page ${currentPage} of ${pageCount}`,
    pageWidth - 20,
    pageHeight - 10,
    { align: "right" }
  );

  return doc;
};
