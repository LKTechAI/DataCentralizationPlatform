import { Link } from "react-router-dom";

function Home() {
  return (
    <div
      className="container-fluid d-flex flex-column justify-content-center align-items-center"
      style={{ minHeight: "100vh", backgroundColor: "black", color: "white" }}
    >
      <h1 className="mb-4 text-center">📊 Centralized Data Platform</h1>

      <p className="text-center mb-4">
        Select a department to view uploaded data and analysis.
      </p>

      <div className="d-flex flex-column w-50">
        <Link to="/manufacturing" className="btn btn-primary mb-3 w-100">
          Manufacturing
        </Link>
       
        <Link to="/sales" className="btn btn-success mb-3 w-100">
          Sales
        </Link>

        <Link to="/field" className="btn btn-warning mb-3 w-100">
          Field
        </Link>

        <Link to="/testing" className="btn btn-danger mb-3 w-100">
          Testing
        </Link>
      </div>
    </div>
  );
}

export default Home;
