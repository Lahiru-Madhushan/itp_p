import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const API_URL = "http://localhost:8070/Chart";

export default function FeedbackStats() {
  const [stats, setStats] = useState({ total: 0, positive: 0, negative: 0 });

  useEffect(() => {
    fetch(`${API_URL}/stats`)
      .then((res) => res.json())
      .then((data) => {
        console.log("API Response:", data); // ✅ debug
        setStats({
          total: Number(data.total),
          positive: Number(data.positive),
          negative: Number(data.negative),
        });
      })
      .catch((err) => console.error(err));
  }, []);

  // Filter out zero values and handle edge cases
  const getChartData = () => {
    const data = [];
    
    if (stats.positive > 0) {
      data.push({ name: "Positive", value: stats.positive });
    }
    
    if (stats.negative > 0) {
      data.push({ name: "Negative", value: stats.negative });
    }
    
    // If all values are zero, show a placeholder
    if (data.length === 0 && stats.total > 0) {
      data.push({ name: "No Data", value: 1 });
    }
    
    return data;
  };

  const chartData = getChartData();
  const COLORS = ["#00C49F", "#FF8042", "#8884d8"];

  console.log("Chart Data:", chartData); // ✅ debug
  console.log("Stats:", stats); // ✅ debug

  // Custom label that only shows for non-zero values
  const renderLabel = ({ name, value, percent }) => {
    if (value === 0) return null;
    if (name === "No Data") return "No Data";
    
    return `${name}: ${(percent * 100).toFixed(1)}%`;
  };

  // Custom tooltip formatter
  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow">
          <p className="font-semibold">{data.name}</p>
          <p>Count: {data.value}</p>
          <p>Percentage: {((data.value / stats.total) * 100).toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-10">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-[500px]">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          📊 Feedback Sentiment Overview
        </h2>

        <div className="flex justify-center">
          {stats.total === 0 ? (
            <div className="flex items-center justify-center h-64 w-64 rounded-full bg-gray-100">
              <p className="text-gray-500 text-lg">No feedback data</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-64 w-64 rounded-full bg-gray-100">
              <p className="text-gray-500 text-lg">No sentiment data</p>
            </div>
          ) : (
            <PieChart width={400} height={400}>
              <Pie
                data={chartData}
                dataKey="value"
                outerRadius={150}
                label={renderLabel}
                labelLine={false}
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={customTooltip} />
              <Legend />
            </PieChart>
          )}
        </div>

        <div className="mt-6 text-center space-y-2">
          <p className="text-lg font-medium text-gray-700">
            Total Feedbacks:{" "}
            <span className="font-bold text-indigo-600">{stats.total}</span>
          </p>
          <p className="text-md text-green-600">
            Positive: {stats.positive} (
            {stats.total > 0
              ? ((stats.positive / stats.total) * 100).toFixed(1)
              : 0}
            %)
          </p>
          <p className="text-md text-red-600">
            Negative: {stats.negative} (
            {stats.total > 0
              ? ((stats.negative / stats.total) * 100).toFixed(1)
              : 0}
            %)
          </p>
        </div>

        {/* Debug Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            Debug: Positive={stats.positive}, Negative={stats.negative}, ChartItems={chartData.length}
          </p>
        </div>
      </div>
    </div>
  );
}