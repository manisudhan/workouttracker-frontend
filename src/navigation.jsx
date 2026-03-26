import React from "react";
import { NavLink } from "react-router-dom";

function Navigate() {
  const styles = {
    navBar: {
      fontFamily: "'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      backgroundColor: "#1f2937", 
      padding: "0 10px", // Reduced padding so it doesn't clip on small screens
      display: "flex",
      justifyContent: "space-around", // Evenly spaces the links
      flexWrap: "wrap", // CRITICAL: Allows links to drop to a new line on mobile
      boxShadow: "0 4px 10px rgba(0,0,0,0.3)", 
      borderBottom: "1px solid #374151", 
      width: "100%", 
      boxSizing: "border-box",
    },
    navLinkBase: {
      textDecoration: "none",
      color: "#9ca3af", 
      fontWeight: "500",
      // CRITICAL: clamp(min-size, preferred-size, max-size) 
      // This automatically scales the text smoothly based on screen width!
      fontSize: "clamp(1.1rem, 2.5vw, 1.75rem)", 
      padding: "16px 20px", // Sane padding that works everywhere
      flex: "1 1 auto", // CRITICAL: Tells the links to stretch and fill available space evenly
      borderBottom: "3px solid transparent",
      transition: "color 0.2s ease, border-bottom 0.2s ease",
      textAlign: "center",
      whiteSpace: "nowrap", // Prevents the words "Track Calorie" from stacking weirdly
    },
    navLinkActive: {
      color: "#ffffff", 
      borderBottom: "3px solid #4f46e5", 
    },
  };

  return (
    <nav style={styles.navBar}>
      <NavLink
        to="/dashboard"
        style={({ isActive }) => ({
          ...styles.navLinkBase,
          ...(isActive ? styles.navLinkActive : {}),
        })}
      >
        Home
      </NavLink>

      <NavLink
        to="/track-calorie"
        style={({ isActive }) => ({
          ...styles.navLinkBase,
          ...(isActive ? styles.navLinkActive : {}),
        })}
      >
        Track Calorie
      </NavLink>

      <NavLink
        to="/track-workout"
        style={({ isActive }) => ({
          ...styles.navLinkBase,
          ...(isActive ? styles.navLinkActive : {}),
        })}
      >
        Track Workout
      </NavLink>

      <NavLink
        to="/profile"
        style={({ isActive }) => ({
          ...styles.navLinkBase,
          ...(isActive ? styles.navLinkActive : {}),
        })}
      >
        Profile
      </NavLink>
    </nav>
  );
}

export default Navigate;