export default function DataTable({columns = [], data = []}) {
  if (!columns || columns.length === 0) {
    // derive columns from first row
    columns = data && data[0] ? Object.keys(data[0]) : [];
  }
  return (
    <div style={{overflowX: "auto"}}>
      <table className="table table-sm table-striped">
        <thead>
          <tr>{columns.map(c => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={i}>
              {columns.map(c => <td key={c}>{r[c] ?? ""}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
