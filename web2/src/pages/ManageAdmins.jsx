import React, { useState } from "react";
import { Trash2, Plus, X, ShieldCheck, UserCog } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "../api/axios";
import Loader from "../components/Loader.jsx";
import toast from "react-hot-toast";

const ManageAdmins = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "123456", 
    full_name: "",
    employee_id: "",
    phone: "",
    role: "admin" 
  });

  // 1. Fetch ONLY admins using the role query parameter
  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      // Pointing to the new unified users route with the role filter
      const res = await API.get("/users/all?role=admin&limit=100");
      // The backend returns { data: [...], pagination: {...} }, so we return res.data.data
      return res.data.data || [];
    },
  });

  // 2. Updated Toggle Mutation
  const toggleRole = useMutation({
    mutationFn: (id) => API.patch(`/users/toggle-role/${id}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["admins"]);
      toast.success(res.data.message);
    },
  });

  // 3. Updated Delete Mutation 
  const deleteUser = useMutation({
    mutationFn: (id) => API.delete(`/users/delete/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["admins"]);
      toast.success("Account removed");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete")
  });

  const addAdmin = useMutation({
    mutationFn: async (data) => {
      // Because the /users/create route uses multer, we must send it as FormData
      const formData = new FormData();
      Object.keys(data).forEach((key) => formData.append(key, data[key]));
      return await API.post("/users/create", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admins"]);
      setOpen(false);
      setForm({ username: "", email: "", password: "123456", full_name: "", employee_id: "", phone: "", role: "admin" });
      toast.success("New Admin Registered");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Registration failed")
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addAdmin.mutate(form);
  };

  if (isLoading) return <Loader/>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Permissions</h1>
          <p className="text-sm text-gray-500">Manage administrative access for staff members</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
        >
          <Plus size={18} /> Add Admin
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Identity</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Email</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Admin Access</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {admins?.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{user.full_name || user.username}</p>
                      <p className="text-xs text-gray-400">@{user.username}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600">{user.email}</td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => toggleRole.mutate(user._id)}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all bg-green-100 text-green-700 border border-green-200"
                  >
                    ENABLED
                  </button>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => { if(window.confirm("Delete this admin account?")) deleteUser.mutate(user._id)}}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            
            {admins.length === 0 && (
               <tr>
                 <td colSpan="4" className="p-8 text-center text-gray-500">No admins found.</td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button>
            <h2 className="text-xl font-bold mb-1">New Administrator</h2>
            <p className="text-sm text-gray-500 mb-6">Create a new staff identity with admin privileges.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              <div className="grid grid-cols-2 gap-4">
                 <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                 <input placeholder="Employee ID" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} required className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <input type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              <input placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3">
                 <UserCog className="text-amber-600" size={20} />
                 <p className="text-[11px] text-amber-700 leading-tight">Admin accounts are created with the default password <span className="font-bold">123456</span></p>
              </div>

              <button
                type="submit"
                disabled={addAdmin.isPending}
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
              >
                {addAdmin.isPending ? "Registering..." : "Complete Registration"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAdmins;