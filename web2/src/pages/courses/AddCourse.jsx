import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateCourse, useUpdateCourse, useCourse } from "../../hooks/useCourses";
import EntityForm from "../../components/common/EntityForm";
import Loader from "../../components/Loader";
import { Check, ChevronDown, Plus } from "lucide-react";
import toast from "react-hot-toast";

const additionalInfoOptions = [
  { value: "haccp&hygiene", label: "HACCP & Hygiene" },
  { value: "city&guild", label: "City & Guilds" },
  { value: "nsda", label: "NSDA" },
];

const AddCourse = ({ mode = "add" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const { data: courseData, isLoading: courseLoading } = useCourse(mode === 'edit' ? id : null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [customInfo, setCustomInfo] = useState("");

  const initialData = useMemo(() => {
    if (mode === "edit" && courseData) {
      const infoArray = Array.isArray(courseData.additional_info) 
        ? courseData.additional_info 
        : (courseData.additional_info ? [courseData.additional_info] : []);

      return {
        course_name: courseData.course_name || "",
        course_code: courseData.course_code || "",
        duration_value: courseData.duration?.value?.toString() || "",
        duration_unit: courseData.duration?.unit || "months",
        description: courseData.description || "",
        additional_info: infoArray,
        is_active: courseData.is_active ?? true,
      };
    }
    return {
      course_name: "", course_code: "", duration_value: "", duration_unit: "months",
      description: "", additional_info: [], is_active: true,
    };
  }, [mode, courseData]);

  // Inject Custom Multi-Select UI into EntityForm
  const renderMultiSelect = ({ value = [], onChange }) => {
    const handleToggle = (optValue) => {
      onChange(value.includes(optValue) ? value.filter(v => v !== optValue) : [...value, optValue]);
    };

    const handleAddCustom = (e) => {
      e?.preventDefault();
      const val = customInfo.trim();
      if (val && !value.includes(val)) onChange([...value, val]);
      setCustomInfo("");
    };

    const handleSelectAll = () => {
      onChange(value.length >= additionalInfoOptions.length ? [] : additionalInfoOptions.map(o => o.value));
    };

    return (
      <div className="relative z-10">
        <label className="block text-sm font-medium text-gray-800 mb-1.5">Additional Certifications (Optional)</label>
        <div 
          className="w-full px-3.5 py-2.5 min-h-[44px] border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition cursor-pointer bg-white flex flex-wrap items-center justify-between shadow-sm"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="flex flex-wrap gap-1.5 flex-1">
            {value.length > 0 ? (
              value.map((selectedValue) => {
                const option = additionalInfoOptions.find(opt => opt.value === selectedValue);
                return (
                  <span key={selectedValue} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    {option?.label || selectedValue}
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleToggle(selectedValue); }} className="ml-1.5 text-blue-400 hover:text-blue-600 focus:outline-none">×</button>
                  </span>
                );
              })
            ) : (
              <span className="text-gray-400 text-sm">Select or add certifications...</span>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </div>

        {showDropdown && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-72 flex flex-col">
            <div className="p-3 border-b border-gray-100 bg-gray-50/50" onClick={e => e.stopPropagation()}>
              <div className="flex gap-2">
                <input 
                  type="text" value={customInfo} onChange={(e) => setCustomInfo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustom(e)}
                  placeholder="Type custom info & press Enter..."
                  className="flex-1 text-sm px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button type="button" onClick={handleAddCustom} disabled={!customInfo.trim()} className="px-3 py-1.5 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition">
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto">
              <div className="flex items-center px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100" onClick={handleSelectAll}>
                <div className={`w-4 h-4 border rounded flex items-center justify-center mr-3 transition-colors ${value.length >= additionalInfoOptions.length ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                  {value.length >= additionalInfoOptions.length && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm font-medium text-gray-700">Select Standard (All)</span>
              </div>
              {additionalInfoOptions.map((option) => (
                <div key={option.value} className="flex items-center px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => handleToggle(option.value)}>
                  <div className={`w-4 h-4 border rounded flex items-center justify-center mr-3 transition-colors ${value.includes(option.value) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                    {value.includes(option.value) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm text-gray-700">{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const courseConfig = [
    { name: "course_name", label: "Course Name", required: true },
    { name: "course_code", label: "Course Code", placeholder: "e.g., FSM-101", required: true },
    { name: "duration_value", label: "Duration Value", type: "number", placeholder: "e.g., 6", required: true, props: { min: "1" } },
    { name: "duration_unit", label: "Duration Unit", type: "select", required: true, options: [
      { value: 'days', label: 'Days' }, { value: 'months', label: 'Months' }, { value: 'years', label: 'Years' }
    ]},
    { name: "additional_info", type: "custom", fullWidth: true, render: renderMultiSelect },
    { name: "description", label: "Course Description", type: "textarea", rows: "4", fullWidth: true, placeholder: "Enter detailed course description..." },
    { name: "is_active", label: "Course is Active & Enrolling", type: "checkbox" }
  ];

  // We capture BOTH args, but only use rawData to match your backend logic exactly
  const handleSubmit = async (formDataInstance, rawData) => {
    if (Number(rawData.duration_value) <= 0) return toast.error("Valid duration required");

    const coursePayload = {
      course_name: String(rawData.course_name).trim(),
      course_code: String(rawData.course_code).trim(),
      duration_value: Number(rawData.duration_value),
      duration_unit: rawData.duration_unit,
      description: String(rawData.description).trim(),
      additional_info: rawData.additional_info,
      is_active: rawData.is_active,
    };

    try {
      if (mode === "edit") await updateCourse.mutateAsync({ id, ...coursePayload });
      else await createCourse.mutateAsync(coursePayload);
      setTimeout(() => navigate("/admin/all-courses"), 1000);
    } catch (error) {
      // Handled by tanstack
    }
  };

  const isLoading = createCourse.isPending || updateCourse.isPending || (mode === "edit" && courseLoading);

  if (isLoading && mode === "edit" && !courseData) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <EntityForm
        title={mode === "edit" ? "Edit Course Details" : "Create New Course"}
        subtitle={mode === "edit" ? "Update existing course curriculum information" : "Define a new training program"}
        config={courseConfig}
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        buttonText={mode === "edit" ? "Save Course Changes" : "Publish New Course"}
        mode={mode}
        onCancel={() => navigate("/admin/all-courses")}
      />
    </div>
  );
};

export default AddCourse;