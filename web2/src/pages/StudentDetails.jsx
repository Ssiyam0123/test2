import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User, Hash, BookOpen, Calendar, Phone, Mail, MapPin, ArrowLeft,
  CheckCircle, XCircle, Clock, Award, Building, FileText, Shield,
  Info, Edit3, UserCheck, MessageSquare, Quote
} from "lucide-react";
import useAuth from "../store/useAuth";
import LogoLoader from "../components/LogoLoader.jsx";
import { usePublicStudentProfile, useStudent } from "../hooks/useStudents.js";
import { InfoItem, SectionCard } from "../components/ProfileLayout.jsx";
import { apiURL } from "../../Constant.js";

const BASE_URL = apiURL.image_url;

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuth();

  // 1. Consolidated Data Fetching
  const {
    data: adminData,
    isLoading: adminLoading,
    isError: adminErr,
    error: adminErrorObj,
  } = useStudent(id, { enabled: !!authUser });

  const {
    data: publicData,
    isLoading: publicLoading,
    isError: publicErr,
    error: publicErrorObj,
  } = usePublicStudentProfile(id, { enabled: !authUser });

  // 2. State Consolidation
  const isLoading = authUser ? adminLoading : publicLoading;
  const isError = authUser ? adminErr : publicErr;
  const error = authUser ? adminErrorObj : publicErrorObj;
  const studentResponse = authUser ? adminData : publicData;

  const student = studentResponse?.data || studentResponse;
  const comments = student?.comments || [];

  if (isLoading) return <LogoLoader />;
  if (isError || !student)
    return <ErrorState navigate={navigate} authUser={authUser} error={error} />;

  // Helpers
  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${BASE_URL}${url}`;
  };

  const parentLabel = student.gender?.toLowerCase() === "female" ? "Daughter of" : "Son of";

  return (
    <div className="min-h-screen bg-[#0f172a] bg-gradient-to-b from-[#1e293b] to-[#0f172a] pb-20 selection:bg-[#EC1B23]/30 font-sans">
      
      {/* Sticky Mobile Nav */}
      <div className="sticky top-0 z-50 bg-slate-900/60 backdrop-blur-md border-b border-white/5 lg:hidden">
        <div className="px-4 h-16 flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-300 hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft size={24} />
            <span className="text-sm font-bold uppercase tracking-widest">Back</span>
          </button>
        </div>
      </div>

      {/* Hero Header Section */}
      <div className="relative pt-6 md:pt-12 pb-24 px-4 overflow-hidden bg-white/[0.02] border-b border-white/5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#EC1B23]/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <button onClick={() => navigate(-1)} className="hidden lg:flex items-center gap-2 text-slate-400 hover:text-white transition-all mb-8 group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold uppercase tracking-widest text-xs">Return to Directory</span>
          </button>

          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-8 md:gap-12">
            <div className="relative">
              <div className="h-44 w-44 md:h-56 md:w-56 rounded-[3rem] overflow-hidden border-8 border-slate-800 shadow-2xl relative z-10 group bg-slate-800">
                {student.photo_url ? (
                  <img src={getImageUrl(student.photo_url)} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt={student.student_name} />
                ) : (
                  <div className="h-full w-full flex items-center justify-center"><User size={80} className="text-slate-600" /></div>
                )}
              </div>
              <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-2xl text-[10px] font-black tracking-[0.2em] shadow-xl border z-20 whitespace-nowrap ${student.is_verified ? "bg-green-600 border-green-400 text-white" : "bg-slate-700 border-slate-500 text-slate-300"}`}>
                {student.is_verified ? "OFFICIAL VERIFIED ✓" : "PENDING VERIFICATION"}
              </div>
            </div>

            <div className="text-center lg:text-left flex-1 space-y-4">
              <div className="space-y-1">
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight drop-shadow-sm">{student.student_name}</h2>
                <p className="text-slate-400 text-lg md:text-xl font-medium italic">{parentLabel} {student.fathers_name}</p>
              </div>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <div className="px-4 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700 text-sm font-bold flex items-center gap-2 text-slate-200">
                  <Hash size={14} className="text-[#EC1B23]" /> {student.student_id}
                </div>
                <div className="px-4 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700 text-sm font-bold flex items-center gap-2 text-slate-200">
                  <Building size={14} className="text-blue-400" /> Batch {student.batch}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          
          <SectionCard title="Contact Registry" icon={User} color="text-blue-500">
            <InfoItem icon={Mail} label="Email Address" value={student.email} />
            <InfoItem icon={Phone} label="Primary Contact" value={student.contact_number} />
            <InfoItem icon={MapPin} label="Postal Address" value={student.address} />
          </SectionCard>

          <SectionCard title="Academic Portfolio" icon={BookOpen} color="text-purple-500">
            <InfoItem icon={Award} label="Enrolled Course" value={student.course_name} />
            <InfoItem icon={Clock} label="Standard Duration" value={`${student.course_duration?.value} ${student.course_duration?.unit}`} />
            <InfoItem icon={UserCheck} label="Completion" value={student.status?.toUpperCase()} />
            <InfoItem icon={Info} label="Assessment" value={student.competency?.replace("_", " ")} color="text-emerald-400" />
          </SectionCard>

          <SectionCard title="Official Records" icon={Shield} color="text-emerald-500">
            <div className={`p-5 rounded-2xl mb-6 border-2 flex items-center justify-between ${student.is_active ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
              <span className="text-xs font-black tracking-widest text-slate-400 uppercase">System Status</span>
              <span className={`text-[10px] px-3 py-1 rounded-lg font-black uppercase ${student.is_active ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>{student.is_active ? "Active" : "Archived"}</span>
            </div>
            <InfoItem icon={Calendar} label="Issue Date" value={new Date(student.issue_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} />
          </SectionCard>
        </div>

        {/* INSTRUCTOR COMMENTS SECTION */}
        {authUser && (
          <div className="mt-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <MessageSquare className="text-indigo-400 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">Instructor Observations</h3>
                <p className="text-slate-400 text-sm font-medium">Internal faculty feedback and performance notes</p>
              </div>
            </div>

            {comments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {comments.map((comment, index) => (
                  <div key={comment._id || index} className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-[2.5rem] p-6 md:p-8 hover:bg-white/[0.05] transition-all group">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 overflow-hidden shrink-0 flex items-center justify-center">
                          {comment.instructor?.photo_url ? (
                            <img src={getImageUrl(comment.instructor.photo_url)} alt="Instructor" className="h-full w-full object-cover" />
                          ) : (
                            <User className="text-indigo-400 w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-white font-black text-base leading-none mb-1">{comment.instructor?.full_name || "Official Faculty"}</h4>
                          <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest bg-indigo-400/10 px-2 py-0.5 rounded-md border border-indigo-400/20">{comment.instructor?.designation || "Staff"}</span>
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                         <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">Observed On</p>
                         <p className="text-slate-300 text-xs font-medium">{new Date(comment.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="relative pl-2">
                      <Quote className="absolute -top-2 -left-2 w-8 h-8 text-white/5 -rotate-12 group-hover:text-indigo-500/10 transition-colors" />
                      <p className="text-slate-300 leading-relaxed text-sm md:text-base font-medium relative z-10">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[3rem] p-12 text-center">
                <Info className="text-slate-500 w-8 h-8 mx-auto mb-4" />
                <h4 className="text-slate-300 font-bold text-lg">No Observations Recorded</h4>
              </div>
            )}
          </div>
        )}

        {/* Admin Buttons */}
        {authUser && (
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button onClick={() => navigate(`/admin/update-student/${student._id}`)} className="flex-1 py-5 bg-gradient-to-r from-[#EC1B23] to-[#FF3D3D] text-white font-black rounded-3xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
              <Edit3 size={20} /> Modify Record
            </button>
            <button onClick={() => navigate("/admin/all-students")} className="flex-1 py-5 bg-slate-800 border border-slate-600 text-white font-black rounded-3xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
              <FileText size={20} /> Student Registry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ErrorState = ({ navigate, authUser }) => (
  <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 text-center">
    <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl">
      <XCircle className="w-16 h-16 text-[#EC1B23] mx-auto mb-8" />
      <h1 className="text-3xl font-black text-white mb-4">No Record Found</h1>
      <button onClick={() => navigate(authUser ? "/admin/all-students" : "/")} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
        <ArrowLeft size={18} /> Try New Search
      </button>
    </div>
  </div>
);

export default StudentDetails;