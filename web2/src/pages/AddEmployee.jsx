import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// FIX 1: Import the new unified user hooks we just created
import { useAddUser, useUpdateUser } from "../hooks/useUser.js"; 
import InputGroup from "../components/fields/InputGroup.jsx";
import SelectGroup from "../components/fields/SelectGroup.jsx";
import imageCompression from "browser-image-compression";
import { apiURL } from "../../Constant.js";

const BASE_URL = apiURL.image_url;

const AddEmployeeForm = ({ mode = "add", data = null }) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const navigate = useNavigate();

  // FIX 2: Use the new mutations
  const addUserMutation = useAddUser();
  const updateUserMutation = useUpdateUser();

  const departmentOptions = [
    { value: "Faculty", label: "Faculty / Instructor" },
    { value: "Administration", label: "Administration" },
    { value: "Management", label: "Management" },
    { value: "Support Staff", label: "Support Staff" },
  ];

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "On Leave", label: "On Leave" },
    { value: "Resigned", label: "Resigned" },
  ];

  const roleOptions = [
    { value: "staff", label: "General Staff" },
    { value: "instructor", label: "Instructor" },
    { value: "register", label: "Registrar" },
    { value: "admin", label: "Administrator" },
  ];

  const [formData, setFormData] = useState({
    employee_id: "",
    full_name: "",
    email: "",
    phone: "",
    designation: "",
    department: "",
    joining_date: "",
    status: "Active",
    username: "",
    password: mode === "add" ? "123456" : "", 
    role: "staff",
    facebook: "",
    linkedin: "",
    twitter: "",
    instagram: "",
  });

  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // FIX 3: Robust Population for Edit Mode
  useEffect(() => {
    if (mode === "edit" && data) {
      setFormData({
        employee_id: data.employee_id || "",
        full_name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        designation: data.designation || "",
        department: data.department || "",
        joining_date: data.joining_date ? data.joining_date.split("T")[0] : "",
        status: data.status || "Active",
        username: data.username || "",
        password: "", // Keep empty so they don't accidentally overwrite it unless typing
        role: data.role || "staff",
        facebook: data.social_links?.facebook || "",
        linkedin: data.social_links?.linkedin || "",
        twitter: data.social_links?.twitter || "",
        instagram: data.social_links?.instagram || "",
      });

      if (data.photo_url && typeof data.photo_url === "string" && data.photo_url.trim() !== "") {
        setPreviewUrl(
          data.photo_url.startsWith("http")
            ? data.photo_url
            : `${BASE_URL}${data.photo_url}`
        );
      } else {
        setPreviewUrl("");
      }
    }
  }, [mode, data]);

  useEffect(() => {
    if (!photo) return;
    const objectUrl = URL.createObjectURL(photo);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return setFormErrors({
        ...formErrors,
        photo: "Invalid image type. Please select a picture.",
      });
    }

    setIsCompressing(true);
    setFormErrors((prev) => ({ ...prev, photo: undefined }));

    try {
      const options = {
        maxSizeMB: 0.5, 
        maxWidthOrHeight: 1280,
        useWebWorker: true,
        initialQuality: 0.7,
      };

      const compressedBlob = await imageCompression(file, options);
      const compressedFile = new File([compressedBlob], file.name, {
        type: compressedBlob.type,
        lastModified: Date.now(),
      });

      setPhoto(compressedFile);
    } catch (error) {
      console.error("Image compression failed:", error);
      setFormErrors((prev) => ({
        ...prev,
        photo: "Failed to compress image. Try a different file.",
      }));
    } finally {
      setIsCompressing(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      "employee_id",
      "full_name",
      "email",
      "phone",
      "designation",
      "department",
      "username",
      "role",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field] || String(formData[field]).trim() === "") {
        errors[field] = "This field is required";
      }
    });

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (mode === "add" && (!formData.password || formData.password.trim() === "")) {
      errors.password = "Password is required for new accounts";
    } else if (formData.password && formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const employeeData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "password" && mode === "edit" && (!value || value.trim() === "")) return;

      if (value !== undefined && value !== null && value !== "") {
        employeeData.append(key, typeof value === "string" ? value.trim() : value);
      }
    });

    if (photo) employeeData.append("photo", photo);

    // Adjust this route depending on what your admin directory page is named
    const mutationConfig = {
      onSuccess: () => navigate("/admin/all-employees"), 
    };

    if (mode === "edit") {
      updateUserMutation.mutate(
        { id: data._id, formData: employeeData },
        mutationConfig
      );
    } else {
      addUserMutation.mutate(employeeData, mutationConfig);
    }
  };

  const isMutating = addUserMutation.isPending || updateUserMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-8 pb-4 border-b">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === "edit" ? "Edit Employee Profile" : "Register New Employee"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Fill out the information below to {mode === "edit" ? "update" : "create"} an employee record.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/all-employees")}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
          >
            ← Back to List
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} error={formErrors.full_name} required />
              <InputGroup label="Employee ID" name="employee_id" value={formData.employee_id} onChange={handleChange} error={formErrors.employee_id} required />
              <InputGroup label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={formErrors.email} required />
              <InputGroup label="Contact Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} error={formErrors.phone} required />
            </div>
          </div>

          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Job Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectGroup label="Department" name="department" defaultOption="Select Department..." value={formData.department} onChange={handleChange} options={departmentOptions} error={formErrors.department} required />
              <InputGroup label="Designation / Job Title" name="designation" placeholder="e.g. Senior Culinary Instructor" value={formData.designation} onChange={handleChange} error={formErrors.designation} required />
              <InputGroup label="Joining Date" name="joining_date" type="date" value={formData.joining_date} onChange={handleChange} />
              <SelectGroup label="Employment Status" name="status" value={formData.status} onChange={handleChange} options={statusOptions} />
            </div>
          </div>

          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Credentials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Username" name="username" value={formData.username} onChange={handleChange} error={formErrors.username} required />
              <InputGroup 
                label={mode === "edit" ? "New Password (Optional)" : "Password"} 
                name="password" 
                type="text" 
                placeholder={mode === "add" ? "123456" : "Leave blank to keep current"} 
                value={formData.password} 
                onChange={handleChange} 
                error={formErrors.password} 
                required={mode === "add"} 
              />
              <SelectGroup label="System Role" name="role" value={formData.role} onChange={handleChange} options={roleOptions} error={formErrors.role} required />
            </div>
          </div>

          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Social Links (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Facebook URL" name="facebook" placeholder="https://facebook.com/..." value={formData.facebook} onChange={handleChange} />
              <InputGroup label="LinkedIn URL" name="linkedin" placeholder="https://linkedin.com/in/..." value={formData.linkedin} onChange={handleChange} />
              <InputGroup label="Twitter (X) URL" name="twitter" placeholder="https://twitter.com/..." value={formData.twitter} onChange={handleChange} />
              <InputGroup label="Instagram URL" name="instagram" placeholder="https://instagram.com/..." value={formData.instagram} onChange={handleChange} />
            </div>
          </div>

          <div className="pt-6 border-t">
            <h2 className="text-sm font-medium text-gray-800 mb-3">Employee Photo</h2>
            <div className="flex items-center space-x-6">
              <div className="shrink-0">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-24 w-24 object-cover rounded-xl shadow-sm border border-gray-200" />
                ) : (
                  <div className="h-24 w-24 rounded-xl bg-gray-100 border border-gray-200 border-dashed flex items-center justify-center text-gray-400">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <label className="block">
                <span className="sr-only">Choose profile photo</span>
                <input type="file" onChange={handleUploadPhoto} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer transition-colors" />
                {formErrors.photo && <p className="text-sm text-red-600 mt-2">{formErrors.photo}</p>}
              </label>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isMutating || isCompressing}
              className="w-full py-3.5 bg-[#000c1d] text-white font-bold rounded-lg shadow-sm hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isCompressing ? "Optimizing Image..." : isMutating ? "Processing..." : mode === "edit" ? "Save Changes" : "Register Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeForm;