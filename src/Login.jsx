import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loginUser = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-black flex justify-center items-center">
      <div className="bg-white/10 p-8 rounded-xl w-full max-w-md border border-white/20">
        <h2 className="text-2xl text-white font-bold mb-6 text-center">Login</h2>

        {error && <div className="text-red-400 mb-3">{error}</div>}

        <input
          className="w-full p-3 mb-3 rounded bg-neutral-800 text-white"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-3 mb-3 rounded bg-neutral-800 text-white"
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={loginUser}
          className="w-full bg-yellow-500 text-black p-3 rounded font-semibold"
        >
          Login
        </button>

        <p className="text-gray-300 text-sm mt-3 text-center">
          No account? <Link to="/signup" className="text-yellow-400">Signup</Link>
        </p>
      </div>
    </div>
  );
}
