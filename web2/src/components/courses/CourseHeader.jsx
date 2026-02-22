
import { Plus } from 'lucide-react';

const CourseHeader = ({ 
  totalCourses = 0, 
  onAddCourse,
  isLoading = false 
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">All Courses</h1>
        <p className="text-gray-600 mt-1">
          Manage and view all courses ({totalCourses || 0} total)
        </p>
      </div>
      <button
        onClick={onAddCourse}
        disabled={isLoading}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4 md:mt-0"
      >
        <Plus size={20} />
        <span>Add New Course</span>
      </button>
    </div>
  );
};

export default CourseHeader;