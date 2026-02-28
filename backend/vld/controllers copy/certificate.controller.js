import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Student from "../models/student.js"; // Adjust based on your model path

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const downloadCertificatePDF = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 1. Initialize PDF Document (A4 Landscape)
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 0,
    });

    // 2. Set response headers to trigger file download
    const safeName = student.student_name.replace(/[^a-zA-Z0-9]/g, "_");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=CIB_Certificate_${safeName}.pdf`);
    
    doc.pipe(res);

    // Asset paths
    const fontsPath = path.join(__dirname, "../assets/fonts");
    const imagesPath = path.join(__dirname, "../assets/images");

    // ==========================================
    // 3. BACKGROUND LAYERS & WATERMARKS
    // ==========================================
    
    // Base Waves Background (Full A4 Bleed - 842x595)
    doc.image(`${imagesPath}/WavesBackground.png`, 0, 0, { width: 842, height: 595 });
    
    // Corner Accents and Signatures
    doc.image(`${imagesPath}/GoldCorners.png`, 0, 0, { width: 842, height: 595 });
    doc.image(`${imagesPath}/SealSignature.png`, 0, 0, { width: 842, height: 595 });

    // ---------------------------------------------------------
    // GIANT CENTER LOGO WATERMARK (Drawn BEFORE text so it sits behind)
    // ---------------------------------------------------------
    const logoWidth = 540; // 3x the size of 180
    const logoX = (842 / 2) - (logoWidth / 2); // Perfectly centered horizontally (151)
    
    // CHANGED: Moved down by 10px (was 180, now 190)
    const logoY = 190; 
    
    if (fs.existsSync(path.join(imagesPath, "logo.png"))) {
        // Adding opacity parameter here if your logo isn't already faded
        doc.image(`${imagesPath}/logo.png`, logoX, logoY, { width: logoWidth });
    }
    // ---------------------------------------------------------

    // Outer Gold Border (The "Last Border")
    doc.lineWidth(2).strokeColor("#bd9b5e").rect(20, 20, 802, 555).stroke();

    // ==========================================
    // 4. TYPOGRAPHY & TEXT (Layered on top)
    // ==========================================

    // Header 
    doc.font(`${fontsPath}/Cinzel-Bold.ttf`)
       .fontSize(19)
       .fillColor("#111111")
       .text("THE CULINARY INSTITUTE OF BANGLADESH", 0, 50, { align: "center", characterSpacing: 1.5 });

    doc.font(`${fontsPath}/Montserrat-SemiBold.ttf`)
       .fontSize(10)
       .fillColor("#555555")
       .text(`Registration No: STP-DHA-003244`, 0, 75, { align: "center" });

    doc.font(`${fontsPath}/GreatVibes-Regular.ttf`)
       .fontSize(22)
       .fillColor("#444444")
       .text("Excellence in culinary training, certified with pride", 0, 90, { align: "center" });

    // Main Title 
    doc.font(`${fontsPath}/Cinzel-Bold.ttf`)
       .fontSize(60)
       .fillColor("#111111")
       .text("CERTIFICATE", 0, 135, { align: "center", characterSpacing: 10 });

    doc.font(`${fontsPath}/Montserrat-Regular.ttf`)
       .fontSize(17)
       .fillColor("#c5a059")
       .text("OF ACHIEVEMENT", 0, 200, { align: "center", characterSpacing: 8 });

    // Awardee Name 
    doc.font(`${fontsPath}/Montserrat-SemiBold.ttf`)
       .fontSize(10)
       .fillColor("#333333")
       .text("THIS CERTIFICATE IS PROUDLY GIVEN TO", 0, 250, { align: "center", characterSpacing: 2 });

    doc.font(`${fontsPath}/GreatVibes-Regular.ttf`)
       .fontSize(85)
       .fillColor("#111111")
       .text(student.student_name, 0, 265, { align: "center" });

    // ==========================================
    // 5. COURSE DETAILS 
    // ==========================================

    // Gold Divider Line
    doc.lineWidth(1.5).strokeColor("#c5a059").moveTo(180, 370).lineTo(662, 370).stroke();

    doc.font(`${fontsPath}/Montserrat-Regular.ttf`)
       .fontSize(12)
       .fillColor("#333333")
       .text("In recognition of accomplishment and demonstrated excellence in the culinary arts.", 0, 390, { align: "center" });

    doc.font(`${fontsPath}/Montserrat-Bold.ttf`)
       .fontSize(18)
       .fillColor("#111111")
       .text(student.course_name, 0, 415, { align: "center" });

    // Format Date Helper
    const d = new Date(student.issue_date || Date.now());
    const issueDate = `Awarded on ${d.getDate()} ${d.toLocaleDateString("en-GB", { month: "long" })} ${d.getFullYear()}`;

    doc.font(`${fontsPath}/Montserrat-MediumItalic.ttf`)
       .fontSize(12)
       .fillColor("#555555")
       .text(issueDate, 0, 440, { align: "center" });

    // ==========================================
    // 6. FOOTER (QR Code & Verification Text)
    // ==========================================
    
    const studentUrl = `https://verification.cibdhk.com/student/${student._id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(studentUrl, { margin: 0, width: 150 });
    
    // Position Settings for Left Footer
    const qrX = 60;
    const qrSize = 55;
    const footerY = 485;
    const textX = qrX + qrSize + 15;
    
    // Insert QR Code & Box
    doc.image(qrCodeDataUrl, qrX, footerY, { width: qrSize });
    doc.lineWidth(0.5).strokeColor("#bd9b5e").rect(qrX, footerY, qrSize, qrSize).stroke();

    // Footer Text (NSDA Accreditation)
    let textY = footerY;

    doc.font(`${fontsPath}/Montserrat-Regular.ttf`).fontSize(7).fillColor("#333333")
       .text("This academy is accredited by the ", textX, textY, { continued: true })
       .font(`${fontsPath}/Montserrat-Bold.ttf`)
       .text("National");
    
    textY += 10;
    doc.font(`${fontsPath}/Montserrat-Bold.ttf`)
       .text("Skills Development Authority (NSDA)", textX, textY);
    
    textY += 10;
    doc.font(`${fontsPath}/Montserrat-Regular.ttf`)
       .text("and adheres to NSDA & international food", textX, textY);
    
    textY += 10;
    doc.font(`${fontsPath}/Montserrat-Regular.ttf`)
       .text("safety & quality management standards.", textX, textY);

    // Spacer
    textY += 15;

    // Registration & Verification Lines
    doc.font(`${fontsPath}/Montserrat-Bold.ttf`)
       .fillColor("#111111")
       .text(`Student Reg No: `, textX, textY, { continued: true })
       .font(`${fontsPath}/Montserrat-Regular.ttf`)
       .text(student.registration_number || student._id);

    textY += 10;
    doc.font(`${fontsPath}/Montserrat-Bold.ttf`)
       .text(`Manual Verification: `, textX, textY, { continued: true })
       .font(`${fontsPath}/Montserrat-Regular.ttf`)
       .text("contact@cibdhk.com | www.cibdhk.com");

    // Finalize the PDF
    doc.end();

  } catch (error) {
    console.error("PDF Generation Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate certificate" });
    }
  }
};