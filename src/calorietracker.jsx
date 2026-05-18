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

  // Updated colors for the light theme
  const goalPieData = [
    { name: "Net Eaten", value: netCalories, fill: "#5EF522" }, // Bright accent green
    { name: "Remaining", value: remainingCalories, fill: "#e5e7eb" }, // Soft gray
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
        <h1 style={styles.title}>🍽️ DAILY NUTRITION</h1>

        <div style={styles.sectionCard}>
          <div style={styles.inputContainer}>
            <div ref={autocompleteRef} style={{ ...styles.autocompleteContainer, ...styles.foodInput }}>
              <input
                type="text"
                value={meal}
                onChange={handleMealChange}
                placeholder="Enter food (e.g., chicken breast)"
                style={{ ...styles.input, width: "100%", boxSizing: "border-box" }}
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
                  {suggestions.slice(0, 10).map((food, index) => (
                    <li
                      key={index}
                      style={styles.suggestionItem}
                      onClick={() => handleSuggestionClick(food)}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
              onClick={handleAddMeal}
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
              Add Meal
            </button>
            <button
              onClick={handleClear}
              style={{ ...styles.button, ...styles.clearButton }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#d1d5db';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
            >
              Clear All
            </button>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                style={{ ...styles.button, ...styles.clearButton }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d1d5db'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              >
                + Add Custom
              </button>
            )}
            
            {showForm && (
              <div style={styles.customFormContainer}>
                <h3 style={styles.customFormTitle}>Log Custom Nutrition</h3>

                <div style={{ marginBottom: "15px" }}>
                  <label style={styles.customFormLabel}>
                    Calories (kcal):
                  </label>
                  <input
                    type="number"
                    value={calorie}
                    onChange={(e) => setCalorie(e.target.value)}
                    placeholder="e.g. 300"
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
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={styles.customFormLabel}>
                    Protein (g):
                  </label>
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="e.g. 30"
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
                </div>

                <div style={{display: "flex", gap: "16px"}}>
                  <button
                    onClick={addCalories}
                    style={{ ...styles.button, ...styles.addButton, flex: 1 }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4fe313'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#5EF522'}
                  >
                    Save Entry
                  </button>

                  <button
                    onClick={() => setShowForm(false)}
                    style={{ ...styles.button, backgroundColor: "#ef4444", color: "#ffffff", flex: 1 }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          {error && <p style={styles.error}>{error}</p>}
        </div>

        <div style={styles.totalsRow}>
          <div style={{ ...styles.totalContainer, ...styles.caloriesTotal }}>
            <span style={styles.totalLabel}>Net Calories</span>
            <span style={styles.totalValue}>{netCalories}</span>
            <span style={styles.totalUnit}>kcal</span>
            {totalBurned > 0 && (
              <div style={styles.burnedSubtext}>
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
          <div style={styles.sectionCardHalf}>
            <h3 style={styles.sectionTitle}>Today's Meals</h3>
            <ul style={styles.list}>
              {meals.length === 0 ? (
                <p style={styles.emptyText}>No meals added yet.</p>
              ) : (
                meals.map((m, index) => (
                  <li key={index} style={styles.listItem}>
                    <span style={{fontWeight: "600", color: "#4b5563"}}>{m.food}</span>
                    <div style={styles.mealStats}>
                      <span style={styles.proteinText}>{m.protein} g</span>
                      <strong style={{color: "#111827"}}>{m.calories} kcal</strong>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div style={styles.sectionCardHalf}>
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
                            fill="#111827" // Dark text for readability on light themes
                            fontSize="22"
                            fontWeight="800"
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
                    <Legend formatter={(value) => <span style={{ color: "#4b5563", fontSize: "1.75rem", fontWeight: "600" }}>{value}</span>} />
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

        <div style={styles.sectionCard}>
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
              style={{ ...styles.input, width: "300px" }}
              onFocus={(e) => {
                e.target.style.borderColor = "#f97316";
                e.target.style.boxShadow = "0 0 0 6px rgba(249, 115, 22, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              onClick={handleAddBurned}
              style={{ ...styles.button, backgroundColor: "#f97316", color: "#fff", boxShadow: "0 4px 6px -1px rgba(249, 115, 22, 0.2)" }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#ea580c';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 25px -4px rgba(249, 115, 22, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#f97316';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(249, 115, 22, 0.2)';
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(1px)'}
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
  title: {
    color: "#111827",
    fontWeight: "900",
    fontSize: "4.5rem",
    margin: "2rem 0 3rem 0",
    textAlign: "center",
    letterSpacing: "-0.04em",
    textTransform: "uppercase"
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    padding: "3.5rem 4rem",
    borderRadius: "2rem",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 10px 20px -5px rgba(0, 0, 0, 0.03)",
    marginBottom: "3rem",
    borderTop: "8px solid #5EF522",
  },
  sectionCardHalf: {
    backgroundColor: "#ffffff",
    padding: "3.5rem 3.5rem",
    borderRadius: "2rem",
    boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e5e7eb"
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
  inputContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginBottom: "2rem",
    gap: "2rem",
    flexWrap: "wrap",
  },
  input: {
    padding: "0 1.5rem",
    fontSize: "1.75rem",
    borderRadius: "1rem",
    border: "2px solid #d1d5db",
    backgroundColor: "#ffffff",
    color: "#111827",
    height: "80px",
    boxSizing: "border-box",
    width: "100%",
    outline: "none",
    transition: "all 0.2s ease",
    fontWeight: "600"
  },
  foodInput: {
    flex: "2 1 400px",
  },
  numberInput: {
    flex: "1 1 200px",
  },
  autocompleteContainer: {
    position: "relative",
  },
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
    zIndex: 1000,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    textAlign: "left",
  },
  suggestionItem: {
    padding: "1rem 1.5rem",
    cursor: "pointer",
    color: "#111827",
    fontSize: "1.5rem",
    fontWeight: "500",
    borderRadius: "0.5rem",
    transition: "background 0.2s ease",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-start",
    gap: "1.5rem",
    flexWrap: "wrap",
  },
  button: {
    height: "80px",
    padding: "0 3rem",
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
  clearButton: {
    backgroundColor: "#f3f4f6",
    color: "#111827",
    border: "2px solid #e5e7eb",
  },
  customFormContainer: {
    marginTop: "2rem",
    padding: "2.5rem",
    backgroundColor: "#f9fafb",
    borderRadius: "1.5rem",
    width: "100%",
    border: "1px solid #e5e7eb"
  },
  customFormTitle: {
    fontSize: "2rem",
    marginTop: 0,
    color: "#111827",
    fontWeight: "800",
    marginBottom: "1.5rem"
  },
  customFormLabel: {
    display: "block",
    fontSize: "1.5rem",
    marginBottom: "0.75rem",
    color: "#4b5563",
    fontWeight: "600"
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
  totalsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "2.5rem",
    margin: "3rem 0",
  },
  totalContainer: {
    backgroundColor: "#ffffff",
    padding: "2.5rem",
    borderRadius: "1.5rem",
    textAlign: "center",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e5e7eb"
  },
  caloriesTotal: { borderTop: "8px solid #10b981" },
  targetTotal: { borderTop: "8px solid #f59e0b" },
  proteinTotal: { borderTop: "8px solid #3b82f6" },
  totalLabel: {
    fontSize: "1.5rem",
    fontWeight: "700",
    display: "block",
    color: "#6b7280",
    marginBottom: "1rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  totalValue: {
    fontSize: "4.5rem",
    fontWeight: "900",
    margin: "0 8px",
    color: "#111827",
    lineHeight: "1"
  },
  totalUnit: {
    fontSize: "2rem",
    fontWeight: "600",
    color: "#9ca3af",
  },
  burnedSubtext: {
    fontSize: "1.25rem",
    color: "#10b981",
    marginTop: "1rem",
    fontWeight: "700",
  },
  resultsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
    gap: "3rem",
    textAlign: "left",
    marginBottom: "3rem"
  },
  list: {
    listStyleType: "none",
    padding: 0,
    margin: 0,
    maxHeight: "500px",
    overflowY: "auto",
  },
  listItem: {
    backgroundColor: "#f9fafb",
    color: "#111827",
    padding: "1.5rem 2rem",
    borderRadius: "1rem",
    marginBottom: "1rem",
    border: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "1.75rem",
  },
  mealStats: {
    textAlign: "right",
  },
  proteinText: {
    color: "#3b82f6",
    marginRight: "1.5rem",
    fontWeight: "800",
  },
  emptyText: {
    color: "#9ca3af",
    fontStyle: "italic",
    textAlign: "center",
    padding: "3rem 0",
    fontSize: "1.75rem",
    fontWeight: "500"
  },
  tooltip: {
    backgroundColor: "#ffffff",
    border: "2px solid #e5e7eb",
    padding: "1.5rem",
    borderRadius: "1rem",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    color: "#111827",
    fontSize: "1.75rem",
    fontWeight: "700",
  },
  overBudgetWarning: {
    textAlign: "center",
    color: "#ef4444",
    fontWeight: "800",
    fontSize: "1.75rem",
    marginTop: "2rem",
    padding: "1rem",
    backgroundColor: "#fef2f2",
    borderRadius: "1rem",
    border: "1px solid #fecaca"
  },
  workoutDescription: {
    color: "#4b5563", 
    marginBottom: "2rem",
    fontSize: "1.75rem",
    fontWeight: "500"
  },
  workoutInputContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: "1.5rem",
    marginTop: "1.5rem",
    flexWrap: "wrap",
  },
  burnedText: {
    color: "#f97316",
    fontSize: "2rem",
    marginTop: "2.5rem",
    fontWeight: "600"
  },
};

export default CalorieTracker;