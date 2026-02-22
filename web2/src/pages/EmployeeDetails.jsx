import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Edit3, Mail, Phone, Briefcase, Calendar, 
  Hash, Shield, User, Facebook, Twitter, Instagram, Linkedin, 
  Globe, Building, Clock, XCircle
} from "lucide-react";
import LogoLoader from "../components/LogoLoader";
import { apiURL } from "../../Constant.js";
import { useUser } from "../hooks/useUser.js";

const BASE_URL = apiURL.image_url;

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: employee, isLoading, isError, error } = useUser(id);

  if (isLoading) return <LogoLoader />;
  if (isError || !employee) return <ErrorState navigate={navigate} error={error} />;

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${BASE_URL}${url}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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

  const getRoleStyle = (role) => {
    switch (role) {
      case "admin": return "bg-indigo-600 text-white shadow-indigo-200";
      case "instructor": return "bg-blue-500 text-white shadow-blue-200";
      case "register": return "bg-violet-500 text-white shadow-violet-200";
      default: return "bg-slate-600 text-white shadow-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] font-sans pb-20">
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 h-16 flex items-center">
        <button onClick={() => navigate(-1)} className="flex items-center text-slate-600 font-semibold gap-2">
          <ArrowLeft size={20} /> Directory
        </button>
      </div>

      {/* Corporate Cover Header */}
      <div className="h-64 bg-gradient-to-r from-slate-900 via-[#0f172a] to-indigo-950 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8">
          <button onClick={() => navigate(-1)} className="hidden lg:flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-medium text-sm group bg-white/5 px-4 py-2 rounded-full w-fit backdrop-blur-sm border border-white/10">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Staff Directory
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        
        {/* Main Profile Card - FIX: Removed overflow-hidden so the avatar pops out correctly */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-10 mb-8 flex flex-col md:flex-row gap-8 items-center md:items-end relative">
          
          {/* Avatar */}
          <div className="relative -mt-20 md:-mt-24 shrink-0">
            <div className="h-40 w-40 md:h-48 md:w-48 rounded-3xl overflow-hidden border-8 border-white shadow-lg bg-slate-100 flex items-center justify-center">
              {employee.photo_url ? (
                <img src={getImageUrl(employee.photo_url)} alt={employee.full_name} className="h-full w-full object-cover" />
              ) : (
                <User size={64} className="text-slate-300" />
              )}
            </div>
            {/* Status Indicator - FIX: Centered at the bottom using left-1/2 & -translate-x-1/2 */}
            <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-xl border-2 border-white text-xs font-bold uppercase tracking-wider shadow-sm whitespace-nowrap ${getStatusStyle(employee.status)}`}>
              {employee.status}
            </div>
          </div>

          {/* Core Info */}
          <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {employee.full_name}
              </h1>
              <span className={`w-fit mx-auto md:mx-0 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm ${getRoleStyle(employee.role)}`}>
                {employee.role === 'register' ? 'Registrar' : employee.role}
              </span>
            </div>
            <p className="text-lg text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2 mb-6">
              <Briefcase size={18} className="text-indigo-400" /> {employee.designation}
            </p>

            {/* Quick Stats Banner */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <Building size={16} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">{employee.department}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <Hash size={16} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-700 font-mono">{employee.employee_id}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <Clock size={16} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">Joined {formatDate(employee.joining_date)}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="w-full md:w-auto mt-4 md:mt-0">
            <button
              onClick={() => navigate(`/admin/update-employee/${employee._id}`)}
              className="w-full md:w-auto px-6 py-3.5 bg-slate-900 hover:bg-indigo-600 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 active:scale-95"
            >
              <Edit3 size={18} /> Update Profile
            </button>
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Contact & Socials */}
          <div className="space-y-8">
            <InfoCard title="Contact Information" icon={Phone} iconColor="text-emerald-500" bg="bg-emerald-50">
              <DetailRow icon={Mail} label="Email Address" value={employee.email} isLink href={`mailto:${employee.email}`} />
              <DetailRow icon={Phone} label="Mobile Phone" value={employee.phone} isLink href={`tel:${employee.phone}`} />
            </InfoCard>

            <InfoCard title="Social Connectivity" icon={Globe} iconColor="text-blue-500" bg="bg-blue-50">
              <div className="grid grid-cols-2 gap-3 mt-2">
                <SocialButton type="linkedin" url={employee.social_links?.linkedin} />
                <SocialButton type="facebook" url={employee.social_links?.facebook} />
                <SocialButton type="twitter" url={employee.social_links?.twitter} />
                <SocialButton type="instagram" url={employee.social_links?.instagram} />
              </div>
              {!employee.social_links?.facebook && !employee.social_links?.linkedin && !employee.social_links?.twitter && !employee.social_links?.instagram && (
                <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded-xl border border-slate-100 border-dashed">No social links linked.</p>
              )}
            </InfoCard>
          </div>

          {/* Right Column: System & HR Info */}
          <div className="lg:col-span-2 space-y-8">
            <InfoCard title="System Credentials" icon={Shield} iconColor="text-indigo-500" bg="bg-indigo-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Login Username</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-mono font-bold text-slate-800">{employee.username}</span>
                    <User size={20} className="text-slate-300" />
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Access Level</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-800 capitalize">{employee.role} Access</span>
                    <Shield size={20} className="text-indigo-300" />
                  </div>
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Employment Record" icon={Briefcase} iconColor="text-rose-500" bg="bg-rose-50">
               <div className="space-y-0">
                  <TimelineRow date={formatDate(employee.createdAt)} title="Profile Created in System" desc={`Added as ${employee.role}`} isFirst />
                  <TimelineRow date={formatDate(employee.joining_date)} title="Official Joining Date" desc={`Hired as ${employee.designation} in ${employee.department}`} />
                  <TimelineRow date={formatDate(employee.updatedAt)} title="Last Profile Update" desc="Most recent modification to records" isLast />
               </div>
            </InfoCard>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- Reusable Sub-Components --- //

const InfoCard = ({ title, icon: Icon, iconColor, bg, children }) => (
  <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/60 relative">
    <div className="flex items-center gap-3 mb-6">
      <div className={`p-2.5 rounded-xl ${bg} ${iconColor}`}>
        <Icon size={20} />
      </div>
      <h2 className="text-lg font-bold text-slate-800">{title}</h2>
    </div>
    {children}
  </div>
);

const DetailRow = ({ icon: Icon, label, value, isLink, href }) => (
  <div className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors mb-2 last:mb-0">
    <div className="mt-0.5"><Icon size={18} className="text-slate-400" /></div>
    <div className="overflow-hidden">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      {isLink ? (
        <a href={href} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 truncate block">{value}</a>
      ) : (
        <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
      )}
    </div>
  </div>
);

const SocialButton = ({ type, url }) => {
  if (!url) return null;
  const validUrl = url.startsWith("http") ? url : `https://${url}`;
  
  const config = {
    linkedin: { icon: Linkedin, color: "text-[#0A66C2] bg-[#0A66C2]/10 hover:bg-[#0A66C2] hover:text-white", label: "LinkedIn" },
    facebook: { icon: Facebook, color: "text-[#1877F2] bg-[#1877F2]/10 hover:bg-[#1877F2] hover:text-white", label: "Facebook" },
    twitter: { icon: Twitter, color: "text-slate-800 bg-slate-100 hover:bg-slate-800 hover:text-white", label: "Twitter / X" },
    instagram: { icon: Instagram, color: "text-[#E4405F] bg-[#E4405F]/10 hover:bg-gradient-to-tr hover:from-[#F58529] hover:to-[#DD2A7B] hover:text-white", label: "Instagram" },
  };

  const { icon: Icon, color, label } = config[type];

  return (
    <a href={validUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-all duration-300 font-semibold text-sm ${color}`}>
      <Icon size={18} /> <span className="hidden sm:inline">{label}</span>
    </a>
  );
};

const TimelineRow = ({ date, title, desc, isFirst, isLast }) => (
  <div className="flex gap-4 relative">
    {!isLast && <div className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-slate-100"></div>}
    <div className={`relative z-10 w-6 h-6 rounded-full border-4 border-white shrink-0 mt-1 flex items-center justify-center ${isFirst ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
    <div className="pb-8">
      <p className="text-xs font-bold text-slate-400 mb-1">{date}</p>
      <p className="text-sm font-bold text-slate-800">{title}</p>
      <p className="text-sm text-slate-500 mt-1 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const ErrorState = ({ navigate, error }) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div className="max-w-md w-full bg-white border border-slate-200 p-10 rounded-3xl shadow-xl text-center">
      <div className="inline-flex items-center justify-center p-6 bg-rose-50 rounded-full mb-6">
        <XCircle className="w-16 h-16 text-rose-500" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-3">Record Unavailable</h1>
      <p className="text-slate-500 mb-8">{error?.message || "This employee profile could not be found."}</p>
      <button onClick={() => navigate("/admin/all-employees")} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors">
        Return to Directory
      </button>
    </div>
  </div>
);

export default EmployeeDetails;