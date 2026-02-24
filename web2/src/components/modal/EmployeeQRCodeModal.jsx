import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { X, Download, User } from "lucide-react";
import { apiURL } from "../../../Constant.js";

// Import your background image here or use a public path
import IDBackground from "../../assets/id-bg.png"; 
import Logo from "/logo.png"; // Assuming you have the logo file

const IMAGE_URL = apiURL.image_url;
const BASE_URL = apiURL.fontend_url;

const EmployeeQRCodeModal = ({ employee, onClose }) => {
  const modalRef = useRef(null);

  if (!employee) return null;

  const scanUrl = `${BASE_URL}/employee/${employee._id}`;

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${IMAGE_URL}${url}`;
  };

  const handleDownloadQR = () => {
    const canvas = modalRef.current?.querySelector("canvas");
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${employee.employee_id}_ID_Card.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all animate-in fade-in duration-300">
      
      {/* Close Button */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 text-white hover:bg-white/20 p-2 rounded-full transition-colors"
      >
        <X size={28} />
      </button>

      {/* ID Card Wrapper */}
      <div 
        ref={modalRef}
        className="bg-white w-[380px] h-[640px] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 flex flex-col"
        style={{
          backgroundImage: `url(${IDBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Top Header Section */}
        <div className="pt-12 px-8 flex items-center gap-3">
          <img src={Logo} alt="CIB Logo" className="w-16 h-16 object-contain" />
          <div className="text-left">
            <h2 className="text-[17px] font-bold text-gray-900 leading-tight">
              The Culinary Institute <br /> of Bangladesh (CIB)
            </h2>
          </div>
        </div>

        {/* Profile Image Section */}
        <div className="flex justify-center mt-12">
          <div className="w-44 h-44 rounded-full overflow-hidden border-[6px] border-gray-200/50 shadow-xl bg-slate-100">
            {employee.photo_url ? (
              <img 
                src={getImageUrl(employee.photo_url)} 
                alt={employee.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={60} className="text-slate-400" />
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="text-center mt-8 px-4">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {employee.full_name}
          </h1>
          <div className="mt-2 space-y-1">
            <p className="text-lg font-medium text-gray-700 leading-tight">
              {employee.designation}
            </p>
            <p className="text-md text-gray-600 font-normal italic">
              {employee.department} Department
            </p>
          </div>
        </div>

        {/* QR Code & ID Footer */}
        <div className="absolute bottom-16 left-0 right-0 flex flex-col items-center">
          <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
            <QRCodeCanvas 
              value={scanUrl} 
              size={100} 
              level="H" 
              includeMargin={false} 
            />
          </div>
          <div className="mt-4 flex flex-col items-center">
             <span className="text-[12px] font-bold text-gray-500 uppercase tracking-[0.2em]">
               ID: {employee.employee_id}
             </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-10">
        <button 
          onClick={handleDownloadQR} 
          className="px-8 py-3 bg-[#EC1B23] text-white rounded-full font-bold flex items-center gap-3 hover:bg-[#cc141b] shadow-xl transition-all active:scale-95"
        >
          <Download size={20} /> Export ID Card
        </button>
      </div>
    </div>
  );
};

export default EmployeeQRCodeModal;