import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserDashboard } from '../components/UserDashboard';
import { AdminDashboard } from '../components/AdminDashboard';
import { DepartmentHeadDashboard } from '../components/DepartmentHeadDashboard';
import { useTheme } from '../components/ThemeProvider';
import { LogoutDialog } from '../components/LogoutDialog';
import { Button } from '../components/ui/button';
import { ITSupportImage } from '../components/ImagePlaceholders';
import { LogOut, Sun, Moon, Menu } from 'lucide-react';

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
    
    return <UserDashboard user={user} />;
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
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <ITSupportImage className="h-8 w-8" alt="IT Supporter Logo" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">IT Supporter</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, <span className="font-medium">{user.name || user.email}</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                  {getUserRoleDisplay(user)}
                </span>
              </div>
              <Button onClick={toggleTheme} variant="outline" size="sm">
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              <Button onClick={() => setShowLogoutDialog(true)} variant="outline" size="sm" className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400">
                <LogOut className="h-4 w-4" />
                <span className="ml-2">Logout</span>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} variant="outline" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 pt-4 pb-4">
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome, <span className="font-medium">{user.name || user.email}</span>
                  <div className="mt-1">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                      {getUserRoleDisplay(user)}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={toggleTheme} variant="outline" size="sm" className="flex-1">
                    {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    <span className="ml-2">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                  </Button>
                  <Button onClick={() => setShowLogoutDialog(true)} variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400">
                    <LogOut className="h-4 w-4" />
                    <span className="ml-2">Logout</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
      
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