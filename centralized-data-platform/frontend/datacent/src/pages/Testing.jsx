import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#93C5FD", "#A5B4FC", "#FDE68A", "#86EFAC", "#FCA5A5"];

export default function Testing() {
  const [testData, setTestData] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/testing")
      .then((res) => res.json())
      .then((data) => setTestData(data))
      .catch((err) => console.error("Error loading testing data", err));
  }, []);

  if (testData.length === 0) {
    return <p className="text-center mt-10 text-xl">Loading Testing Data...</p>;
  }

  // ------------------ PROCESSING ------------------

  const passFailCount = {};
  testData.forEach((d) => {
    passFailCount[d.Test_Result] = (passFailCount[d.Test_Result] || 0) + 1;
  });
  const passFailData = Object.entries(passFailCount).map(([name, value]) => ({
    name,
    value,
  }));

  const hardnessData = testData.map((d) => ({
    batch: d.Batch_ID,
    hardness: Number(d.Hardness),
  }));

  const thicknessData = testData.map((d) => ({
    batch: d.Batch_ID,
    thickness: Number(d.Thickness_mm),
  }));

  const frictionData = testData.map((d) => ({
    batch: d.Batch_ID,
    friction: Number(d.Friction_Coefficient),
  }));

  const avgHardness =
    (testData.reduce((sum, d) => sum + Number(d.Hardness), 0) /
      testData.length).toFixed(2);

  const avgThickness =
    (testData.reduce((sum, d) => sum + Number(d.Thickness_mm), 0) /
      testData.length).toFixed(2);

  const avgFriction =
    (testData.reduce((sum, d) => sum + Number(d.Friction_Coefficient), 0) /
      testData.length).toFixed(3);

  const passRate = (
    (passFailCount["PASS"] / testData.length) *
    100
  ).toFixed(1);

  // ------------------ STYLE ------------------
  const cardStyle =
    "bg-white shadow-md rounded-xl p-6 flex flex-col items-center border border-gray-200";

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-10 text-gray-800">
        Product Testing Analytics Dashboard
      </h1>

      {/* ---------- SUMMARY CARDS ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className={cardStyle}>
          <h3 className="text-lg font-semibold text-gray-600">Avg Hardness</h3>
          <p className="text-3xl font-bold text-indigo-500">{avgHardness}</p>
        </div>

        <div className={cardStyle}>
          <h3 className="text-lg font-semibold text-gray-600">Avg Thickness</h3>
          <p className="text-3xl font-bold text-green-500">{avgThickness} mm</p>
        </div>

        <div className={cardStyle}>
          <h3 className="text-lg font-semibold text-gray-600">Avg Friction</h3>
          <p className="text-3xl font-bold text-yellow-500">{avgFriction}</p>
        </div>

        <div className={cardStyle}>
          <h3 className="text-lg font-semibold text-gray-600">Pass Rate</h3>
          <p className="text-3xl font-bold text-blue-500">{passRate}%</p>
        </div>
      </div>

      {/* ---------- 2 COLUMN GRID ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* PASS/FAIL PIE CHART */}
        <div className={cardStyle}>
          <h2 className="text-2xl font-semibold mb-4">Pass vs Fail Distribution</h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={passFailData} dataKey="value" outerRadius={110} label>
                {passFailData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <p className="mt-3 text-gray-700 text-center">
            Pass rate is <b>{passRate}%</b>, indicating overall component reliability.
          </p>
        </div>

        {/* HARDNESS BAR CHART */}
        <div className={cardStyle}>
          <h2 className="text-2xl font-semibold mb-4">Hardness by Batch</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hardnessData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="batch" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hardness" fill="#A5B4FC" />
            </BarChart>
          </ResponsiveContainer>

          <p className="mt-3 text-gray-700 text-center">
            Batches with low hardness may indicate quality issues requiring recalibration.
          </p>
        </div>

        {/* THICKNESS LINE CHART */}
        <div className={cardStyle}>
          <h2 className="text-2xl font-semibold mb-4">Thickness Variation</h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={thicknessData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="batch" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="thickness" stroke="#86EFAC" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>

          <p className="mt-3 text-gray-700 text-center">
            Monitoring thickness ensures structural stability and uniformity.
          </p>
        </div>

        {/* FRICTION AREA CHART */}
        <div className={cardStyle}>
          <h2 className="text-2xl font-semibold mb-4">Friction Coefficient Analysis</h2>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={frictionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="batch" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="friction"
                fill="#FCA5A5"
                stroke="#FCA5A5"
              />
            </AreaChart>
          </ResponsiveContainer>

          <p className="mt-3 text-gray-700 text-center">
            Friction variation helps predict material performance during braking or motion.
          </p>
        </div>
      </div>

      {/* FULL WIDTH CHART */}
      <div className={cardStyle + " mt-10"}>
        <h2 className="text-2xl font-semibold mb-4">
          Combined Performance Trend (Hardness vs Thickness)
        </h2>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={testData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Batch_ID" />
            <YAxis />
            <Tooltip />
            <Line dataKey="Hardness" stroke="#93C5FD" strokeWidth={3} />
            <Line dataKey="Thickness_mm" stroke="#FDE68A" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>

        <p className="mt-4 text-gray-700 text-center">
          Combined metrics help identify outlier batches requiring re-testing.
        </p>
      </div>
    </div>
  );
}
