import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateCourse, useUpdateCourse, useCourse } from "../hooks/useCourses";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { Check, ChevronDown, Plus } from "lucide-react";
import InputGroup from "../components/fields/InputGroup";
import SelectGroup from "../components/fields/SelectGroup";

const AddCourse = ({ mode = "add" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
 
  const { data: courseData, isLoading: courseLoading } = useCourse(mode === 'edit' ? id : null);

  const additionalInfoOptions = [
    { value: "haccp&hygiene", label: "HACCP & Hygiene" },
    { value: "city&guild", label: "City & Guilds" },
    { value: "nsda", label: "NSDA" },
  ];

  const [formData, setFormData] = useState({
    course_name: "",
    course_code: "",
    duration_value: "",
    duration_unit: "months",
    description: "",
    additional_info: [],
    is_active: true,
  });

  const [formErrors, setFormErrors] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [customInfo, setCustomInfo] = useState(""); // <-- State for custom tags

  useEffect(() => {
    if (mode === "edit" && courseData) {
      let additionalInfoArray = [];
      if (courseData.additional_info) {
        if (Array.isArray(courseData.additional_info)) {
          additionalInfoArray = courseData.additional_info;
        } else if (typeof courseData.additional_info === 'string') {
          additionalInfoArray = courseData.additional_info ? [courseData.additional_info] : [];
        }
      }
      
      setFormData({
        course_name: courseData.course_name || "",
        course_code: courseData.course_code || "",
        duration_value: courseData.duration?.value?.toString() || "",
        duration_unit: courseData.duration?.unit || "months",
        description: courseData.description || "",
        additional_info: additionalInfoArray,
        is_active: courseData.is_active ?? true,
      });
    }
  }, [mode, courseData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    
    if (name === "duration_value") {
      setFormData((prev) => ({ ...prev, [name]: value === "" ? "" : value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const handleAdditionalInfoChange = (optionValue) => {
    setFormData(prev => {
      const currentSelection = [...prev.additional_info];
      if (currentSelection.includes(optionValue)) {
        return { ...prev, additional_info: currentSelection.filter(item => item !== optionValue) };
      } else {
        return { ...prev, additional_info: [...currentSelection, optionValue] };
      }
    });
  };

  // <-- NEW: Function to handle adding custom tags from the frontend
  const handleAddCustomInfo = (e) => {
    e?.preventDefault(); // Prevent accidental form submission
    const val = customInfo.trim();
    if (val && !formData.additional_info.includes(val)) {
      setFormData(prev => ({ 
        ...prev, 
        additional_info: [...prev.additional_info, val] 
      }));
    }
    setCustomInfo(""); // Reset input field
  };

  // <-- NEW: Handle Enter key press inside custom input
  const handleCustomInfoKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomInfo();
    }
  };

  const handleSelectAll = () => {
    if (formData.additional_info.length >= additionalInfoOptions.length) {
      setFormData(prev => ({ ...prev, additional_info: [] }));
    } else {
      setFormData(prev => ({ ...prev, additional_info: additionalInfoOptions.map(opt => opt.value) }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.course_name.trim()) errors.course_name = "Course name is required";
    if (!formData.course_code.trim()) errors.course_code = "Course code is required";
    
    const durationNum = Number(formData.duration_value);
    if (!formData.duration_value || isNaN(durationNum) || durationNum <= 0) {
      errors.duration_value = "Valid duration required";
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the highlighted errors");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const coursePayload = {
        course_name: formData.course_name.trim(),
        course_code: formData.course_code.trim(),
        duration_value: Number(formData.duration_value),
        duration_unit: formData.duration_unit,
        description: formData.description.trim(),
        additional_info: formData.additional_info,
        is_active: formData.is_active,
      };

      if (mode === "edit") {
        await updateCourse.mutateAsync({ id, ...coursePayload });
      } else {
        await createCourse.mutateAsync(coursePayload);
      }

      setTimeout(() => navigate("/admin/all-courses"), 1000);
    } catch (error) {
      // Error handling is managed globally by react-query
    }
  };

  const isLoading = createCourse.isPending || updateCourse.isPending || (mode === "edit" && courseLoading);

  if (isLoading && mode === "edit" && !courseData) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 relative">
          
          {(createCourse.isPending || updateCourse.isPending) && (
            <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center backdrop-blur-[1px] rounded-xl">
              <Loader />
            </div>
          )}

          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {mode === "edit" ? "Edit Course Details" : "Create New Course"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {mode === "edit" ? "Update existing course curriculum information" : "Define a new training program"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin/all-courses")}
              disabled={isLoading}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
            >
              ← Back to Roster
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Course Name" name="course_name" value={formData.course_name} onChange={handleChange} error={formErrors.course_name} required />
              <InputGroup label="Course Code" name="course_code" value={formData.course_code} onChange={handleChange} error={formErrors.course_code} placeholder="e.g., FSM-101" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Duration Value" name="duration_value" type="number" value={formData.duration_value} onChange={handleChange} error={formErrors.duration_value} placeholder="e.g., 6" required />
              
              {/* UPDATED: Added 'Days' to the duration dropdown */}
              <SelectGroup 
                label="Duration Unit" 
                name="duration_unit" 
                value={formData.duration_unit} 
                onChange={handleChange} 
                options={[
                  {value: 'days', label: 'Days'}, 
                  {value: 'months', label: 'Months'}, 
                  {value: 'years', label: 'Years'}
                ]} 
                required 
              />
            </div>

            {/* Custom Multi-Select Dropdown */}
            <div className="relative z-10">
              <label className="block text-sm font-medium text-gray-800 mb-1.5">
                Additional Certifications (Optional)
              </label>
              <div 
                className="w-full px-3.5 py-2.5 min-h-[44px] border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition cursor-pointer bg-white flex flex-wrap items-center justify-between shadow-sm"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {formData.additional_info?.length > 0 ? (
                    formData.additional_info.map((selectedValue) => {
                      const option = additionalInfoOptions.find(opt => opt.value === selectedValue);
                      return (
                        <span key={selectedValue} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {option?.label || selectedValue}
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleAdditionalInfoChange(selectedValue); }} className="ml-1.5 text-blue-400 hover:text-blue-600 focus:outline-none">×</button>
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
                  
                  {/* NEW: Custom Input Field inside dropdown */}
                  <div className="p-3 border-b border-gray-100 bg-gray-50/50" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={customInfo}
                        onChange={(e) => setCustomInfo(e.target.value)}
                        onKeyDown={handleCustomInfoKeyDown}
                        placeholder="Type custom info & press Enter..."
                        className="flex-1 text-sm px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button 
                        type="button" 
                        onClick={handleAddCustomInfo}
                        disabled={!customInfo.trim()}
                        className="px-3 py-1.5 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-y-auto">
                    <div className="flex items-center px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100" onClick={handleSelectAll}>
                      <div className={`w-4 h-4 border rounded flex items-center justify-center mr-3 transition-colors ${formData.additional_info?.length >= additionalInfoOptions.length ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                        {formData.additional_info?.length >= additionalInfoOptions.length && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm font-medium text-gray-700">Select Standard (All)</span>
                    </div>
                    {additionalInfoOptions.map((option) => {
                      const isSelected = formData.additional_info?.includes(option.value);
                      return (
                        <div key={option.value} className="flex items-center px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => handleAdditionalInfoChange(option.value)}>
                          <div className={`w-4 h-4 border rounded flex items-center justify-center mr-3 transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <label className="block mb-1.5 text-sm font-medium text-gray-800">Course Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter detailed course description..."
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-2.5 cursor-pointer w-fit">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-800">Course is Active & Enrolling</span>
              </label>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {mode === "edit" ? "Save Course Changes" : "Publish New Course"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;