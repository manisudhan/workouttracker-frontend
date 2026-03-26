import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./login";
import Dashboard from "./dashboard";
import Signin from "./signin";
import Trackcalorie from "./calorietracker";
import WorkoutTracker from "./trackworkout";
import ProfilePage from "./profile"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path ="/track-calorie" element={<Trackcalorie />} />
        <Route path="/register" element={<Signin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path = "/track-workout" element={<WorkoutTracker />} />
        <Route path = "/profile" element = {<ProfilePage />} />
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
