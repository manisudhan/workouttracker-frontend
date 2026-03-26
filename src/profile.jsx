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
    if (bmiNum < 18.5) return { text: "Underweight", color: "#60a5fa" };
    if (bmiNum < 25) return { text: "Normal", color: "#34d399" };
    if (bmiNum < 30) return { text: "Overweight", color: "#fbbf24" };
    return { text: "Obese", color: "#f87171" };
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
            <h1 style={styles.title}>👤 My Profile</h1>
            <p style={styles.subtitle}>Welcome back, {username}!</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={isEditing ? styles.cancelButton : styles.editButton}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.message}>{message}</p>}

        <div style={styles.infoSection}>
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
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
            >
              Save Changes
            </button>
          )}
        </div>

        <div style={styles.statsSection}>
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
                    <p style={styles.statValue}>{weightGoal.diff} kg</p>
                    <p style={styles.statCategory}>to {weightGoal.direction}</p>
                  </>
                ) : (
                  <p style={styles.statValue}>Not set</p>
                )}
              </div>
            </div>

            <div style={{...styles.statCard, ...styles.calorieCard}}>
              <div style={styles.statIcon}>🔥</div>
              <div style={styles.statContent}>
                <p style={styles.statLabel}>Today's Calories</p>
                <p style={styles.statValue}>{progressData.weeklyCalorieAvg}</p>
                <p style={styles.statCategory}>kcal</p>
              </div>
            </div>

            <div style={{...styles.statCard, ...styles.proteinCard}}>
              <div style={styles.statIcon}>💪</div>
              <div style={styles.statContent}>
                <p style={styles.statLabel}>Today's Protein</p>
                <p style={styles.statValue}>{progressData.weeklyProteinAvg.toFixed(1)}</p>
                <p style={styles.statCategory}>grams</p>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.progressSection}>
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

        <div style={styles.tipsSection}>
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
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
    flexWrap: "wrap",
    gap: "24px",
  },
  title: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: "3.5rem", 
    margin: "0 0 12px 0",
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: "1.75rem", 
    margin: 0,
  },
  editButton: {
    backgroundColor: "#4f46e5",
    color: "white",
    padding: "16px 28px", 
    fontSize: "22px", 
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "all 0.2s ease",
  },
  cancelButton: {
    backgroundColor: "#6b7280",
    color: "white",
    padding: "16px 28px",
    fontSize: "22px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "all 0.2s ease",
  },
  infoSection: {
    backgroundColor: "#1f2937",
    padding: "32px",
    borderRadius: "16px",
    marginBottom: "32px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: "2.25rem", 
    fontWeight: "700",
    marginBottom: "28px",
    paddingBottom: "16px",
    borderBottom: "2px solid #374151",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
    gap: "24px",
    marginBottom: "24px",
  },
  infoCard: {
    backgroundColor: "#374151",
    padding: "24px",
    borderRadius: "12px",
  },
  label: {
    color: "#9ca3af",
    fontSize: "20px", 
    fontWeight: "600",
    display: "block",
    marginBottom: "12px",
  },
  input: {
    width: "100%",
    padding: "16px 20px",
    fontSize: "22px", 
    borderRadius: "8px",
    border: "2px solid #4b5563",
    backgroundColor: "#1f2937",
    color: "#ffffff",
    height: "60px", 
    boxSizing: "border-box",
  },
  infoValue: {
    color: "#ffffff",
    fontSize: "28px", 
    fontWeight: "700",
    margin: 0,
  },
  saveButton: {
    backgroundColor: "#10b981",
    color: "white",
    padding: "16px 36px",
    fontSize: "22px", 
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "20px",
    transition: "all 0.2s ease",
  },
  statsSection: {
    backgroundColor: "#1f2937",
    padding: "32px",
    borderRadius: "16px",
    marginBottom: "32px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
    gap: "24px",
  },
  statCard: {
    padding: "24px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  bmiCard: { backgroundColor: "#5b21b6" }, 
  goalCard: { backgroundColor: "#1d4ed8" },
  calorieCard: { backgroundColor: "#b91c1c" },
  proteinCard: { backgroundColor: "#047857" },
  statIcon: {
    fontSize: "56px", 
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: "20px", 
    margin: "0 0 8px 0",
    fontWeight: "500",
  },
  statValue: {
    color: "#ffffff",
    fontSize: "48px", 
    fontWeight: "800",
    margin: "0 0 8px 0",
  },
  statCategory: {
    fontSize: "20px", 
    margin: 0,
    fontWeight: "700",
  },
  progressSection: {
    backgroundColor: "#1f2937",
    padding: "32px",
    borderRadius: "16px",
    marginBottom: "32px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  },
  progressGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", 
    gap: "28px",
  },
  progressCard: {
    backgroundColor: "#374151",
    padding: "28px",
    borderRadius: "12px",
  },
  progressTitle: {
    color: "#ffffff",
    fontSize: "24px", 
    fontWeight: "700",
    marginBottom: "20px",
  },
  progressValue: {
    color: "#818cf8", 
    fontSize: "72px", 
    fontWeight: "800",
    margin: 0,
  },
  exerciseList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  exerciseItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px 20px", 
    backgroundColor: "#1f2937",
    borderRadius: "8px",
  },
  exerciseRank: {
    color: "#818cf8",
    fontWeight: "800",
    fontSize: "22px", 
    minWidth: "40px",
  },
  exerciseName: {
    color: "#f3f4f6",
    flex: 1,
    fontSize: "22px", 
    fontWeight: "500",
  },
  exerciseVolume: {
    color: "#34d399",
    fontWeight: "700",
    fontSize: "22px", 
  },
  emptyText: {
    color: "#9ca3af",
    fontStyle: "italic",
    textAlign: "center",
    padding: "24px",
    fontSize: "22px", 
  },
  tipsSection: {
    backgroundColor: "#1f2937",
    padding: "32px",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  },
  tipsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", 
    gap: "24px",
  },
  tipCard: {
    backgroundColor: "#374151",
    padding: "24px",
    borderRadius: "12px",
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
  },
  tipIcon: {
    fontSize: "48px", 
  },
  tipText: {
    color: "#e5e7eb",
    fontSize: "22px", 
    lineHeight: "1.6",
    margin: 0,
    fontWeight: "500",
  },
  error: {
    color: "#fca5a5",
    fontWeight: "700",
    fontSize: "22px", 
    textAlign: "center",
    padding: "16px",
    backgroundColor: "#7f1d1d", 
    borderRadius: "8px",
    marginBottom: "24px",
  },
  message: {
    color: "#6ee7b7",
    fontWeight: "700",
    fontSize: "22px", 
    textAlign: "center",
    padding: "16px",
    backgroundColor: "#064e3b", 
    borderRadius: "8px",
    marginBottom: "24px",
  },
};

export default Profile;