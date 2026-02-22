import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { X, Download, User } from "lucide-react";
import { apiURL } from "../../Constant.js";

const IMAGE_URL = apiURL.image_url;
const BASE_URL = apiURL.fontend_url;

const EmployeeQRCodeModal = ({ employee, onClose }) => {
  const modalRef = useRef(null);

  if (!employee) return null;

  // The public URL the QR code will direct to when scanned
  const scanUrl = `${BASE_URL}/employee/${employee._id}`;

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${IMAGE_URL}${url}`;
  };

  // Extracts the Canvas element and triggers a direct image download of the QR
  const handleDownloadQR = () => {
    const canvas = modalRef.current?.querySelector("canvas");
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${employee.employee_id}_QRCode.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#000c1d]/80 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-300">
      
      {/* Close Button (Floating outside the card) */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 md:top-10 md:right-10 text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors"
      >
        <X size={28} />
      </button>

      {/* ID Card Wrapper */}
      <div 
        ref={modalRef}
        className="bg-white w-[320px] rounded-[1.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 flex flex-col"
      >
        {/* Top Banner / Lanyard Area */}
        <div className="bg-gradient-to-b from-[#EC1B23] to-[#cc141b] h-28 w-full relative flex flex-col items-center pt-4">
          {/* Faux Lanyard Slot */}
          <div className="w-14 h-2.5 bg-black/20 rounded-full shadow-inner mb-3"></div>
          <h2 className="text-white font-black tracking-widest text-sm uppercase opacity-90">
            Staff Identity Card
          </h2>
        </div>

        {/* Profile Image (Overlapping the banner) */}
        <div className="flex justify-center -mt-12 relative z-10">
          <div className="w-28 h-28 bg-white rounded-full p-1.5 shadow-md">
            {employee.photo_url ? (
              <img 
                src={getImageUrl(employee.photo_url)} 
                alt={employee.full_name}
                className="w-full h-full rounded-full object-cover border border-gray-100"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center border border-gray-100">
                <User size={40} className="text-slate-400" />
              </div>
            )}
          </div>
        </div>

        {/* Employee Details */}
        <div className="text-center px-6 mt-3 pb-5 flex-1">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">
            {employee.full_name}
          </h3>
          <p className="text-[#EC1B23] font-bold text-sm mt-1 uppercase tracking-wide">
            {employee.designation}
          </p>
          <p className="text-gray-500 text-xs mt-0.5 font-medium">
            {employee.department} Department
          </p>
        </div>

        {/* Bottom Section (QR & ID Number) */}
        <div className="bg-slate-50 border-t border-gray-100 p-6 flex flex-col items-center">
          <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-200 mb-4 group">
            <QRCodeCanvas 
              value={scanUrl} 
              size={120} 
              level="H" 
              includeMargin={false} 
              className="rounded-lg" 
            />
          </div>
          
          <div className="text-center w-full">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-0.5">
              Employee ID
            </p>
            <div className="bg-gray-200/50 py-1.5 rounded-md text-gray-800 font-mono font-bold tracking-wider text-sm">
              {employee.employee_id}
            </div>
          </div>
        </div>
      </div>

      {/* Action Area (Outside the card) */}
      <div className="mt-8 flex gap-4">
        <button 
          onClick={handleDownloadQR} 
          className="px-6 py-3 bg-white text-gray-900 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-100 shadow-lg transition-transform active:scale-95"
        >
          <Download size={18} /> Download QR
        </button>
      </div>

    </div>
  );
};

export default EmployeeQRCodeModal;