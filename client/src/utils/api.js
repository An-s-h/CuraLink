// API utility with JWT token support
const base = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${base}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/signin";
    return;
  }

  return response;
}

export default apiFetch;
