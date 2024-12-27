// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import ScholarshipDetail from "./pages/ScholarshipDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/edit" element={<HomePage isAdminMode={true} />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/:scholarshipID" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
