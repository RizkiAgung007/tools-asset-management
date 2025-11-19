import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.get("/sanctum/csrf-cookie", { withCredentials: true });

      const response = await api.post("/api/login", {
        email: email,
        password: password,
      });

      localStorage.setItem("token", response.data.token);

      sessionStorage.setItem("user_name", response.data.user.name);
      sessionStorage.setItem("user_role", response.data.user.role);

      navigate("/dashboard");
    } catch (err) {
      console.error("Login Error:", err);

      if (err.response && err.response.status === 401) {
        setError("Email dan Password salah.");
      } else {
        setError("Terjadi kesalahan pada server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-lg w-full max-w-md overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              Asset Management
            </h2>
            <p className="text-gray-50 text-sm mt-1">
              Masuk dengan akun perusahaan
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="your@mail.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="*******"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white
                                ${
                                  loading
                                    ? "bg-blue-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                                }
                                transition-colors duration-200`}
            >
              {loading ? "Memproses..." : "Masuk Dashboard"}
            </button>
          </form>
        </div>
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            &copy: 2025 Enterprise Asset System
          </p>
        </div>
      </div>
    </div>
  );
}
