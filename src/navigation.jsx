import React from "react";
import { NavLink } from "react-router-dom";

function Navigate() {
  const styles = {
    navBar: {
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      backgroundColor: "#ffffff", 
      display: "flex",
      justifyContent: "flex-start", 
      alignItems: "center",
      flexWrap: "nowrap", 
      overflowX: "auto", 
      WebkitOverflowScrolling: "touch", 
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", 
      borderBottom: "1px solid #e5e7eb", 
      width: "100%", 
      boxSizing: "border-box",
      padding: "0.75rem 1rem", // Added padding so the colored pills don't touch the edges
      gap: "0.5rem", // Adds clean spacing between the links
      scrollbarWidth: "none", 
      msOverflowStyle: "none", 
    },
  };

  return (
    <>
      <style>
        {`
          /* Hides the horizontal scrollbar for a native app feel */
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }

          /* Base styling for all navigation links */
          .nav-item {
            text-decoration: none;
            color: #6b7280;
            font-weight: 700;
            font-size: clamp(1rem, 2vw, 1.15rem);
            padding: 0.875rem 2rem;
            flex: 1 0 auto;
            border-radius: 1rem; /* Creates the rounded pill shape */
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            text-align: center;
            white-space: nowrap;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            background-color: transparent;
          }

          /* Smooth hover effect for inactive tabs */
          .nav-item:hover:not(.active-tab) {
            background-color: #f3f4f6;
            color: #111827;
            transform: translateY(-1px);
          }

          /* The massive pop of color for the active tab */
          .nav-item.active-tab {
            background-color: #5EF522;
            color: #111827;
            box-shadow: 0 6px 15px -3px rgba(94, 245, 34, 0.4);
          }
        `}
      </style>

      <nav style={styles.navBar} className="hide-scrollbar">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => isActive ? "nav-item active-tab" : "nav-item"}
        >
          Home
        </NavLink>

        <NavLink
          to="/track-calorie"
          className={({ isActive }) => isActive ? "nav-item active-tab" : "nav-item"}
        >
          Track Calorie
        </NavLink>

        <NavLink
          to="/track-workout"
          className={({ isActive }) => isActive ? "nav-item active-tab" : "nav-item"}
        >
          Track Workout
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => isActive ? "nav-item active-tab" : "nav-item"}
        >
          Profile
        </NavLink>
      </nav>
    </>
  );
}

export default Navigate;