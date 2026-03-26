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

  return (
    <div style={styles.pageContainer}>
      <Navigate />
      
      <div style={styles.container}>
        <h2 style={styles.heading}>Your Fitness Profile</h2>
        <p style={styles.subheading}>Keep this up-to-date to get the most accurate tracking.</p>

        <form onSubmit={handleProfileSubmit} style={styles.form}>
          {/* Basic Info */}
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="height">Height (cm)</label>
            <input id="height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} style={styles.input} placeholder="e.g., 180" />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="weight">Weight (kg)</label>
            <input id="weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} style={styles.input} placeholder="e.g., 75" />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="age">Age</label>
            <input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} style={styles.input} placeholder="e.g., 30" />
          </div>

          {/* Calculated Field */}
          <div style={styles.calcBox}>
            <span style={styles.calcLabel}>Maintenance Calories</span>
            <p style={styles.calcValue}>{maintenanceCalories} kcal/day</p>
            <small style={styles.calcSubtext}>(Based on Harris-Benedict formula)</small>
          </div>

          {/* Goals */}
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="targetWeight">Target Weight (kg)</label>
            <input id="targetWeight" type="number" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} style={styles.input} placeholder="e.g., 70" />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="targetCalories">Your Target Calories</label>
            <input id="targetCalories" type="number" value={targetCalories} onChange={(e) => setTargetCalories(e.target.value)} style={styles.input} placeholder="e.g., 2000" />
          </div>

          {/* Submit Button */}
          <div style={styles.fullSpan}>
            <button type="submit" style={styles.button} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#6366f1'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}>
              Save Profile
            </button>
            {message && <p style={messageStyle(message)}>{message}</p>}
          </div>
        </form>

        {/* --- NEW SECTION: WEIGHT TRACKER --- */}
        <div style={styles.trackerSection}>
          <h3 style={styles.subHeadingTitle}>📈 Weight Progress Tracker</h3>
          
          <form onSubmit={handleWeightSubmit} style={styles.trackerForm}>
            <input 
              type="number" 
              step="0.1"
              value={dailyWeight} 
              onChange={(e) => setDailyWeight(e.target.value)} 
              style={{...styles.input, flex: "1 1 250px"}} 
              placeholder="Log today's weight (kg)" 
              required
            />
            <button 
              type="submit" 
              style={styles.smallButton}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#059669'}
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={18} tickMargin={10} />
                  <YAxis stroke="#9ca3af" fontSize={18} domain={['dataMin - 2', 'auto']} tickMargin={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4b5563', color: '#fff', fontSize: '22px', borderRadius: '8px', padding: '16px' }}
                    itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#818cf8" strokeWidth={4} dot={{ r: 6, fill: '#818cf8' }} activeDot={{ r: 10 }} />
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

// --- MASSIVELY UPSCALED TEXT & RESPONSIVE STYLES ---
const styles = {
  pageContainer: {
    minHeight: "100vh",
    backgroundColor: "#111827",
    color: "#f3f4f6",
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
  container: {
    maxWidth: "90rem", 
    margin: "40px auto",
    padding: "32px 40px",
    backgroundColor: "#1f2937",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  },
  heading: { 
    fontSize: "3.5rem", 
    fontWeight: "800", 
    color: "#ffffff", 
    marginBottom: "12px",
    textAlign: "center"
  },
  subheading: { 
    marginBottom: "40px", 
    fontSize: "1.5rem", 
    color: "#9ca3af",
    textAlign: "center"
  },
  form: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", 
    gap: "32px" 
  },
  inputGroup: { 
    display: "flex", 
    flexDirection: "column", 
    gap: "12px" 
  },
  label: { 
    fontSize: "24px", 
    fontWeight: "600", 
    color: "#d1d5db" 
  },
  input: {
    width: "100%", 
    padding: "16px 20px", 
    backgroundColor: "#374151", 
    border: "2px solid #4b5563",
    borderRadius: "8px", 
    color: "#ffffff", 
    boxSizing: "border-box", 
    fontSize: "22px", 
    height: "60px" 
  },
  calcBox: { 
    padding: "24px", 
    backgroundColor: "#312e81", 
    borderRadius: "12px", 
    textAlign: "center", 
    display: "flex", 
    flexDirection: "column", 
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  calcLabel: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#a5b4fc"
  },
  calcValue: { 
    fontSize: "48px", 
    fontWeight: "bold", 
    margin: "8px 0", 
    color: "#e0e7ff" 
  },
  calcSubtext: { 
    fontSize: "18px", 
    color: "#a5b4fc" 
  },
  fullSpan: { 
    gridColumn: "1 / -1", 
    textAlign: "center" 
  },
  button: {
    width: "100%", 
    maxWidth: "600px", 
    padding: "16px 36px", 
    fontSize: "24px", 
    fontWeight: "bold", 
    color: "#ffffff",
    backgroundColor: "#4f46e5", 
    borderRadius: "8px", 
    border: "none", 
    cursor: "pointer", 
    transition: "0.2s", 
    marginTop: "20px",
  },
  messageError: { 
    textAlign: "center", 
    fontWeight: "700", 
    marginTop: "20px", 
    color: "#fca5a5",
    backgroundColor: "#7f1d1d",
    padding: "16px",
    borderRadius: "8px",
    fontSize: "22px"
  },
  messageSuccess: { 
    textAlign: "center", 
    fontWeight: "700", 
    marginTop: "20px", 
    color: "#6ee7b7",
    backgroundColor: "#064e3b",
    padding: "16px",
    borderRadius: "8px",
    fontSize: "22px"
  },
  trackerSection: { 
    marginTop: "60px",
    backgroundColor: "#374151",
    padding: "32px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  subHeadingTitle: { 
    fontSize: "2.25rem", 
    fontWeight: "700", 
    color: "#ffffff", 
    marginBottom: "24px",
    borderBottom: "2px solid #4b5563",
    paddingBottom: "12px"
  },
  trackerForm: { 
    display: "flex", 
    gap: "16px", 
    marginBottom: "32px",
    flexWrap: "wrap", 
  },
  smallButton: {
    padding: "16px 28px", 
    fontSize: "22px", 
    fontWeight: "bold", 
    color: "#ffffff",
    backgroundColor: "#059669", 
    borderRadius: "8px", 
    border: "none", 
    cursor: "pointer", 
    transition: "0.2s", 
    whiteSpace: "nowrap",
    flex: "1 1 auto"
  },
  chartContainer: { 
    height: "450px", 
    width: "100%", 
    backgroundColor: "#1f2937", 
    borderRadius: "12px", 
    padding: "24px", 
    boxSizing: "border-box", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center",
    border: "2px solid #4b5563"
  },
  emptyChartText: { 
    color: "#9ca3af", 
    fontStyle: "italic",
    fontSize: "24px" 
  }
};

export default UserInfoForm;