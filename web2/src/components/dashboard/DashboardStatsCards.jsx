
import {
  Users,
  UserPlus,
  BookOpen,
  CheckCircle
} from 'lucide-react';

const DashboardStatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Total Students */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Students</p>
            <p className="text-3xl font-bold mt-2">
              {stats?.totals.students.total.toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <Users className="text-blue-600" size={24} />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            <span className="text-green-600 font-semibold">
              {stats?.totals.students.active} active
            </span>
            {" • "}
            <span className="text-blue-600 font-semibold">
              {stats?.totals.students.completed} completed
            </span>
          </p>
        </div>
      </div>

      {/* Active Students */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Active Students</p>
            <p className="text-3xl font-bold mt-2 text-green-600">
              {stats?.totals.students.active.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <UserPlus className="text-green-600" size={24} />
          </div>
        </div>
      </div>

      {/* Completed */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-3xl font-bold mt-2 text-blue-600">
              {stats?.totals.students.completed.toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <CheckCircle className="text-blue-600" size={24} />
          </div>
        </div>
      </div>

      {/* Courses */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Courses</p>
            <p className="text-3xl font-bold mt-2">
              {stats?.totals.courses.total.toLocaleString()}
            </p>
          </div>
          <div className="bg-purple-100 p-3 rounded-lg">
            <BookOpen className="text-purple-600" size={24} />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{stats?.totals.courses.active} active</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardStatsCards;