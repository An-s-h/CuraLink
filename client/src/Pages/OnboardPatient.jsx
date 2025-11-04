import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import AnimatedBackground from "../components/ui/AnimatedBackground.jsx";

export default function OnboardPatient() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [conditions, setConditions] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function extractConditions(text) {
    if (!text || text.length < 5) return;
    setIsExtracting(true);
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
    try {
      const res = await fetch(`${base}/api/ai/extract-conditions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      }).then((r) => r.json());
      if (res.conditions?.length > 0) {
        setConditions(res.conditions.join(", "));
      }
    } catch (e) {
      console.error("AI extraction failed", e);
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleStart() {
    setError("");
    if (password !== confirmPassword) return setError("Passwords do not match");
    if (password.length < 6)
      return setError("Password must be at least 6 characters");

    setLoading(true);
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000";

    try {
      const conditionsArray = conditions
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const registerRes = await fetch(`${base}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          role: "patient",
          medicalInterests: conditionsArray,
        }),
      });

      const registerData = await registerRes.json();
      if (!registerRes.ok) {
        setError(registerData.error || "Registration failed");
        setLoading(false);
        return;
      }

      const user = registerData.user;
      localStorage.setItem("token", registerData.token);
      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event("login"));

      const profile = {
        role: "patient",
        patient: {
          conditions: conditionsArray,
          location: { city, country },
          gender: gender.trim() || undefined,
        },
      };

      await fetch(`${base}/api/profile/${user._id || user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${registerData.token}`,
        },
        body: JSON.stringify(profile),
      });

      navigate("/dashboard/patient");
    } catch (e) {
      console.error("Registration error:", e);
      setError("Failed to create account. Please try again.");
      setLoading(false);
    }
  }

  const progress = [
    { id: 1, label: "Email & Password" },
    { id: 2, label: "Your Name" },
    { id: 3, label: "Medical Condition" },
    { id: 4, label: "Location" },
  ];

  return (
    <Layout>
      <div className="relative">
        <AnimatedBackground />
        <div className="flex justify-center items-center min-h-screen  px-4 py-8">
          <div className="w-full max-w-lg bg-white/20 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(255,186,100,0.2)] border border-orange-100 p-10 space-y-8 transition-all duration-300">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-orange-700 tracking-tight">
                Patient Onboarding
              </h1>
              <p className="text-sm text-orange-600 font-medium">
                Step {step} of 4 — {progress[step - 1].label}
              </p>
              <div className="flex justify-center gap-2 mt-4">
                {progress.map((p) => (
                  <div
                    key={p.id}
                    className={`h-1.5 w-10 rounded-full transition-all duration-300 ${
                      p.id <= step ? "bg-orange-500" : "bg-orange-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-6">
              {step === 1 && (
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
                      className="w-full py-3 px-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full py-3 px-4 text-base w-full py-3 px-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Confirm Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full py-3 px-4 text-base w-full py-3 px-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    />
                  </div>
                  {error && (
                    <div className="text-red-500 text-center text-sm py-2 px-4 bg-red-50 rounded-lg border border-red-200">
                      {error}
                    </div>
                  )}
                  <Button
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white rounded-xl py-3.5 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                    onClick={() => {
                      if (email && password && confirmPassword) {
                        if (password !== confirmPassword)
                          return setError("Passwords do not match");
                        if (password.length < 6)
                          return setError(
                            "Password must be at least 6 characters"
                          );
                        setError("");
                        setStep(2);
                      }
                    }}
                  >
                    Continue →
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Your Name
                    </label>
                    <Input
                      placeholder="Enter your full name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full py-3 px-4 text-base w-full py-3 px-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    />
                  </div>
                  <div className="flex justify-between gap-3 pt-2">
                    <Button
                      variant="ghost"
                      onClick={() => setStep(1)}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-6 py-3 rounded-xl font-medium transition-all"
                    >
                      ← Back
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white rounded-xl px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                      onClick={() => username && setStep(3)}
                    >
                      Continue →
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Describe your medical condition
                    </label>
                    <div className="relative">
                      <Input
                        placeholder="e.g. I have chest pain, breathing issues..."
                        value={conditions}
                        onChange={(e) => setConditions(e.target.value)}
                        onBlur={(e) => extractConditions(e.target.value)}
                        className="w-full py-3 px-4 text-base w-full py-3 px-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      />
                      {isExtracting && (
                        <span className="absolute right-4 top-3.5 text-xs text-orange-600 font-medium">
                          Extracting…
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      AI will automatically identify your conditions.
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full py-3 px-4 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all"
                    >
                      <option value="">Select gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Non-binary</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                  <div className="flex justify-between gap-3 pt-2">
                    <Button
                      variant="ghost"
                      onClick={() => setStep(2)}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-6 py-3 rounded-xl font-medium transition-all"
                    >
                      ← Back
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white rounded-xl px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                      onClick={() => setStep(4)}
                    >
                      Continue →
                    </Button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Location
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full py-3 px-4 text-base w-full py-3 px-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      />
                      <Input
                        placeholder="Country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full py-3 px-4 text-base w-full py-3 px-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      />
                    </div>
                  </div>
                  {error && (
                    <div className="text-red-500 text-sm text-center py-2 px-4 bg-red-50 rounded-lg border border-red-200">
                      {error}
                    </div>
                  )}
                  <div className="flex justify-between gap-3 pt-2">
                    <Button
                      variant="ghost"
                      onClick={() => setStep(3)}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-6 py-3 rounded-xl font-medium transition-all"
                    >
                      ← Back
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white rounded-xl px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      onClick={handleStart}
                      disabled={loading}
                    >
                      {loading ? "Creating Account..." : "Complete →"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
