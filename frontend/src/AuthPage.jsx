import { useState } from "react";
import { Building2 } from "lucide-react";
import { login, signup } from "./services/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

function AuthPage({ onAuthenticated, theme }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === "signup";

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const switchMode = () => {
    setMode(isSignup ? "login" : "signup");
    setError("");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");

    if ((isSignup && !form.name.trim()) || !form.email.trim() || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (isSignup && form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setSubmitting(true);
      const user = isSignup
        ? await signup({ name: form.name.trim(), email: form.email.trim(), password: form.password })
        : await login({ email: form.email.trim(), password: form.password });
      onAuthenticated(user);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`auth-page ${theme}-theme`}>
      <div className="auth-card">
        <div className="brand auth-brand">
          <div className="brand-icon"><Building2 size={23} /></div>
          <span>LeadFlow</span>
        </div>

        <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p className="auth-subtitle">
          {isSignup ? "Sign up to start tracking your leads." : "Log in to manage your leads."}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {isSignup && (
            <div className="form-group">
              <label htmlFor="auth-name">Full Name *</label>
              <input id="auth-name" name="name" value={form.name} onChange={handleChange} placeholder="Enter your name" autoComplete="name" />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Email Address *</label>
            <input id="auth-email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@company.com" autoComplete="email" />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password *</label>
            <input id="auth-password" type="password" name="password" value={form.password} onChange={handleChange} placeholder={isSignup ? "At least 6 characters" : "Enter your password"} autoComplete={isSignup ? "new-password" : "current-password"} />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="primary-button auth-submit" disabled={submitting}>
            {submitting ? "Please wait..." : isSignup ? "Sign Up" : "Log In"}
          </button>
        </form>

        <p className="auth-switch">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button type="button" onClick={switchMode}>{isSignup ? "Log in" : "Sign up"}</button>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
