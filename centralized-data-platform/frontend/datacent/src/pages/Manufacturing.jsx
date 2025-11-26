import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import KPI from "../components/KPI";
import ChartCard from "../components/ChartCard";
import DataTable from "../components/DataTable";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  BarChart, Bar, ResponsiveContainer
} from "recharts";

import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function Manufacturing() {

  /* -------------------------- STATE -------------------------- */

  const [range, setRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection"
    }
  ]);

  const [showCalendar, setShowCalendar] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);


  /* -------------------------- FETCH DATA -------------------------- */

  const fetchData = (start = null, end = null) => {
    setLoading(true);
    let url = "/analysis/manufacturing";

    if (start && end) {
      url += `?start=${start}&end=${end}`;
    }

    api.get(url)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();            // default: backend returns latest 10 dates
  }, []);


  /* -------------------------- LOADING STATES -------------------------- */

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!data) return <div className="text-center mt-5">No data.</div>;


  /* -------------------------- PROCESS DATA -------------------------- */

  const k = data.kpis || {};

  const timeSeries = data.time_series?.dates?.map((d, idx) => ({
    date: d,
    production: data.time_series.production[idx] ?? 0,
    defects: data.time_series.defects[idx] ?? 0,
  })) || [];

  const barDowntime =
    data.downtime_by_machine?.map(d => ({
      name: d.machine,
      downtime: d.total_downtime
    })) || [];

  const sampleColumns = Object.keys((data.sample && data.sample[0]) || {});


  /* -------------------------- UI -------------------------- */

  return (
    <div>

      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center my-3">
        <h3>Manufacturing Overview</h3>

        <button
          className="btn btn-primary"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          Select Date Range
        </button>
      </div>

      {/* Calendar Popup */}
      {showCalendar && (
        <div className="calendar-container shadow p-3 mb-4 bg-white rounded">
          <DateRange
            editableDateInputs={true}
            onChange={item => setRange([item.selection])}
            moveRangeOnFirstSelection={false}
            ranges={range}
          />

          <button
            className="btn btn-success mt-2"
            onClick={() => {
              const s = range[0].startDate?.toISOString().split("T")[0];
              const e = range[0].endDate?.toISOString().split("T")[0];
              fetchData(s, e);
              setShowCalendar(false);
            }}
          >
            Apply Filter
          </button>

          <button
            className="btn btn-secondary mt-2 ms-2"
            onClick={() => {
              fetchData();      // reload backend “latest 10 dates”
              setShowCalendar(false);
            }}
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="row g-3 my-3">
        <div className="col-md-3"><KPI label="Total Production" value={k.total_production ?? 0} /></div>
        <div className="col-md-3"><KPI label="Total Defects" value={k.total_defects ?? 0} /></div>
        <div className="col-md-3"><KPI label="Defect Rate (%)" value={k.defect_rate_pct ?? 0} /></div>
        <div className="col-md-3"><KPI label="Avg Downtime (min)" value={k.avg_downtime_minutes ?? 0} /></div>
      </div>

      {/* Production Trend */}
      <ChartCard title="Production & Defects Trend">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeries}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="production" name="Production" stroke="#1976d2" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="defects" name="Defects" stroke="#d32f2f" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-2 small-muted">
          {data.conclusions && data.conclusions[0]}
        </div>
      </ChartCard>

      {/* Downtime by Machine */}
      <ChartCard title="Downtime by Machine (minutes)">
        <ResponsiveContainer width="100%" height={420} >
          <BarChart data={barDowntime}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="downtime" name="Downtime (min)" fill="#8a93abff" barSize={200}/>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-2 small-muted">
          {data.conclusions && data.conclusions.slice(1).join(" | ")}
        </div>
      </ChartCard>

      {/* Machine Summary */}
      <ChartCard title="Machine Summary">
        <DataTable
          columns={["machine", "production_sum", "defects_sum", "defect_rate_pct", "total_downtime"]}
          data={data.by_machine || []}
        />
      </ChartCard>

      {/* Sample Rows */}
      <ChartCard title="Sample Records (Most Recent 10 Rows)">
        <DataTable columns={sampleColumns} data={data.sample || []} />
      </ChartCard>

    </div>
  );
}
