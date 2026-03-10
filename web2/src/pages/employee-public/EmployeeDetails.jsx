import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Edit3, Mail, Phone, Briefcase, Calendar, 
  Hash, Shield, Facebook, Twitter, Instagram, Linkedin, 
  Globe, Building, XCircle
} from "lucide-react";
import LogoLoader from "../../components/LogoLoader.jsx";
import { useUser } from "../../hooks/useUser.js";
import useAuth from "../../store/useAuth.js";
import { PERMISSIONS } from "../../config/permissionConfig.js";
import Avatar from "../../components/common/Avatar.jsx";

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); 
  
  const { data: employee, isLoading, isError, error } = useUser(id);

  if (isLoading) return <LogoLoader />;
  if (isError || !employee) return <ErrorState navigate={navigate} error={error} />;

  const canEdit = hasPermission(PERMISSIONS.EMPLOYEE_EDIT);
  const canSeeCredentials = hasPermission(PERMISSIONS.EMPLOYEE_ROLE_CONTROL);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Active": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "On Leave": return "bg-amber-100 text-amber-700 border-amber-200";
      case "Resigned": return "bg-rose-100 text-rose-700 border-rose-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // রোল নাম এবং স্টাইল হ্যান্ডলিং
  const roleName = typeof employee.role === 'object' ? employee.role.name : employee.role;

  return (
    <div className="min-h-screen bg-[#f4f7fb] font-sans pb-20 animate-in fade-in duration-500">
      {/* Corporate Cover Header */}
      <div className="h-64 bg-gradient-to-r from-slate-900 via-[#1e293b] to-indigo-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-black text-[10px] uppercase tracking-widest group bg-white/5 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Directory
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        
        {/* Profile Identity Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-10 mb-8 flex flex-col md:flex-row gap-8 items-center md:items-end relative">
          
          <div className="relative -mt-20 md:-mt-24 shrink-0">
            {/* 🚀 Avatar Component Integration */}
            <Avatar 
              src={employee.photo_url} 
              fallbackText={employee.full_name} 
              sizeClass="h-40 w-40 md:h-48 md:w-48 shadow-2xl border-8 border-white" 
              className="rounded-[2.5rem]"
            />
            <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-xl border-2 border-white text-[10px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap ${getStatusStyle(employee.status)}`}>
              {employee.status}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
                {employee.full_name}
              </h1>
              <span className="w-fit mx-auto md:mx-0 px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
                {roleName}
              </span>
            </div>
            <p className="text-lg text-slate-500 font-bold flex items-center justify-center md:justify-start gap-2 mb-6">
              <Briefcase size={18} className="text-teal-500" /> {employee.designation || "Executive"}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <Building size={16} className="text-slate-400" />
                <span className="text-xs font-black uppercase text-slate-600 tracking-tight">{employee.department || "General"}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <Hash size={16} className="text-slate-400" />
                <span className="text-xs font-black text-slate-600 font-mono tracking-widest">{employee.employee_id}</span>
              </div>
            </div>
          </div>

          {/* 🚀 Action Button: Restricted by ADD_EMPLOYEE or EMPLOYEE_EDIT */}
          {canEdit && (
            <div className="w-full md:w-auto mt-4 md:mt-0">
              <button
                onClick={() => navigate(`/admin/update-employee/${employee._id}`)}
                className="w-full md:w-auto px-8 py-4 bg-slate-900 hover:bg-teal-600 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 active:scale-95"
              >
                <Edit3 size={16} /> Update Record
              </button>
            </div>
          )}
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="space-y-8">
            <InfoCard title="Communication" icon={Phone} iconColor="text-teal-500" bg="bg-teal-50">
              <DetailRow icon={Mail} label="Email Address" value={employee.email} isLink href={`mailto:${employee.email}`} />
              <DetailRow icon={Phone} label="Mobile Phone" value={employee.phone} isLink href={`tel:${employee.phone}`} />
            </InfoCard>

            <InfoCard title="Digital Footprint" icon={Globe} iconColor="text-indigo-500" bg="bg-indigo-50">
              <div className="grid grid-cols-2 gap-3 mt-2">
                <SocialButton type="linkedin" url={employee.social_links?.linkedin} />
                <SocialButton type="facebook" url={employee.social_links?.facebook} />
                <SocialButton type="twitter" url={employee.social_links?.twitter} />
                <SocialButton type="instagram" url={employee.social_links?.instagram} />
              </div>
              {!employee.social_links?.facebook && !employee.social_links?.linkedin && !employee.social_links?.twitter && !employee.social_links?.instagram && (
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 text-center py-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">No social links</p>
              )}
            </InfoCard>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {/* 🚀 System Info: Restricted by Role Control Permission */}
            {canSeeCredentials && (
              <InfoCard title="Authorization Layer" icon={Shield} iconColor="text-indigo-500" bg="bg-indigo-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">System Username</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-mono font-black text-slate-800 tracking-tighter">@{employee.username}</span>
                      <Shield size={20} className="text-indigo-200" />
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Assigned Access</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-slate-800 uppercase tracking-tighter">{roleName} Level</span>
                      <Shield size={20} className="text-teal-200" />
                    </div>
                  </div>
                </div>
              </InfoCard>
            )}

            <InfoCard title="Lifecycle Record" icon={Briefcase} iconColor="text-rose-500" bg="bg-rose-50">
               <div className="space-y-0 px-2 pt-2">
                  <TimelineRow date={formatDate(employee.joining_date)} title="Organization Entry" desc={`Commenced journey as ${employee.designation || 'Staff'} in ${employee.department || 'Operations'}`} isFirst />
                  <TimelineRow date={formatDate(employee.createdAt)} title="System Initialized" desc="Digital footprint created in the ecosystem" />
                  <TimelineRow date={formatDate(employee.updatedAt)} title="Recent Integrity Sync" desc="Last verified administrative record update" isLast />
               </div>
            </InfoCard>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components (Styled for Premium Look) --- //

const InfoCard = ({ title, icon: Icon, iconColor, bg, children }) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60 relative">
    <div className="flex items-center gap-3 mb-8">
      <div className={`p-3 rounded-2xl ${bg} ${iconColor} shadow-inner`}>
        <Icon size={20} />
      </div>
      <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">{title}</h2>
    </div>
    {children}
  </div>
);

const DetailRow = ({ icon: Icon, label, value, isLink, href }) => (
  <div className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all mb-2 last:mb-0 group">
    <div className="mt-1 bg-slate-100 p-2 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
      <Icon size={16} className="text-slate-400 group-hover:text-indigo-500" />
    </div>
    <div className="overflow-hidden">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      {isLink ? (
        <a href={href} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 truncate block transition-colors">{value}</a>
      ) : (
        <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
      )}
    </div>
  </div>
);

const SocialButton = ({ type, url }) => {
  if (!url) return null;
  const validUrl = url.startsWith("http") ? url : `https://${url}`;
  
  const config = {
    linkedin: { icon: Linkedin, color: "text-[#0A66C2] bg-[#0A66C2]/5 hover:bg-[#0A66C2] hover:text-white" },
    facebook: { icon: Facebook, color: "text-[#1877F2] bg-[#1877F2]/5 hover:bg-[#1877F2] hover:text-white" },
    twitter: { icon: Twitter, color: "text-slate-800 bg-slate-100 hover:bg-slate-800 hover:text-white" },
    instagram: { icon: Instagram, color: "text-[#E4405F] bg-[#E4405F]/5 hover:bg-gradient-to-tr hover:from-[#F58529] hover:to-[#DD2A7B] hover:text-white" },
  };

  const { icon: Icon, color } = config[type];

  return (
    <a href={validUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center p-4 rounded-2xl transition-all duration-500 ${color} shadow-sm`}>
      <Icon size={20} />
    </a>
  );
};

const TimelineRow = ({ date, title, desc, isFirst, isLast }) => (
  <div className="flex gap-6 relative">
    {!isLast && <div className="absolute left-[13px] top-8 bottom-[-24px] w-0.5 bg-slate-100"></div>}
    <div className={`relative z-10 w-7 h-7 rounded-xl border-4 border-white shrink-0 mt-1 flex items-center justify-center shadow-md ${isFirst ? 'bg-indigo-600 shadow-indigo-100' : 'bg-slate-200'}`}>
      {isFirst && <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>}
    </div>
    <div className="pb-10">
      <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">{date}</p>
      <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{title}</p>
      <p className="text-xs font-bold text-slate-400 mt-2 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const ErrorState = ({ navigate, error }) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div className="max-w-md w-full bg-white border border-slate-200 p-10 rounded-[3rem] shadow-2xl text-center">
      <div className="inline-flex items-center justify-center p-6 bg-rose-50 rounded-full mb-6">
        <XCircle className="w-16 h-16 text-rose-500" />
      </div>
      <h1 className="text-2xl font-black text-slate-800 mb-3 uppercase">Sync Failed</h1>
      <p className="text-sm font-bold text-slate-400 mb-8">{error?.message || "The requested administrative record is unavailable."}</p>
      <button onClick={() => navigate(-1)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100">
        Return to Safety
      </button>
    </div>
  </div>
);

export default EmployeeDetails;