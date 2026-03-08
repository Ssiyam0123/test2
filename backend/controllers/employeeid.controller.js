import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import User from "../models/user.js";

// ==========================================
// 🚀 PRODUCTION-GRADE EMPLOYEE ID GENERATOR
// ==========================================
export const downloadEmployeeID = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // 1. Initialize High-Quality PDF (CR-80 Standard ID Card Size in Points: 320x504)
    const doc = new PDFDocument({
      size: [320, 504], 
      margin: 0,
      info: {
        Title: `${employee.full_name} - Official ID Card`,
        Author: "The Culinary Institute of Bangladesh",
      }
    });

    const safeName = employee.full_name.replace(/[^a-zA-Z0-9]/g, "_");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Employee_ID_${safeName}.pdf`);
    
    doc.pipe(res);

    // Asset Paths
    const assetsPath = path.join(process.cwd(), "assets", "images");
    const fontsPath = path.join(process.cwd(), "assets", "fonts");

    // ==========================================
    // 2. BACKGROUND & BRANDING
    // ==========================================
    const bgPath = path.join(assetsPath, "id-bg.png"); // Make sure this is a high-res image
    if (fs.existsSync(bgPath)) {
      doc.image(bgPath, 0, 0, { width: 320, height: 504 });
    } else {
      // Fallback elegant background if image is missing
      doc.rect(0, 0, 320, 504).fill("#f8fafc");
      doc.rect(0, 0, 320, 140).fill("#0f172a"); // Top Header Banner
    }

    // Logo & Header Text
    const logoPath = path.join(assetsPath, "logo_main.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 45, 30, { width: 50 }); 
      
      doc.font(`${fontsPath}/Montserrat-Bold.ttf`)
         .fontSize(11)
         .fillColor(fs.existsSync(bgPath) ? "#ffffff" : "#ffffff") // Adjust based on your background
         .text("The Culinary Institute", 105, 38)
         .fontSize(9)
         .text("of Bangladesh (CIB)", 105, 52);
    }

    // ==========================================
    // 3. EMPLOYEE PHOTO (Premium Circular Avatar)
    // ==========================================
    const photoCenterX = 160;
    const photoCenterY = 190;
    const photoRadius = 65;

    let hasPhoto = false;

    if (employee.photo_url) {
      const absolutePhotoPath = path.join(process.cwd(), "public", employee.photo_url);
      if (fs.existsSync(absolutePhotoPath)) {
        try {
          doc.save();
          doc.circle(photoCenterX, photoCenterY, photoRadius).clip(); 
          doc.image(absolutePhotoPath, photoCenterX - photoRadius, photoCenterY - photoRadius, { 
            width: photoRadius * 2, 
            height: photoRadius * 2,
            align: 'center', 
            valign: 'center' 
          });
          doc.restore();
          hasPhoto = true;
        } catch (err) {
          console.error("Photo rendering failed:", err);
        }
      }
    }

    // Fallback Avatar if no photo is available
    if (!hasPhoto) {
      doc.circle(photoCenterX, photoCenterY, photoRadius).fill("#e2e8f0");
      doc.font(`${fontsPath}/Montserrat-Bold.ttf`)
         .fontSize(40)
         .fillColor("#94a3b8")
         .text(employee.full_name.charAt(0).toUpperCase(), 0, photoCenterY - 18, { align: "center" });
    }

    // Premium Double Border for Photo
    doc.lineWidth(4).strokeColor("#ffffff").circle(photoCenterX, photoCenterY, photoRadius).stroke();
    doc.lineWidth(1).strokeColor("#cbd5e1").circle(photoCenterX, photoCenterY, photoRadius + 2).stroke();

    // ==========================================
    // 4. EMPLOYEE DETAILS (Typography Focused)
    // ==========================================
    doc.font(`${fontsPath}/Montserrat-Bold.ttf`)
       .fontSize(22)
       .fillColor("#1e293b")
       .text(employee.full_name.toUpperCase(), 20, 285, { align: "center", width: 280 });

    doc.font(`${fontsPath}/Montserrat-SemiBold.ttf`)
       .fontSize(12)
       .fillColor("#0d9488") // A premium teal/blue accent color
       .text(employee.designation, 20, 315, { align: "center", width: 280 });

    doc.font(`${fontsPath}/Montserrat-Medium.ttf`)
       .fontSize(10)
       .fillColor("#64748b")
       .text(`Dept: ${employee.department || "General"}`, 20, 335, { align: "center", width: 280 });

    // ==========================================
    // 5. QR CODE (Secure & Scannable)
    // ==========================================
    // Provide a valid URL for verification
    const scanUrl = `https://verification.cibdhk.com/employee/${employee.employee_id}`;
    
    const qrBuffer = await QRCode.toBuffer(scanUrl, { 
      errorCorrectionLevel: 'H', // High error correction for printed materials
      margin: 1, 
      width: 150,
      color: { dark: "#0f172a", light: "#ffffff" }
    });

    const qrSize = 65;
    const qrX = 160 - (qrSize / 2);
    const qrY = 370;

    // Subtle Shadow/Border behind QR
    doc.lineWidth(1).strokeColor("#e2e8f0").roundedRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 6).stroke();
    doc.image(qrBuffer, qrX, qrY, { width: qrSize });

    // ==========================================
    // 6. FOOTER (ID & Validation Text)
    // ==========================================
    doc.font(`${fontsPath}/Montserrat-Bold.ttf`)
       .fontSize(14)
       .fillColor("#1e293b")
       .text(`ID: ${employee.employee_id || 'N/A'}`, 0, 455, { align: "center", characterSpacing: 2 });

    doc.font(`${fontsPath}/Montserrat-Medium.ttf`)
       .fontSize(8)
       .fillColor("#94a3b8")
       .text("cibdhk.com", 0, 480, { align: "center" });

    doc.end();

  } catch (error) {
    console.error("❌ ID Generation Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate ID card PDF." });
    }
  }
};