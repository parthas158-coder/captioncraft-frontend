import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/"); // go to dashboard
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black flex justify-center items-center">
      <form
        onSubmit={handleSignup}
        className="bg-white/10 p-8 rounded-xl w-full max-w-md border border-white/20"
      >
        <h2 className="text-2xl text-white font-bold mb-6 text-center">Signup</h2>

        {error && <div className="text-red-400 mb-3">{error}</div>}

        <input
          className="w-full p-3 mb-3 rounded bg-neutral-800 text-white"
          placeholder="Email"
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-3 mb-3 rounded bg-neutral-800 text-white"
          placeholder="Password"
          type="password"
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-yellow-500 text-black p-3 rounded font-semibold"
        >
          Signup
        </button>

        <p className="text-gray-300 text-sm mt-3 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-yellow-400">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
