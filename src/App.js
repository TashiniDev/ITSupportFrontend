import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { ThemeProvider } from "./components/ThemeProvider";
import ToastProvider from "./components/ToastProvider";
import "./styles/toast.css";
 

const Layout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <main className="flex-1">
        <Routes>
          {/* Public/User Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          {/* Removed forgot-password route: replaced by in-page modal in LoginPage */}
        </Routes>
      </main>
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <Layout />
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
