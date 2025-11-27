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
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#A5B4FC", // pastel indigo
  "#86EFAC", // pastel green
  "#FDE68A", // pastel yellow
  "#FCA5A5", // pastel red
  "#93C5FD", // pastel blue
];

export default function Field() {
  const [fieldData, setFieldData] = useState([]);

  useEffect(() => {
    fetch("https://datacentralizationplatform.onrender.com/field")
      .then((res) => res.json())
      .then((data) => setFieldData(data))
      .catch((err) => console.error("Error loading field data", err));
  }, []);

  if (fieldData.length === 0) {
    return <p className="text-center mt-10 text-xl">Loading Field Data...</p>;
  }

  // ------------------ DATA PROCESSING ------------------

  const failureCount = {};
  fieldData.forEach((d) => {
    failureCount[d.Failure_Type] = (failureCount[d.Failure_Type] || 0) + 1;
  });
  const failureTypeData = Object.entries(failureCount).map(([name, value]) => ({
    name,
    value,
  }));

  const modelCount = {};
  fieldData.forEach((d) => {
    modelCount[d.Bike_Model] = (modelCount[d.Bike_Model] || 0) + 1;
  });
  const modelData = Object.entries(modelCount).map(([model, count]) => ({
    model,
    count,
  }));

  const repairCostMap = {};
  fieldData.forEach((d) => {
    if (!repairCostMap[d.Bike_Model]) {
      repairCostMap[d.Bike_Model] = { total: 0, count: 0 };
    }
    repairCostMap[d.Bike_Model].total += Number(d.Repair_Cost);
    repairCostMap[d.Bike_Model].count += 1;
  });
  const repairCostData = Object.entries(repairCostMap).map(([model, obj]) => ({
    model,
    avgCost: (obj.total / obj.count).toFixed(0),
  }));

  const severityCount = {};
  fieldData.forEach((d) => {
    severityCount[d.Severity] = (severityCount[d.Severity] || 0) + 1;
  });
  const severityData = Object.entries(severityCount).map(([name, value]) => ({
    name,
    value,
  }));

  const mileageCostData = fieldData.map((d) => ({
    mileage: Number(d.Bike_Mileage),
    cost: Number(d.Repair_Cost),
  }));

  // ------------------ CARD STYLE ------------------
  const cardStyle =
    "bg-white shadow-md rounded-xl p-6 flex flex-col items-center justify-center border border-gray-200";

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-10 text-gray-800">
        Field Service Analytics Dashboard
      </h1>

      {/* ------------- 2 COLUMN GRID ------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* -------- FAILURE TYPE PIE -------- */}
        <div className={cardStyle}>
          <h2 className="text-2xl font-semibold mb-4">Failure Type Distribution</h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={failureTypeData} dataKey="value" outerRadius={110} label>
                {failureTypeData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <p className="mt-4 text-gray-700 text-center">
            <b>{failureTypeData[0].name}</b> occurs most frequently, showing where
            preventive maintenance can reduce issues.
          </p>
        </div>

        {/* -------- MODEL FAILURES -------- */}
        <div className={cardStyle}>
          <h2 className="text-2xl font-semibold mb-4">Failures Per Bike Model</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={modelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="model" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#A5B4FC" />
            </BarChart>
          </ResponsiveContainer>

          <p className="mt-4 text-gray-700 text-center">
            The model{" "}
            <b>
              {modelData.reduce((a, b) =>
                a.count > b.count ? a : b
              ).model}
            </b>{" "}
            shows the highest failure activity.
          </p>
        </div>

        {/* -------- AVG REPAIR COST -------- */}
        <div className={cardStyle}>
          <h2 className="text-2xl font-semibold mb-4">
            Average Repair Cost per Model
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={repairCostData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="model" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgCost" fill="#86EFAC" />
            </BarChart>
          </ResponsiveContainer>

          <p className="mt-4 text-gray-700 text-center">
            Higher repair costs may indicate deeper mechanical issues for some models.
          </p>
        </div>

        {/* -------- SEVERITY PIE -------- */}
        <div className={cardStyle}>
          <h2 className="text-2xl font-semibold mb-4">
            Severity Level Distribution
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={severityData} dataKey="value" outerRadius={110} label>
                {severityData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <p className="mt-4 text-gray-700 text-center">
            Severity insights help prioritize high-risk repairs and resource planning.
          </p>
        </div>
      </div>

      {/* -------- FULL WIDTH LINE CHART -------- */}
      <div className={cardStyle + " mt-10"}>
        <h2 className="text-2xl font-semibold mb-4">
          Mileage vs Repair Cost Trend
        </h2>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={mileageCostData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mileage" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="cost" stroke="#FCA5A5" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>

        <p className="mt-4 text-gray-700 text-center">
          Higher mileage correlates with increased repair cost — indicating natural wear.
        </p>
      </div>
    </div>
  );
}
