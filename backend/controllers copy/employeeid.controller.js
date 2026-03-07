import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import User from "../models/user.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const downloadEmployeeID = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // 1. Initialize PDF (Portrait ID Card size: 320x500 pts)
    const doc = new PDFDocument({
      size: [320, 500], 
      margin: 0,
    });

    const safeName = employee.full_name.replace(/[^a-zA-Z0-9]/g, "_");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=ID_${safeName}.pdf`);
    
    doc.pipe(res);

    const assetsPath = path.join(process.cwd(), "assets", "images");
    const fontsPath = path.join(process.cwd(), "assets", "fonts");

    // ==========================================
    // 2. BACKGROUND & BRANDING
    // ==========================================
    const bgPath = path.join(assetsPath, "id-bg.png");
    if (fs.existsSync(bgPath)) {
      doc.image(bgPath, 0, 0, { width: 320, height: 500 });
    }

    const logoPath = path.join(assetsPath, "logo_main.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 40, { width: 48 }); 
      
      doc.font(`${fontsPath}/Montserrat-Bold.ttf`)
         .fontSize(12)
         .fillColor("#000000")
         .text("The Culinary Institute", 105, 48)
         .text("of Bangladesh (CIB)", 105, 62);
    }

    // ==========================================
    // 3. EMPLOYEE PHOTO (Perfect Circle)
    // ==========================================
    if (employee.photo_url) {
      try {
        const absolutePhotoPath = path.join(process.cwd(), "public", employee.photo_url);

        if (fs.existsSync(absolutePhotoPath)) {
          doc.save();
          // Centered horizontally, positioned exactly as the reference
          doc.circle(160, 200, 70).clip(); 
          doc.image(absolutePhotoPath, 90, 130, { 
            width: 140, 
            height: 140, 
            align: 'center', 
            valign: 'center' 
          });
          doc.restore();

          // Smooth Border for Photo
          doc.lineWidth(4).strokeColor("#ffffff").circle(160, 200, 70).stroke();
          doc.lineWidth(1).strokeColor("#e2e8f0").circle(160, 200, 71).stroke();
        }
      } catch (err) {
        console.error("Photo rendering failed:", err);
      }
    }

    // ==========================================
    // 4. TEXT SECTION
    // ==========================================
    doc.font(`${fontsPath}/Montserrat-Bold.ttf`)
       .fontSize(24)
       .fillColor("#000000")
       .text(employee.full_name, 0, 305, { align: "center" });

    doc.font(`${fontsPath}/Montserrat-SemiBold.ttf`)
       .fontSize(14)
       .fillColor("#333333")
       .text(employee.designation, 20, 340, { align: "center", width: 280 });

    // ==========================================
    // 5. QR CODE (Centered Professional Look)
    // ==========================================
    const scanUrl = `https://verification.cibdhk.com/employee/${employee._id}`;
    
    // Low margin QR to fit the container perfectly
    const qrBuffer = await QRCode.toBuffer(scanUrl, { 
      margin: 1, 
      width: 160,
      color: { dark: "#000000", light: "#ffffff" }
    });

    // Draw a subtle rounded background for the QR code
    const qrSize = 75;
    const qrX = 160 - (qrSize / 2);
    const qrY = 385;

    doc.fillColor("#f8fafc").roundedRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, 8).fill();
    doc.image(qrBuffer, qrX, qrY, { width: qrSize });

    // ==========================================
    // 6. FOOTER ID LABEL
    // ==========================================
    doc.font(`${fontsPath}/Montserrat-Bold.ttf`)
       .fontSize(13)
       .fillColor("#000000")
       .text(`ID: ${employee.employee_id || '------'}`, 0, 465, { 
          align: "center", 
          characterSpacing: 1.5 
       });

    doc.end();

  } catch (error) {
    console.error("ID Generation Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};