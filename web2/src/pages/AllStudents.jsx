import React, { Suspense, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Download, AlertCircle, RefreshCw, Plus, Send, X, MessageSquare, User as UserIcon } from "lucide-react";
import {
  useStudents,
  useDeleteStudent,
  useToggleStudentStatus,
  useAddComment,      // NEW HOOK
  useStudentComments  // NEW HOOK
} from "../hooks/useStudents";
import { useConfirmToast } from "../components/ConfirmToast";
import StudentFilters from "../components/StudentFilters.jsx";
import QRCodeModal from "../components/QRCodeModal.jsx";
import useAuth from "../store/useAuth.js";
import { apiURL } from "../../Constant.js";

const StudentsTable = React.lazy(() => import("../components/StudentsTable.jsx"));


const CommentModal = ({ student, onClose }) => {
  const [commentText, setCommentText] = useState("");
  const { data: commentsResponse, isLoading } = useStudentComments(student._id);
  const addCommentMutation = useAddComment();

  const comments = commentsResponse?.data || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    addCommentMutation.mutate(
      { studentId: student._id, text: commentText },
      { onSuccess: () => setCommentText("") }
    );
  };

  
  
  
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <MessageSquare size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Student Observations</h2>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider">{student.student_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400"><X size={20}/></button>
        </div>

        {/* Comment List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {isLoading ? (
            <div className="flex justify-center py-10"><RefreshCw className="animate-spin text-indigo-500" /></div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                  {comment.instructor?.photo_url ? (
                    <img src={`${apiURL.image_url}${comment.instructor.photo_url}`} className="h-full w-full rounded-full object-cover" />
                  ) : <UserIcon size={14} />}
                </div>
                <div className="flex-1 bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-bold text-gray-900">{comment.instructor?.full_name || "Instructor"}</p>
                    <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{comment.text}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <div className="text-slate-300 mb-2 flex justify-center"><MessageSquare size={40} /></div>
              <p className="text-gray-400 text-sm">No comments yet for this student.</p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a private observation..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none min-h-[80px]"
              />
            <button
              type="submit"
              disabled={!commentText.trim() || addCommentMutation.isPending}
              className="absolute bottom-3 right-3 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
              {addCommentMutation.isPending ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};


const TableSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
    {/* Table Header Placeholder */}
    <div className="bg-gray-50 h-14 w-full border-b border-gray-200 flex items-center px-6">
      <div className="h-3 bg-gray-200 rounded w-32 mr-auto" />
      <div className="h-3 bg-gray-200 rounded w-24 mx-auto hidden md:block" />
      <div className="h-3 bg-gray-200 rounded w-20 mx-auto hidden md:block" />
      <div className="h-3 bg-gray-200 rounded w-28 ml-auto" />
    </div>

    {/* Table Rows Placeholders */}
    {[...Array(8)].map((_, i) => (
      <div key={i} className="flex items-center space-x-6 p-5 border-b border-gray-100">
        
        {/* Column 1: Student Info */}
        <div className="flex items-center space-x-4 flex-1">
          <div className="rounded-full bg-gray-200 h-12 w-12 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        </div>

        {/* Column 2: Academic (Hidden on small screens) */}
        <div className="hidden lg:flex flex-col space-y-2 flex-1">
          <div className="h-3 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-100 rounded w-24" />
          <div className="h-3 bg-gray-50 rounded w-20" />
        </div>

        {/* Column 3: Status Badge */}
        <div className="hidden md:block flex-shrink-0">
          <div className="h-6 bg-gray-100 rounded-full w-20" />
        </div>

        {/* Column 4: Dates */}
        <div className="hidden xl:flex flex-col space-y-2 flex-1">
          <div className="h-3 bg-gray-100 rounded w-20" />
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>

        {/* Column 5: Action Buttons */}
        <div className="flex space-x-2 shrink-0">
          <div className="h-8 w-8 bg-gray-100 rounded-lg" />
          <div className="h-8 w-8 bg-gray-100 rounded-lg" />
          <div className="h-8 w-8 bg-gray-200 rounded-lg" />
          <div className="h-8 w-8 bg-gray-100 rounded-lg" />
        </div>
      </div>
    ))}

    {/* Footer Pagination Placeholder */}
    <div className="bg-gray-50 h-16 w-full flex items-center justify-between px-6">
      <div className="h-4 bg-gray-200 rounded w-40" />
      <div className="flex space-x-2">
        <div className="h-8 w-16 bg-white border border-gray-200 rounded" />
        <div className="h-8 w-16 bg-white border border-gray-200 rounded" />
      </div>
    </div>
  </div>
);




const AllStudents = () => {
  
  const INITIAL_FILTERS = {
    status: "all",
    batch: "all",
    course: "all",
    competency: "all",
    is_active: "all",
    is_verified: "all",
    date_from: "",
  date_to: "",
};

  const navigate = useNavigate();
  const { showConfirmToast } = useConfirmToast();
  const { authUser } = useAuth();

  const [selectedStudentForQr, setSelectedStudentForQr] = useState(null);
  const [selectedStudentForComment, setSelectedStudentForComment] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const queryFilters = useMemo(
    () => ({
      ...filters,
      ...(searchTerm && { search: searchTerm }),
    }),
    [filters, searchTerm]
  );

  const { data, isLoading: studentsLoading, error, refetch, isRefetching } = useStudents(page, limit, queryFilters);

  console.log(data)
  const deleteStudentMutation = useDeleteStudent();
  const toggleStatusMutation = useToggleStudentStatus();

  // const students = data?.data || [];
const students = data?.data || [];
  const pagination = data?.pagination;
  const filterOptions = data?.filters;

  useEffect(() => { setPage(1); }, [queryFilters]);

  const handleDelete = (id, studentName) => {
    showConfirmToast({
      type: "delete",
      title: "Delete Student",
      message: `Are you sure you want to permanently delete`,
      itemName: studentName,
      confirmText: "Delete",
      confirmColor: "red",
      onConfirm: async () => { await deleteStudentMutation.mutateAsync(id); },
    });
  };

    const onViewDetails = (id) => {
    navigate(`/student/${id}`);
  };


  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Student Directory</h1>
          <p className="text-sm text-gray-500">Manage and export registered student records.</p>
        </div>
        
        {authUser?.role !== "instructor" && (
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={() => {/* CSV logic */}}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all shadow-sm"
            >
              <Download size={16} /> <span>Export CSV</span>
            </button>
            <button
              onClick={() => navigate("/admin/add-student")}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm"
            >
              <Plus size={16} /> <span>Add Student</span>
            </button>
          </div>
        )}
      </div>

      <div className="mb-6">
        <StudentFilters onFilterChange={setFilters} onSearchSubmit={setSearchTerm} filterOptions={filterOptions} initialFilters={filters} isLoading={studentsLoading} />
      </div>

      <Suspense fallback={<TableSkeleton />}>
        {studentsLoading ? <TableSkeleton /> : (
          <StudentsTable
            students={students}
            currentUser={authUser}
            pagination={pagination}
            onViewDetails={onViewDetails}
            onDelete={handleDelete}
            onToggleStatus={(id) => toggleStatusMutation.mutate(id)}
            onGenerateQR={setSelectedStudentForQr}
            onAddComment={setSelectedStudentForComment}
            onViewProfile={(s) => navigate(`/student/${s._id}`)}
            onEdit={(id) => navigate(`/admin/update-student/${id}`)}
            deleteLoading={deleteStudentMutation.isPending}
            toggleLoading={toggleStatusMutation.isPending}
            page={page}
            onPageChange={setPage}
            searchTerm={searchTerm}
            onClearFilters={() => { setFilters(INITIAL_FILTERS); setSearchTerm(""); }}
            filters={filters}
          />
        )}
      </Suspense>

      {/* MODALS */}
      {selectedStudentForQr && (
        <QRCodeModal student={selectedStudentForQr} onClose={() => setSelectedStudentForQr(null)} />
      )}

      {selectedStudentForComment && (
        <CommentModal student={selectedStudentForComment} onClose={() => setSelectedStudentForComment(null)} />
      )}
    </div>
  );
};

export default AllStudents;