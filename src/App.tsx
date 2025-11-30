import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthProvider";
import ProtectedRoute from "./ProtectedRoute";

import Login from "./Login";
import Signup from "./Signup";

// Your main UI
import Dashboard from "./Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
