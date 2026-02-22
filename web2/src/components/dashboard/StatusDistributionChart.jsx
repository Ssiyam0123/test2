
import {
  PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, Legend
} from 'recharts';

const StatusDistributionChart = ({ statusDistribution, height = 256 }) => {
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

  const getStatusColor = (status) => {
    const colors = {
      active: "#10b981",
      completed: "#3b82f6",
      inactive: "#f59e0b",
      discontinued: "#ef4444",
      on_leave: "#8b5cf6"
    };
    return colors[status] || "#6b7280";
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Students by Status</h2>
      <div style={{ height: `${height}px`, width: '100%', position: 'relative' }}>
        {statusDistribution?.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusDistribution?.map(item => ({
                  name: formatStatusName(item._id),
                  value: item.count
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getStatusColor(entry._id)} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Students"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">No status data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusDistributionChart;