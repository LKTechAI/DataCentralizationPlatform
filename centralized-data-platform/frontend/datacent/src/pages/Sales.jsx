import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";
import KPI from "../components/KPI";
import ChartCard from "../components/ChartCard";
import DataTable from "../components/DataTable";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const COLORS = ["#1976d2", "#2e7d32", "#f57c00", "#8e24aa", "#d32f2f"];

export default function Sales() {
  const [range, setRange] = useState([{
    startDate: null,
    endDate: null,
    key: "selection"
  }]);
  const [showCalendar, setShowCalendar] = useState(false);

  const [loading, setLoading] = useState(true);
  const [serverData, setServerData] = useState(null); // structured response OR raw rows
  const [rawRows, setRawRows] = useState(null); // fallback if server returns array

  // Fetch function: calls backend analysis endpoint (preferred).
  const fetchData = async (start = null, end = null) => {
    setLoading(true);
    try {
      const params = {};
      if (start && end) { params.start = start; params.end = end; }
      const res = await api.get("/sales", { params });
      // If backend returns structured analysis { kpis, time_series, ... } we use it directly.
      if (res.data && (res.data.kpis || res.data.time_series || res.data.by_region)) {
        setServerData(res.data);
        setRawRows(null);
      } else if (Array.isArray(res.data)) {
        // backend returned raw rows
        setRawRows(res.data);
        setServerData(null);
      } else {
        // unknown shape — try to use res.data.rows or res.data.data
        const arr = res.data?.data || res.data?.rows || [];
        if (Array.isArray(arr)) {
          setRawRows(arr);
          setServerData(null);
        } else {
          setServerData(res.data);
        }
      }
    } catch (err) {
      console.error("analysis/sales failed:", err);
      // fallback: try raw endpoint /sales (returns array)
      try {
        const r = await api.get("/sales");
        setRawRows(r.data || []);
        setServerData(null);
      } catch (e) {
        console.error("fallback /sales failed:", e);
        setRawRows([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Helper: format date to YYYY-MM-DD
  const fmt = (d) => d ? new Date(d).toISOString().split("T")[0] : null;

  // If serverData provided (structured), use it. Else compute aggregates from rawRows.
  const computed = useMemo(() => {
    if (!serverData && (!rawRows || rawRows.length === 0)) return null;

    // If serverData has expected shape, normalize to our computed shape
    if (serverData) {
      // Expecting: kpis, time_series, by_region, by_dealer, returns_by_region, sample, conclusions
      return {
        kpis: serverData.kpis || {},
        timeSeries: serverData.time_series || { dates: [], units: [], revenue: [] },
        byRegion: serverData.by_region || [],
        byDealer: serverData.by_dealer || [],
        returnsByRegion: serverData.returns_by_region || [],
        sample: serverData.sample || [],
        conclusions: serverData.conclusions || []
      };
    }

    // Otherwise compute from rawRows (array of objects)
    const rows = rawRows.map(r => {
      // normalize keys (some docs may have lower/upper case)
      return {
        Date: r.Date || r.date,
        Region: r.Region || r.region,
        Dealer_ID: r.Dealer_ID || r.dealer_id || r.dealer,
        Units_Sold: Number(r.Units_Sold ?? r.units_sold ?? 0),
        Revenue: Number(r.Revenue ?? r.revenue ?? 0),
        Returns: Number(r.Returns ?? r.returns ?? 0)
      };
    });

    // group by date for time series
    const tsMap = {};
    rows.forEach(r => {
      const d = fmt(r.Date);
      if (!d) return;
      if (!tsMap[d]) tsMap[d] = { units: 0, revenue: 0, returns: 0 };
      tsMap[d].units += r.Units_Sold;
      tsMap[d].revenue += r.Revenue;
      tsMap[d].returns += r.Returns;
    });
    const dates = Object.keys(tsMap).sort((a, b) => new Date(a) - new Date(b));
    const timeSeries = { dates, units: dates.map(d => tsMap[d].units), revenue: dates.map(d => tsMap[d].revenue) };

    // by region
    const regionMap = {};
    rows.forEach(r => {
      const reg = r.Region || "Unknown";
      if (!regionMap[reg]) regionMap[reg] = { units: 0, revenue: 0, returns: 0 };
      regionMap[reg].units += r.Units_Sold;
      regionMap[reg].revenue += r.Revenue;
      regionMap[reg].returns += r.Returns;
    });
    const byRegion = Object.keys(regionMap).map(k => ({ region: k, ...regionMap[k] }));

    // by dealer
    const dealerMap = {};
    rows.forEach(r => {
      const d = r.Dealer_ID || "Unknown";
      if (!dealerMap[d]) dealerMap[d] = { units: 0, revenue: 0, returns: 0 };
      dealerMap[d].units += r.Units_Sold;
      dealerMap[d].revenue += r.Revenue;
      dealerMap[d].returns += r.Returns;
    });
    const byDealer = Object.keys(dealerMap).map(k => ({ dealer: k, ...dealerMap[k] }))
      .sort((a,b)=>b.revenue - a.revenue);

    // returns by region (for pie)
    const returnsByRegion = byRegion.map(r => ({ name: r.region, value: r.returns }));

    // KPIs
    const totalUnits = rows.reduce((s,r)=>s + r.Units_Sold, 0);
    const totalRevenue = rows.reduce((s,r)=>s + r.Revenue, 0);
    const totalReturns = rows.reduce((s,r)=>s + r.Returns, 0);
    const kpis = {
      total_units: totalUnits,
      total_revenue: totalRevenue,
      arpu: totalUnits ? (totalRevenue / totalUnits) : 0,
      returns_pct: totalUnits ? (100 * totalReturns / totalUnits) : 0
    };

    // sample: most recent 10 rows by date desc
    const sample = rows.sort((a,b)=> new Date(b.Date) - new Date(a.Date)).slice(0, 10);

    // simple conclusions
    const conclusions = [];
    if (dates.length >= 2) {
      const firstRev = timeSeries.revenue[0];
      const lastRev = timeSeries.revenue[timeSeries.revenue.length - 1];
      const pct = firstRev ? ((lastRev - firstRev) / firstRev) * 100 : 0;
      if (pct > 5) conclusions.push(`Revenue increased ${pct.toFixed(1)}% over the selected range.`);
      else if (pct < -5) conclusions.push(`Revenue decreased ${Math.abs(pct).toFixed(1)}% over the selected range.`);
      else conclusions.push("Revenue roughly stable over the selected range.");
    }
    if (byRegion.length) {
      const top = byRegion.sort((a,b)=>b.revenue - a.revenue)[0];
      conclusions.push(`Top region by revenue: ${top.region} (${top.revenue}).`);
    }

    return { kpis, timeSeries, byRegion, byDealer, returnsByRegion, sample, conclusions };
  }, [serverData, rawRows]);

  if (loading) return <div className="text-center mt-4">Loading...</div>;
  if (!computed) return <div className="text-center mt-4">No sales data available.</div>;

  const { kpis, timeSeries, byRegion, byDealer, returnsByRegion, sample, conclusions } = computed;

  // prepare recharts friendly arrays
  const timeSeriesData = timeSeries.dates.map((d, idx)=>({
    date: d,
    units: timeSeries.units?.[idx] ?? 0,
    revenue: timeSeries.revenue?.[idx] ?? 0
  }));

  const regionData = byRegion.map(r=>({ region: r.region, units: r.units, revenue: r.revenue }));
  const dealerData = byDealer.map(d=>({ dealer: d.dealer, units: d.units, revenue: d.revenue }));

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-3">
        <h3>Sales Dashboard</h3>
        <button className="btn btn-primary" onClick={() => setShowCalendar(!showCalendar)}>Select Date Range</button>
      </div>

      {/* date picker */}
      {showCalendar && (
        <div className="calendar-container shadow p-3 mb-4 bg-white rounded">
          <DateRange
            editableDateInputs={true}
            onChange={item => setRange([item.selection])}
            moveRangeOnFirstSelection={false}
            ranges={range}
          />
          <div className="mt-2">
            <button className="btn btn-success" onClick={() => {
              const s = range[0].startDate?.toISOString().split("T")[0];
              const e = range[0].endDate?.toISOString().split("T")[0];
              fetchData(s, e);
              setShowCalendar(false);
            }}>Apply Filter</button>

            <button className="btn btn-secondary ms-2" onClick={() => {
              fetchData(); setShowCalendar(false);
            }}>Clear</button>
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="row g-3 my-3">
        <div className="col-md-3"><KPI label="Total Units" value={kpis.total_units ?? 0} /></div>
        <div className="col-md-3"><KPI label="Total Revenue" value={kpis.total_revenue ?? 0} /></div>
        <div className="col-md-3"><KPI label="Avg Revenue / Unit" value={kpis.arpu ? kpis.arpu.toFixed(2) : 0} /></div>
        <div className="col-md-3"><KPI label="Returns (%)" value={kpis.returns_pct ? kpis.returns_pct.toFixed(2) : 0} /></div>
      </div>

      {/* Trend */}
      <ChartCard title="Units & Revenue Trend">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={timeSeriesData}>
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" orientation="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="units" name="Units" stroke={COLORS[0]} />
            <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke={COLORS[1]} />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-2 small-muted">{conclusions && conclusions[0]}</div>
      </ChartCard>

      <div className="row">
        <div className="col-md-6">
          <ChartCard title="Sales by Region (Revenue)">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionData}>
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill={COLORS[1]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 small-muted">Top region: {byRegion.sort((a,b)=>b.revenue-a.revenue)[0]?.region}</div>
          </ChartCard>
        </div>

        <div className="col-md-6">
          <ChartCard title="Top Dealers (Revenue)">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart layout="vertical" data={dealerData.slice(0,10)}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="dealer" />
                <Tooltip />
                <Bar dataKey="revenue" name="Revenue" fill={COLORS[2]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 small-muted">Showing top 10 dealers by revenue.</div>
          </ChartCard>
        </div>
      </div>

      {/* Returns Pie */}
      <ChartCard title="Returns by Region">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={returnsByRegion} dataKey="value" nameKey="name" outerRadius={90} label>
              {returnsByRegion.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-2 small-muted">Higher returns can indicate delivery/quality issues in region.</div>
      </ChartCard>

      {/* Sample table */}
      <ChartCard title="Recent Sales Records (sample)">
        <DataTable columns={sample && sample.length ? Object.keys(sample[0]) : ["Date","Region","Dealer_ID","Units_Sold","Revenue","Returns"]} data={sample || []} />
      </ChartCard>

    </div>
  );
}
