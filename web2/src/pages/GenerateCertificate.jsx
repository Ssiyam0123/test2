import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// 1. CHANGED THIS IMPORT FROM QRCodeCanvas to QRCodeSVG
import { QRCodeSVG } from "qrcode.react"; 
import { Download, ArrowLeft, Loader2 } from "lucide-react";
import { useStudent } from "../hooks/useStudents.js";
import LogoLoader from "../components/LogoLoader.jsx";
import { apiURL } from "../../Constant.js";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const GenerateCertificate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);
  const scaleWrapperRef = useRef(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0); 
  const [layersReady, setLayersReady] = useState(false);
  const [bgLayers, setBgLayers] = useState({
    waves: null,
    corners: null,
    sealSig: null,
  });

  const {
    data: studentResponse,
    isLoading,
    isError,
  } = useStudent(id, { enabled: !!id });
  const student = studentResponse?.data || studentResponse;

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Great+Vibes&family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const loadLayer = (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = src;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 2000;
          canvas.height = 1414;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, 2000, 1414);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => {
          console.warn(`Missing asset: ${src}`);
          resolve(null);
        };
      });

    Promise.all([
      loadLayer("/WavesBackground.png"), 
      loadLayer("/GoldCorners.png"), 
      loadLayer("/Seal&SignatureBlock.png"), 
    ]).then(([waves, corners, sealSig]) => {
      setBgLayers({ waves, corners, sealSig });
      setLayersReady(true);
    });

    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    const scaleToFit = () => {
      if (!scaleWrapperRef.current) return;
      const certWidth = 2000;
      const certHeight = 1414;
      const windowWidth = window.innerWidth - 40;
      const windowHeight = window.innerHeight - 120;

      const scale = Math.min(
        windowWidth / certWidth,
        windowHeight / certHeight,
      );
      scaleWrapperRef.current.style.transform = `scale(${scale < 1 ? scale : 1})`;
    };

    if (student && layersReady) {
      scaleToFit();
      window.addEventListener("resize", scaleToFit);
    }
    return () => window.removeEventListener("resize", scaleToFit);
  }, [student, layersReady]);

  if (isLoading || !layersReady) return <LogoLoader />;
  if (isError || !student) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800">
          Certificate Not Found
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-blue-600 hover:underline text-sm font-bold uppercase"
        >
          Go Back
        </button>
      </div>
    );
  }

  const studentUrl = `${apiURL.fontend_url}/student/${student._id}`;

  const getDaySuffix = (day) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1: return "st"; case 2: return "nd"; case 3: return "rd"; default: return "th";
    }
  };

  const d = new Date(student.issue_date || Date.now());
  const issueDate = `Awarded on ${d.getDate()}${getDaySuffix(d.getDate())} ${d.toLocaleDateString("en-GB", { month: "long" })} ${d.getFullYear()}`;

  const downloadPDF = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 90) return 90; 
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 150);

    try {
      await document.fonts.ready;

      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 2000,
        windowHeight: 1414,
        scrollY: 0, 
        scrollX: 0,
      });

      setGenerationProgress(95); 

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      pdf.addImage(imgData, "JPEG", 0, 0, 297, 210);

      const safeName = student.student_name.replace(/[^a-zA-Z0-9]/g, "_");
      pdf.save(`CIB_Certificate_${safeName}.pdf`);
      
      setGenerationProgress(100); 
    } catch (error) {
      console.error("PDF Generation Failed: ", error);
      alert("Failed to generate the PDF.");
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
      }, 500); 
    }
  };

  const CertificateLayout = () => (
    <div
      style={{
        width: "2000px",
        height: "1414px",
        position: "relative",
        backgroundColor: "white",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50px",
          left: "50px",
          right: "50px",
          bottom: "50px",
          border: "5px solid #bd9b5e",
          zIndex: 6,
          pointerEvents: "none",
        }}
      ></div>

      {bgLayers.waves && (
        <img src={bgLayers.waves} alt="waves" style={{ position: "absolute", top: 0, left: 0, width: "2000px", height: "1414px", zIndex: 1 }} />
      )}
      {bgLayers.corners && (
        <img src={bgLayers.corners} alt="corners" style={{ position: "absolute", top: 0, left: 0, width: "2000px", height: "1414px", zIndex: 5 }} />
      )}
      {bgLayers.sealSig && (
        <img src={bgLayers.sealSig} alt="seal" style={{ position: "absolute", top: 0, left: 0, width: "2000px", height: "1414px", zIndex: 3 }} />
      )}

      <div
        style={{
          position: "absolute",
          top: "150px",
          left: 0,
          width: "2000px",
          textAlign: "center",
          fontFamily: "'Cinzel', serif",
          fontSize: "40px",
          fontWeight: "700",
          color: "#222",
          zIndex: 10,
          letterSpacing: "2px",
        }}
      >
        THE CULINARY INSTITUTE OF BANGLADESH
      </div>
      <div
        style={{
          position: "absolute",
          top: "210px",
          left: 0,
          width: "2000px",
          textAlign: "center",
          fontFamily: "'Montserrat', sans-serif",
          fontSize: "20px",
          fontWeight: "600",
          color: "#555",
          zIndex: 10,
        }}
      >
        Registration No: STP-DHA-003244
      </div>
      <div
        style={{
          position: "absolute",
          top: "250px",
          left: 0,
          width: "2000px",
          textAlign: "center",
          fontFamily: "'Great Vibes', cursive",
          fontSize: "40px",
          color: "#444",
          zIndex: 10,
        }}
      >
        Excellence in culinary training, certified with pride
      </div>

      <div
        style={{
          position: "absolute",
          top: "260px",
          left: 0,
          width: "2000px",
          textAlign: "center",
          fontFamily: "'Cinzel', serif",
          fontSize: "120px",
          color: "#111",
          zIndex: 10,
          letterSpacing: "15px",
        }}
      >
        CERTIFICATE
      </div>
      <div
        style={{
          position: "absolute",
          top: "440px",
          left: 0,
          width: "2000px",
          textAlign: "center",
          fontFamily: "'Cinzel', serif",
          fontSize: "40px",
          color: "#c5a059",
          zIndex: 10,
          letterSpacing: "12px",
        }}
      >
        OF ACHIEVEMENT
      </div>

      <div
        style={{
          position: "absolute",
          top: "550px",
          left: 0,
          width: "2000px",
          textAlign: "center",
          fontFamily: "'Montserrat', sans-serif",
          fontSize: "22px",
          fontWeight: "500",
          color: "#333",
          zIndex: 10,
          letterSpacing: "3px",
        }}
      >
        THIS CERTIFICATE IS PROUDLY GIVEN TO
      </div>

      <div
        style={{
          position: "absolute",
          top: "530px",
          left: 0,
          width: "2000px",
          textAlign: "center",
          fontFamily: "'Great Vibes', cursive",
          fontSize: "170px",
          lineHeight: "1",
          color: "#111",
          zIndex: 10,
        }}
      >
        {student.student_name}
      </div>

      <div
        style={{
          position: "absolute",
          top: "800px",
          left: "250px",
          width: "1500px",
          height: "2px",
          backgroundColor: "#c5a059",
          zIndex: 5,
        }}
      ></div>

      <div
        style={{
          position: "absolute",
          top: "850px",
          left: 0,
          width: "2000px",
          textAlign: "center",
          fontFamily: "'Montserrat', sans-serif",
          fontSize: "26px",
          color: "#333",
          zIndex: 10,
        }}
      >
        In recognition of accomplishment and demonstrated excellence in the culinary arts.
      </div>
      <div
        style={{
          position: "absolute",
          top: "910px",
          left: 0,
          width: "2000px",
          textAlign: "center",
          fontFamily: "'Montserrat', sans-serif",
          fontSize: "32px",
          fontStyle: "italic",
          fontWeight: "700",
          color: "#222",
          zIndex: 10,
        }}
      >
        {student.course_name}
      </div>
      <div
        style={{
          position: "absolute",
          top: "970px",
          left: 0,
          width: "2000px",
          textAlign: "center",
          fontFamily: "'Montserrat', sans-serif",
          fontSize: "24px",
          fontStyle: "italic",
          fontWeight: "500",
          color: "#555",
          zIndex: 10,
        }}
      >
        {issueDate}
      </div>

      <div
        style={{
          position: "absolute",
          top: "1150px",
          left: "130px",
          zIndex: 10,
          width: "650px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div
          style={{
            width: "140px",
            height: "140px",
            background: "white",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            flexShrink: 0,
          }}
        >
          {/* 2. SWITCHED TO QRCodeSVG FOR PERFECT PDF CAPTURE */}
          <QRCodeSVG value={studentUrl || "https://cibdhk.com"} size={120} level="H" />
        </div>
        <div
          style={{
            flex: 1,
            fontSize: "15px",
            lineHeight: "1.7",
            color: "#444",
            fontStyle: "italic",
            fontFamily: "'Montserrat', sans-serif",
            textAlign: "left",
            fontWeight: "500",
          }}
        >
          This certificate is automatically generated by CIB's Certificate Verification Portal.
          <br />
          <span style={{ fontWeight: "700", color: "#222", fontStyle: "normal" }}>
            Student Reg No:
          </span>{" "}
          {student.registration_number || student._id}
          <br />
          <span style={{ fontWeight: "700", color: "#222", fontStyle: "normal" }}>
            Manual Verification:
          </span>{" "}
          contact@cibdhk.com
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#e2e8f0] py-8 flex flex-col items-center overflow-x-hidden relative">
      <div className="w-full max-w-[1100px] mb-6 flex justify-between items-center z-20 relative px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 font-bold text-xs uppercase tracking-widest rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition"
        >
          <ArrowLeft size={16} /> Student Details
        </button>
        <button
          onClick={downloadPDF}
          disabled={isGenerating}
          className="flex items-center gap-2 px-8 py-2.5 bg-[#000c1d] text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:bg-slate-800 transition active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating PDF... {generationProgress}%
            </>
          ) : (
            <>
              <Download size={16} />
              Download PDF
            </>
          )}
        </button>
      </div>

      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          transformOrigin: "top center",
        }}
        ref={scaleWrapperRef}
      >
        <div style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
          <CertificateLayout />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: "-10000px",
          left: "-10000px",
          zIndex: -1,
        }}
      >
        <div ref={printRef}>
          <CertificateLayout />
        </div>
      </div>
    </div>
  );
};

export default GenerateCertificate;