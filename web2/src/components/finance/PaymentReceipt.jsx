import React, { useRef } from "react";
import { Printer, X, Download } from "lucide-react";
import { format } from "date-fns";

export default function PaymentReceipt({ txn, studentName, studentId, courseName, onClose }) {
  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank", "width=900,height=700");

    // 🚀 INDUSTRY STANDARD PRINT TEMPLATE (Pure CSS for perfect printing)
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${txn.receipt_number}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
            body { font-family: 'Inter', sans-serif; color: #1e293b; margin: 0; padding: 40px; background: #fff; }
            .receipt-box { max-width: 700px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 8px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px; }
            .brand h1 { margin: 0; font-size: 24px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; }
            .brand p { margin: 4px 0 0; font-size: 12px; color: #64748b; }
            .title h2 { margin: 0; font-size: 28px; font-weight: 800; color: #0f172a; text-align: right; text-transform: uppercase; letter-spacing: 2px; }
            .title p { margin: 4px 0 0; font-size: 12px; color: #64748b; text-align: right; font-family: monospace; }
            .info-grid { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .info-block { font-size: 13px; line-height: 1.6; }
            .info-block strong { color: #334155; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .table th { background-color: #f8fafc; padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #475569; border-bottom: 2px solid #e2e8f0; }
            .table td { padding: 16px 12px; font-size: 14px; border-bottom: 1px solid #e2e8f0; }
            .table .right { text-align: right; }
            .summary { display: flex; justify-content: flex-end; margin-top: 20px; }
            .summary-box { width: 300px; }
            .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #475569; }
            .summary-row.total { font-size: 20px; font-weight: 800; color: #0f172a; border-top: 2px solid #1e293b; padding-top: 12px; margin-top: 4px; }
            .signatures { display: flex; justify-content: space-between; margin-top: 80px; }
            .sign-line { width: 200px; border-top: 1px solid #cbd5e1; text-align: center; padding-top: 8px; font-size: 12px; color: #64748b; font-weight: 600; }
            .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
            @media print { 
              body { padding: 0; } 
              .receipt-box { border: none; padding: 0; max-width: 100%; } 
            }
          </style>
        </head>
        <body>
          <div class="receipt-box">${printContent}</div>
          <script>window.onload = function() { setTimeout(() => { window.print(); window.close(); }, 300); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const formattedDate = txn?.createdAt ? format(new Date(txn.createdAt), "dd MMM, yyyy - hh:mm a") : format(new Date(), "dd MMM, yyyy");

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-8 animate-in zoom-in-95 duration-300">
      
      {/* Action Bar */}
      <div className="w-full max-w-3xl flex justify-end gap-3 mb-4">
        <button onClick={handlePrint} className="px-6 py-2.5 bg-teal-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-teal-700 transition-all flex items-center gap-2 shadow-lg shadow-teal-600/20">
          <Printer size={16} /> Print / Save PDF
        </button>
        <button onClick={onClose} className="p-2.5 bg-white/10 hover:bg-rose-500 text-white rounded-xl transition-all">
          <X size={20} />
        </button>
      </div>

      {/* 🚀 THE RECEIPT PREVIEW (This UI mirrors the Print CSS above) */}
      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-2xl overflow-y-auto max-h-[80vh] custom-scrollbar">
        <div ref={printRef} className="p-8 sm:p-12">
          
          {/* Header */}
          <div className="header">
            <div className="brand">
              <h1>CIBD Institute</h1>
              <p>123 Education Street, Dhaka, Bangladesh</p>
              <p>Phone: +880 1234 567890 | Web: www.cibdhk.com</p>
            </div>
            <div className="title">
              <h2>RECEIPT</h2>
              <p>#${txn.receipt_number}</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="info-grid">
            <div className="info-block">
              <strong>Billed To</strong>
              <div style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>{studentName}</div>
              {studentId && <div>Student ID: {studentId}</div>}
              {courseName && <div style={{ marginTop: "4px", color: "#64748b" }}>Course: {courseName}</div>}
            </div>
            <div className="info-block" style={{ textAlign: "right" }}>
              <strong>Payment Info</strong>
              <div>Date: {formattedDate}</div>
              <div>Method: {txn.payment_method}</div>
              {txn.transaction_id && <div>TrxID: {txn.transaction_id}</div>}
            </div>
          </div>

          {/* Table */}
          <table className="table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="right">Category</th>
                <th className="right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style={{ fontWeight: "600", color: "#0f172a" }}>Course Fee Payment</div>
                  {txn.remarks && <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Note: {txn.remarks}</div>}
                </td>
                <td className="right">{txn.payment_type}</td>
                <td className="right" style={{ fontWeight: "600" }}>৳{txn.amount?.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          {/* Summary */}
          <div className="summary">
            <div className="summary-box">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>৳{txn.amount?.toLocaleString()}</span>
              </div>
              <div className="summary-row total">
                <span>Total Paid</span>
                <span>৳{txn.amount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="signatures">
            <div className="sign-line">Student Signature</div>
            <div className="sign-line">Authorized Signatory<br/><span style={{fontSize: "10px", fontWeight: "normal", color: "#94a3b8"}}>({txn.collected_by?.full_name || "System Admin"})</span></div>
          </div>

          {/* Footer */}
          <div className="footer">
            This is a computer-generated receipt and does not require a physical signature. <br/>
            Thank you for learning with us!
          </div>

        </div>
      </div>
    </div>
  );
}