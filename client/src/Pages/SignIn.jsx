import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import AnimatedBackground from "../components/ui/AnimatedBackground.jsx";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password");
      return;
    }

    setLoading(true);
    setError("");
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000";

    try {
      const res = await fetch(`${base}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim(), 
          password,
          role 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Sign in failed");
        setLoading(false);
        return;
      }

      // Store JWT token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Dispatch login event to update navbar
      window.dispatchEvent(new Event("login"));

      // Redirect to dashboard
      navigate(`/dashboard/${role}`);
    } catch (e) {
      setError("Failed to sign in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="relative">
        <AnimatedBackground />
        <div className="flex justify-center items-center min-h-screen px-4 py-8">
          <div className="w-full max-w-lg bg-white/20 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(255,186,100,0.2)] border border-orange-100 p-10 space-y-8 transition-all duration-300">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-orange-700 tracking-tight">
                Sign In
              </h1>
              <p className="text-sm text-orange-600 font-medium">
                Resume your session
              </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSignIn()}
                  className="w-full py-3 px-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSignIn()}
                  className="w-full py-3 px-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  I am a
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setRole("patient")}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md ${
                      role === "patient"
                        ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white"
                        : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                    }`}
                  >
                    Patient
                  </button>
                  <button
                    onClick={() => setRole("researcher")}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md ${
                      role === "researcher"
                        ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white"
                        : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                    }`}
                  >
                    Researcher
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-center text-sm py-2 px-4 bg-red-50 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <Button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white rounded-xl py-3.5 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Signing in..." : "Sign In →"}
              </Button>
            </div>

            <div className="text-center text-sm text-orange-600">
              Don't have an account?{" "}
              <a
                href="/"
                className="text-orange-700 hover:text-orange-800 font-semibold hover:underline transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/");
                }}
              >
                Sign up
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
