import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const BatchDistributionChart = ({ batchDistribution, height = 256 }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">
        Students per Batch (Top 10)
      </h2>
      <div
        style={{ height: `${height}px`, width: "100%", position: "relative" }}
      >
        {batchDistribution && batchDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={batchDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="_id"
                stroke="#6b7280"
                angle={360}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="#6b7280" />
              <Tooltip
                formatter={(value) => [`${value} students`, "Count"]}
                labelFormatter={(label) => `Batch: ${label}`}
              />
              <Legend />
              <Bar
                dataKey="count"
                name="Students"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">No batch data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchDistributionChart;
