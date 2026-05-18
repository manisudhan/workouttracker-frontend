import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigate from "./navigation";

// Use the environment variable for your AWS IP, or default to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Profile = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    height_cm: "",
    weight_kg: "",
    age: "",
    target_weight_kg: "",
    maintenance_calories: "",
    target_calories: "",
  });
  const [username, setUsername] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [progressData, setProgressData] = useState({
    totalWorkouts: 0,
    totalSets: 0,
    weeklyCalorieAvg: 0,
    weeklyProteinAvg: 0,
    topExercises: [],
    recentActivity: [],
  });

  const token = localStorage.getItem("token");

  // Calculate BMI
  const calculateBMI = () => {
    if (userInfo.height_cm && userInfo.weight_kg) {
      const heightM = userInfo.height_cm / 100;
      const bmi = (userInfo.weight_kg / (heightM * heightM)).toFixed(1);
      return bmi;
    }
    return "N/A";
  };

  // Get BMI category
  const getBMICategory = (bmi) => {
    if (bmi === "N/A") return { text: "N/A", color: "#6b7280" };
    const bmiNum = parseFloat(bmi);
    if (bmiNum < 18.5) return { text: "Underweight", color: "#3b82f6" }; 
    if (bmiNum < 25) return { text: "Normal", color: "#10b981" };
    if (bmiNum < 30) return { text: "Overweight", color: "#f59e0b" };
    return { text: "Obese", color: "#ef4444" };
  };

  // Calculate weight goal progress
  const getWeightProgress = () => {
    if (userInfo.weight_kg && userInfo.target_weight_kg) {
      const current = parseFloat(userInfo.weight_kg);
      const target = parseFloat(userInfo.target_weight_kg);
      const diff = Math.abs(current - target);
      const direction = current > target ? "lose" : "gain";
      return { diff: diff.toFixed(1), direction };
    }
    return null;
  };

  // Fetch user info
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUsername(payload.username || "User");
    } catch (e) {
      console.error("Error parsing token:", e);
    }

    const fetchUserInfo = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/userinfo`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch user info");
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          setUserInfo(data);
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };

    fetchUserInfo();
  }, [token, navigate]);

  // Fetch progress statistics
  useEffect(() => {
    if (!token) return;

    const fetchProgress = async () => {
      try {
        const exercisesRes = await fetch(`${API_BASE_URL}/api/workouts/exercises`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (exercisesRes.ok) {
          const exercises = await exercisesRes.json();
          
          const volumePromises = exercises.slice(0, 5).map(async (exercise) => {
            const volRes = await fetch(
              `${API_BASE_URL}/api/workouts/volume?exercise=${encodeURIComponent(exercise)}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (volRes.ok) {
              const volData = await volRes.json();
              const totalVolume = volData.reduce((sum, d) => sum + d.volume, 0);
              return { name: exercise, volume: totalVolume };
            }
            return null;
          });

          const volumeResults = await Promise.all(volumePromises);
          const topExercises = volumeResults
            .filter(e => e !== null)
            .sort((a, b) => b.volume - a.volume)
            .slice(0, 5);

          setProgressData(prev => ({
            ...prev,
            topExercises,
            totalWorkouts: exercises.length,
          }));
        }

        const mealsRes = await fetch(`${API_BASE_URL}/api/meals`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (mealsRes.ok) {
          const meals = await mealsRes.json();
          const totalCal = meals.reduce((sum, m) => sum + parseFloat(m.calories || 0), 0);
          const totalPro = meals.reduce((sum, m) => sum + parseFloat(m.protein || 0), 0);
          
          setProgressData(prev => ({
            ...prev,
            weeklyCalorieAvg: totalCal,
            weeklyProteinAvg: totalPro,
          }));
        }
      } catch (err) {
        console.error("Error fetching progress:", err);
      }
    };

    fetchProgress();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleSave = async () => {
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/userinfo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userInfo),
      });

      if (!res.ok) throw new Error("Failed to save user info");

      setMessage("Profile updated successfully! ✅");
      setIsEditing(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error saving user info:", err);
      setError("Failed to update profile. Please try again.");
    }
  };

  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(bmi);
  const weightGoal = getWeightProgress();

  return (
    <div style={styles.pageContainer}>
      <Navigate />

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>👤 MY PROFILE</h1>
            <p style={styles.subtitle}>Welcome back, <span style={{color: "#111827", fontWeight: "700"}}>{username}</span>!</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={isEditing ? styles.cancelButton : styles.editButton}
            onMouseOver={(e) => {
              if (isEditing) {
                e.currentTarget.style.backgroundColor = '#d1d5db';
              } else {
                e.currentTarget.style.backgroundColor = '#4fe313';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 25px -4px rgba(94, 245, 34, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (isEditing) {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              } else {
                e.currentTarget.style.backgroundColor = '#5EF522';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(94, 245, 34, 0.2)';
              }
            }}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.message}>{message}</p>}

        <div style={styles.sectionCard}>
          <h2 style={styles.sectionTitle}>📋 Personal Information</h2>
          <div style={styles.infoGrid}>
            <div style={styles.infoCard}>
              <label style={styles.label}>Height (cm)</label>
              {isEditing ? (
                <input
                  type="number"
                  name="height_cm"
                  value={userInfo.height_cm}
                  onChange={handleInputChange}
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#5EF522";
                    e.target.style.boxShadow = "0 0 0 6px rgba(94, 245, 34, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                    e.target.style.boxShadow = "none";
                  }}
                />
              ) : (
                <p style={styles.infoValue}>{userInfo.height_cm || "Not set"}</p>
              )}
            </div>

            <div style={styles.infoCard}>
              <label style={styles.label}>Weight (kg)</label>
              {isEditing ? (
                <input
                  type="number"
                  name="weight_kg"
                  value={userInfo.weight_kg}
                  onChange={handleInputChange}
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#5EF522";
                    e.target.style.boxShadow = "0 0 0 6px rgba(94, 245, 34, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                    e.target.style.boxShadow = "none";
                  }}
                />
              ) : (
                <p style={styles.infoValue}>{userInfo.weight_kg || "Not set"}</p>
              )}
            </div>

            <div style={styles.infoCard}>
              <label style={styles.label}>Age</label>
              {isEditing ? (
                <input
                  type="number"
                  name="age"
                  value={userInfo.age}
                  onChange={handleInputChange}
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#5EF522";
                    e.target.style.boxShadow = "0 0 0 6px rgba(94, 245, 34, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                    e.target.style.boxShadow = "none";
                  }}
                />
              ) : (
                <p style={styles.infoValue}>{userInfo.age || "Not set"}</p>
              )}
            </div>

            <div style={styles.infoCard}>
              <label style={styles.label}>Target Weight (kg)</label>
              {isEditing ? (
                <input
                  type="number"
                  name="target_weight_kg"
                  value={userInfo.target_weight_kg}
                  onChange={handleInputChange}
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#5EF522";
                    e.target.style.boxShadow = "0 0 0 6px rgba(94, 245, 34, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                    e.target.style.boxShadow = "none";
                  }}
                />
              ) : (
                <p style={styles.infoValue}>{userInfo.target_weight_kg || "Not set"}</p>
              )}
            </div>

            <div style={styles.infoCard}>
              <label style={styles.label}>Maintenance Calories</label>
              {isEditing ? (
                <input
                  type="number"
                  name="maintenance_calories"
                  value={userInfo.maintenance_calories}
                  onChange={handleInputChange}
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#5EF522";
                    e.target.style.boxShadow = "0 0 0 6px rgba(94, 245, 34, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                    e.target.style.boxShadow = "none";
                  }}
                />
              ) : (
                <p style={styles.infoValue}>{userInfo.maintenance_calories || "Not set"}</p>
              )}
            </div>

            <div style={styles.infoCard}>
              <label style={styles.label}>Target Calories</label>
              {isEditing ? (
                <input
                  type="number"
                  name="target_calories"
                  value={userInfo.target_calories}
                  onChange={handleInputChange}
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#5EF522";
                    e.target.style.boxShadow = "0 0 0 6px rgba(94, 245, 34, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                    e.target.style.boxShadow = "none";
                  }}
                />
              ) : (
                <p style={styles.infoValue}>{userInfo.target_calories || "Not set"}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <button 
              onClick={handleSave} 
              style={styles.saveButton}
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
              Save Changes
            </button>
          )}
        </div>

        <div style={styles.sectionCard}>
          <h2 style={styles.sectionTitle}>📊 Health Metrics</h2>
          <div style={styles.statsGrid}>
            <div style={{...styles.statCard, ...styles.bmiCard}}>
              <div style={styles.statIcon}>🏃</div>
              <div style={styles.statContent}>
                <p style={styles.statLabel}>BMI</p>
                <p style={styles.statValue}>{bmi}</p>
                <p style={{...styles.statCategory, color: bmiCategory.color}}>
                  {bmiCategory.text}
                </p>
              </div>
            </div>

            <div style={{...styles.statCard, ...styles.goalCard}}>
              <div style={styles.statIcon}>🎯</div>
              <div style={styles.statContent}>
                <p style={styles.statLabel}>Weight Goal</p>
                {weightGoal ? (
                  <>
                    <p style={styles.statValue}>{weightGoal.diff} <span style={{fontSize: "1.5rem"}}>kg</span></p>
                    <p style={styles.statCategory}>to {weightGoal.direction}</p>
                  </>
                ) : (
                  <p style={{...styles.statValue, fontSize:"1.75rem", fontWeight:"700", color:"#111827"}}>Not set</p>
                )}
              </div>
            </div>

            <div style={{...styles.statCard, ...styles.calorieCard}}>
              <div style={styles.statIcon}>🔥</div>
              <div style={styles.statContent}>
                <p style={styles.statLabel}>Today's Calories</p>
                <p style={styles.statValue}>{progressData.weeklyCalorieAvg} <span style={{fontSize: "1.5rem"}}>kcal</span></p>
              </div>
            </div>

            <div style={{...styles.statCard, ...styles.proteinCard}}>
              <div style={styles.statIcon}>💪</div>
              <div style={styles.statContent}>
                <p style={styles.statLabel}>Today's Protein</p>
                <p style={styles.statValue}>{progressData.weeklyProteinAvg.toFixed(1)} <span style={{fontSize: "1.5rem"}}>g</span></p>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.sectionCard}>
          <h2 style={styles.sectionTitle}>🏋️ Workout Progress</h2>
          <div style={styles.progressGrid}>
            <div style={styles.progressCard}>
              <h3 style={styles.progressTitle}>Total Exercises Logged</h3>
              <p style={styles.progressValue}>{progressData.totalWorkouts}</p>
            </div>

            <div style={styles.progressCard}>
              <h3 style={styles.progressTitle}>Top Exercises by Volume</h3>
              {progressData.topExercises.length > 0 ? (
                <div style={styles.exerciseList}>
                  {progressData.topExercises.map((ex, idx) => (
                    <div key={idx} style={styles.exerciseItem}>
                      <span style={styles.exerciseRank}>#{idx + 1}</span>
                      <span style={styles.exerciseName}>{ex.name}</span>
                      <span style={styles.exerciseVolume}>{ex.volume.toFixed(0)} kg</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={styles.emptyText}>No exercises logged yet</p>
              )}
            </div>
          </div>
        </div>

        <div style={styles.sectionCard}>
          <h2 style={styles.sectionTitle}>💡 Fitness Tips</h2>
          <div style={styles.tipsGrid}>
            <div style={styles.tipCard}>
              <div style={styles.tipIcon}>🥗</div>
              <p style={styles.tipText}>Aim for 1g of protein per pound of body weight for muscle growth</p>
            </div>
            <div style={styles.tipCard}>
              <div style={styles.tipIcon}>💧</div>
              <p style={styles.tipText}>Stay hydrated - drink at least 8 glasses of water daily</p>
            </div>
            <div style={styles.tipCard}>
              <div style={styles.tipIcon}>😴</div>
              <p style={styles.tipText}>Get 7-9 hours of sleep for optimal recovery and muscle growth</p>
            </div>
            <div style={styles.tipCard}>
              <div style={styles.tipIcon}>📈</div>
              <p style={styles.tipText}>Progressive overload is key - gradually increase weight or reps</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
    width: "96%",        // Takes up almost the entire width of the screen
    maxWidth: "1800px",  // Expansive maximum width for massive desktop monitors
    margin: "0 auto",    // Keeps it perfectly centered
    padding: "2rem 1rem", 
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "3rem",
    flexWrap: "wrap",
    gap: "24px",
    paddingTop: "2rem",
    paddingLeft: "1rem",
    paddingRight: "1rem"
  },
  title: {
    color: "#111827",
    fontWeight: "900",
    fontSize: "4rem", 
    margin: "0 0 12px 0",
    letterSpacing: "-0.04em",
    textTransform: "uppercase"
  },
  subtitle: {
    color: "#6b7280",
    fontSize: "1.75rem", 
    margin: 0,
    fontWeight: "400"
  },
  editButton: {
    backgroundColor: "#5EF522",
    color: "#111827",
    padding: "1rem 2.5rem", 
    fontSize: "1.5rem", 
    border: "none",
    borderRadius: "1rem",
    cursor: "pointer",
    fontWeight: "900",
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    boxShadow: "0 4px 6px -1px rgba(94, 245, 34, 0.2)"
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    color: "#111827",
    padding: "1rem 2.5rem",
    fontSize: "1.5rem",
    border: "2px solid #e5e7eb",
    borderRadius: "1rem",
    cursor: "pointer",
    fontWeight: "700",
    transition: "all 0.2s ease",
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    padding: "3.5rem 4rem", // Generous inner padding for a high-end feel
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
    letterSpacing: "-0.02em"
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", // Slightly wider minimum for better balance on big screens
    gap: "2.5rem",
    marginBottom: "2rem",
  },
  infoCard: {
    backgroundColor: "#f9fafb",
    padding: "2rem",
    borderRadius: "1.25rem",
    border: "1px solid #e5e7eb",
  },
  label: {
    color: "#6b7280",
    fontSize: "1.25rem", 
    fontWeight: "600",
    display: "block",
    marginBottom: "1rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  input: {
    width: "100%",
    padding: "1.25rem 1.5rem",
    fontSize: "1.75rem", 
    borderRadius: "1rem",
    border: "2px solid #d1d5db",
    backgroundColor: "#ffffff",
    color: "#111827",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
    outline: "none",
    fontWeight: "600"
  },
  infoValue: {
    color: "#111827",
    fontSize: "2.25rem", 
    fontWeight: "800",
    margin: 0,
  },
  saveButton: {
    backgroundColor: "#5EF522",
    color: "#111827",
    padding: "1.5rem 3rem",
    fontSize: "1.5rem", 
    border: "none",
    borderRadius: "1rem",
    cursor: "pointer",
    fontWeight: "900",
    marginTop: "2rem",
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    boxShadow: "0 4px 6px -1px rgba(94, 245, 34, 0.2)",
    width: "100%",
    maxWidth: "400px",
    display: "block"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
    gap: "2.5rem",
  },
  statCard: {
    padding: "2.5rem",
    borderRadius: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    border: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
  },
  bmiCard: { borderLeft: "8px solid #8b5cf6" }, 
  goalCard: { borderLeft: "8px solid #3b82f6" },
  calorieCard: { borderLeft: "8px solid #ef4444" },
  proteinCard: { borderLeft: "8px solid #10b981" },
  statIcon: {
    fontSize: "3.5rem", 
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    color: "#6b7280",
    fontSize: "1.25rem", 
    margin: "0 0 0.5rem 0",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  statValue: {
    color: "#111827",
    fontSize: "3.5rem", 
    fontWeight: "900",
    margin: "0 0 0.5rem 0",
    lineHeight: "1"
  },
  statCategory: {
    fontSize: "1.25rem", 
    margin: 0,
    fontWeight: "700",
    color: "#4b5563"
  },
  progressGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", 
    gap: "3rem",
  },
  progressCard: {
    backgroundColor: "#f9fafb",
    padding: "2.5rem",
    borderRadius: "1.5rem",
    border: "1px solid #e5e7eb"
  },
  progressTitle: {
    color: "#111827",
    fontSize: "1.75rem", 
    fontWeight: "800",
    marginBottom: "1.5rem",
  },
  progressValue: {
    color: "#111827", 
    fontSize: "5rem", 
    fontWeight: "900",
    margin: 0,
  },
  exerciseList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  exerciseItem: {
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
    padding: "1.25rem 1.5rem", 
    backgroundColor: "#ffffff",
    borderRadius: "1rem",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
  },
  exerciseRank: {
    color: "#111827",
    fontWeight: "900",
    fontSize: "1.5rem", 
    minWidth: "40px",
  },
  exerciseName: {
    color: "#4b5563",
    flex: 1,
    fontSize: "1.5rem", 
    fontWeight: "600",
  },
  exerciseVolume: {
    color: "#10b981",
    fontWeight: "800",
    fontSize: "1.5rem", 
  },
  emptyText: {
    color: "#9ca3af",
    fontStyle: "italic",
    textAlign: "center",
    padding: "2rem",
    fontSize: "1.5rem", 
  },
  tipsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
    gap: "2.5rem",
  },
  tipCard: {
    backgroundColor: "#f9fafb",
    padding: "2rem",
    borderRadius: "1.5rem",
    display: "flex",
    gap: "1.5rem",
    alignItems: "flex-start",
    border: "1px solid #e5e7eb"
  },
  tipIcon: {
    fontSize: "3rem", 
  },
  tipText: {
    color: "#4b5563",
    fontSize: "1.5rem", 
    lineHeight: "1.6",
    margin: 0,
    fontWeight: "500",
  },
  error: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: "1.5rem", 
    textAlign: "center",
    padding: "1.5rem",
    backgroundColor: "#fef2f2", 
    borderRadius: "1rem",
    marginBottom: "2rem",
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
    marginBottom: "2rem",
    border: "2px solid #a7f3d0"
  },
};

export default Profile;