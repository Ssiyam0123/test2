import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAddStudent, useUpdateStudent } from "../hooks/useStudents.js";
import { useActiveCourses } from "../hooks/useCourses";
import Loader from "../components/Loader.jsx";
import InputGroup from "../components/fields/InputGroup.jsx";
import SelectGroup from "../components/fields/SelectGroup.jsx";
import imageCompression from "browser-image-compression";
import { apiURL } from "../../Constant.js";

const BASE_URL = apiURL.image_url;

const AddStudentForm = ({ mode = "add", data = null }) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const navigate = useNavigate();
  const {
    data: coursesData,
    isLoading: coursesLoading,
    error: coursesError,
  } = useActiveCourses();
  const addStudentMutation = useAddStudent();
  const editStudentMutation = useUpdateStudent();

  const activeCourses = coursesData?.data || [];
  const courseOptions = activeCourses.map((c) => ({
    value: c._id,
    label: c.course_name,
  }));
  const batchOptions = Array.from({ length: 20 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Batch ${i + 1}`,
  }));

  const [formData, setFormData] = useState({
    student_name: "",
    fathers_name: "",
    student_id: "",
    registration_number: "",
    gender: "male",
    course: "",
    competency: "not_assessed",
    batch: "1",
    status: "active",
    issue_date: "",
    completion_date: "",
    is_active: true,
    is_verified: false,
    contact_number: "",
    email: "",
    address: "",
  });

  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (mode === "edit" && data) {
      setFormData((prev) => ({
        ...prev,
        ...data,
        course: data.course?._id || "",
        batch: data.batch?.toString() || "1",
        issue_date: data.issue_date?.split("T")[0] || "",
        completion_date: data.completion_date?.split("T")[0] || "",
        gender: data.gender || "male",
        is_active: data.is_active ?? true,
        is_verified: data.is_verified ?? false,
      }));

      if (
        data.photo_url &&
        typeof data.photo_url === "string" &&
        data.photo_url.trim() !== ""
      ) {
        setPreviewUrl(
          data.photo_url.startsWith("http")
            ? data.photo_url
            : `${BASE_URL}${data.photo_url}`,
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

    // Free memory when component unmounts or photo changes
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (formErrors[name])
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
        maxSizeMB: 0.500, // Target file size
        maxWidthOrHeight: 1280, // Scale down massive 4K/8K phone camera photos
        useWebWorker: true, // Offloads work from the main thread
        initialQuality: 0.7,
        alwaysKeepResolution: false
      };

      // Compress the file
      const compressedBlob = await imageCompression(file, options);

      // Convert the Blob back into a standard File object so Multer reads the name correctly
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
    const requiredStr = [
      "student_name",
      "fathers_name",
      "student_id",
      "registration_number",
      "course",
      "batch",
      "issue_date",
    ];

    requiredStr.forEach((field) => {
      if (!formData[field] || String(formData[field]).trim() === "") {
        errors[field] = "This field is required";
      }
    });

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const studentData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        studentData.append(
          key,
          typeof value === "string" ? value.trim() : value,
        );
      }
    });

    if (photo) studentData.append("photo", photo);

    const mutationConfig = { onSuccess: () => navigate("/admin/all-students") };

    if (mode === "edit") {
      editStudentMutation.mutate(
        { id: data._id, formData: studentData },
        mutationConfig,
      );
    } else {
      addStudentMutation.mutate(studentData, mutationConfig);
    }
  };

  const isMutating =
    addStudentMutation.isPending || editStudentMutation.isPending;

  if (coursesLoading) return <Loader />;
  if (coursesError)
    return (
      <div className="p-6 text-red-600">
        Error loading courses. Please refresh.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-8 pb-4 border-b">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === "edit"
                ? "Edit Student Profile"
                : "Register New Student"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Fill out the information below to{" "}
              {mode === "edit" ? "update" : "create"} a student record.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/all-students")}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
          >
            ← Back to List
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup
              label="Student Name"
              name="student_name"
              value={formData.student_name}
              onChange={handleChange}
              error={formErrors.student_name}
              required
            />
            <InputGroup
              label="Father's Name"
              name="fathers_name"
              value={formData.fathers_name}
              onChange={handleChange}
              error={formErrors.fathers_name}
              required
            />
            <SelectGroup
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
              ]}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
            <InputGroup
              label="Student ID"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              error={formErrors.student_id}
              required
            />
            <InputGroup
              label="Registration Number"
              name="registration_number"
              value={formData.registration_number}
              onChange={handleChange}
              error={formErrors.registration_number}
            
            />
            <SelectGroup
              label="Course"
              name="course"
              defaultOption="Select a course..."
              value={formData.course}
              onChange={handleChange}
              options={courseOptions}
              error={formErrors.course}
              required
            />
            <SelectGroup
              label="Batch"
              name="batch"
              value={formData.batch}
              onChange={handleChange}
              options={batchOptions}
              required
            />
            <SelectGroup
              label="Competency"
              name="competency"
              value={formData.competency}
              onChange={handleChange}
              options={[
                { value: "competent", label: "Competent" },
                { value: "incompetent", label: "Incompetent" },
                { value: "not_assessed", label: "Not Assessed" },
              ]}
            />
            <SelectGroup
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "completed", label: "Completed" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
            <InputGroup
              label="Issue Date"
              name="issue_date"
              type="date"
              value={formData.issue_date}
              onChange={handleChange}
              error={formErrors.issue_date}
              required
            />
            <InputGroup
              label="Completion Date"
              name="completion_date"
              type="date"
              value={formData.completion_date}
              onChange={handleChange}
            />
            <InputGroup
              label="Contact Number"
              name="contact_number"
              type="tel"
              value={formData.contact_number}
              onChange={handleChange}
            />
            <InputGroup
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={formErrors.email}
            />
            <div className="md:col-span-2 flex flex-col">
              <label className="block mb-1.5 text-sm font-medium text-gray-800">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter full address"
              />
            </div>
          </div>

          <div className="pt-6 border-t">
            <h2 className="text-sm font-medium text-gray-800 mb-3">
              Student Photo
            </h2>
            <div className="flex items-center space-x-6">
              <div className="shrink-0">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-24 w-24 object-cover rounded-xl shadow-sm border border-gray-200"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-xl bg-gray-100 border border-gray-200 border-dashed flex items-center justify-center text-gray-400">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <label className="block">
                <span className="sr-only">Choose profile photo</span>
                <input
                  type="file"
                  onChange={handleUploadPhoto}
                  accept="image/*"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer transition-colors"
                />
                {formErrors.photo && (
                  <p className="text-sm text-red-600 mt-2">
                    {formErrors.photo}
                  </p>
                )}
              </label>
            </div>
          </div>

          <div className="flex space-x-6 pt-6 border-t">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Account Active
              </span>
            </label>
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="is_verified"
                checked={formData.is_verified}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Student Verified
              </span>
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isMutating || isCompressing}
              className="w-full py-3.5 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isCompressing
                ? "Optimizing Image..."
                : isMutating
                  ? "Processing..."
                  : mode === "edit"
                    ? "Save Changes"
                    : "Register Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentForm;
