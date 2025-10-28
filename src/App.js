import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import TicketCreatorDashboard from "./components/TicketCreatorDashboard";
import { ITTeamDashboard } from "./components/ITTeamDashboard";
import { DepartmentHeadDashboard } from "./components/DepartmentHeadDashboard";
import CreateTicketPage from './pages/CreateTicketPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
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
          {/* Explicit role-specific dashboard routes so we can deep-link (use DashboardPage to include header) */}
          <Route path="/dashboard/ticket-creator" element={<DashboardPage />} />
          <Route path="/dashboard/it-team" element={<DashboardPage />} />
          <Route path="/tickets/create" element={<CreateTicketPage />} />
          <Route path="/tickets/:ticketId" element={<TicketDetailsPage />} />
          <Route path="/tickets/:ticketId/edit" element={<CreateTicketPage />} />
          <Route path="/dashboard/it-head" element={<DashboardPage />} />
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
