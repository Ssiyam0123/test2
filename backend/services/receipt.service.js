import PDFDocument from "pdfkit";

export const generateReceiptPDF = (data) => {
  return new Promise((resolve, reject) => {
    try {
      // PDF ডকুমেন্ট তৈরি (A4 সাইজ, চারদিকে 50px মার্জিন)
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const buffers = [];

      // ডাটা বাফারে কালেক্ট করা
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // ==========================================
      // 🟢 1. HEADER (Institute Info)
      // ==========================================
      doc.font("Helvetica-Bold").fontSize(24).fillColor("#0f172a").text("CIBD Institute", { align: "center" });
      doc.font("Helvetica").fontSize(10).fillColor("#64748b").text("123 Education Street, Dhaka, Bangladesh", { align: "center" });
      doc.text("Phone: +880 1234 567890 | Web: www.cibdhk.com", { align: "center" });
      doc.moveDown(2);

      // ==========================================
      // 🟢 2. RECEIPT TITLE
      // ==========================================
      doc.font("Helvetica-Bold").fontSize(18).fillColor("#0f172a").text("RECEIPT", 50, 140);
      doc.font("Courier-Bold").fontSize(12).fillColor("#475569").text(`#${data.receipt_number}`, 50, 160);

      // ==========================================
      // 🟢 3. INFO GRID (Billed To & Payment Info)
      // ==========================================
      const topY = 200;

      // Left Column (Student Info)
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#94a3b8").text("BILLED TO", 50, topY);
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#0f172a").text(data.student_name, 50, topY + 15);
      doc.font("Helvetica").fontSize(10).fillColor("#475569").text(`ID: ${data.student_id}`, 50, topY + 35);
      doc.text(`Course: ${data.course_name}`, 50, topY + 50);

      // Right Column (Transaction Info)
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#94a3b8").text("PAYMENT INFO", 350, topY);
      doc.font("Helvetica").fontSize(10).fillColor("#475569").text(`Date: ${data.date}`, 350, topY + 15);
      doc.text(`Method: ${data.payment_method}`, 350, topY + 30);
      if (data.transaction_id) {
        doc.text(`TrxID: ${data.transaction_id}`, 350, topY + 45);
      }

      // ==========================================
      // 🟢 4. TABLE HEADER
      // ==========================================
      const tableY = 290;
      doc.rect(50, tableY, 495, 25).fill("#f8fafc"); // হালকা গ্রে ব্যাকগ্রাউন্ড
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#475569");
      doc.text("DESCRIPTION", 60, tableY + 8);
      doc.text("CATEGORY", 250, tableY + 8);
      doc.text("AMOUNT", 0, tableY + 8, { align: "right", width: 535 }); // ডানপাশে এলাইন

      // ==========================================
      // 🟢 5. TABLE ROW
      // ==========================================
      const rowY = tableY + 35;
      doc.font("Helvetica-Bold").fontSize(12).fillColor("#0f172a");
      doc.text("Course Fee Payment", 60, rowY);
      
      doc.font("Helvetica").fontSize(11).fillColor("#475569").text(data.payment_type, 250, rowY);
      
      doc.font("Helvetica-Bold").fontSize(12).fillColor("#0f172a").text(`BDT ${data.amount}`, 0, rowY, { align: "right", width: 535 });

      // Remarks/Note (If any)
      if (data.remarks) {
        doc.font("Helvetica-Oblique").fontSize(10).fillColor("#64748b").text(`Note: ${data.remarks}`, 60, rowY + 18);
      }

      // ==========================================
      // 🟢 6. TOTAL AMOUNT
      // ==========================================
      const totalY = rowY + 60;
      doc.moveTo(350, totalY).lineTo(545, totalY).stroke("#cbd5e1"); // উপরের দাগ
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#0f172a");
      doc.text("Total Paid:", 350, totalY + 15);
      doc.text(`BDT ${data.amount}`, 0, totalY + 15, { align: "right", width: 535 });

      // ==========================================
      // 🟢 7. SIGNATURES
      // ==========================================
      const signY = 650;
      
      // Student Signature Line
      doc.moveTo(50, signY).lineTo(200, signY).stroke("#cbd5e1");
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#64748b").text("Student Signature", 50, signY + 10, { width: 150, align: "center" });

      // Authority Signature Line
      doc.moveTo(395, signY).lineTo(545, signY).stroke("#cbd5e1");
      doc.text("Authorized Signatory", 395, signY + 10, { width: 150, align: "center" });
      doc.font("Helvetica").fontSize(8).text(`(${data.collected_by})`, 395, signY + 25, { width: 150, align: "center" });

      // ==========================================
      // 🟢 8. FOOTER
      // ==========================================
      doc.font("Helvetica").fontSize(9).fillColor("#94a3b8").text("This is a computer-generated receipt and does not require a physical signature.", 50, 750, { align: "center" });
      doc.text("Thank you for learning with us!", 50, 765, { align: "center" });

      // ড্র করা শেষ, ডকুমেন্ট ক্লোজ করে বাফারে পাঠিয়ে দাও
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};