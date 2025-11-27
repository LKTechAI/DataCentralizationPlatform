import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Manufacturing from "./pages/Manufacturing";
import Sales from "./pages/Sales";
import Field from "./pages/Field";
import Testing from "./pages/Testing";
import Login from "./pages/login";   // <-- FIXED

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/manufacturing" element={<Manufacturing />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/field" element={<Field />} />
        <Route path="/testing" element={<Testing />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
