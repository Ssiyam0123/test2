// components/dashboard/RecentActivities.jsx
import React from 'react';
import { Users } from 'lucide-react';

const RecentActivities = ({ recentActivities, onRefresh }) => {
  const formatStatusName = (status) => {
    const statusMap = {
      active: "Active",
      completed: "Completed",
      inactive: "Inactive",
      discontinued: "Discontinued",
      on_leave: "On Leave"
    };
    return statusMap[status] || status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Activities</h2>
        <button 
          onClick={onRefresh}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>
      <div className="space-y-3">
        {recentActivities && recentActivities.length > 0 ? (
          recentActivities.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded ${
                  activity.status === 'active' ? 'bg-green-100' :
                  activity.status === 'completed' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Users size={16} className={
                    activity.status === 'active' ? 'text-green-600' :
                    activity.status === 'completed' ? 'text-blue-600' : 'text-gray-600'
                  } />
                </div>
                <div>
                  <p className="font-medium">{activity.student_name}</p>
                  <p className="text-sm text-gray-600">ID: {activity.student_id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium capitalize">
                  {formatStatusName(activity.status)}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No recent activities</p>
        )}
      </div>
    </div>
  );
};

export default RecentActivities;