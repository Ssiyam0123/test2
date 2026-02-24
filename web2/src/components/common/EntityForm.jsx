import React, { useState, useEffect } from "react";
import imageCompression from "browser-image-compression";
import { Loader2 } from "lucide-react";
import InputGroup from "../fields/InputGroup.jsx";
import SelectGroup from "../fields/SelectGroup.jsx";
import { apiURL } from "../../../Constant.js";

const BASE_URL = apiURL.image_url;

const EntityForm = ({ 
  title, subtitle, config, onSubmit, isLoading, initialData = {}, 
  buttonText = "Submit", mode = "add", onCancel, buttonColor
}) => {
  const [formData, setFormData] = useState(() => {
    const initialFields = {};
    config.forEach(field => {
      if (field.type === "checkbox-group") {
        initialFields[field.name] = initialData[field.name] || [];
      } else if (field.name) {
        initialFields[field.name] = initialData[field.name] || "";
      }
    });
    return { ...initialData, ...initialFields };
  });

  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData((prev) => ({ ...prev, ...initialData }));
      
      if (initialData.photo_url && typeof initialData.photo_url === "string" && initialData.photo_url.trim() !== "") {
        setPreviewUrl(initialData.photo_url.startsWith("http") ? initialData.photo_url : `${BASE_URL}${initialData.photo_url}`);
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (!photo) return;
    const objectUrl = URL.createObjectURL(photo);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    
    // Checkbox Group Array logic
    if (e.target.dataset.group === "checkbox-group") {
      setFormData((prev) => {
        const currentArray = Array.isArray(prev[name]) ? prev[name] : [];
        if (checked) {
          return { ...prev, [name]: [...currentArray, value] };
        } else {
          return { ...prev, [name]: currentArray.filter(item => item !== value) };
        }
      });
      return;
    }

    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setFormErrors({ ...formErrors, photo: "Invalid image type." });

    setIsCompressing(true);
    setFormErrors((prev) => ({ ...prev, photo: undefined }));
    try {
      const compressedBlob = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1280, useWebWorker: true, initialQuality: 0.7 });
      setPhoto(new File([compressedBlob], file.name, { type: compressedBlob.type, lastModified: Date.now() }));
    } catch (error) {
      setFormErrors((prev) => ({ ...prev, photo: "Failed to compress image." }));
    } finally {
      setIsCompressing(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    config.forEach((field) => {
      const value = formData[field.name];
      
      if (field.required) {
        if (Array.isArray(value) && value.length === 0) {
          errors[field.name] = "Please select at least one option";
        } else if (!Array.isArray(value) && (!value || String(value).trim() === "")) {
          errors[field.name] = "This field is required";
        }
      }
      
      if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[field.name] = "Invalid email format";
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) value.forEach(v => data.append(`${key}[]`, v));
        else data.append(key, typeof value === "string" ? value.trim() : value);
      }
    });
    if (photo) data.append("photo", photo);
    
    onSubmit(data, formData);
  };

  const standardFields = config.filter(f => !["file", "checkbox"].includes(f.type));
  const fileField = config.find(f => f.type === "file");
  const singleCheckboxFields = config.filter(f => f.type === "checkbox");

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-xl p-8 relative overflow-hidden border border-gray-100">
      {(isLoading || isCompressing) && (
        <div className="absolute inset-0 bg-white/60 z-50 flex items-center justify-center backdrop-blur-[2px]">
          <Loader2 className="animate-spin text-teal-600" size={40} />
        </div>
      )}

      <div className="flex justify-between items-start mb-8 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">{subtitle}</p>
        </div>
        <button onClick={onCancel} type="button" className="text-xs font-bold text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl transition-all border border-gray-100">
          CANCEL
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {standardFields.map((field) => {
            if (field.divider) {
              return (
                <div key={field.name} className="col-span-full pt-4 mt-2 border-t border-gray-50">
                  {field.title && <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">{field.title}</h2>}
                </div>
              );
            }
            
            if (field.type === "custom") {
              return (
                <div key={field.name} className={field.fullWidth ? "col-span-full" : ""}>
                  {field.render({
                    value: formData[field.name],
                    onChange: (val) => setFormData(prev => ({ ...prev, [field.name]: val }))
                  })}
                </div>
              );
            }

            // ==========================================
            // UPDATED: Checkbox Group Logic (Clean Grid UI)
            // ==========================================
            if (field.type === "checkbox-group") {
              const currentValues = Array.isArray(formData[field.name]) ? formData[field.name] : [];
              return (
                <div key={field.name} className={field.fullWidth ? "col-span-full" : "col-span-full"}>
                  <label className="block mb-4 text-[13px] font-bold text-gray-800 tracking-wide ml-1">
                    {field.label}
                  </label>
                  {/* The grid controls the layout exactly like the image */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-4 gap-x-6 ml-1">
                    {field.options.map((opt) => (
                      <label 
                        key={opt.value} 
                        className="flex items-center space-x-2.5 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          name={field.name}
                          value={opt.value}
                          data-group="checkbox-group"
                          checked={currentValues.includes(opt.value)}
                          onChange={handleChange}
                          // Uses accent color to get the native teal fill without custom SVGs
                          className="w-[18px] h-[18px] text-teal-600 bg-white border-gray-300 rounded focus:ring-teal-500 accent-teal-600 cursor-pointer transition-all"
                        />
                        <span className="text-[14px] text-gray-700 font-medium select-none group-hover:text-gray-900 transition-colors">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {formErrors[field.name] && <p className="text-[10px] font-bold text-red-500 mt-3 ml-1 uppercase">{formErrors[field.name]}</p>}
                </div>
              );
            }

            if (field.type === "select") {
              return (
                <SelectGroup key={field.name} label={field.label} name={field.name} value={formData[field.name] || ""} onChange={handleChange} options={field.options} defaultOption={field.defaultOption} required={field.required} error={formErrors[field.name]} />
              );
            }
            
            if (field.type === "textarea") {
              return (
                <div key={field.name} className={`flex flex-col ${field.fullWidth ? 'col-span-full' : ''}`}>
                  <label className="block mb-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">{field.label}</label>
                  <textarea 
                    name={field.name} 
                    value={formData[field.name] || ""} 
                    onChange={handleChange} 
                    rows={field.rows || "3"} 
                    placeholder={field.placeholder} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all duration-200" 
                  />
                  {formErrors[field.name] && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase">{formErrors[field.name]}</p>}
                </div>
              );
            }

            return (
              <div key={field.name} className={field.fullWidth ? "col-span-full" : ""}>
                <InputGroup 
                  label={field.label} 
                  name={field.name} 
                  type={field.type || "text"} 
                  value={formData[field.name] || ""} 
                  onChange={handleChange} 
                  placeholder={field.placeholder} 
                  required={field.required} 
                  error={formErrors[field.name]} 
                  {...field.props} 
                />
              </div>
            );
          })}
        </div>

        {fileField && (
          <div className="pt-6 border-t border-gray-50">
            <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-4 ml-1">{fileField.label}</h2>
            <div className="flex items-center space-x-6 bg-gray-50 p-4 rounded-3xl border border-gray-100">
              <div className="shrink-0">
                {previewUrl ? <img src={previewUrl} alt="Preview" className="h-20 w-20 object-cover rounded-2xl shadow-md border-2 border-white" /> : <div className="h-20 w-20 rounded-2xl bg-white border border-gray-200 border-dashed flex items-center justify-center text-[10px] font-bold text-gray-300 uppercase">No Image</div>}
              </div>
              <label className="block flex-1">
                <input type="file" onChange={handleUploadPhoto} accept="image/*" className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer transition-all" />
                {formErrors.photo && <p className="text-[10px] font-bold text-red-500 mt-2 uppercase">{formErrors.photo}</p>}
              </label>
            </div>
          </div>
        )}

        {singleCheckboxFields.length > 0 && (
          <div className="flex flex-wrap gap-6 pt-6 border-t border-gray-50">
            {singleCheckboxFields.map((field) => (
              <label key={field.name} className="flex items-center space-x-3 cursor-pointer group">
                <input type="checkbox" name={field.name} checked={formData[field.name] || false} onChange={handleChange} className="w-[18px] h-[18px] text-teal-600 rounded-lg border-gray-300 focus:ring-teal-500 accent-teal-600 transition-all cursor-pointer" />
                <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{field.label}</span>
              </label>
            ))}
          </div>
        )}

        <div className="pt-4">
          <button 
            type="submit" 
            disabled={isLoading || isCompressing} 
            className={`w-full py-4 flex justify-center items-center gap-2 text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${buttonColor || "bg-[#14b8a6] hover:bg-teal-600 shadow-teal-500/20"}`}
          >
            {isCompressing ? "Optimizing..." : isLoading ? "Processing..." : buttonText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EntityForm;