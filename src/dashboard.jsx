import React, { useState, useEffect, useMemo } from "react";
import Navigate from "./navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Use the environment variable for your AWS IP, or default to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function UserInfoForm() {
  // --- Profile Form Fields ---
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [targetCalories, setTargetCalories] = useState("");
  const [message, setMessage] = useState("");

  // --- Weight Tracker Fields ---
  const [dailyWeight, setDailyWeight] = useState("");
  const [weightHistory, setWeightHistory] = useState([]);
  const [trackerMessage, setTrackerMessage] = useState("");

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // --- 1. Calculate Maintenance Calories ---
  const maintenanceCalories = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseInt(age);
    if (h > 0 && w > 0 && a > 0) {
      // Harris-Benedict Equation
      const calculated = 10 * w + 6.25 * h - 5 * a + 5;
      return Math.round(calculated);
    }
    return 0;
  }, [height, weight, age]);

  // --- 2. Load existing user info & weight history ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch Profile Info
        const infoRes = await fetch(`${API_BASE_URL}/api/userinfo`, {
          headers: getAuthHeader(),
        });
        if (infoRes.ok) {
          const data = await infoRes.json();
          if (data) {
            setHeight(data.height_cm || "");
            setWeight(data.weight_kg || "");
            setAge(data.age || "");
            setTargetWeight(data.target_weight_kg || "");
            setTargetCalories(data.target_calories || "");
          }
        }

        // Fetch Weight History
        const historyRes = await fetch(`${API_BASE_URL}/api/weight-history`, {
          headers: getAuthHeader(),
        });
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setWeightHistory(historyData || []);
        }
      } catch (err) {
        console.error("Error fetching data:", err.message);
      }
    };
    fetchDashboardData();
  }, []);

  // --- 3. Handle Profile Submission ---
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const body = {
        height_cm: parseFloat(height),
        weight_kg: parseFloat(weight),
        age: parseInt(age),
        target_weight_kg: parseFloat(targetWeight),
        target_calories: parseInt(targetCalories),
        maintenance_calories: maintenanceCalories,
      };

      const res = await fetch(`${API_BASE_URL}/api/userinfo`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage("✅ Your info has been saved!");
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  // --- 4. Handle Daily Weight Submission ---
  const handleWeightSubmit = async (e) => {
    e.preventDefault();
    setTrackerMessage("");
    
    if(!dailyWeight) return;

    try {
      const newEntry = {
        weight: parseFloat(dailyWeight),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
      };

      const res = await fetch(`${API_BASE_URL}/api/weight-history`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(newEntry),
      });

      if (!res.ok) {
         const data = await res.json();
         throw new Error(data.message || "Failed to log weight");
      }

      setWeightHistory((prev) => [...prev, newEntry]);
      setWeight(dailyWeight); 
      setDailyWeight("");
      setTrackerMessage("✅ Weight logged for today!");
      
      setTimeout(() => setTrackerMessage(""), 3000);
    } catch (err) {
      setTrackerMessage(`❌ Error: ${err.message}`);
    }
  };

  const messageStyle = (msg) => (msg.startsWith('❌') || msg.startsWith('⚠️')) 
    ? styles.messageError 
    : styles.messageSuccess;

  // Custom tooltips for the light theme chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={styles.tooltipContent}>
          <p style={styles.tooltipLabel}>{label}</p>
          <p style={styles.tooltipIntro}>{`${payload[0].value} kg`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={styles.pageContainer}>
      <Navigate />
      
      <div style={styles.container}>
        <h2 style={styles.heading}>YOUR FITNESS PROFILE</h2>
        <p style={styles.subheading}>Keep this up-to-date to get the most accurate tracking.</p>

        <div style={styles.sectionCard}>
          <form onSubmit={handleProfileSubmit} style={styles.form}>
            {/* Basic Info */}
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="height">Height (cm)</label>
              <input 
                id="height" 
                type="number" 
                value={height} 
                onChange={(e) => setHeight(e.target.value)} 
                style={styles.input} 
                placeholder="e.g., 180" 
                onFocus={(e) => {
                  e.target.style.borderColor = "#5EF522";
                  e.target.style.boxShadow = "0 0 0 6px rgba(94, 245, 34, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="weight">Weight (kg)</label>
              <input 
                id="weight" 
                type="number" 
                value={weight} 
                onChange={(e) => setWeight(e.target.value)} 
                style={styles.input} 
                placeholder="e.g., 75"
                onFocus={(e) => {
                  e.target.style.borderColor = "#5EF522";
                  e.target.style.boxShadow = "0 0 0 6px rgba(94, 245, 34, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="age">Age</label>
              <input 
                id="age" 
                type="number" 
                value={age} 
                onChange={(e) => setAge(e.target.value)} 
                style={styles.input} 
                placeholder="e.g., 30"
                onFocus={(e) => {
                  e.target.style.borderColor = "#5EF522";
                  e.target.style.boxShadow = "0 0 0 6px rgba(94, 245, 34, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Calculated Field */}
            <div style={styles.calcBox}>
              <span style={styles.calcLabel}>Maintenance Calories</span>
              <p style={styles.calcValue}>{maintenanceCalories} <span style={{fontSize: "2rem"}}>kcal/day</span></p>
              <small style={styles.calcSubtext}>(Based on Harris-Benedict formula)</small>
            </div>

            {/* Goals */}
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="targetWeight">Target Weight (kg)</label>
              <input 
                id="targetWeight" 
                type="number" 
                value={targetWeight} 
                onChange={(e) => setTargetWeight(e.target.value)} 
                style={styles.input} 
                placeholder="e.g., 70"
                onFocus={(e) => {
                  e.target.style.borderColor = "#5EF522";
                  e.target.style.boxShadow = "0 0 0 6px rgba(94, 245, 34, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="targetCalories">Your Target Calories</label>
              <input 
                id="targetCalories" 
                type="number" 
                value={targetCalories} 
                onChange={(e) => setTargetCalories(e.target.value)} 
                style={styles.input} 
                placeholder="e.g., 2000"
                onFocus={(e) => {
                  e.target.style.borderColor = "#5EF522";
                  e.target.style.boxShadow = "0 0 0 6px rgba(94, 245, 34, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Submit Button */}
            <div style={styles.fullSpan}>
              <button 
                type="submit" 
                style={styles.button} 
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#4fe313';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -4px rgba(94, 245, 34, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#5EF522';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(94, 245, 34, 0.2)';
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(1px)'}
              >
                Save Profile
              </button>
              {message && <p style={messageStyle(message)}>{message}</p>}
            </div>
          </form>
        </div>

        {/* --- NEW SECTION: WEIGHT TRACKER --- */}
        <div style={styles.sectionCard}>
          <h3 style={styles.subHeadingTitle}>📈 Weight Progress Tracker</h3>
          
          <form onSubmit={handleWeightSubmit} style={styles.trackerForm}>
            <input 
              type="number" 
              step="0.1"
              value={dailyWeight} 
              onChange={(e) => setDailyWeight(e.target.value)} 
              style={{...styles.input, flex: "1 1 300px"}} 
              placeholder="Log today's weight (kg)" 
              required
              onFocus={(e) => {
                e.target.style.borderColor = "#5EF522";
                e.target.style.boxShadow = "0 0 0 6px rgba(94, 245, 34, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            />
            <button 
              type="submit" 
              style={styles.smallButton}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#4fe313';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 25px -4px rgba(94, 245, 34, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#5EF522';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(94, 245, 34, 0.2)';
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(1px)'}
            >
              Log Weight
            </button>
          </form>
          {trackerMessage && <p style={messageStyle(trackerMessage)}>{trackerMessage}</p>}

          {/* Chart Area */}
          <div style={styles.chartContainer}>
            {weightHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightHistory} margin={{ top: 20, right: 30, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#6b7280', fontSize: 18, fontWeight: '600' }} tickMargin={15} />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#6b7280', fontSize: 18, fontWeight: '600' }} domain={['dataMin - 2', 'auto']} tickMargin={10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#d1d5db', strokeWidth: 2 }} />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#111827" // Sharp dark line
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#5EF522', stroke: '#111827', strokeWidth: 2 }} // Green dots
                    activeDot={{ r: 10, fill: '#5EF522', stroke: '#111827', strokeWidth: 3 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p style={styles.emptyChartText}>No weight data logged yet. Start logging to see your progress!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- FLUID WIDESCREEN & PREMIUM LIGHT THEME ---
const styles = {
  pageContainer: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #ffffff 0%, #f3f4f6 100%)",
    color: "#111827",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    paddingBottom: "60px"
  },
  container: {
    width: "96%",
    maxWidth: "1800px",
    margin: "0 auto",
    padding: "2rem 1rem",
  },
  heading: { 
    fontSize: "4.5rem", 
    fontWeight: "900", 
    color: "#111827", 
    margin: "2rem 0 1rem 0",
    textAlign: "center",
    letterSpacing: "-0.04em",
    textTransform: "uppercase"
  },
  subheading: { 
    marginBottom: "3rem", 
    fontSize: "1.75rem", 
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "500"
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    padding: "3.5rem 4rem",
    borderRadius: "2rem",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 10px 20px -5px rgba(0, 0, 0, 0.03)",
    marginBottom: "3rem",
    borderTop: "8px solid #5EF522",
  },
  form: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", 
    gap: "2.5rem" 
  },
  inputGroup: { 
    display: "flex", 
    flexDirection: "column", 
    gap: "1rem" 
  },
  label: { 
    fontSize: "1.5rem", 
    fontWeight: "700", 
    color: "#4b5563",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  input: {
    width: "100%", 
    padding: "0 1.5rem", 
    backgroundColor: "#ffffff", 
    border: "2px solid #d1d5db",
    borderRadius: "1rem", 
    color: "#111827", 
    boxSizing: "border-box", 
    fontSize: "1.75rem", 
    height: "80px",
    outline: "none",
    transition: "all 0.2s ease",
    fontWeight: "600"
  },
  calcBox: { 
    padding: "2rem", 
    backgroundColor: "#f9fafb", 
    borderRadius: "1.5rem", 
    textAlign: "center", 
    display: "flex", 
    flexDirection: "column", 
    justifyContent: "center",
    borderLeft: "8px solid #5EF522",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
  },
  calcLabel: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#4b5563",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "0.5rem"
  },
  calcValue: { 
    fontSize: "4.5rem", 
    fontWeight: "900", 
    margin: "0", 
    color: "#111827",
    lineHeight: "1"
  },
  calcSubtext: { 
    fontSize: "1.25rem", 
    color: "#6b7280",
    marginTop: "0.5rem",
    fontWeight: "500"
  },
  fullSpan: { 
    gridColumn: "1 / -1", 
    textAlign: "center",
    marginTop: "2rem"
  },
  button: {
    width: "100%", 
    maxWidth: "500px", 
    padding: "0 3rem", 
    fontSize: "1.75rem", 
    fontWeight: "900", 
    color: "#111827",
    backgroundColor: "#5EF522", 
    borderRadius: "1rem", 
    border: "none", 
    cursor: "pointer", 
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)", 
    height: "80px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    boxShadow: "0 4px 6px -1px rgba(94, 245, 34, 0.2)"
  },
  messageError: { 
    textAlign: "center", 
    fontWeight: "700", 
    marginTop: "2rem", 
    color: "#ef4444",
    backgroundColor: "#fef2f2",
    padding: "1.5rem",
    borderRadius: "1rem",
    fontSize: "1.5rem",
    border: "2px solid #fecaca",
    maxWidth: "500px",
    margin: "2rem auto 0 auto"
  },
  messageSuccess: { 
    textAlign: "center", 
    fontWeight: "700", 
    marginTop: "2rem", 
    color: "#10b981",
    backgroundColor: "#ecfdf5",
    padding: "1.5rem",
    borderRadius: "1rem",
    fontSize: "1.5rem",
    border: "2px solid #a7f3d0",
    maxWidth: "500px",
    margin: "2rem auto 0 auto"
  },
  subHeadingTitle: { 
    fontSize: "2.5rem", 
    fontWeight: "800", 
    color: "#111827", 
    marginBottom: "3rem",
    borderBottom: "2px solid #f3f4f6",
    paddingBottom: "1.5rem",
    letterSpacing: "-0.02em"
  },
  trackerForm: { 
    display: "flex", 
    gap: "1.5rem", 
    marginBottom: "3rem",
    flexWrap: "wrap", 
  },
  smallButton: {
    padding: "0 3rem", 
    fontSize: "1.75rem", 
    fontWeight: "900", 
    color: "#111827",
    backgroundColor: "#5EF522", 
    borderRadius: "1rem", 
    border: "none", 
    cursor: "pointer", 
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)", 
    whiteSpace: "nowrap",
    flex: "1 1 auto",
    height: "80px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    boxShadow: "0 4px 6px -1px rgba(94, 245, 34, 0.2)"
  },
  chartContainer: { 
    height: "500px", 
    width: "100%", 
    backgroundColor: "#ffffff", 
    borderRadius: "1.5rem", 
    padding: "2rem", 
    boxSizing: "border-box", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
  },
  emptyChartText: { 
    color: "#9ca3af", 
    fontStyle: "italic",
    fontSize: "1.75rem",
    fontWeight: "500" 
  },
  tooltipContent: {
    backgroundColor: "#ffffff",
    border: "2px solid #e5e7eb",
    padding: "1.5rem",
    borderRadius: "1rem",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  },
  tooltipLabel: { 
    color: "#6b7280", 
    fontSize: "1.25rem", 
    margin: "0 0 0.5rem 0",
    fontWeight: "600",
    textTransform: "uppercase"
  },
  tooltipIntro: { 
    color: "#111827", 
    fontSize: "2.25rem", 
    fontWeight: "900", 
    margin: 0 
  },
};

export default UserInfoForm;