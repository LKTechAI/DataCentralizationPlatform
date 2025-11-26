import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">📊 Centralized Data Platform</h1>

      <p className="text-center mb-4">
        Select a department to view uploaded data and analysis.
      </p>

      <div className="row justify-content-center">
        <div className="col-md-3 mb-3">
          <Link to="/manufacturing" className="btn btn-primary w-100">
            Manufacturing
          </Link>
        </div>
        <div className="col-md-3 mb-3">
          <Link to="/sales" className="btn btn-success w-100">
            Sales
          </Link>
        </div>
        <div className="col-md-3 mb-3">
          <Link to="/field" className="btn btn-warning w-100">
            Field
          </Link>
        </div>
        <div className="col-md-3 mb-3">
          <Link to="/testing" className="btn btn-danger w-100">
            Testing
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
