import React, { useState, useEffect, useCallback, useRef } from "react";
import Navigate from "./navigation";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

// Use environment variable for AWS/Production or default to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const PREDEFINED_EXERCISES = [
  { id: "ex1", name: "Barbell Bench Press" },
  { id: "ex2", name: "Dumbbell Bench Press" },
  { id: "ex3", name: "Incline Barbell Press" },
  { id: "ex4", name: "Incline Dumbbell Press" },
  { id: "ex5", name: "Push-up" },
  { id: "ex6", name: "Dip" },
  { id: "ex7", name: "Overhead Press (Barbell)" },
  { id: "ex8", name: "Dumbbell Shoulder Press" },
  { id: "ex9", name: "Lateral Raise" },
  { id: "ex10", name: "Tricep Pushdown" },
  { id: "ex11", name: "Skullcrusher" },
  { id: "ex12", name: "Squat (Barbell)" },
  { id: "ex13", name: "Leg Press" },
  { id: "ex14", name: "Lunge" },
  { id: "ex15", name: "Leg Extension" },
  { id: "ex16", name: "Leg Curl" },
  { id: "ex17", name: "Deadlift (Conventional)" },
  { id: "ex18", name: "Romanian Deadlift" },
  { id: "ex19", name: "Pull-up" },
  { id: "ex20", name: "Chin-up" },
  { id: "ex21", name: "Lat Pulldown" },
  { id: "ex22", name: "Bent Over Row (Barbell)" },
  { id: "ex23", name: "Dumbbell Row" },
  { id: "ex24", name: "Seated Cable Row" },
  { id: "ex25", name: "Bicep Curl (Dumbbell)" },
  { id: "ex26", name: "Bicep Curl (Barbell)" },
  { id: "ex27", name: "Hammer Curl" },
  { id: "ex28", name: "Plank" },
  { id: "ex29", name: "Crunch" },
  { id: "ex30", name: "Calf Raise" },
];

const WorkoutTracker = () => {
  const [log, setLog] = useState({ exerciseName: "", reps: "", weight: "" });
  const [exerciseList, setExerciseList] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const token = localStorage.getItem("token");
  const autocompleteRef = useRef(null);

  const fetchExercises = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/workouts/exercises`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch exercises");
      const data = await res.json();
      setExerciseList(data);
      if (!selectedExercise && data.length > 0) {
        setSelectedExercise(data[0]);
      }
    } catch (err) {
      console.error("Error fetching exercises:", err);
      setError("Could not load exercise list.");
    }
  }, [token, selectedExercise]);

  const fetchVolumeData = useCallback(async () => {
    if (!selectedExercise || !token) {
      setChartData([]);
      return;
    }
    setError("");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/workouts/volume?exercise=${encodeURIComponent(
          selectedExercise
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch volume data");
      const data = await res.json();
      setChartData(data);
    } catch (err) {
      console.error("Error fetching volume:", err);
      setError(`Could not load volume data for ${selectedExercise}.`);
    }
  }, [selectedExercise, token]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  useEffect(() => {
    fetchVolumeData();
  }, [fetchVolumeData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target)
      ) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogChange = (e) => {
    const { name, value } = e.target;
    setLog({ ...log, [name]: value });

    if (name === "exerciseName") {
      if (value.length > 0) {
        const filteredSuggestions = PREDEFINED_EXERCISES.filter((ex) =>
          ex.name.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filteredSuggestions);
      } else {
        setSuggestions([]);
      }
    }
  };

  const handleSuggestionClick = (exerciseName) => {
    setLog({ ...log, exerciseName: exerciseName });
    setSuggestions([]);
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!log.exerciseName || !log.reps) {
      setError("Exercise Name and Reps are required.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/workouts/sets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          exerciseName: log.exerciseName,
          reps: parseInt(log.reps),
          weight: parseFloat(log.weight) || 0,
        }),
      });

      if (!res.ok) throw new Error("Failed to save set");

      setMessage(`✅ Set logged successfully!`);
      
      setLog({ exerciseName: "", reps: "", weight: "" });

      if (!exerciseList.includes(log.exerciseName)) {
        await fetchExercises();
        setSelectedExercise(log.exerciseName);
      } else if (log.exerciseName === selectedExercise) {
        await fetchVolumeData();
      }
      
      setTimeout(() => setMessage(""), 3000);

    } catch (err) {
      console.error(err);
      setError("Error saving set. Please try again.");
    }
  };
  
  const renderChart = () => {
    if (chartData.length === 0) {
      return <p style={styles.emptyText}>No data logged for this exercise yet.</p>;
    }

    // Light theme axis styling
    const axisStyle = { fontSize: 18, fill: '#6b7280', fontWeight: '600' };

    if (chartData.length === 1) {
      return (
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <defs>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5EF522" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#5EF522" stopOpacity={0.3}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="date" stroke="#9ca3af" tick={axisStyle} tickMargin={10} />
            <YAxis stroke="#9ca3af" tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} cursor={{fill: '#f3f4f6'}} />
            <Legend 
              wrapperStyle={{ paddingTop: "30px" }}
              formatter={(value) => <span style={{ color: '#4b5563', fontSize: '22px', fontWeight: 'bold' }}>{value}</span>} 
            />
            <Bar 
              dataKey="volume" 
              fill="url(#colorVolume)"
              stroke="#111827" // Dark sleek border to pop out
              strokeWidth={3}
              name="Total Volume (kg)"
              radius={[10, 10, 0, 0]} 
              barSize={80}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={500}>
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
          <defs>
            <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5EF522" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#5EF522" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="date" stroke="#9ca3af" tick={axisStyle} tickMargin={10} />
          <YAxis stroke="#9ca3af" tick={axisStyle} />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: "30px" }}
            formatter={(value) => <span style={{ color: '#4b5563', fontSize: '22px', fontWeight: 'bold' }}>{value}</span>} 
          />
          <Area
            type="monotone"
            dataKey="volume"
            stroke="#111827" // Sharp dark line contrast
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#colorArea)"
            name="Total Volume (kg)"
            activeDot={{ r: 10, stroke: '#5EF522', strokeWidth: 4, fill: '#111827' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div style={styles.pageContainer}>
      <Navigate />
      <div style={styles.container}>
        <h1 style={styles.title}>🏋️ WORKOUT TRACKER</h1>

        <div style={styles.sectionCard}>
          <h2 style={styles.sectionTitle}>Log a New Set</h2>
          <form onSubmit={handleLogSubmit} style={styles.form}>
            <div style={styles.inputContainer}>
              <div ref={autocompleteRef} style={{...styles.autocompleteContainer, ...styles.textInput}}>
                <input
                  name="exerciseName"
                  type="text"
                  value={log.exerciseName}
                  onChange={handleLogChange}
                  placeholder="Exercise (e.g., Bench Press)"
                  style={{ ...styles.input, width: "100%", boxSizing: "border-box" }}
                  autoComplete="off"
                  onFocus={(e) => {
                    e.target.style.borderColor = "#5EF522";
                    e.target.style.boxShadow = "0 0 0 6px rgba(94, 245, 34, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                    e.target.style.boxShadow = "none";
                  }}
                />
                {suggestions.length > 0 && (
                  <ul style={styles.suggestionsList}>
                    {suggestions.map((ex) => (
                      <li
                        key={ex.id}
                        style={styles.suggestionItem}
                        onClick={() => handleSuggestionClick(ex.name)}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {ex.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <input
                name="reps"
                type="number"
                value={log.reps}
                onChange={handleLogChange}
                placeholder="Reps"
                style={{ ...styles.input, ...styles.numberInput }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#5EF522";
                  e.target.style.boxShadow = "0 0 0 6px rgba(94, 245, 34, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
              />
              <input
                name="weight"
                type="number"
                step="0.25"
                value={log.weight}
                onChange={handleLogChange}
                placeholder="Weight (kg)"
                style={{ ...styles.input, ...styles.numberInput }}
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
            <div style={styles.buttonContainer}>
              <button 
                type="submit" 
                style={{ ...styles.button, ...styles.addButton }}
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
                Log Set
              </button>
            </div>
          </form>
          {error && <p style={styles.error}>{error}</p>}
          {message && <p style={styles.message}>{message}</p>}
        </div>

        <div style={styles.sectionCard}>
          <h2 style={styles.sectionTitle}>Progress Visualization</h2>
          <div style={styles.chartControls}>
            <label htmlFor="exercise-select" style={styles.label}>Exercise:</label>
            <select
              id="exercise-select"
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              style={styles.select}
              onFocus={(e) => {
                e.target.style.borderColor = "#5EF522";
                e.target.style.boxShadow = "0 0 0 6px rgba(94, 245, 34, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            >
              <option value="" disabled>-- Select Exercise --</option>
              {exerciseList.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.chartSection}>
            {selectedExercise ? (
              renderChart()
            ) : (
              <p style={styles.emptyText}>Select an exercise to see your gains!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Light theme custom tooltip
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
    width: "96%",        // Expands on big monitors
    maxWidth: "1800px",  // Caps at ultra-widescreen size
    margin: "0 auto",
    padding: "2rem 1rem",
  },
  title: {
    color: "#111827",
    fontWeight: "900",
    fontSize: "4.5rem", 
    margin: "2rem 0 3rem 0",
    letterSpacing: "-0.04em",
    textAlign: "center",
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    padding: "3.5rem 4rem",
    borderRadius: "2rem",
    marginBottom: "3rem",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 10px 20px -5px rgba(0, 0, 0, 0.03)",
    borderTop: "8px solid #5EF522",
  },
  sectionTitle: {
    color: "#111827",
    fontSize: "2.5rem",
    fontWeight: "800",
    marginBottom: "3rem",
    paddingBottom: "1.5rem",
    borderBottom: "2px solid #f3f4f6",
    letterSpacing: "-0.02em",
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  inputContainer: {
    display: "flex",
    gap: "2.5rem",
    flexWrap: "wrap",
  },
  input: {
    height: "80px",
    padding: "0 1.5rem",
    fontSize: "1.75rem",
    borderRadius: "1rem",
    border: "2px solid #d1d5db",
    backgroundColor: "#ffffff",
    color: "#111827",
    outline: "none",
    transition: "all 0.2s ease",
    fontWeight: "600",
  },
  textInput: { flex: "2 1 400px" },
  numberInput: { flex: "1 1 180px" },
  autocompleteContainer: { position: "relative" },
  suggestionsList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: "1rem",
    marginTop: "8px",
    listStyle: "none",
    padding: "10px",
    maxHeight: "350px",
    overflowY: "auto",
    zIndex: 100,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  suggestionItem: {
    padding: "1rem 1.5rem",
    borderRadius: "0.5rem",
    cursor: "pointer",
    fontSize: "1.5rem",
    color: "#111827",
    fontWeight: "500",
    transition: "background 0.2s ease",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "1rem",
  },
  button: {
    height: "80px",
    padding: "0 4rem",
    fontSize: "1.75rem",
    fontWeight: "900",
    borderRadius: "1rem",
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  addButton: {
    backgroundColor: "#5EF522",
    color: "#111827",
    boxShadow: "0 4px 6px -1px rgba(94, 245, 34, 0.2)",
  },
  error: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: "1.5rem", 
    textAlign: "center",
    padding: "1.5rem",
    backgroundColor: "#fef2f2", 
    borderRadius: "1rem",
    marginTop: "2rem",
    border: "2px solid #fecaca"
  },
  message: {
    color: "#10b981",
    fontWeight: "700",
    fontSize: "1.5rem", 
    textAlign: "center",
    padding: "1.5rem",
    backgroundColor: "#ecfdf5", 
    borderRadius: "1rem",
    marginTop: "2rem",
    border: "2px solid #a7f3d0"
  },
  chartControls: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    marginBottom: "3rem",
    flexWrap: "wrap",
  },
  label: { 
    fontSize: "1.75rem", 
    fontWeight: "800", 
    color: "#4b5563",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  select: {
    height: "70px",
    padding: "0 1.5rem",
    fontSize: "1.5rem",
    borderRadius: "1rem",
    backgroundColor: "#ffffff",
    color: "#111827",
    border: "2px solid #d1d5db",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s ease",
    outline: "none",
  },
  chartSection: {
    paddingTop: "2rem",
  },
  emptyText: {
    fontSize: "1.75rem",
    color: "#9ca3af",
    textAlign: "center",
    padding: "4rem 0",
    fontStyle: "italic",
    fontWeight: "500",
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

export default WorkoutTracker;