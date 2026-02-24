// components/QRCodeModal.jsx
import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { X, Download, User, Hash, BookOpen } from "lucide-react";
import { apiURL } from "../../../Constant.js";

const IMAGE_URL = apiURL.image_url;
const BASE_URL = apiURL.fontend_url;

const QRCodeModal = ({ student, onClose }) => {
  const modalRef = useRef(null);

  if (!student) return null;

  // The URL the QR code will direct to when scanned
  const scanUrl = `${BASE_URL}/student/${student._id}`;

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${IMAGE_URL}${url}`;
  };

  // Extracts the Canvas element and triggers a direct image download
  const handleDownloadQR = () => {
    const canvas = modalRef.current?.querySelector("canvas");
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${student.student_id}_QRCode.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#000c1d]/70 backdrop-blur-md p-4 transition-all animate-in fade-in duration-300">
      
      {/* Modal Container */}
      <div 
        ref={modalRef}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative animate-in zoom-in-95 duration-300"
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#EC1B23] to-[#FF3D3D] p-4 flex justify-between items-center">
          <h3 className="text-white font-black tracking-widest uppercase text-sm flex items-center gap-2">
            Student Identity QR
          </h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 flex flex-col items-center">
          
          {/* QR Code Container */}
          <div className="bg-white p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 mb-6 group">
            <QRCodeCanvas
              value={scanUrl}
              size={180}
              level="H"
              includeMargin={true}
              className="rounded-xl"
            />
          </div>

          {/* Student Quick Info */}
          <div className="w-full space-y-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3">
              {student.photo_url ? (
                <img 
                  src={getImageUrl(student.photo_url)} 
                  alt={student.student_name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User size={20} className="text-blue-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {student.student_name}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                  <Hash size={12} />
                  <span className="font-mono">{student.student_id}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3 flex items-start gap-2">
              <BookOpen size={14} className="text-gray-400 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-600 font-medium leading-tight">
                {student.course_name}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleDownloadQR}
            className="w-full mt-6 py-3.5 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors active:scale-[0.98]"
          >
            <Download size={18} />
            Download QR Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;