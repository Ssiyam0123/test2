import React from "react";
import StudentForm from "./AddStudent";
import { useParams } from "react-router-dom";
import { useStudent } from "../../hooks/useStudents";

const UpdateStudent = () => {
  const { id } = useParams();
  const { data: student, isLoading, error } = useStudent(id);
  return <StudentForm mode="edit" data={student} />;
};

export default UpdateStudent;
