"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";

interface DashboardData {
  totalDocs: number;
  approved: number;
  rejected: number;
  pending: number;
  tags: { name: string; count: number }[];
  recentActivity: { user: string; action: string; doc: string; date: string }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    // TODO: Replace with real API call
    setData({
      totalDocs: 42,
      approved: 30,
      rejected: 5,
      pending: 7,
      tags: [
        { name: "AI", count: 10 },
        { name: "Security", count: 7 },
        { name: "Research", count: 12 },
        { name: "Other", count: 13 },
      ],
      recentActivity: [
        { user: "Alice", action: "uploaded", doc: "AI Research.pdf", date: "2025-09-01" },
        { user: "Bob", action: "approved", doc: "Security Notes.docx", date: "2025-09-02" },
        { user: "Charlie", action: "commented", doc: "Thesis Draft.pdf", date: "2025-09-03" },
      ],
    });
  }, []);

  if (!data) return <p className="p-6">Loading...</p>;

  const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#f59e0b"];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">📊 Document Analytics</h1>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="rounded-2xl shadow bg-white p-6 text-center">
          <p className="text-gray-600">Total Documents</p>
          <p className="text-2xl font-bold text-gray-900">{data.totalDocs}</p>
        </div>
        <div className="rounded-2xl shadow bg-white p-6 text-center">
          <p className="text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">{data.approved}</p>
        </div>
        <div className="rounded-2xl shadow bg-white p-6 text-center">
          <p className="text-gray-600">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{data.rejected}</p>
        </div>
        <div className="rounded-2xl shadow bg-white p-6 text-center">
          <p className="text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{data.pending}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="rounded-2xl shadow bg-white p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Tag Distribution</h2>
          <PieChart width={300} height={250}>
            <Pie
              data={data.tags}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label
            >
              {data.tags.map((_, i) => (
                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        <div className="rounded-2xl shadow bg-white p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Documents by Status</h2>
          <BarChart
            width={300}
            height={250}
            data={[
              { status: "Approved", value: data.approved },
              { status: "Rejected", value: data.rejected },
              { status: "Pending", value: data.pending },
            ]}
          >
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
          </BarChart>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl shadow bg-white p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Recent Activity</h2>
        <ul className="space-y-3">
          {data.recentActivity.map((a, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-3 bg-gray-100 rounded-lg flex justify-between"
            >
              <span className="text-gray-900">
                <strong>{a.user}</strong> {a.action} <em>{a.doc}</em>
              </span>
              <span className="text-gray-500 text-sm">{a.date}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
