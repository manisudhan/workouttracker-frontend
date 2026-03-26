import React, { useState, useEffect, useMemo, useRef } from "react";
import Navigate from "./navigation";
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { NavLink } from "react-router-dom";

// This pulls your AWS IP from the .env file, or defaults to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const foodCalories = {
  // Fruits
  apple: { calories: 52, protein: 0.3 },
  banana: { calories: 89, protein: 1.1 },
  orange: { calories: 47, protein: 0.9 },
  grapes: { calories: 69, protein: 0.7 },
  mango: { calories: 60, protein: 0.8 },
  pineapple: { calories: 50, protein: 0.5 },
  strawberry: { calories: 32, protein: 0.7 },
  blueberry: { calories: 57, protein: 0.7 },
  watermelon: { calories: 30, protein: 0.6 },
  papaya: { calories: 43, protein: 0.5 },
  avocado: { calories: 160, protein: 2 },
  pear: { calories: 57, protein: 0.4 },
  peach: { calories: 39, protein: 0.9 },
  cherry: { calories: 50, protein: 1 },
  pomegranate: { calories: 83, protein: 1.7 },
  kiwi: { calories: 41, protein: 1.1 },
  guava: { calories: 68, protein: 2.6 },
  lemon: { calories: 29, protein: 1.1 },

  // Vegetables
  tomato: { calories: 18, protein: 0.9 },
  cucumber: { calories: 16, protein: 0.7 },
  carrot: { calories: 41, protein: 0.9 },
  broccoli: { calories: 34, protein: 2.8 },
  cauliflower: { calories: 25, protein: 1.9 },
  spinach: { calories: 23, protein: 2.9 },
  potato: { calories: 77, protein: 2 },
  "sweet potato": { calories: 86, protein: 1.6 },
  corn: { calories: 96, protein: 3.4 },
  peas: { calories: 81, protein: 5.4 },
  onion: { calories: 40, protein: 1.1 },
  garlic: { calories: 149, protein: 6.4 },
  eggplant: { calories: 25, protein: 1 },
  pumpkin: { calories: 26, protein: 1 },
  beetroot: { calories: 43, protein: 1.6 },
  lettuce: { calories: 15, protein: 1.4 },
  cabbage: { calories: 25, protein: 1.3 },
  okra: { calories: 33, protein: 1.9 },
  mushroom: { calories: 22, protein: 3.1 },

  // Proteins (Meat, Dairy, Eggs)
  chicken: { calories: 165, protein: 31 },
  "chicken breast (cooked)": { calories: 165, protein: 31 },
  "chicken thigh (cooked)": { calories: 209, protein: 26 },
  "chicken leg (cooked)": { calories: 177, protein: 28 },
  "chicken wings (cooked)": { calories: 290, protein: 30 },
  "chicken (roast, whole)": { calories: 185, protein: 29 },
  "egg (boiled)": { calories: 155, protein: 13 },
  "egg (fried)": { calories: 196, protein: 14 },
  "egg white": { calories: 52, protein: 11 },
  "fish (salmon, cooked)": { calories: 206, protein: 22 },
  "fish (tuna, canned)": { calories: 116, protein: 26 },
  "fish (cod, cooked)": { calories: 105, protein: 23 },
  "beef (ground, 80/20, cooked)": { calories: 254, protein: 26 },
  "beef (steak, sirloin, cooked)": { calories: 183, protein: 28 },
  "pork (loin, cooked)": { calories: 231, protein: 27 },
  "bacon (cooked)": { calories: 541, protein: 37 },
  "lamb (chop, cooked)": { calories: 283, protein: 25 },
  "shrimp (cooked)": { calories: 99, protein: 24 },
  "crab (cooked)": { calories: 97, protein: 20 },
  tofu: { calories: 76, protein: 8 },
  paneer: { calories: 296, protein: 18 },
  "milk (whole)": { calories: 60, protein: 3.3 },
  "milk (skimmed)": { calories: 34, protein: 3.4 },
  "yogurt (plain)": { calories: 59, protein: 10 },
  "greek yogurt (plain)": { calories: 97, protein: 9 },
  "cheese (cheddar)": { calories: 404, protein: 23 },
  butter: { calories: 717, protein: 0.9 },
  ghee: { calories: 900, protein: 0 },

  // Carbs & Grains
  "bread (white)": { calories: 265, protein: 9 },
  "bread (brown)": { calories: 252, protein: 11 },
  "rice (white, cooked)": { calories: 130, protein: 2.7 },
  "rice (brown, cooked)": { calories: 111, protein: 2.6 },
  "pasta (cooked)": { calories: 131, protein: 5 },
  "noodles (cooked)": { calories: 138, protein: 4.5 },
  "oats (uncooked)": { calories: 389, protein: 16.9 },
  cornflakes: { calories: 357, protein: 7.5 },

  // Prepared Foods & Legumes
  "pizza (pepperoni)": { calories: 298, protein: 12 },
  burger: { calories: 295, protein: 17 },
  "sandwich (ham & cheese)": { calories: 280, protein: 14 },
  idli: { calories: 130, protein: 4 },
  "dosa (plain)": { calories: 190, protein: 4 },
  chapati: { calories: 297, protein: 11 },
  paratha: { calories: 310, protein: 7 },
  poha: { calories: 130, protein: 2.5 },
  upma: { calories: 150, protein: 4 },
  samosa: { calories: 262, protein: 4.5 },
  "vada (medu)": { calories: 330, protein: 12 },
  "biryani (chicken)": { calories: 180, protein: 9 },
  "fried rice (chicken)": { calories: 174, protein: 7 },
  "lentils (dal, cooked)": { calories: 116, protein: 9 },
  "kidney beans (rajma, cooked)": { calories: 127, protein: 8.7 },
  "chickpeas (chole, cooked)": { calories: 164, protein: 9 },
  "paneer curry": { calories: 160, protein: 7 },
  "chicken curry": { calories: 145, protein: 15 },
  "mutton curry": { calories: 170, protein: 12 },
  "egg curry": { calories: 150, protein: 8 },
  "veg salad": { calories: 70, protein: 2 },
  "fruit salad": { calories: 90, protein: 1 },

  // Nuts, Sweets & Drinks
  almonds: { calories: 579, protein: 21 },
  cashew: { calories: 553, protein: 18 },
  walnut: { calories: 654, protein: 15 },
  peanuts: { calories: 567, protein: 26 },
  dates: { calories: 282, protein: 2.5 },
  honey: { calories: 304, protein: 0.3 },
  sugar: { calories: 387, protein: 0 },
  "chocolate (dark)": { calories: 546, protein: 7.8 },
  "ice cream (vanilla)": { calories: 207, protein: 3.5 },
  "coffee (black)": { calories: 2, protein: 0.1 },
  "tea (without sugar)": { calories: 1, protein: 0.1 },
  "tea (with milk)": { calories: 30, protein: 1 },
  coke: { calories: 41, protein: 0 },
  "juice (orange)": { calories: 45, protein: 0.7 },
  "juice (apple)": { calories: 46, protein: 0.1 },
};

const CalorieTracker = () => {
  const [meal, setMeal] = useState("");
  const [weight, setWeight] = useState("");
  const [meals, setMeals] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [targetCalories, setTargetCalories] = useState(0);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const autocompleteRef = useRef(null);
  const allFoodNames = useMemo(() => Object.keys(foodCalories), []);
  const [showForm, setShowForm] = useState(false);
  const [calorie, setCalorie] = useState("");
  const [protein, setProtein] = useState("");

  const [burnedInput, setBurnedInput] = useState("");
  const [totalBurned, setTotalBurned] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchMeals = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/meals`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch meals");
        const data = await res.json();
        
        const actualMeals = [];
        let eatenCals = 0;
        let eatenPro = 0;
        let burnedCals = 0;

        data.forEach((m) => {
          if (m.food === "🔥 Workout Burn") {
            burnedCals += parseFloat(m.calories || 0);
          } else {
            eatenCals += parseFloat(m.calories || 0);
            eatenPro += parseFloat(m.protein || 0);
            actualMeals.push(m);
          }
        });

        setMeals(actualMeals);
        setTotalCalories(eatenCals);
        setTotalProtein(eatenPro);
        setTotalBurned(burnedCals);
      } catch (err) {
        console.error("Error fetching meals:", err);
      }
    };

    const fetchUserInfo = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/userinfo`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch user info");
        const data = await res.json();
        if (data && data.target_calories) {
          setTargetCalories(data.target_calories);
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };

    fetchMeals();
    fetchUserInfo();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMealChange = (e) => {
    const value = e.target.value;
    setMeal(value);
    if (value.length > 0) {
      const filteredSuggestions = allFoodNames.filter((food) =>
        food.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (foodName) => {
    setMeal(foodName);
    setSuggestions([]);
  };

  const handleAddMeal = async () => {
    const token = localStorage.getItem("token");
    const food = meal.trim().toLowerCase();
    const w = parseFloat(weight);

    if (!food) {
      setError("Please enter a food name");
      return;
    }
    if (isNaN(w) || w <= 0) {
      setError("Please enter a valid weight in grams");
      return;
    }

    const foodData = foodCalories[food];

    if (foodData) {
      const calculatedCalories = (w / 100) * foodData.calories;
      const calculatedProtein = (w / 100) * foodData.protein;

      const newMeal = {
        food: `${food} (${weight}g)`,
        calories: Math.round(calculatedCalories),
        protein: parseFloat(calculatedProtein.toFixed(1)),
      };

      try {
        const res = await fetch(`${API_BASE_URL}/api/meals`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newMeal),
        });

        if (!res.ok) throw new Error("Failed to save meal");

        setMeals([...meals, newMeal]);
        setTotalCalories((prev) => prev + newMeal.calories);
        setTotalProtein((prev) => prev + newMeal.protein);
        setMeal("");
        setWeight("");
        setError("");
        setSuggestions([]);
      } catch (err) {
        setError("Error saving meal. Please try again.");
        console.error(err);
      }
    } else {
      setError(`No calorie info found for "${meal}"`);
    }
  };

  const addCalories = async () => {
    if (!calorie || !protein) {
      alert("Please enter both calories and protein!");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/meals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          food: "Custom Entry",
          calories: Number(calorie),
          protein: Number(protein),
        }),
      });

      if (!res.ok) throw new Error("Failed to save meal");

      const newMeal = {
        food: "Custom Entry",
        calories: Number(calorie),
        protein: Number(protein),
      };
      setMeals([...meals, newMeal]);
      setTotalCalories((prev) => prev + Number(calorie));
      setTotalProtein((prev) => prev + Number(protein));

      setCalorie("");
      setProtein("");
      setShowForm(false);
    } catch (error) {
      console.error("Failed to add calories:", error);
    }
  };

  const handleClear = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_BASE_URL}/api/meals`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMeals([]);
      setTotalCalories(0);
      setTotalProtein(0);
      setTotalBurned(0);
      setError("");
    } catch (err) {
      console.error("Error clearing meals:", err);
      setError("Failed to clear meals");
    }
  };

  const handleAddBurned = async () => {
    const burned = parseInt(burnedInput);
    if (!isNaN(burned) && burned > 0) {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_BASE_URL}/api/meals`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            food: "🔥 Workout Burn", 
            calories: burned,
            protein: 0,
          }),
        });

        if (!res.ok) throw new Error("Failed to log workout");

        setTotalBurned((prev) => prev + burned);
        setBurnedInput("");
        setError("");
      } catch (err) {
        console.error("Failed to add burned calories:", err);
        setError("Failed to save workout data. Please try again.");
      }
    }
  };

  const netCalories = Math.max(0, totalCalories - totalBurned); 
  const remainingCalories = Math.max(0, targetCalories - netCalories);
  const overBudget = netCalories > targetCalories;
  const caloriesOver = netCalories - targetCalories;

  const goalPieData = [
    { name: "Net Eaten", value: netCalories, fill: "#16a34a" },
    { name: "Remaining", value: remainingCalories, fill: "#4b5563" },
  ];

  const GoalTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={styles.tooltip}>
          <p style={{ margin: 0 }}>{`${payload[0].name}: ${payload[0].value} kcal`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={styles.pageContainer}>
      <Navigate />
      <div style={styles.container}>
        <h1 style={styles.title}>🍽️ Daily Calorie & Protein Tracker</h1>

        <div style={styles.inputSection}>
          <div style={styles.inputContainer}>
            <div ref={autocompleteRef} style={{ ...styles.autocompleteContainer, ...styles.foodInput }}>
              <input
                type="text"
                value={meal}
                onChange={handleMealChange}
                placeholder="Enter food (e.g., chicken breast)"
                style={{ ...styles.input, width: "100%", boxSizing: "border-box" }}
              />
              {suggestions.length > 0 && (
                <ul style={styles.suggestionsList}>
                  {suggestions.slice(0, 10).map((food, index) => (
                    <li
                      key={index}
                      style={styles.suggestionItem}
                      onClick={() => handleSuggestionClick(food)}
                    >
                      {food}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Weight (g)"
              style={{ ...styles.input, ...styles.numberInput }}
            />
          </div>
          <div style={styles.buttonContainer}>
            <button
              onClick={handleAddMeal}
              style={{ ...styles.button, ...styles.addButton }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#6366f1")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#4f46e5")}
            >
              Add Meal
            </button>
            <button
              onClick={handleClear}
              style={{ ...styles.button, ...styles.clearButton }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#52525b")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#374151")}
            >
              Clear All
            </button>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                style={{ ...styles.button, ...styles.clearButton }}
              >
                + Add Custom Calories
              </button>
            )}
            {showForm && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "20px",
                  backgroundColor: "#1c1c3cff",
                  borderRadius: "12px",
                  width: "100%",
                }}
              >
                <h3 style={{ fontSize: "28px", marginTop: 0, color: "#fff" }}>Log Custom Nutrition</h3>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", fontSize: "22px", marginBottom: "8px", color: "#d1d5db" }}>
                    Calories (kcal):
                  </label>
                  <input
                    type="number"
                    value={calorie}
                    onChange={(e) => setCalorie(e.target.value)}
                    placeholder="e.g. 300"
                    style={styles.input}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "22px", marginBottom: "8px", color: "#d1d5db" }}>
                    Protein (g):
                  </label>
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="e.g. 30"
                    style={styles.input}
                  />
                </div>

                <button
                  onClick={addCalories}
                  style={{ ...styles.button, backgroundColor: "#4caf50", marginRight: "12px" }}
                >
                  Save Entry
                </button>

                <button
                  onClick={() => setShowForm(false)}
                  style={{ ...styles.button, backgroundColor: "#f44336" }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.totalsRow}>
          <div style={{ ...styles.totalContainer, ...styles.caloriesTotal }}>
            <span style={styles.totalLabel}>Net Calories</span>
            <span style={styles.totalValue}>{netCalories}</span>
            <span style={styles.totalUnit}>kcal</span>
            {totalBurned > 0 && (
              <div style={{ fontSize: "18px", color: "#86efac", marginTop: "8px", fontWeight: "500" }}>
                ({totalCalories} eaten - {totalBurned} burned)
              </div>
            )}
          </div>
          <div style={{ ...styles.totalContainer, ...styles.targetTotal }}>
            <span style={styles.totalLabel}>Your Target</span>
            <span style={styles.totalValue}>{targetCalories}</span>
            <span style={styles.totalUnit}>kcal</span>
          </div>
          <div style={{ ...styles.totalContainer, ...styles.proteinTotal }}>
            <span style={styles.totalLabel}>Total Protein</span>
            <span style={styles.totalValue}>{totalProtein.toFixed(1)}</span>
            <span style={styles.totalUnit}>g</span>
          </div>
        </div>

        <div style={styles.resultsContainer}>
          <div style={styles.listSection}>
            <h3 style={styles.sectionTitle}>Today's Meals</h3>
            <ul style={styles.list}>
              {meals.length === 0 ? (
                <p style={styles.emptyText}>No meals added yet.</p>
              ) : (
                meals.map((m, index) => (
                  <li key={index} style={styles.listItem}>
                    <span>{m.food}</span>
                    <div style={styles.mealStats}>
                      <span style={styles.proteinText}>{m.protein} g</span>
                      <strong>{m.calories} kcal</strong>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div style={styles.chartSection}>
            <h3 style={styles.sectionTitle}>📊 Calorie Goal Progress</h3>
            {targetCalories > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={goalPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={90}
                      outerRadius={130}
                      paddingAngle={5}
                      labelLine={false}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                        return (
                          <text
                            x={x}
                            y={y}
                            fill="white"
                            fontSize="22"
                            fontWeight="bold"
                            textAnchor={x > cx ? "start" : "end"}
                            dominantBaseline="central"
                          >
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                    >
                      {goalPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<GoalTooltip />} />
                    <Legend formatter={(value) => <span style={{ color: "#9ca3af", fontSize: "22px" }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
                {overBudget && (
                  <p style={styles.overBudgetWarning}>
                    🔥 You are {caloriesOver} kcal over your net target!
                  </p>
                )}
              </>
            ) : (
              <p style={styles.emptyText}>
                Please set your 'Target Calories' in your Profile to see your progress.
              </p>
            )}
          </div>
        </div>

        <div style={styles.workoutSection}>
          <h3 style={styles.sectionTitle}>🏃‍♂️ Calories Burned (Cardio / Workout)</h3>
          <p style={styles.workoutDescription}>
            Did you exercise today? Enter your burned calories below to keep track!
          </p>
          <div style={styles.workoutInputContainer}>
            <input
              type="number"
              value={burnedInput}
              onChange={(e) => setBurnedInput(e.target.value)}
              placeholder="e.g., 300"
              style={{ ...styles.input, width: "220px" }}
            />
            <button
              onClick={handleAddBurned}
              style={{ ...styles.button, backgroundColor: "#f97316", color: "#fff" }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#ea580c")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f97316")}
            >
              Log Workout
            </button>
          </div>
          
          {totalBurned > 0 && (
            <p style={styles.burnedText}>
              🔥 Total Calories Burned Today: <strong>{totalBurned} kcal</strong>
            </p>
          )}
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
    backgroundColor: "#1f2937",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  },
  title: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: "3.5rem",
    margin: "0 0 32px 0",
    textAlign: "center",
  },
  inputSection: {
    backgroundColor: "#374151",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    marginBottom: "32px",
  },
  inputContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    marginBottom: "20px",
    gap: "16px",
    flexWrap: "wrap",
  },
  input: {
    padding: "16px 20px",
    fontSize: "22px",
    borderRadius: "8px",
    border: "2px solid #4b5563",
    backgroundColor: "#374151",
    color: "#ffffff",
    height: "60px",
    boxSizing: "border-box",
    width: "100%",
  },
  foodInput: {
    flex: "1 1 400px",
  },
  numberInput: {
    flex: "1 1 150px",
    width: "150px",
  },
  autocompleteContainer: {
    position: "relative",
  },
  suggestionsList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#374151",
    border: "2px solid #4b5563",
    borderTop: "none",
    borderRadius: "8px",
    borderTopLeftRadius: "0",
    borderTopRightRadius: "0",
    listStyle: "none",
    padding: 0,
    margin: "-2px 0 0 0",
    maxHeight: "250px",
    overflowY: "auto",
    zIndex: 1000,
    boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
    textAlign: "left",
  },
  suggestionItem: {
    padding: "16px",
    cursor: "pointer",
    color: "#d1d5db",
    fontSize: "22px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  button: {
    padding: "16px 28px",
    fontSize: "22px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "all 0.2s ease",
  },
  addButton: {
    backgroundColor: "#4f46e5",
    color: "white",
  },
  clearButton: {
    backgroundColor: "#374151",
    color: "#d1d5db",
    border: "2px solid #4b5563",
  },
  error: {
    color: "#f87171",
    fontWeight: "600",
    fontSize: "22px",
    margin: "-12px 0 20px 0",
    textAlign: "center",
  },
  totalsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    margin: "32px 0",
  },
  totalContainer: {
    color: "white",
    padding: "24px",
    borderRadius: "12px",
    textAlign: "center",
  },
  caloriesTotal: { backgroundColor: "#15803d" },
  targetTotal: { backgroundColor: "#b45309", color: "#f3f4f6" },
  proteinTotal: { backgroundColor: "#4338ca" },
  totalLabel: {
    fontSize: "24px",
    fontWeight: "600",
    display: "block",
    color: "#d1d5db",
    marginBottom: "8px",
  },
  totalValue: {
    fontSize: "64px",
    fontWeight: "bold",
    margin: "0 8px",
    color: "#ffffff",
  },
  totalUnit: {
    fontSize: "32px",
    fontWeight: "400",
    color: "#d1d5db",
  },
  resultsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "32px",
    textAlign: "left",
  },
  listSection: {
    backgroundColor: "#374151",
    padding: "24px",
    borderRadius: "12px",
  },
  chartSection: {
    backgroundColor: "#374151",
    padding: "24px",
    borderRadius: "12px",
  },
  sectionTitle: {
    color: "#ffffff",
    borderBottom: "2px solid #4b5563",
    paddingBottom: "12px",
    marginBottom: "24px",
    fontSize: "2rem",
    fontWeight: "bold",
  },
  list: {
    listStyleType: "none",
    padding: 0,
    margin: 0,
    maxHeight: "450px",
    overflowY: "auto",
  },
  listItem: {
    backgroundColor: "#4b5563",
    color: "#f3f4f6",
    padding: "16px 20px",
    borderRadius: "8px",
    marginBottom: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "22px",
  },
  mealStats: {
    textAlign: "right",
  },
  proteinText: {
    color: "#a5b4fc",
    marginRight: "16px",
    fontWeight: "bold",
  },
  emptyText: {
    color: "#9ca3af",
    fontStyle: "italic",
    textAlign: "center",
    padding: "20px",
    fontSize: "22px",
  },
  tooltip: {
    backgroundColor: "#1f2937",
    border: "1px solid #374151",
    padding: "16px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    color: "#ffffff",
    fontSize: "22px",
    fontWeight: "bold",
  },
  overBudgetWarning: {
    textAlign: "center",
    color: "#f87171",
    fontWeight: "bold",
    fontSize: "24px",
    marginTop: "16px",
  },
  workoutSection: {
    backgroundColor: "#374151",
    padding: "32px 24px",
    borderRadius: "12px",
    marginTop: "32px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  workoutDescription: {
    color: "#9ca3af", 
    marginBottom: "20px",
    fontSize: "22px",
  },
  workoutInputContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    marginTop: "16px",
    flexWrap: "wrap",
  },
  burnedText: {
    color: "#fb923c",
    fontSize: "1.75rem",
    marginTop: "24px",
  },
};

export default CalorieTracker;