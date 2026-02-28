import React, { useMemo, useState } from "react";
import { AlertCircle, Wallet, Banknote, History, CreditCard, Loader2, Tags, ReceiptText, ArrowRight, User } from "lucide-react";
import { useCollectPayment, useStudentFinance, useUpdateFeeDiscount } from "../../hooks/useFinance.js";
import EntityForm from "../common/EntityForm";
import { format as dayjs } from "date-fns";

const CollectPaymentModal = ({ isOpen, onClose, studentId, studentName }) => {
  const paymentMutation = useCollectPayment();
  const discountMutation = useUpdateFeeDiscount();
  const { data: financeData, isLoading } = useStudentFinance(studentId);

  const [activeTab, setActiveTab] = useState("payment");

  const feeSummary = financeData?.fee_summary || {};
  const transactions = financeData?.transactions || [];
  const discountHistory = feeSummary?.discount_history || [];
  
  const dueAmount = useMemo(() => {
      return (feeSummary.net_payable || 0) - (feeSummary.paid_amount || 0);
  }, [feeSummary]);

  if (!isOpen) return null;

  // ==========================================
  // CONFIG 1: PAYMENT
  // ==========================================
  const paymentConfig = [
    {
      name: "amount",
      label: "Payment Amount (BDT)",
      type: "number",
      required: true,
      placeholder: `Current Due: ৳${dueAmount.toLocaleString()}`,
      props: { max: dueAmount, min: 1, step: "any" }
    },
    {
      name: "payment_type",
      label: "Category",
      type: "select",
      required: true,
      options: [
        { label: "Installment", value: "Installment" },
        { label: "Admission Fee", value: "Admission Fee" },
        { label: "Other", value: "Other" },
      ],
      defaultOption: "Select Type"
    },
    {
      name: "payment_method",
      label: "Method",
      type: "select",
      required: true,
      options: [
        { label: "Cash", value: "Cash" },
        { label: "Mobile Banking", value: "Mobile Banking" },
        { label: "Bank Transfer", value: "Bank Transfer" },
        { label: "Card", value: "Card" },
      ],
      defaultOption: "Select Method"
    },
    {
      name: "transaction_id",
      label: "TrxID / Reference",
      type: "text",
      placeholder: "e.g. bKash TrxID",
      fullWidth: false
    },
    {
      name: "remarks",
      label: "Remarks",
      type: "textarea",
      placeholder: "Internal notes...",
      fullWidth: true
    }
  ];

  // ==========================================
  // CONFIG 2: ADDITIVE DISCOUNT
  // ==========================================
  const discountConfig = [
    {
      name: "additional_discount", 
      label: "Add Extra Discount Amount (BDT)",
      type: "number",
      required: true,
      placeholder: "e.g. 500",
      props: { min: 1, max: dueAmount, step: "any" } 
    }
  ];

  const handlePaymentSubmit = async (formDataInstance, plainDataObject) => {
    try {
      await paymentMutation.mutateAsync({
        ...plainDataObject,
        fee_record: feeSummary._id, 
        amount: Number(plainDataObject.amount)
      });
    } catch (err) {
      console.error("Payment failed", err);
    }
  };

  const handleDiscountSubmit = async (formDataInstance, plainDataObject) => {
    try {
      const currentTotalDiscount = feeSummary.discount || 0;
      const newlyAddedDiscount = Number(plainDataObject.additional_discount);
      
      const combinedTotalDiscount = currentTotalDiscount + newlyAddedDiscount;

      await discountMutation.mutateAsync({
        feeId: feeSummary._id,
        discount: combinedTotalDiscount 
      });
      setActiveTab("payment"); 
    } catch (err) {
      console.error("Discount update failed", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-6xl h-[90vh] bg-slate-50 shadow-2xl rounded-[2.5rem] flex flex-col overflow-hidden relative">
        
        <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
            <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <Wallet className="text-teal-600" />
                    Financial Ledger
                </h2>
                <p className="text-sm font-bold text-slate-400 mt-1">Managing account for <span className="text-teal-600">{studentName}</span></p>
            </div>
            <button onClick={onClose} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl transition-colors">
                Close Viewer
            </button>
        </div>

        {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p className="font-bold tracking-widest uppercase text-xs">Loading Records...</p>
            </div>
        ) : (
            <div className="flex-1 flex overflow-hidden">
                
                {/* LEFT COLUMN: History & Audits */}
                <div className="w-1/2 border-r border-slate-200 bg-slate-50 flex flex-col p-6 overflow-y-auto no-scrollbar space-y-6">
                    
                    {/* Financial Snapshot */}
                    <div className="grid grid-cols-2 gap-4 shrink-0">
                        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Net Payable</p>
                            <h3 className="text-2xl font-black text-slate-800">৳{feeSummary.net_payable?.toLocaleString()}</h3>
                            {feeSummary.discount > 0 && (
                                <p className="text-xs font-bold text-indigo-600 mt-1 flex items-center gap-1">
                                    <Tags size={12} /> Includes ৳{feeSummary.discount.toLocaleString()} Off
                                </p>
                            )}
                        </div>
                        <div className={`p-5 rounded-3xl border shadow-sm ${dueAmount > 0 ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-emerald-50 border-emerald-100 text-emerald-800'}`}>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Remaining Due</p>
                            <h3 className="text-2xl font-black">৳{dueAmount.toLocaleString()}</h3>
                        </div>
                    </div>

                    {/* PAYMENT HISTORY */}
                    <div className="flex-1 flex flex-col min-h-[250px]">
                        <div className="flex items-center gap-2 mb-3 text-slate-700 shrink-0">
                            <History size={16} />
                            <h3 className="text-sm font-black uppercase tracking-widest">Payment History</h3>
                        </div>
                        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-y-auto no-scrollbar p-2">
                            {transactions.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <Banknote size={32} className="mb-3 opacity-20" />
                                    <p className="text-xs font-bold">No payments recorded.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {transactions.map((txn) => (
                                        <div key={txn._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="text-sm font-black text-slate-700">{txn.payment_type}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 font-mono mt-0.5">{txn.receipt_number}</p>
                                                </div>
                                                <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                                    + ৳{txn.amount.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200/60">
                                                {/* RECEIVED BY / METHOD INFO */}
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                                        {txn.payment_method === 'Cash' ? <Banknote size={14} /> : <CreditCard size={14} />}
                                                        {txn.payment_method}
                                                    </div>
                                                    <p className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
                                                        <User size={10} /> Rcvd By: <span className="text-teal-600">{txn.collected_by?.full_name || "System Admin"}</span>
                                                    </p>
                                                </div>
                                                {/* DATE */}
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
                                                    {dayjs(new Date(txn.createdAt), 'dd MMM yyyy, h:mm a')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DISCOUNT AUDIT TRAIL */}
                    {discountHistory.length > 0 && (
                        <div className="flex-1 flex flex-col min-h-[150px]">
                            <div className="flex items-center gap-2 mb-3 text-indigo-700 shrink-0 mt-2">
                                <Tags size={16} />
                                <h3 className="text-sm font-black uppercase tracking-widest">Discount Audit Trail</h3>
                            </div>
                            <div className="flex-1 bg-white rounded-3xl border border-indigo-100 shadow-sm overflow-y-auto no-scrollbar p-2">
                                <div className="space-y-2">
                                    {discountHistory.map((log, index) => (
                                        <div key={index} className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-50 flex flex-col gap-2">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2 text-sm font-black text-indigo-900">
                                                    <span className="opacity-50 line-through">৳{log.previous_discount.toLocaleString()}</span>
                                                    <ArrowRight size={14} className="text-indigo-400" />
                                                    <span>৳{log.new_discount.toLocaleString()}</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                                                    {dayjs(new Date(log.updated_at), 'dd MMM, h:mm a')}
                                                </span>
                                            </div>
                                            {/* AUTHORIZED BY INFO */}
                                            <p className="flex items-center gap-1 text-[10px] font-bold text-indigo-600/80">
                                                <User size={12} /> Authorized by: <span className="font-black">{log.updated_by?.full_name || "System Admin"}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Forms */}
                <div className="w-1/2 p-6 bg-white overflow-y-auto no-scrollbar relative flex flex-col">
                    <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 shrink-0">
                        <button
                            onClick={() => setActiveTab("payment")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'payment' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <ReceiptText size={16} /> Collect
                        </button>
                        <button
                            onClick={() => setActiveTab("discount")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'discount' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Tags size={16} /> Discount
                        </button>
                    </div>

                    <div className="flex-1 relative">
                        {activeTab === "payment" ? (
                            dueAmount <= 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-emerald-600 bg-emerald-50/50 rounded-3xl border border-emerald-100 mt-8 p-10 text-center">
                                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                                        <Wallet size={32} />
                                    </div>
                                    <h3 className="text-xl font-black">Account Settled</h3>
                                    <p className="text-sm font-bold text-emerald-600/70 mt-2">There is no outstanding balance to collect for this student.</p>
                                </div>
                            ) : (
                                <EntityForm
                                    title="Collect Payment"
                                    subtitle="Generate a new receipt"
                                    config={paymentConfig}
                                    onSubmit={handlePaymentSubmit}
                                    isLoading={paymentMutation.isPending}
                                    onCancel={onClose}
                                    buttonText="Confirm & Issue Receipt"
                                    buttonColor="bg-teal-600 hover:bg-teal-700 shadow-teal-600/20"
                                    initialData={{
                                        payment_type: "Installment",
                                        payment_method: "Cash"
                                    }}
                                />
                            )
                        ) : (
                            <div className="animate-in fade-in zoom-in-95 duration-200">
                                <EntityForm
                                    title="Add Extra Discount"
                                    subtitle={`Course Base Fee: ৳${feeSummary.total_amount?.toLocaleString()}`}
                                    config={discountConfig}
                                    onSubmit={handleDiscountSubmit}
                                    isLoading={discountMutation.isPending}
                                    onCancel={onClose}
                                    buttonText="Apply Extra Discount"
                                    buttonColor="bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
                                />
                                <div className="mt-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex gap-3 text-indigo-800">
                                    <AlertCircle size={20} className="shrink-0 text-indigo-500" />
                                    <div className="text-xs font-bold leading-relaxed space-y-1">
                                        <p>Current Total Scholarship: <span className="font-black text-indigo-600">৳{(feeSummary.discount || 0).toLocaleString()}</span></p>
                                        <p>Entering an amount above will <span className="font-black text-indigo-600">ADD</span> to this existing scholarship and instantly reduce their Remaining Due.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default CollectPaymentModal;