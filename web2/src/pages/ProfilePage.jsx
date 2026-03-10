import React, { useState, useMemo } from "react";
import { 
  UserPen, Mail, Phone, ShieldCheck, MapPin, 
  Facebook, Linkedin, Twitter, Instagram, Globe, 
  ExternalLink, Building, Briefcase, Calendar, Lock
} from "lucide-react";
import { useMyProfile, useUpdateMyProfile } from "../hooks/useUser";
import { PERMISSIONS } from "../config/permissionConfig";
import useAuth from "../store/useAuth";
import EntityForm from "../components/common/EntityForm";
import Avatar from "../components/common/Avatar";
import Loader from "../components/Loader";

export default function ProfilePage() {
  const { data: profile, isLoading } = useMyProfile();
  const updateMutation = useUpdateMyProfile();
  const { hasPermission } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 🚀 গ্র্যানুলার পারমিশন চেক
  const canEdit = hasPermission(PERMISSIONS.UPDATE_MY_PROFILE);

  // Form Config (EntityForm এর জন্য)
  const profileFormConfig = [
    { divider: true, title: "Basic Details", icon: UserPen },
    { name: "full_name", label: "Full Name", type: "text", required: true },
    { name: "email", label: "Email Address", type: "email", required: true },
    { name: "phone", label: "Contact Number", type: "text", required: true },
    { name: "password", label: "Reset Password", type: "password", placeholder: "Leave blank to keep old one" },
    
    { divider: true, title: "Social Connect", icon: Globe },
    { name: "facebook", label: "Facebook URL", type: "text" },
    { name: "linkedin", label: "LinkedIn URL", type: "text" },
    { name: "twitter", label: "Twitter URL", type: "text" },
    { name: "instagram", label: "Instagram URL", type: "text" },
    { name: "others", label: "Other Portfolio", type: "text", fullWidth: true },
    
    { divider: true, title: "Media", icon: UserPen },
    { name: "photo", label: "Profile Picture", type: "file" }
  ];

  const initialFormData = useMemo(() => {
    if (!profile) return {};
    return {
      full_name: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      facebook: profile.social_links?.facebook || "",
      linkedin: profile.social_links?.linkedin || "",
      twitter: profile.social_links?.twitter || "",
      instagram: profile.social_links?.instagram || "",
      others: profile.social_links?.custom || "",
      photo_url: profile.photo_url
    };
  }, [profile]);

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/50 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[80px] rounded-full"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <Avatar src={profile?.photo_url} fallbackText={profile?.full_name} sizeClass="w-32 h-32 md:w-40 md:h-40 shadow-2xl border-4 border-white ring-4 ring-teal-50" />
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">{profile?.full_name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-3">
                <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-100">
                  {profile?.role?.name}
                </span>
                <span className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-widest px-3 border-l border-slate-200">
                  <MapPin size={14} className="text-teal-500" /> {profile?.branch?.branch_name}
                </span>
              </div>
            </div>
          </div>
          {canEdit && (
            <button onClick={() => setIsEditModalOpen(true)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-teal-600 transition-all shadow-xl shadow-slate-200 flex items-center gap-3 active:scale-95">
              <UserPen size={18} /> Modify Identity
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <ShieldCheck size={14} className="text-teal-500" /> Identity Matrix
            </h3>
            <div className="space-y-6">
              {[
                { label: "Employee ID", value: `#${profile?.employee_id}`, icon: Briefcase },
                { label: "Work Status", value: profile?.status, isStatus: true },
                { label: "Department", value: profile?.department || "Unassigned", icon: Building },
                { label: "Joined date", value: new Date(profile?.joining_date).toLocaleDateString(), icon: Calendar }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.label}</span>
                  {item.isStatus ? (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg border border-emerald-100">{item.value}</span>
                  ) : (
                    <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Social Links Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <Globe size={14} className="text-indigo-500" /> Network Reach
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(profile?.social_links || {}).map(([key, value]) => (
                value && (
                  <a key={key} href={value} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:border-teal-500 transition-all group">
                    {key === 'facebook' && <Facebook size={14} className="text-blue-600" />}
                    {key === 'linkedin' && <Linkedin size={14} className="text-blue-700" />}
                    {key === 'twitter' && <Twitter size={14} className="text-sky-500" />}
                    {key === 'instagram' && <Instagram size={14} className="text-rose-500" />}
                    {key === 'custom' && <Globe size={14} className="text-slate-600" />}
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter group-hover:text-teal-600">{key}</span>
                  </a>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Info */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {[
                  { icon: Mail, label: "Official Correspondence", value: profile?.email, color: "text-indigo-500" },
                  { icon: Phone, label: "Direct Communication", value: profile?.phone || "N/A", color: "text-teal-500" },
                  { icon: Briefcase, label: "Current Designation", value: profile?.designation || "N/A", color: "text-amber-500" },
                  { icon: Building, label: "Assigned Campus", value: profile?.branch?.branch_name, color: "text-rose-500" }
                ].map((info, idx) => (
                  <div key={idx} className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <info.icon size={12} className={info.color} /> {info.label}
                    </p>
                    <p className="text-xl font-bold text-slate-800 tracking-tight">{info.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-16 pt-10 border-t border-slate-100 relative">
                 <div className="absolute -top-3 left-10 bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Biography</div>
                 <p className="text-lg font-medium text-slate-500 leading-relaxed italic">
                    Professional administrative authority at {profile?.branch?.branch_name}, dedicated to operational excellence and organizational growth.
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* 🚀 EDIT MODAL USING ENTITY FORM */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <EntityForm 
              title="Identity Refinement"
              subtitle="Modify your personal profile information and social presence."
              config={profileFormConfig}
              initialData={initialFormData}
              isLoading={updateMutation.isPending}
              buttonText="Deploy Changes"
              onCancel={() => setIsEditModalOpen(false)}
              onSubmit={(formData) => {
                updateMutation.mutate(formData, { onSuccess: () => setIsEditModalOpen(false) });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}