import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, Save } from "lucide-react";
import EntityForm from "../../components/common/EntityForm";
import { 
  useAddMasterSyllabus, 
  useUpdateMasterSyllabus, 
  useMasterSyllabusDetails,
  useMasterTopics 
} from "../../hooks/useMasterSyllabus";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";

const CATEGORIES = ["Foundations", "Continental", "Asian", "Bakery & Pastry", "Middle Eastern", "Beverage", "Assessment", "General"];

export default function AddMasterSyllabus({ mode = "add" }) {
  const navigate = useNavigate();
  const { id } = useParams();

  // ১. ডাটাবেজ থেকে সব টপিক আনা (যাতে ম্যাক্সিমাম সিরিয়াল বের করা যায়)
  const { data: allTopicsRes, isLoading: loadingAll } = useMasterTopics();
  
  // ২. এডিট মোড হলে ওই নির্দিষ্ট টপিকের ডাটা আনা
  const { data: editData, isLoading: loadingEdit } = useMasterSyllabusDetails(id, { 
    enabled: mode === "edit" && !!id 
  });

  const addMutation = useAddMasterSyllabus();
  const editMutation = useUpdateMasterSyllabus();

  const [topics, setTopics] = useState([]);

  // 🚀 অটো-সিরিয়াল সেট করার লজিক (শুধুমাত্র Add মোডে)
  useEffect(() => {
    if (mode === "add" && allTopicsRes?.data) {
      // ডাটাবেজের সর্বোচ্চ order_index খুঁজে বের করা
      const currentMax = allTopicsRes.data.length > 0 
        ? Math.max(...allTopicsRes.data.map(t => t.order_index || 0)) 
        : 0;

      // ৫টা নতুন রো সেট করা যা ম্যাক্সিমাম নাম্বারের পর থেকে শুরু হবে
      setTopics([
        { topic: "", category: "General", class_type: "Lecture", order_index: currentMax + 1, description: "" },
        { topic: "", category: "General", class_type: "Lecture", order_index: currentMax + 2, description: "" },
        { topic: "", category: "General", class_type: "Lecture", order_index: currentMax + 3, description: "" },
      ]);
    }
  }, [allTopicsRes, mode]);

  // 🚀 এডিট মোডে শুধুমাত্র ওই ১টি টপিক সেট করা
  useEffect(() => {
    if (mode === "edit" && editData?.data) {
      setTopics([{ ...editData.data }]);
    }
  }, [editData, mode]);

  const handleRowChange = (index, field, value) => {
    const updated = [...topics];
    updated[index][field] = value;
    setTopics(updated);
  };

  const handleAddMoreRows = () => {
    const lastOrder = topics.length > 0 ? topics[topics.length - 1].order_index : 0;
    const lastCategory = topics.length > 0 ? topics[topics.length - 1].category : "General";
    
    setTopics([...topics, { 
      topic: "", 
      category: lastCategory, 
      class_type: "Lecture", 
      order_index: lastOrder + 1, 
      description: "" 
    }]);
  };

  const removeRow = (index) => {
    if (mode === "edit") return; // এডিট মোডে রো রিমুভ বন্ধ
    setTopics(topics.filter((_, i) => i !== index));
  };

  const formConfig = [
    {
      name: "topics_builder",
      type: "custom",
      fullWidth: true,
      render: () => (
        <div className="space-y-4">
          {topics.map((item, idx) => (
            <div key={idx} className="p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:border-teal-200 transition-all group relative">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                
                <div className="md:col-span-3 flex gap-3">
                   <div className="w-10 h-10 shrink-0 bg-gray-900 text-white rounded-xl flex items-center justify-center text-xs font-black">
                      {item.order_index}
                   </div>
                   <div className="flex-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase mb-1 block ml-1">Category</label>
                      <select
                        value={item.category}
                        onChange={(e) => handleRowChange(idx, "category", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white outline-none"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                </div>

                <div className="md:col-span-5">
                   <label className="text-[9px] font-black text-gray-400 uppercase mb-1 block ml-1">Topic Name</label>
                   <input
                    type="text"
                    required
                    value={item.topic}
                    onChange={(e) => handleRowChange(idx, "topic", e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:bg-white outline-none"
                  />
                </div>

                <div className="md:col-span-3">
                   <label className="text-[9px] font-black text-gray-400 uppercase mb-1 block ml-1">Type</label>
                   <select
                    value={item.class_type}
                    onChange={(e) => handleRowChange(idx, "class_type", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white outline-none"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab</option>
                    <option value="Exam">Exam</option>
                    <option value="Orientation">Orientation</option>
                  </select>
                </div>

                {mode === "add" && (
                  <div className="md:col-span-1 pt-5 text-right">
                    <button type="button" onClick={() => removeRow(idx)} className="p-2 text-gray-300 hover:text-rose-500"><Trash2 size={18} /></button>
                  </div>
                )}

                <div className="md:col-span-12">
                   <input
                    type="text"
                    placeholder="Details (Optional)..."
                    value={item.description}
                    onChange={(e) => handleRowChange(idx, "description", e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50/50 border border-dashed border-gray-200 rounded-xl text-[11px] text-gray-500 focus:bg-white outline-none"
                  />
                </div>
              </div>
            </div>
          ))}

          {mode === "add" && (
            <button
              type="button"
              onClick={handleAddMoreRows}
              className="w-full py-4 border-2 border-dashed border-gray-200 rounded-[2rem] text-gray-400 font-bold text-sm hover:border-teal-400 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Add More Topics
            </button>
          )}
        </div>
      )
    }
  ];

  const handleFormSubmit = () => {
    const finalData = topics.filter(t => t.topic.trim() !== "");
    if (finalData.length === 0) return toast.error("Please add a topic name.");

    if (mode === "edit") {
      editMutation.mutate({ id, payload: finalData[0] }, {
        onSuccess: () => navigate("/admin/manage-syllabus")
      });
    } else {
      addMutation.mutate(finalData, {
        onSuccess: () => navigate("/admin/manage-syllabus")
      });
    }
  };

  if (loadingAll || loadingEdit) return <div className="h-screen flex items-center justify-center"><Loader /></div>;

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen">
      <EntityForm
        title={mode === "edit" ? "Edit Syllabus Topic" : "Add to Library"}
        subtitle={mode === "edit" ? "Modify existing lesson details." : "Topics will automatically continue from your last entry."}
        config={formConfig}
        onSubmit={handleFormSubmit}
        isLoading={addMutation.isPending || editMutation.isPending}
        buttonText={mode === "edit" ? "Update Topic" : "Save to Library"}
        buttonColor="bg-gray-900 hover:bg-black"
        onCancel={() => navigate("/admin/manage-syllabus")}
      />
    </div>
  );
}