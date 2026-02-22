import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  User,
  Hash,
  BookOpen,
  Eye,
  ArrowLeft,
  Shield,
  RotateCw,
  Building,
  AlertCircle,
} from "lucide-react";
import LogoLoader from "../components/LogoLoader";
import { usePublicStudentSearch } from "../hooks/useStudents";
import { apiURL } from "../../Constant.js";

const BASE_URL = apiURL.image_url;

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start space-x-4">
    <div className="p-2 bg-white/5 rounded-lg border border-white/5">
      <Icon className="w-5 h-5 text-blue-300" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-blue-200/50 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-white font-medium truncate mt-0.5">{value || "N/A"}</p>
    </div>
  </div>
);

const NoResultsFound = ({ reset }) => (
  <div className="text-center py-16 bg-white/5 border border-white/10 rounded-3xl animate-in fade-in zoom-in duration-500">
    <div className="inline-flex items-center justify-center p-6 bg-red-500/10 rounded-full mb-6">
      <AlertCircle className="w-12 h-12 text-[#EC1B23]" />
    </div>
    <h3 className="text-2xl font-bold text-white mb-4">Student Not Found</h3>
    <p className="text-blue-200/60 max-w-md mx-auto mb-8 leading-relaxed">
      No student record matches that ID or Registration number. Please verify
      the credentials and try again.
    </p>
    <button
      onClick={reset}
      className="inline-flex items-center space-x-2 text-[#EC1B23] hover:text-[#FF3D3D] font-bold transition-colors"
    >
      <ArrowLeft className="w-5 h-5" />
      <span>Search Again</span>
    </button>
  </div>
);

const StudentSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const navigate = useNavigate();
  const resultsRef = useRef(null);

 const {
  data: searchData,
  isLoading,
  isError,
  error,
  isFetching,
} = usePublicStudentSearch(searchQuery, isSearchEnabled);

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${BASE_URL}${url}`;
  };

  useEffect(() => {
    if (searchData && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [searchData]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchEnabled(true);
  };

  const handleResetSearch = () => {
    setSearchQuery("");
    setIsSearchEnabled(false);
  };

  const getErrorMessage = () => {
    if (error?.response?.status === 404)
      return "Record not found in our database.";
    return (
      error?.response?.data?.message ||
      "Verification service is currently unavailable."
    );
  };

  if (isLoading || isFetching) return <LogoLoader />;

  const searchResults = searchData?.data ? [searchData.data] : [];
  const hasSearched = isSearchEnabled || searchData || isError;

//   useEffect(()=>{
// console.log(searchResults);
//   },[searchResults])

  return (
    <div className="bg-[#000c1d] min-h-screen text-white selection:bg-[#EC1B23]/30">
      {/* Search Hero Section */}
      <div className="relative pt-16 pb-12 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-20 blur-[120px] pointer-events-none">
          <div className="absolute top-0 left-0 w-72 h-72 bg-[#EC1B23] rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-600 rounded-full"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl border border-white/10 mb-6">
            <Shield className="w-8 h-8 text-[#EC1B23]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            Student <span className="text-[#EC1B23]">Verification</span> Portal
          </h1>
          <p className="text-blue-100/60 text-lg mb-10 max-w-2xl mx-auto">
            Official portal for verifying credentials of students registered
            with The Culinary Institute of Bangladesh.
          </p>

          <form
            onSubmit={handleSearch}
            className="relative group max-w-2xl mx-auto"
          >
            <div className="relative flex items-center">
              <Search
                className="absolute left-5 text-gray-400 group-focus-within:text-[#EC1B23] transition-colors"
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchEnabled(false);
                }}
                placeholder="Enter Student ID or Registration No..."
                className="w-full pl-14 pr-4 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-[#EC1B23]/20 focus:border-[#EC1B23]/40 outline-none transition-all text-lg font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={!searchQuery.trim()}
              className="w-full mt-4 py-4 bg-gradient-to-r from-[#EC1B23] to-[#FF3D3D] rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-red-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              Verify Record
            </button>
            {isError && (
              <p className="mt-4 text-[#EC1B23] font-medium flex items-center justify-center gap-2 animate-bounce">
                <AlertCircle size={16} /> {getErrorMessage()}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Dynamic Results Section */}
      {hasSearched && (
        <div className="max-w-6xl mx-auto px-6 pb-20" ref={resultsRef}>
          {searchResults.length > 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-white/10"></div>
                <h2 className="text-sm font-black tracking-[0.2em] text-blue-200 uppercase">
                  Verification Result
                </h2>
                <div className="h-px flex-1 bg-white/10"></div>
              </div>

              {searchResults?.map((student) => (
                <div
                  key={student._id}
                  className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 md:p-12 shadow-3xl backdrop-blur-md"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left: Branding & Photo */}
                    <div className="lg:col-span-4 flex flex-col items-center">
                      <div className="relative">
                        <div className="h-56 w-56 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl relative z-10 bg-slate-800">
                          {student.photo_url ? (
                            <img
                              className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                              loading="lazy"
                              src={getImageUrl(student.photo_url)}
                              alt={student.student_name}
                              onError={(e) => {
                                // Fallback if the image URL is broken
                                e.target.style.display = "none";
                                e.target.nextElementSibling.style.display =
                                  "flex";
                              }}
                            />
                          ) : null}

                          {/* Fallback avatar if no photo exists or image fails to load */}
                          <div
                            className="h-full w-full items-center justify-center bg-slate-800"
                            style={{
                              display: student.photo_url ? "none" : "flex",
                            }}
                          >
                            <User size={80} className="text-slate-600" />
                          </div>
                        </div>
                        <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#EC1B23] rounded-2xl flex items-center justify-center shadow-lg z-20 animate-pulse">
                          <Shield size={24} className="text-white" />
                        </div>
                      </div>
                      <div className="mt-8 px-6 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-sm font-black">
                        OFFICIALLY VERIFIED RECORD
                      </div>
                    </div>

                    {/* Right: Data Grid */}
                    <div className="lg:col-span-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-12">
                        <InfoItem
                          icon={User}
                          label="Student Name"
                          value={student.student_name}
                        />
                        <InfoItem
                          icon={Hash}
                          label="Student ID"
                          value={student.student_id}
                        />
                        <InfoItem
                          icon={BookOpen}
                          label="Course Title"
                          value={student.course_name}
                        />
                        <InfoItem
                          icon={Building}
                          label="Batch ID"
                          value={student.batch}
                        />
                      </div>

                      <button
                        onClick={() => navigate(`/student/${student._id}`)}
                        className="w-full mt-12 py-5 bg-white text-[#000c1d] rounded-2xl font-black text-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-3 shadow-xl"
                      >
                        <Eye size={22} /> VIEW COMPLETE PROFILE
                      </button>

                      <div className="flex items-center justify-center mt-6 gap-6 opacity-40">
                        <button
                          onClick={() => window.print()}
                          className="text-sm flex items-center gap-2 hover:opacity-100 transition-opacity"
                        >
                          <RotateCw size={14} /> Refresh
                        </button>
                        <div className="h-4 w-px bg-white"></div>
                        <p className="text-sm font-mono tracking-tighter">
                          CIB-AUTH-{student._id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <NoResultsFound reset={handleResetSearch} />
          )}
        </div>
      )}
    </div>
  );
};

export default StudentSearch;
