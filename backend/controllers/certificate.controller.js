import Student from "../models/student.js";
import { generateCertificateBuffer } from "../services/certificate.service.js";
import nodemailer from "nodemailer";
import { getCertificateEmailTemplate } from "../utils/emailTemplates.js"; 
import "dotenv/config";

// 🟢 1. PDF Download Controller
export const downloadCertificatePDF = async (req, res) => {
  try {
    const { awardedOn } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const pdfBuffer = await generateCertificateBuffer(student, awardedOn);
    const safeName = student.student_name.replace(/[^a-zA-Z0-9]/g, "_");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=CIB_Certificate_${safeName}.pdf`,
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).json({ message: "Failed to generate certificate" });
  }
};

export const sendCertificateEmail = async (req, res) => {
  try {
    const { email, awardedOn } = req.body;
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    if (!email) {
      return res.status(400).json({ success: false, message: "Recipient email is required" });
    }

    const pdfBuffer = await generateCertificateBuffer(student, awardedOn);
    const safeName = student.student_name.replace(/[^a-zA-Z0-9]/g, "_");

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: true, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 10000, 
    });

    const htmlContent = getCertificateEmailTemplate(student); 

    // 5. Mail Options
    const mailOptions = {
      from: `"Culinary Institute of Bangladesh" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Official Certificate - ${student.student_name}`,
      html: htmlContent,
      attachments: [
        {
          filename: `CIB_Certificate_${safeName}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log("✅ Email sent: %s", info.messageId);

    return res.status(200).json({ 
      success: true, 
      message: "Certificate sent successfully!",
      messageId: info.messageId 
    });

  } catch (error) {
    console.error("❌ Email Sending Error:", error.message);
    
    return res.status(500).json({ 
      success: false, 
      message: "Failed to send email.",
      error: process.env.NODE_ENV === "development" ? error.message : "SMTP Configuration Error"
    });
  }
};