import React, { useState } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";   // <-- added for redirect

export default function Login() {
  const navigate = useNavigate(); // <-- hook for navigating in React

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [status, setStatus] = useState("System Operational");
  const [otpEnabled, setOtpEnabled] = useState(false);
  const [loginEnabled, setLoginEnabled] = useState(false);

  // Generate OTP
  const generateOtp = () => {
    if (email.trim() === "" || phone.trim() === "") {
      setStatus("ERR: MISSING_INPUT");
      return;
    }

    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(randomOtp);

    alert("AUTHENTICATION SERVER:\nOTP Generated: " + randomOtp);

    setOtpEnabled(true);
    setLoginEnabled(true);
    setStatus("WAITING FOR TOKEN...");
  };

  // Login Logic
  const login = () => {
    if (otp.trim() === generatedOtp) {
  setStatus("AUTH_SUCCESS");

      // 🔥 Redirect to Dashboard using React Router
     navigate("/home"); // must match the route path exactly
} else {
  setStatus("ERR: INVALID_TOKEN");
}
  };

  return (
    <div className="login-container">

      {/* LEFT SIDE PANEL */}
      <div className="left-panel">
        <div className="overlay">
          <h1 className="title">VASU'S BRAKES INDIA</h1>
          <h3 className="subtitle">Data Centralization Platform</h3>
        </div>
      </div>

      {/* RIGHT SIDE PANEL */}
      <div className="right-panel">

        <div className="top-close">
          <button className="close-btn" onClick={() => window.close()}>
            X
          </button>
        </div>

        <div className="form-box">
          <h2 className="header">AUTHENTICATE</h2>

          <div className="status-row">
            <div className="green-dot"></div>
            <span className="status-text">{status}</span>
          </div>

          <label className="input-label">USER_ID / EMAIL</label>
          <input
            className="input-field"
            type="text"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <label className="input-label">PHONE NUMBER</label>
          <input
            className="input-field"
            type="text"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />

          <button className="secondary-btn" onClick={generateOtp}>
            GENERATE OTP
          </button>

          <hr className="divider" />

          <label className="input-label">SECURITY_TOKEN (OTP)</label>
          <input
            disabled={!otpEnabled}
            className={`input-field ${otpEnabled ? "" : "disabled"}`}
            type="text"
            value={otp}
            onChange={e => setOtp(e.target.value)}
          />

          <button
            className={`primary-btn ${loginEnabled ? "" : "disabled-btn"}`}
            disabled={!loginEnabled}
            onClick={login}
          >
            INITIALIZE SESSION &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
