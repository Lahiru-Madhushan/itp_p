import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer
} from "recharts";
import { TrendingUp, Sparkles, Loader } from "lucide-react";
import { API_ROOT } from "../lib/api";

const api = axios.create({
  baseURL: API_ROOT,
});

const COLORS = ["#10b981", "#ef4444", "#6b7280"];
const HOVER_COLORS = ["#34d399", "#f87171", "#9ca3af"];

const SentimentPie = () => {
  const [stats, setStats] = useState({ positive: 0, negative: 0, unknown: 0 });
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get("/Chart/stats/sentiment");
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching sentiment stats:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const data = [
    { name: "Positive", value: stats.positive, color: COLORS[0] },
    { name: "Negative", value: stats.negative, color: COLORS[1] },
    { name: "Unknown", value: stats.unknown, color: COLORS[2] },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const percentage = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0;

      return (
        <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-100">
          <p className="font-semibold text-gray-900">{d.name}</p>
          <p className="text-sm text-gray-600">{d.value.toLocaleString()} entries</p>
          <p className="text-sm font-medium" style={{ color: d.color }}>
            {percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-sm font-bold drop-shadow-md"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/80 rounded-3xl shadow-2xl border border-gray-100/80 p-8 max-w-4xl mx-auto backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Feedback Sentiment
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Real-time analysis of customer feedback
            </p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-80 space-y-4">
          <div className="relative">
            <Loader className="h-12 w-12 text-blue-500 animate-spin" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur-lg rounded-full"></div>
          </div>
          <p className="text-gray-500 font-medium">Loading sentiment analysis...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Pie Chart */}
          <div className="h-80 lg:h-96 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="60%"
                  outerRadius="80%"
                  label={CustomLabel}
                  labelLine={false}
                  onMouseEnter={(_, index) => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  strokeWidth={3}
                  stroke="white"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={hoveredIndex === index ? HOVER_COLORS[index] : COLORS[index]}
                      className="transition-all duration-300 transform hover:scale-105"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => (
                    <span className="text-sm font-medium text-gray-700">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Total */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{total.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Total Feedback</div>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="space-y-4">
            {data.map((item, index) => {
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
              return (
                <div
                  key={item.name}
                  className="group p-4 rounded-2xl border-2 border-transparent hover:border-gray-200 bg-white/50 hover:bg-white/80 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: COLORS[index] }}
                      ></div>
                      <span className="font-semibold text-gray-700">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {item.value.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">{percentage}%</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: COLORS[index],
                        boxShadow: `0 0 8px ${COLORS[index]}40`,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SentimentPie;
