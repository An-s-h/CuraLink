import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AnimatedBackground from "../components/ui/AnimatedBackground";
import Footer from "../components/Footer";
export default function Landing() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);

    const updateUser = () => {
      const userData = JSON.parse(localStorage.getItem("user") || "null");
      const token = localStorage.getItem("token");
      setUser(userData && token ? userData : null);
    };

    updateUser();

    const handleLogin = () => updateUser();
    const handleLogout = () => setUser(null);
    const handleStorageChange = (e) => {
      if (e.key === "user" || e.key === "token") updateUser();
    };

    window.addEventListener("login", handleLogin);
    window.addEventListener("logout", handleLogout);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("login", handleLogin);
      window.removeEventListener("logout", handleLogout);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const getDashboardPath = () => {
    if (!user) return "/dashboard/patient";
    return `/dashboard/${user.role || "patient"}`;
  };

  const handleDashboardClick = () => navigate(getDashboardPath());

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      <section className="relative min-h-screen flex items-center justify-center px-6 pt-28 pb-12">
        <div
          className={`max-w-6xl mx-auto relative z-10 text-center space-y-12 transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Heading */}
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 leading-tight">
            Empowering{" "}
            <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-400 bg-clip-text text-transparent animate-gradient-slow lobster-two-regular">
              Healthcare
            </span>{" "}
            Through Connection
          </h1>

          {/* Subheading */}
          <p className=" text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Bridge the gap between patients, caregivers, and researchers.
          </p>

          {/* Conditional CTA */}
          {user ? (
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full blur-2xl opacity-40" />
                <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-full blur-2xl opacity-40" />

                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                  <div className="space-y-3 w-full">
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent break-words px-4">
                      Welcome Back{user?.username ? `, ${user.username}` : ""}!
                    </h3>
                    <p className="text-lg md:text-xl text-gray-700 font-medium max-w-2xl mx-auto px-4">
                      Your personalized dashboard is ready
                    </p>
                  </div>

                  <button
                    onClick={handleDashboardClick}
                    className="group/btn relative mt-4 px-8 md:px-10 py-4 md:py-5 bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-500 text-white rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl text-lg md:text-xl font-bold transform hover:scale-105 overflow-visible"
                  >
                    <span className="relative z-10 flex items-center gap-3 whitespace-nowrap">
                      See Your Personalized Dashboard
                      <svg
                        className="w-6 h-6 transform group-hover/btn:translate-x-2 transition-transform duration-300 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                  </button>

                  <div className="flex flex-wrap justify-center gap-4 pt-4 text-sm">
                    <div className="px-4 py-2 bg-orange-100 rounded-full text-orange-700 font-semibold">
                      ✓ Verified Account
                    </div>
                    <div className="px-4 py-2 bg-yellow-100 rounded-full text-yellow-700 font-semibold">
                      ⚡ All Systems Ready
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Guest View (Patients & Researchers)
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-2xl mx-auto">
              {/* Patients/Caregivers */}
              <Link
                to="/onboard/patient"
                className="group bg-white/80 backdrop-blur-lg border-2 border-orange-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center space-y-5 hover:border-orange-400 hover:scale-[1.03] cursor-pointer relative overflow-hidden"
              >
                {/* Background gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10 w-full flex flex-col items-center space-y-5">
                  <div className="w-18 h-18 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <img
                      src="/patient.svg"
                      alt="Patient Icon"
                      className="w-14 h-14 object-contain"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-orange-700 group-hover:text-orange-800 transition-colors">
                      For Patients/Caregivers
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed max-w-xs px-2">
                      Track your health and connect directly with verified
                      researchers to make a difference.
                    </p>
                  </div>

                  <div className="mt-2 px-6 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-full shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 font-semibold">
                    Get Started
                  </div>
                </div>
              </Link>

              {/* Researchers */}
              <Link
                to="/onboard/researcher"
                className="group bg-white/80 backdrop-blur-lg border-2 border-orange-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center space-y-5 hover:border-orange-400 hover:scale-[1.03] cursor-pointer relative overflow-hidden"
              >
                {/* Background gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10 w-full flex flex-col items-center space-y-5">
                  <div className="w-18 h-18 bg-gradient-to-br from-amber-100 to-orange-200 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <img
                      src="/doctor.svg"
                      alt="Researcher Icon"
                      className="w-14 h-14 object-contain"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-orange-700 group-hover:text-orange-800 transition-colors">
                      For Researchers
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed max-w-xs px-2">
                      Access quality patient data and collaborate with peers to
                      advance medical research.
                    </p>
                  </div>

                  <div className="mt-2 px-6 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-full shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 font-semibold">
                    Join Now
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-8 md:gap-16 py-12 border-t border-b border-orange-200">
            <div className="space-y-2 group cursor-pointer">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-yellow-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                50K+
              </div>
              <div className="text-sm md:text-base text-gray-600">
                Active Patients
              </div>
            </div>
            <div className="space-y-2 group cursor-pointer">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-yellow-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                200+
              </div>
              <div className="text-sm md:text-base text-gray-600">
                Research Projects
              </div>
            </div>
            <div className="space-y-2 group cursor-pointer">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-yellow-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                15+
              </div>
              <div className="text-sm md:text-base text-gray-600">
                Healthcare Partners
              </div>
            </div>
          </div>
        </div>
       
      </section>

      <style jsx>{`
        @keyframes gradient-slow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient-slow {
          background-size: 300% 300%;
          animation: gradient-slow 8s ease infinite;
        }
      `}</style>
       <Footer />
    </div>
  );
}
