import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, Receipt, CreditCard, CheckCircle2, CircleDollarSign, Banknote, User, Tags, Download, Loader2 } from "lucide-react";
import { useStudentFinance, useDownloadReceipt } from "../../hooks/useFinance"; // 🚀 Added useDownloadReceipt
import CollectPaymentModal from "../../components/modal/CollectPaymentModal";
import Loader from "../../components/Loader";
import Avatar from "../../components/common/Avatar";
import { format } from "date-fns";

export default function StudentFinance() {
  const { id: studentId } = useParams();
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeHistoryTab, setActiveHistoryTab] = useState("payments"); 

  const { data, isLoading, error } = useStudentFinance(studentId);
  const { mutate: downloadReceipt, isPending: isDownloading } = useDownloadReceipt(); // 🚀 Backend PDF Hook
  const [downloadingTxnId, setDownloadingTxnId] = useState(null); // To track which button is spinning

  const handleDownload = (txnId) => {
    setDownloadingTxnId(txnId);
    downloadReceipt(txnId, {
      onSettled: () => setDownloadingTxnId(null)
    });
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader /></div>;
  if (error || !data) return <div className="p-10 text-center text-rose-500 font-bold">Failed to load student finance data.</div>;

  const { fee_summary, transactions } = data;
  const discountHistory = fee_summary.discount_history || [];
  const dueAmount = fee_summary.net_payable - fee_summary.paid_amount;
  const isFullyPaid = fee_summary.status === "Paid" || dueAmount <= 0;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen font-sans animate-in fade-in duration-500">
      
      {/* 🟢 HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-teal-600 shadow-sm transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Student Account</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Fee Collection & Ledger</p>
          </div>
        </div>

        <button 
          onClick={() => setIsPaymentModalOpen(true)}
          disabled={isFullyPaid}
          className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            isFullyPaid ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed" : "bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-600/20"
          }`}
        >
          {isFullyPaid ? <CheckCircle2 size={16} /> : <Wallet size={16} />}
          {isFullyPaid ? "Fully Paid" : "Collect Payment / Discount"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 🟢 LEFT: STUDENT PROFILE & OVERVIEW */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center">
            <div className="mb-4">
              <Avatar src={fee_summary.student?.photo_url} alt={fee_summary.student?.student_name} fallbackText={fee_summary.student?.student_name} sizeClass="w-24 h-24" className="border-4 border-white shadow-md mx-auto" />
            </div>
            <h2 className="text-lg font-black text-slate-800">{fee_summary.student?.student_name}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{fee_summary.student?.student_id}</p>
            <div className="mt-4 inline-block px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase">
              {fee_summary.course?.course_name}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 text-white/5 pointer-events-none"><Wallet size={150} /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">Net Payable</p>
            <h3 className="text-3xl font-black mb-6 relative z-10">৳{fee_summary.net_payable.toLocaleString()}</h3>

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                <span className="text-xs font-bold text-emerald-300">Total Paid</span>
                <span className="text-sm font-black text-emerald-400">৳{fee_summary.paid_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                <span className="text-xs font-bold text-rose-300">Current Due</span>
                <span className="text-sm font-black text-rose-400">৳{dueAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🟢 RIGHT: HISTORY (TABS FOR PAYMENTS AND DISCOUNTS) */}
        <div className="lg:col-span-2 flex flex-col">
          
          <div className="flex bg-slate-200/50 p-1.5 rounded-[1.5rem] mb-4 w-fit">
            <button 
              onClick={() => setActiveHistoryTab("payments")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeHistoryTab === "payments" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              <Receipt size={16} /> Payments
            </button>
            <button 
              onClick={() => setActiveHistoryTab("discounts")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeHistoryTab === "discounts" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              <Tags size={16} /> Discounts
            </button>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm flex-1 flex flex-col overflow-hidden min-h-[500px]">
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              
              {/* TAB CONTENT: PAYMENTS */}
              {activeHistoryTab === "payments" && (
                transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60 py-10">
                     <CreditCard size={48} className="mb-4" />
                     <p className="text-xs font-black uppercase tracking-widest">No payments recorded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map(txn => {
                      const isThisDownloading = downloadingTxnId === txn._id;
                      
                      return (
                      <div key={txn._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-slate-100 bg-white hover:border-teal-100 hover:shadow-md transition-all gap-4 group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                            <CircleDollarSign size={20} />
                          </div>
                          <div>
                            <h4 className="text-base font-black text-slate-800">৳{txn.amount.toLocaleString()}</h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">{txn.payment_method}</span>
                              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                {txn.payment_method === "Cash" ? <Banknote size={10} /> : <CreditCard size={10} />}
                                {format(new Date(txn.createdAt), "dd MMM yyyy, hh:mm a")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl flex-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Receipt No.</p>
                            <p className="text-xs font-bold text-slate-700 font-mono mt-0.5">{txn.receipt_number}</p>
                            <p className="text-[9px] font-bold text-slate-400 mt-1 flex items-center gap-1 sm:justify-end">
                               <User size={10}/> By: {txn.collected_by?.full_name || "System"}
                            </p>
                          </div>
                          
                          {/* 🚀 DOWNLOAD PDF BUTTON */}
                          <button
                            onClick={() => handleDownload(txn._id)}
                            disabled={isDownloading}
                            className="p-3 bg-slate-50 hover:bg-teal-50 text-slate-400 hover:text-teal-600 rounded-xl border border-slate-200 transition-all shadow-sm shrink-0"
                            title="Download PDF Receipt"
                          >
                            {isThisDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                          </button>
                        </div>
                      </div>
                    )})}
                  </div>
                )
              )}

              {/* TAB CONTENT: DISCOUNTS */}
              {activeHistoryTab === "discounts" && (
                discountHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60 py-10">
                     <Tags size={48} className="mb-4" />
                     <p className="text-xs font-black uppercase tracking-widest">No discount history.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 mb-6 text-center">
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Original Course Fee</p>
                       <h4 className="text-lg font-black text-indigo-700 mt-1">৳{fee_summary.total_amount?.toLocaleString()}</h4>
                    </div>

                    {discountHistory.map((d, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Tags size={16} />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-800">
                              Total Discount Updated: <span className="text-indigo-600">৳{d.new_discount.toLocaleString()}</span>
                            </h4>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                              Previous: ৳{d.previous_discount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-bold text-slate-400">{format(new Date(d.updated_at), "dd MMM yyyy, hh:mm a")}</p>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">By: {d.updated_by?.full_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

            </div>
          </div>
        </div>

      </div>

      {/* 🚀 PAYMENT MODAL */}
      {isPaymentModalOpen && (
        <CollectPaymentModal 
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          studentId={studentId}
          studentName={fee_summary.student?.student_name}
        />
      )}
    </div>
  );
}