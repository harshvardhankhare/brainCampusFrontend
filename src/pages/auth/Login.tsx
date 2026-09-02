import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
        schoolCode,
      });

      const data = response.data.data;

      localStorage.setItem("token", data.accessToken);

      navigate("/dashboard");
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
        "Invalid email, password, or school code"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>BrainCampus</h1>

      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <div>
          <label>School Code</label>

          <input
            type="text"
            value={schoolCode}
            onChange={(e) => setSchoolCode(e.target.value)}
            placeholder="Enter school code"
            required
          />
        </div>

        <div>
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            required
          />
        </div>

        <div>
          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </div>

        {error && (
          <p>{error}</p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;