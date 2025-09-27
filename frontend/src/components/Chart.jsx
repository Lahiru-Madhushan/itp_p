// src/components/Chart.jsx
import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const API_URL = "http://localhost:8070/Chart";

export default function FeedbackStats() {
  const [stats, setStats] = useState({ total: 0, positive: 0, negative: 0 });

  useEffect(() => {
    fetch(`${API_URL}/stats`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err));
  }, []);

  const data = [
    { name: "Positive", value: stats.positive },
    { name: "Negative", value: stats.negative },
  ];

  const COLORS = ["#00C49F", "#FF8042"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-10">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-[500px]">
        {/* Header */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          📊 Feedback Sentiment Overview
        </h2>

        {/* Chart */}
        <div className="flex justify-center">
          <PieChart width={400} height={400}>
            <Pie
              data={data}
              dataKey="value"
              outerRadius={150}
              label
              paddingAngle={3}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        {/* Footer Stats */}
        <div className="mt-6 text-center">
          <p className="text-lg font-medium text-gray-700">
            Total Feedbacks:{" "}
            <span className="font-bold text-indigo-600">{stats.total}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
