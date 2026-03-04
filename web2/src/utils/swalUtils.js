import Swal from 'sweetalert2';

/**
 * 🚀 Reusable Delete Confirmation Alert
 * @param {string} title - Alert Title
 * @param {string} text - Alert Description
 * @param {string} confirmText - Button text
 * @param {function} onConfirm - Callback function to execute on confirmation
 */
export const confirmDelete = ({
  title = "Are you sure?",
  text = "You won't be able to revert this action!",
  confirmText = "Yes, delete it!",
  onConfirm,
}) => {
  Swal.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
    reverseButtons: true, 
    buttonsStyling: false, 
    customClass: {
      popup: 'rounded-[2rem] border border-slate-100 shadow-2xl p-6',
      title: 'text-2xl font-black text-slate-800 tracking-tight mt-4',
      htmlContainer: 'text-sm font-semibold text-slate-500 mt-2',
      icon: 'border-rose-500 text-rose-500 mt-4',
      actions: 'w-full flex justify-center gap-4 mt-8',
      confirmButton: 'bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-8 py-3 text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-500/30 active:scale-95',
      cancelButton: 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-xl px-8 py-3 text-sm font-black uppercase tracking-widest transition-all active:scale-95'
    }
  }).then((result) => {
    if (result.isConfirmed && onConfirm) {
      onConfirm(); // ইউজার Yes চাপলে তোর ফাংশন ফায়ার হবে
    }
  });
};