import React, { useState } from "react";
import useAuth from "../store/useAuth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, ShieldCheck, Loader2 } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login({ email, password });
      navigate("/admin");        
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e8f0f2] p-4 relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-400/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400/20 rounded-full blur-[100px]" />

      {/* Login Card */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 border border-white/50">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-teal-50 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-inner border border-teal-100/50">
            <ShieldCheck size={40} className="text-teal-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-2">Welcome Back</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Secure Access Portal
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Email Input */}
          <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
              <input
                type="email"
                placeholder="admin@cib.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white outline-none focus:border-teal-500 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="group">
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Password
              </label>
              {/* Optional: Add a "Forgot Password" link here in the future */}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white outline-none focus:border-teal-500 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-4 bg-teal-600 text-white text-[12px] font-black uppercase tracking-widest rounded-2xl hover:bg-teal-700 disabled:opacity-70 transition-all shadow-xl shadow-teal-600/20 flex justify-center items-center gap-2 mt-4"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Authenticating...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Sign In to Dashboard
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[10px] font-bold text-slate-400">
            Powered by <span className="text-teal-600">CIB Tech</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;