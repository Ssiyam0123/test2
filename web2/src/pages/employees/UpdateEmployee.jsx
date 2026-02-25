import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser.js"; // Your new hook!
import AddEmployeeForm from "./AddEmployee.jsx"; // Assuming this is where your form is saved
import Loader from "../../components/Loader.jsx";

const UpdateEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Fetch the specific user's data
  const { data: employee, isLoading, isError } = useUser(id);

  console.log(employee)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader />
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Employee Not Found</h2>
        <button
          onClick={() => navigate("/admin/all-employees")}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  // Pass the fetched data into your form!
  return <AddEmployeeForm mode="edit" data={employee} />;
};

export default UpdateEmployee;