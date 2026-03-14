import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateCertificateBuffer = (student, awardedOnDate = null) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margin: 0,
      });

      // মেমোরিতে (Buffer) ডাটা সেভ করা
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      const fontsPath = path.join(__dirname, "../assets/fonts");
      const imagesPath = path.join(__dirname, "../assets/images");

      // Backgrounds & Corners
      doc.image(`${imagesPath}/WavesBackground.png`, 0, 0, { width: 842, height: 595 });
      doc.image(`${imagesPath}/GoldCorners.png`, 0, 0, { width: 842, height: 595 });
      doc.image(`${imagesPath}/SealSignature.png`, 0, 0, { width: 842, height: 595 });

      // Logo
      const logoWidth = 540; 
      const logoX = (842 / 2) - (logoWidth / 2);
      const logoY = 190; 
      
      if (fs.existsSync(path.join(imagesPath, "logo.png"))) {
        doc.image(`${imagesPath}/logo.png`, logoX, logoY, { width: logoWidth });
      }

      // Border Outline
      doc.lineWidth(2).strokeColor("#bd9b5e").rect(20, 20, 802, 555).stroke();

      // Headers
      doc.font(`${fontsPath}/Cinzel-Bold.ttf`).fontSize(19).fillColor("#111111")
         .text("THE CULINARY INSTITUTE OF BANGLADESH", 0, 50, { align: "center", characterSpacing: 1.5 });

      doc.font(`${fontsPath}/Montserrat-SemiBold.ttf`).fontSize(10).fillColor("#555555")
         .text(`Registration No: STP-DHA-003244`, 0, 75, { align: "center" });

      doc.font(`${fontsPath}/GreatVibes-Regular.ttf`).fontSize(22).fillColor("#444444")
         .text("Excellence in culinary training, certified with pride", 0, 90, { align: "center" });

      doc.font(`${fontsPath}/Cinzel-Bold.ttf`).fontSize(60).fillColor("#111111")
         .text("CERTIFICATE", 0, 135, { align: "center", characterSpacing: 10 });

      doc.font(`${fontsPath}/Montserrat-Regular.ttf`).fontSize(17).fillColor("#c5a059")
         .text("OF ACHIEVEMENT", 0, 200, { align: "center", characterSpacing: 8 });

      // Student Info
      doc.font(`${fontsPath}/Montserrat-SemiBold.ttf`).fontSize(10).fillColor("#333333")
         .text("THIS CERTIFICATE IS PROUDLY GIVEN TO", 0, 250, { align: "center", characterSpacing: 2 });

      doc.font(`${fontsPath}/GreatVibes-Regular.ttf`).fontSize(85).fillColor("#111111")
         .text(student.student_name, 0, 265, { align: "center" });

      // Gold Divider Line
      doc.lineWidth(1.5).strokeColor("#c5a059").moveTo(180, 370).lineTo(662, 370).stroke();

      doc.font(`${fontsPath}/Montserrat-Regular.ttf`).fontSize(12).fillColor("#333333")
         .text("In recognition of accomplishment and demonstrated excellence in the culinary arts.", 0, 390, { align: "center" });

      doc.font(`${fontsPath}/Montserrat-Bold.ttf`).fontSize(18).fillColor("#111111")
         .text(student.course_name, 0, 415, { align: "center" });

      // Dynamic Date Processing
      const d = new Date(awardedOnDate || student.issue_date || Date.now());
      const issueDate = `Awarded on ${d.getDate()} ${d.toLocaleDateString("en-GB", { month: "long" })} ${d.getFullYear()}`;

      doc.font(`${fontsPath}/Montserrat-MediumItalic.ttf`).fontSize(12).fillColor("#555555")
         .text(issueDate, 0, 440, { align: "center" });

      // QR Code
      const studentUrl = `https://verification.cibdhk.com/student/${student._id}`;
      const qrCodeDataUrl = await QRCode.toDataURL(studentUrl, { margin: 0, width: 150 });
      
      const qrX = 60, qrSize = 55, footerY = 485, textX = qrX + qrSize + 15;
      
      doc.image(qrCodeDataUrl, qrX, footerY, { width: qrSize });
      doc.lineWidth(0.5).strokeColor("#bd9b5e").rect(qrX, footerY, qrSize, qrSize).stroke();

      // Footer Text
      let textY = footerY;
      doc.font(`${fontsPath}/Montserrat-Regular.ttf`).fontSize(7).fillColor("#333333")
         .text("This academy is accredited by the ", textX, textY, { continued: true })
         .font(`${fontsPath}/Montserrat-Bold.ttf`).text("National");
      
      textY += 10;
      doc.font(`${fontsPath}/Montserrat-Bold.ttf`).text("Skills Development Authority (NSDA)", textX, textY);
      textY += 10;
      doc.font(`${fontsPath}/Montserrat-Regular.ttf`).text("and adheres to NSDA & international food", textX, textY);
      textY += 10;
      doc.font(`${fontsPath}/Montserrat-Regular.ttf`).text("safety & quality management standards.", textX, textY);

      textY += 15;
      doc.font(`${fontsPath}/Montserrat-Bold.ttf`).fillColor("#111111")
         .text(`Student Reg No: `, textX, textY, { continued: true })
         .font(`${fontsPath}/Montserrat-Regular.ttf`).text(student.registration_number || student._id);

      textY += 10;
      doc.font(`${fontsPath}/Montserrat-Bold.ttf`).text(`Manual Verification: `, textX, textY, { continued: true })
         .font(`${fontsPath}/Montserrat-Regular.ttf`).text("contact@cibdhk.com | www.cibdhk.com");

      // Finalize PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};