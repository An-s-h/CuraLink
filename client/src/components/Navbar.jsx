import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const updateUser = () => {
      const userData = JSON.parse(localStorage.getItem("user") || "null");
      setUser(userData);
    };

    updateUser();

    const handleLogout = () => {
      setUser(null);
      setIsMenuOpen(false);
      setIsMobileMenuOpen(false);
    };

    const handleLogin = () => {
      updateUser();
    };

    const handleStorageChange = (e) => {
      if (e.key === "user" || e.key === "token") {
        updateUser();
      }
    };

    window.addEventListener("logout", handleLogout);
    window.addEventListener("login", handleLogin);
    window.addEventListener("storage", handleStorageChange);

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("logout", handleLogout);
      window.removeEventListener("login", handleLogin);
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("logout"));
    navigate("/");
  }

  function getDashboardPath() {
    if (!user) return "/dashboard/patient";
    return `/dashboard/${user.role || "patient"}`;
  }

  return (
    <header className="fixed top-3 left-0 right-0 z-50 flex justify-center">
      <div className="pointer-events-auto flex items-center justify-between sm:w-[40%] w-[92%] max-w-6xl rounded-full bg-cream-100/70 backdrop-blur-xl border border-orange-200/70 shadow-lg px-6 py-3 transition-all duration-300 hover:shadow-orange-100">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-tight text-orange-700 hover:text-orange-600 transition-colors lobster-two-regular"
        >
          CuraLink
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex items-center gap-8 text-[15px] font-medium text-gray-700">
          {["Trials", "Publications", "Experts", "Forums"].map((item) => (
            <Link
              key={item}
              to={`/${item.toLowerCase()}`}
              className="relative group transition-all"
            >
              <span className="group-hover:text-orange-600">{item}</span>
              <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-orange-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-orange-200 py-2 z-50">
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/favorites"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  >
                    Favorites
                  </Link>
                  <hr className="my-1 border-orange-200" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/signin"
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
            >
              Sign In
            </Link>
          )}
        </nav>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="sm:hidden w-10 h-10 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isMobileMenuOpen && (
  <div className="absolute top-20 left-4 right-4 mx-auto rounded-3xl bg-white/20 backdrop-blur-xl border border-orange-200/40 shadow-lg py-5 px-6 flex flex-col items-center gap-4 sm:hidden z-40 transition-all duration-300">
    {["Trials", "Publications", "Experts", "Forums"].map((item) => (
      <Link
        key={item}
        to={`/${item.toLowerCase()}`}
        onClick={() => setIsMobileMenuOpen(false)}
        className="w-full text-center text-lg font-medium text-gray-800 hover:text-orange-600 hover:bg-white/30 rounded-xl py-2 px-4 transition-all duration-300"
      >
        {item}
      </Link>
    ))}

    {user ? (
      <>
        <Link
          to={getDashboardPath()}
          onClick={() => setIsMobileMenuOpen(false)}
          className="w-full text-center text-lg font-medium text-gray-800 hover:text-orange-600 hover:bg-white/30 rounded-xl py-2 px-4 transition-all duration-300"
        >
          Dashboard
        </Link>
        <Link
          to="/favorites"
          onClick={() => setIsMobileMenuOpen(false)}
          className="w-full text-center text-lg font-medium text-gray-800 hover:text-orange-600 hover:bg-white/30 rounded-xl py-2 px-4 transition-all duration-300"
        >
          Favorites
        </Link>
        <button
          onClick={handleLogout}
          className="w-full text-center text-lg font-medium text-red-600 hover:bg-red-100/30 rounded-xl py-2 px-4 transition-all duration-300"
        >
          Logout
        </button>
      </>
    ) : (
      <Link
        to="/signin"
        onClick={() => setIsMobileMenuOpen(false)}
        className="w-full text-center bg-orange-500 hover:bg-orange-600 text-white text-lg font-medium py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
      >
        Sign In
      </Link>
    )}
  </div>
)}

    </header>
  );
}
