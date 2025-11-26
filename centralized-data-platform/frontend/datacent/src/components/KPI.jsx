export default function KPI({label, value}) {
  return (
    <div className="p-3 container-card">
      <div className="small-muted">{label}</div>
      <div className="kpi">{value}</div>
    </div>
  );
}
