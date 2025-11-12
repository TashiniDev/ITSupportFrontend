import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketCreatorDashboard from '../components/TicketCreatorDashboard';
import ITTeamDashboard from '../components/ITTeamDashboard';
import { DepartmentHeadDashboard } from '../components/DepartmentHeadDashboard';
// removed unused useTheme import
import { LogoutDialog } from '../components/LogoutDialog';
import DashboardHeader from '../components/DashboardHeader';
import { normalizeRole } from '../utils/roleUtils';
import toastService from '../services/toastService';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userDataString = localStorage.getItem('userData');

        if (!token || !userDataString) {
          navigate('/login');
          return;
        }

        let userData;
        try {
          userData = JSON.parse(userDataString);
        } catch (parseError) {
          console.error('Failed to parse userData:', parseError);
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          navigate('/login');
          return;
        }

        if (!userData.uid) {
          console.log('No valid user ID found');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          navigate('/login');
          return;
        }

        const canonical = normalizeRole(userData.role || userData.roleId);
        if (canonical) {
          userData.role = canonical;
          // persist normalized role so subsequent loads are consistent
          localStorage.setItem('userData', JSON.stringify(userData));
        }

        setUser(userData);
      } catch (error) {
        console.log('Session check error:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      // First, immediately clear authentication state
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      // Clear user state immediately
      setUser(null);
      
      // Close the dialog
      setShowLogoutDialog(false);
      
      // Show logout success message
      toastService.auth.logoutSuccess();
      
      // Small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, ensure we clean up and redirect
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      setUser(null);
      setShowLogoutDialog(false);
      navigate('/login');
    }
  };

  const renderDashboard = () => {
    if (!user) return null;

    console.log('Rendering dashboard for user:', user.roleId);

    // Map role IDs to role types - prioritize roleId from JWT token
    const roleId = user.roleId || user.role;
    const roleIdStr = String(roleId);
    
    // Role ID 3 = Department Head Dashboard
    if (roleIdStr === '3' || roleId === 'department_head') {
      return <DepartmentHeadDashboard user={user} />;
    }
    
    // Role ID 2 = IT Team Dashboard
    if (roleIdStr === '2' || roleId === 'it_team') {
      return <ITTeamDashboard user={user} />;
    }
    
    // Role ID 1 = Ticket Creator Dashboard (default)
    return <TicketCreatorDashboard user={user} />;
  };

  // getUserRoleDisplay removed - unused helper

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-lg text-gray-900 dark:text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <DashboardHeader onLogout={() => setShowLogoutDialog(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {renderDashboard()}
      </main>

      <LogoutDialog 
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogout}
      />
    </div>
  );
}

export default DashboardPage;