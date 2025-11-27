import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const COLORS = ["#90CAF9", "#F48FB1"]; // pastel better colors

function Testing() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("https://datacentralizationplatform.onrender.com/testing")
      .then((res) => res.json())
      .then((d) => {
        // Convert values to numeric safely
        const cleaned = d.map((x) => ({
          ...x,
          Hardness: Number(x.Hardness) || 0,
          Thickness_mm: Number(x.Thickness_mm) || 0,
          Friction_Coefficient: Number(x.Friction_Coefficient) || 0,
        }));
        setData(cleaned);
      })
      .catch((err) => console.log(err));
  }, []);

  if (!data || data.length === 0)
    return <div style={{ padding: "40px" }}>Loading...</div>;

  // ----- CALCULATIONS -----
  const avgHardness = (
    data.reduce((a, b) => a + b.Hardness, 0) / data.length
  ).toFixed(2);

  const avgThickness = (
    data.reduce((a, b) => a + b.Thickness_mm, 0) / data.length
  ).toFixed(2);

  const avgFriction = (
    data.reduce((a, b) => a + b.Friction_Coefficient, 0) / data.length
  ).toFixed(3);

  const passCount = data.filter((x) => x.Test_Result === "PASS").length;
  const failCount = data.length - passCount;

  const passRate = ((passCount / data.length) * 100).toFixed(1);

  const passFailData = [
    { name: "PASS", value: passCount },
    { name: "FAIL", value: failCount },
  ];

  return (
    <div style={styles.container}>

      <h1 style={styles.heading}>Product Testing Analytics Dashboard</h1>

      {/* ===== TOP KPI CARDS ===== */}
      <div style={styles.statsGrid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Avg Hardness</h3>
          <p style={styles.cardValue}>{avgHardness}</p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Avg Thickness</h3>
          <p style={styles.cardValue}>{avgThickness} mm</p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Avg Friction</h3>
          <p style={styles.cardValue}>{avgFriction}</p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Pass Rate</h3>
          <p style={styles.cardValue}>{passRate}%</p>
        </div>
      </div>

      {/* ===== PASS vs FAIL PIE CHART ===== */}
      <div style={styles.chartSection}>
        <h2 style={styles.sectionTitle}>Pass vs Fail Distribution</h2>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={passFailData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              dataKey="value"
              label
            >
              {passFailData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ===== HARDNESS BAR CHART ===== */}
      <div style={styles.chartSection}>
        <h2 style={styles.sectionTitle}>Hardness Comparison by Batch</h2>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Batch_ID" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Hardness" fill="#90CAF9" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ===== THICKNESS BAR CHART ===== */}
      <div style={styles.chartSection}>
        <h2 style={styles.sectionTitle}>Thickness Comparison by Batch</h2>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Batch_ID" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Thickness_mm" fill="#F48FB1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ===== FRICTION LINE CHART ===== */}
      <div style={styles.chartSection}>
        <h2 style={styles.sectionTitle}>Friction Coefficient Trend</h2>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Batch_ID" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Friction_Coefficient" fill="#A5D6A7" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

// ================= STYLES =================

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    background: "#f3f5f7",
    minHeight: "100vh",
  },
  heading: {
    fontSize: "32px",
    marginBottom: "20px",
    color: "#333",
    textAlign: "center",
    fontWeight: 600,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginBottom: "30px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  cardTitle: {
    fontSize: "15px",
    color: "#666",
    marginBottom: "5px",
    fontWeight: 500,
  },
  cardValue: {
    fontSize: "26px",
    fontWeight: "bold",
    color: "#333",
  },
  chartSection: {
    marginTop: "40px",
    padding: "25px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: "22px",
    marginBottom: "20px",
    color: "#444",
    fontWeight: 600,
  },
};

export default Testing;
