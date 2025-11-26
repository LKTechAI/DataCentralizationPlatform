export default function ChartCard({title, children}){
  return (
    <div className="container-card mb-3">
      <h5>{title}</h5>
      <div>{children}</div>
    </div>
  );
}
