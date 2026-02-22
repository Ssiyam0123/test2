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

    // 2. Set response headers to trigger file download in the browser
    const safeName = student.student_name.replace(/[^a-zA-Z0-9]/g, "_");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=CIB_Certificate_${safeName}.pdf`);
    
    // Pipe the PDF directly to the HTTP response
    doc.pipe(res);

    // Asset paths
    const fontsPath = path.join(__dirname, "../assets/fonts");
    const imagesPath = path.join(__dirname, "../assets/images");

    // 3. Background Layers
    // Assuming your images are high-res, fit them to A4 Landscape (841.89 x 595.28 points)
    doc.image(`${imagesPath}/WavesBackground.png`, 0, 0, { width: 842, height: 595 });
    doc.image(`${imagesPath}/GoldCorners.png`, 0, 0, { width: 842, height: 595 });
    doc.image(`${imagesPath}/SealSignature.png`, 0, 0, { width: 842, height: 595 });

    // 4. Outer Gold Border
    doc.lineWidth(2).strokeColor("#bd9b5e").rect(20, 20, 802, 555).stroke();

    // 5. Typography & Text
    // Header
    doc.font(`${fontsPath}/Cinzel-Bold.ttf`)
       .fontSize(18)
       .fillColor("#111111")
       .text("THE CULINARY INSTITUTE OF BANGLADESH", 0, 60, { align: "center", characterSpacing: 1.5 });

    doc.font(`${fontsPath}/Montserrat-SemiBold.ttf`)
       .fontSize(10)
       .fillColor("#555555")
       .text(`Registration No: STP-DHA-003244`, 0, 85, { align: "center" });

    doc.font(`${fontsPath}/GreatVibes-Regular.ttf`)
       .fontSize(18)
       .fillColor("#444444")
       .text("Excellence in culinary training, certified with pride", 0, 105, { align: "center" });

    // Main Title
    doc.font(`${fontsPath}/Cinzel-Bold.ttf`)
       .fontSize(55)
       .fillColor("#111111")
       .text("CERTIFICATE", 0, 140, { align: "center", characterSpacing: 8 });

    doc.fontSize(18)
       .fillColor("#c5a059")
       .text("OF ACHIEVEMENT", 0, 195, { align: "center", characterSpacing: 6 });

    // Awardee Name
    doc.font(`${fontsPath}/Montserrat-SemiBold.ttf`)
       .fontSize(10)
       .fillColor("#333333")
       .text("THIS CERTIFICATE IS PROUDLY GIVEN TO", 0, 250, { align: "center", characterSpacing: 2 });

    doc.font(`${fontsPath}/GreatVibes-Regular.ttf`)
       .fontSize(70)
       .fillColor("#111111")
       .text(student.student_name, 0, 265, { align: "center" });

    // Gold Divider Line
    doc.lineWidth(1).strokeColor("#c5a059").moveTo(150, 360).lineTo(692, 360).stroke();

    // Course Details
    doc.font(`${fontsPath}/Montserrat-Regular.ttf`)
       .fontSize(12)
       .fillColor("#333333")
       .text("In recognition of accomplishment and demonstrated excellence in the culinary arts.", 0, 380, { align: "center" });

    doc.font(`${fontsPath}/Montserrat-BoldItalic.ttf`)
       .fontSize(16)
       .fillColor("#111111")
       .text(student.course_name, 0, 405, { align: "center" });

    // Format Date Helper
    const d = new Date(student.issue_date || Date.now());
    const issueDate = `Awarded on ${d.getDate()} ${d.toLocaleDateString("en-GB", { month: "long" })} ${d.getFullYear()}`;

    doc.font(`${fontsPath}/Montserrat-MediumItalic.ttf`)
       .fontSize(11)
       .fillColor("#555555")
       .text(issueDate, 0, 430, { align: "center" });

    // 6. Generate QR Code and Insert it
    const studentUrl = `https://verification.cibdhk.com/student/${student._id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(studentUrl, { margin: 1, width: 150 });
    
    // Position QR Code at bottom left
    doc.image(qrCodeDataUrl, 50, 480, { width: 60 });
    
    // Outline for QR code
    doc.lineWidth(0.5).strokeColor("#bd9b5e").rect(50, 480, 60, 60).stroke();

    // 7. Footer Text next to QR Code
    const footerTextX = 120;
    doc.font(`${fontsPath}/Montserrat-Italic.ttf`)
       .fontSize(7)
       .fillColor("#333333")
       .text("This academy is accredited by the ", footerTextX, 485, { continued: true })
       .font(`${fontsPath}/Montserrat-BoldItalic.ttf`)
       .text("National Skills Development Authority (NSDA)", { continued: true })
       .font(`${fontsPath}/Montserrat-Italic.ttf`)
       .text("\nand adheres to NSDA & international food safety & quality management standards.");

    doc.font(`${fontsPath}/Montserrat-Bold.ttf`)
       .fontSize(7)
       .fillColor("#111111")
       .text(`\nStudent Reg No: `, footerTextX, 510, { continued: true })
       .font(`${fontsPath}/Montserrat-Regular.ttf`)
       .text(student.registration_number || student._id);

    doc.font(`${fontsPath}/Montserrat-Bold.ttf`)
       .text(`Manual Verification: `, footerTextX, 525, { continued: true })
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