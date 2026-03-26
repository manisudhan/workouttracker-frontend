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

    const axisStyle = { fontSize: 18, fill: '#9ca3af', fontWeight: '600' };

    if (chartData.length === 1) {
      return (
        <ResponsiveContainer width="100%" height={450}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <defs>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" vertical={false} />
            <XAxis dataKey="date" stroke="#9ca3af" tick={axisStyle} tickMargin={10} />
            <YAxis stroke="#9ca3af" tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} cursor={{fill: '#374151'}} />
            <Legend 
              wrapperStyle={{ paddingTop: "30px" }}
              formatter={(value) => <span style={{ color: '#9ca3af', fontSize: '22px', fontWeight: 'bold' }}>{value}</span>} 
            />
            <Bar 
              dataKey="volume" 
              fill="url(#colorVolume)"
              name="Total Volume (kg)"
              radius={[10, 10, 0, 0]} 
              barSize={80}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={450}>
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
          <defs>
            <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" vertical={false} />
          <XAxis dataKey="date" stroke="#9ca3af" tick={axisStyle} tickMargin={10} />
          <YAxis stroke="#9ca3af" tick={axisStyle} />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: "30px" }}
            formatter={(value) => <span style={{ color: '#9ca3af', fontSize: '22px', fontWeight: 'bold' }}>{value}</span>} 
          />
          <Area
            type="monotone"
            dataKey="volume"
            stroke="#818cf8"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#colorArea)"
            name="Total Volume (kg)"
            activeDot={{ r: 10, stroke: '#ffffff', strokeWidth: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div style={styles.pageContainer}>
      <Navigate />
      <div style={styles.container}>
        <h1 style={styles.title}>🏋️ Workout Tracker</h1>

        <div style={styles.inputSection}>
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
                />
                {suggestions.length > 0 && (
                  <ul style={styles.suggestionsList}>
                    {suggestions.map((ex) => (
                      <li
                        key={ex.id}
                        style={styles.suggestionItem}
                        onClick={() => handleSuggestionClick(ex.name)}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
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
              />
              <input
                name="weight"
                type="number"
                step="0.25"
                value={log.weight}
                onChange={handleLogChange}
                placeholder="Weight (kg)"
                style={{ ...styles.input, ...styles.numberInput }}
              />
            </div>
            <div style={styles.buttonContainer}>
              <button 
                type="submit" 
                style={{ ...styles.button, ...styles.addButton }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
              >
                Log Set
              </button>
            </div>
          </form>
          {error && <p style={styles.error}>{error}</p>}
          {message && <p style={styles.message}>{message}</p>}
        </div>

        <div style={styles.resultsContainer}>
          <h2 style={styles.sectionTitle}>Progress Visualization</h2>
          <div style={styles.chartControls}>
            <label htmlFor="exercise-select" style={styles.label}>Exercise:</label>
            <select
              id="exercise-select"
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              style={styles.select}
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

// --- MASSIVELY UPSCALED STYLES ---
const styles = {
  pageContainer: {
    minHeight: "100vh",
    backgroundColor: "#111827",
    color: "#f3f4f6",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  container: {
    maxWidth: "90rem", 
    margin: "0 auto",
    padding: "60px 40px",
  },
  title: {
    fontSize: "4.5rem", // EXTRA MASSIVE
    fontWeight: "900",
    textAlign: "center",
    marginBottom: "60px",
    letterSpacing: "-0.025em",
  },
  inputSection: {
    backgroundColor: "#1f2937",
    padding: "50px",
    borderRadius: "24px",
    border: "1px solid #374151",
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "2.5rem",
    fontWeight: "800",
    marginBottom: "40px",
    color: "#ffffff",
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  inputContainer: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  input: {
    height: "80px", // CHUNKIER
    padding: "0 30px",
    fontSize: "1.75rem",
    borderRadius: "16px",
    border: "3px solid #374151",
    backgroundColor: "#111827",
    color: "#ffffff",
    outline: "none",
    transition: "border-color 0.2s",
  },
  textInput: { flex: "2 1 400px" },
  numberInput: { flex: "1 1 180px" },
  autocompleteContainer: { position: "relative" },
  suggestionsList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#1f2937",
    border: "3px solid #374151",
    borderRadius: "16px",
    marginTop: "8px",
    listStyle: "none",
    padding: "10px",
    maxHeight: "350px",
    overflowY: "auto",
    zIndex: 100,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
  },
  suggestionItem: {
    padding: "20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1.5rem",
    transition: "background 0.2s",
  },
  button: {
    height: "80px",
    padding: "0 60px",
    fontSize: "1.75rem",
    fontWeight: "800",
    borderRadius: "16px",
    cursor: "pointer",
    border: "none",
    transition: "transform 0.1s active",
  },
  addButton: {
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    width: "fit-content",
    alignSelf: "center",
  },
  error: {
    backgroundColor: "#7f1d1d",
    color: "#fecaca",
    padding: "20px",
    borderRadius: "12px",
    fontSize: "1.5rem",
    textAlign: "center",
    marginTop: "20px",
  },
  message: {
    backgroundColor: "#064e3b",
    color: "#a7f3d0",
    padding: "20px",
    borderRadius: "12px",
    fontSize: "1.5rem",
    textAlign: "center",
    marginTop: "20px",
  },
  resultsContainer: {
    backgroundColor: "#1f2937",
    padding: "50px",
    borderRadius: "24px",
    border: "1px solid #374151",
  },
  chartControls: {
    display: "flex",
    alignItems: "center",
    gap: "25px",
    marginBottom: "40px",
  },
  label: { fontSize: "2rem", fontWeight: "600", color: "#9ca3af" },
  select: {
    height: "70px",
    padding: "0 20px",
    fontSize: "1.5rem",
    borderRadius: "12px",
    backgroundColor: "#111827",
    color: "#ffffff",
    border: "3px solid #374151",
    cursor: "pointer",
  },
  emptyText: {
    fontSize: "2rem",
    color: "#6b7280",
    textAlign: "center",
    padding: "100px 0",
  },
  tooltipContent: {
    backgroundColor: "#111827",
    border: "2px solid #818cf8",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
  },
  tooltipLabel: { color: "#9ca3af", fontSize: "1.25rem", margin: "0 0 5px 0" },
  tooltipIntro: { color: "#ffffff", fontSize: "2rem", fontWeight: "800", margin: 0 },
};

export default WorkoutTracker;