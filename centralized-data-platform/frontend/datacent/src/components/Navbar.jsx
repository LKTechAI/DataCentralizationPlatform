import React from "react";
import { Link } from "react-router-dom";

export default function Navbar(){
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">Centralized Data</Link>
        <div className="collapse navbar-collapse">
          <div className="navbar-nav ms-auto">
            <Link className="nav-link" to="/manufacturing">Manufacturing</Link>
            <Link className="nav-link" to="/sales">Sales</Link>
            <Link className="nav-link" to="/field">Field</Link>
            <Link className="nav-link" to="/testing">Testing</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
