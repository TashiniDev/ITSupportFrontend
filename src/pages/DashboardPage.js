import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketCreatorDashboard from '../components/TicketCreatorDashboard';
import { AdminDashboard } from '../components/AdminDashboard';
import { DepartmentHeadDashboard } from '../components/DepartmentHeadDashboard';
import { useTheme } from '../components/ThemeProvider';
import { LogoutDialog } from '../components/LogoutDialog';
import { Button } from '../components/ui/button';
import DashboardHeader from '../components/DashboardHeader';
import { Menu } from 'lucide-react';
import { normalizeRole, roleLabel } from '../utils/roleUtils';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      if (!token || !userData.uid) {
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

  const handleLogout = async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setShowLogoutDialog(false);
    navigate('/login');
  };

  const renderDashboard = () => {
    if (!user) return null;

    // Map role IDs to role types (you'll need to adjust based on your backend)
    const roleId = user.roleId || user.role;
    
    if (roleId === '3' || roleId === 'department_head') {
      return <DepartmentHeadDashboard user={user} />;
    }
    
    if (roleId === '2' || roleId === 'it_team') {
      return <AdminDashboard user={user} />;
    }
    
  return <TicketCreatorDashboard user={user} />;
  };

  const getUserRoleDisplay = (user) => {
    const roleId = user.roleId || user.role;
    
    if (roleId === '3' || roleId === 'department_head') {
      return 'IT Head';
    }
    
    if (roleId === '2' || roleId === 'it_team') {
      const categoryMap = {
        '1': 'Power Apps',
        '2': 'Development',
        '3': 'Server/Application',
        '4': 'Network',
        '5': 'HRIS',
        '6': 'Hardware'
      };
      const teamName = categoryMap[user.categoryId] || 'IT Team';
      return `IT Team - ${teamName}`;
    }
    
    return 'Ticket Creator';
  };

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