

const CourseDistributionTable = ({ courseDistribution, totalStudents }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Students per Course</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Course Name</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Students</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {courseDistribution?.map((course, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{course._id}</td>
                <td className="py-3 px-4 font-medium">{course.students}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(course.students / totalStudents) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {((course.students / totalStudents) * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseDistributionTable;