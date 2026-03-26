import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

// Use the environment variable for your AWS IP, or default to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// A simple dumbbell icon for the header
const DumbbellIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#818cf8" 
    strokeWidth="2"
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
          // Performs a full page reload and navigates to the dashboard.
          window.location.href = "/dashboard";
        } else {
          setMessage("Login successful, but no token received.");
        }
      } else {
        setMessage(`❌ Login failed: ${data.message || 'Invalid credentials'}`);
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
      backgroundColor: "#111827", 
      color: "#f3f4f6", 
      padding: "1rem", 
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
    },
    card: {
      width: "100%",
      maxWidth: "28rem", 
      padding: "2rem", 
      backgroundColor: "#1f2937", 
      borderRadius: "1rem", 
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", 
    },
    header: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: "2rem", 
    },
    heading: {
      marginTop: "1rem", 
      fontSize: "1.875rem", 
      fontWeight: "800", 
      textAlign: "center",
      color: "#ffffff", 
    },
    subheading: {
      marginTop: "0.5rem", 
      textAlign: "center",
      fontSize: "0.875rem", 
      color: "#9ca3af", 
    },
    form: {
      marginBottom: "1.5rem", 
    },
    inputGroup: {
      marginBottom: "1.5rem", 
    },
    input: {
      width: "100%",
      padding: "0.75rem 1rem", 
      fontSize: "1.125rem", 
      backgroundColor: "#374151", 
      border: "1px solid #4b5563", 
      borderRadius: "0.5rem", 
      color: "#ffffff", 
      boxSizing: "border-box", 
      marginTop: "1rem",
    },
    button: {
      width: "100%",
      padding: "0.75rem 1rem", 
      fontSize: "1.125rem", 
      fontWeight: "600", 
      color: "#ffffff", 
      backgroundColor: "#4f46e5", 
      borderRadius: "0.5rem", 
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", 
      border: "none",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    message: {
      textAlign: "center",
      fontWeight: "500", 
      marginTop: "1.5rem",
      color: "#f87171", 
    },
    messageSuccess: {
      textAlign: "center",
      fontWeight: "500",
      marginTop: "1.5rem",
      color: "#34d399", 
    },
    footer: {
      textAlign: "center",
      marginTop: "1.5rem",
    },
    footerText: {
      fontSize: "0.875rem", 
      color: "#9ca3af", 
    },
    footerLink: {
      fontWeight: "500", 
      color: "#818cf8", 
      textDecoration: "none",
    }
  };
  
  const messageStyle = (message.startsWith('❌') || message.startsWith('⚠️')) 
    ? styles.message 
    : styles.messageSuccess;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <DumbbellIcon />
          <h2 style={styles.heading}>
            Welcome Back, Lifter
          </h2>
          <p style={styles.subheading}>
            Sign in to track your progress
          </p>
        </div>
        
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <div>
              <label htmlFor="username" style={{ display: 'none' }}>
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
                style={{...styles.input, marginTop: 0}} 
              />
            </div>
            <div>
              <label htmlFor="password" style={{ display: 'none' }}>
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
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              style={styles.button}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
            >
              Log In
            </button>
          </div>
        </form>

        {message && (
          <p style={messageStyle}>
            {message}
          </p>
        )}

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Not a member?{" "}
            <a
              href="/register"
              style={styles.footerLink}
              onMouseOver={(e) => e.currentTarget.style.color = '#a5b4fc'}
              onMouseOut={(e) => e.currentTarget.style.color = '#818cf8'}
            >
              Sign up now
            </a>
          </p>
        </div>
        
        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setMessage("❌ Google Login Failed")}
            theme="filled_blue"
            size="large"
            width="100%"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;