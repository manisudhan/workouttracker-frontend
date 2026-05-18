import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

// Use the environment variable for your AWS IP, or default to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Dumbbell icon scaled up 50% to match the high-impact typography
const DumbbellIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="84"
    height="84"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#111827" 
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 6.5l-6 6" />
    <path d="M12 6.5l6 6" />
    <path d="M12 17.5l-6-6" />
    <path d="M12 17.5l6-6" />
    <path d="M4 12.5h16" />
    <path d="M3 6.5h3" />
    <path d="M18 6.5h3" />
    <path d="M3 17.5h3" />
    <path d="M18 17.5h3" />
  </svg>
);

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const response = await fetch(`${API_BASE_URL}/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard";
      } else {
        setMessage("❌ Google login failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Server error during Google login");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem("token", data.token);
          window.location.href = "/dashboard";
        } else {
          setMessage("Login successful, but no token received.");
        }
      } else {
        setMessage(`❌ Login failed: ${data.message || "Invalid credentials"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Server not reachable. Please try again later.");
    }
  };

  const styles = {
    container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "radial-gradient(circle at top, #ffffff 0%, #f3f4f6 100%)", // Premium subtle gradient
      padding: "2rem",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      boxSizing: "border-box",
    },
    card: {
      width: "100%",
      maxWidth: "44rem", // Expanded width to support the 50% larger typography elegantly
      padding: "5rem 4rem", // Spacious luxury padding 
      backgroundColor: "#ffffff", 
      borderRadius: "2rem", // Smoother, larger corner radii
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 10px 20px -5px rgba(0, 0, 0, 0.03)",
      borderTop: "12px solid #5EF522", // Stronger accent banner to match scale
      boxSizing: "border-box",
    },
    header: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: "3.5rem",
    },
    heading: {
      marginTop: "1.75rem",
      fontSize: "3.5rem", // ~56px (50%+ increase from 2.25rem)
      fontWeight: "900",
      textAlign: "center",
      color: "#111827", 
      letterSpacing: "-0.04em",
      textTransform: "uppercase",
      lineHeight: "1.1",
    },
    subheading: {
      marginTop: "1rem",
      textAlign: "center",
      fontSize: "1.75rem", // ~28px (50% increase from 1.125rem)
      color: "#4b5563", 
      fontWeight: "400",
    },
    form: {
      marginBottom: "2.5rem",
    },
    inputGroup: {
      marginBottom: "2.5rem",
    },
    input: {
      width: "100%",
      padding: "1.5rem 1.75rem", // Larger, comfortable padding for text scale
      fontSize: "1.75rem", // ~28px (50% increase from 1.125rem)
      backgroundColor: "#ffffff",
      border: "2px solid #d1d5db", // Slightly thicker border for crispness at size
      borderRadius: "1rem",
      color: "#111827",
      boxSizing: "border-box",
      marginTop: "1.75rem",
      transition: "all 0.2s ease",
      outline: "none",
      fontWeight: "500",
    },
    button: {
      width: "100%",
      padding: "1.5rem 1.75rem", 
      fontSize: "1.75rem", // ~28px (50% increase from 1.125rem)
      fontWeight: "900",
      color: "#111827", 
      backgroundColor: "#5EF522", 
      borderRadius: "1rem",
      boxShadow: "0 10px 25px -4px rgba(94, 245, 34, 0.45)", 
      border: "none",
      cursor: "pointer",
      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    },
    message: {
      textAlign: "center",
      fontWeight: "700",
      fontSize: "1.5rem", // Increased 50%
      marginTop: "2rem",
      padding: "1.5rem",
      backgroundColor: "#fef2f2",
      color: "#ef4444",
      borderRadius: "1rem",
      border: "2px solid #fecaca",
    },
    messageSuccess: {
      textAlign: "center",
      fontWeight: "700",
      fontSize: "1.5rem", // Increased 50%
      marginTop: "2rem",
      padding: "1.5rem",
      backgroundColor: "#ecfdf5",
      color: "#10b981",
      borderRadius: "1rem",
      border: "2px solid #a7f3d0",
    },
    footer: {
      textAlign: "center",
      marginTop: "3.5rem",
      paddingTop: "3rem",
      borderTop: "2px solid #f3f4f6",
    },
    footerText: {
      fontSize: "1.5rem", // ~24px (50% increase from 1.05rem)
      color: "#4b5563",
    },
    footerLink: {
      fontWeight: "800",
      color: "#111827",
      textDecoration: "underline",
      textDecorationColor: "#5EF522", 
      textDecorationThickness: "4px", // Thicker underline matches larger size
      textUnderlineOffset: "6px",
    },
    googleWrapper: {
      marginTop: "2.5rem",
      transform: "scale(1.25)", // Visually scales up the Google Identity platform button smoothly
      transformOrigin: "center",
      display: "flex",
      justifyContent: "center"
    }
  };

  const messageStyle =
    message.startsWith("❌") || message.startsWith("⚠️")
      ? styles.message
      : styles.messageSuccess;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <DumbbellIcon />
          <h2 style={styles.heading}>Welcome Back, Lifter</h2>
          <p style={styles.subheading}>Sign in to track your progress</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <div>
              <label htmlFor="username" style={{ display: "none" }}>
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                style={{ ...styles.input, marginTop: 0 }}
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
            <div>
              <label htmlFor="password" style={{ display: "none" }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
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
          </div>

          <div>
            <button
              type="submit"
              style={styles.button}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#4fe313";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 14px 30px -2px rgba(94, 245, 34, 0.55)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#5EF522";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 25px -4px rgba(94, 245, 34, 0.45)";
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "translateY(1px)";
              }}
            >
              Log In
            </button>
          </div>
        </form>

        {message && <p style={messageStyle}>{message}</p>}

        <div style={styles.googleWrapper}>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setMessage("❌ Google Login Failed")}
            theme="outline" 
            size="large"
            width="340px" // Adjusted width mapping inside scaled wrapper
          />
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Not a member?{" "}
            <a href="/register" style={styles.footerLink}>
              Sign up now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;