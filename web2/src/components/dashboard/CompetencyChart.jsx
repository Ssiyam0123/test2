
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const CompetencyChart = ({ competencyStats, height = 256 }) => {
  const formatCompetencyLabel = (value) => {
    const map = {
      competent: "Competent",
      not_assessed: "Not Assessed",
      incompetent: "Incompetent"
    };
    return map[value] || value;
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Competency Overview</h2>
      <div style={{ height: `${height}px`, width: '100%', position: 'relative' }}>
        {competencyStats?.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={competencyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="_id" 
                stroke="#6b7280"
                tickFormatter={formatCompetencyLabel}
              />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value) => [`${value} students`, 'Count']}
                labelFormatter={formatCompetencyLabel}
              />
              <Bar 
                dataKey="count" 
                name="Students" 
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">No competency data</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetencyChart;