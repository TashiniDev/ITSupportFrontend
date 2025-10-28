import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ITSupportImage, PrintcareLogoPlaceholder } from './ImagePlaceholders';
import { LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function DashboardHeader({ onLogout }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const raw = localStorage.getItem('userData');
  let user = null;
  try { user = raw ? JSON.parse(raw) : null; } catch(e) { user = null; }

  const displayName = user?.name || user?.name || 'User';
  const role = user?.role || user?.roleId || 'ticket_creator';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <PrintcareLogoPlaceholder className="h-10 w-10" alt="IT Supporter Logo" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">IT Supporter</h1>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Welcome, <span className="font-medium">{displayName}</span>
              <button
                onClick={() => navigate('/tickets/create')}
                className="ml-2 inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs"
              >
                {role === 'it_team' ? 'IT Team' : role === 'department_head' ? 'IT Head' : 'Ticket Creator'}
              </button>
            </div>

            <Button onClick={toggleTheme} variant="outline" size="sm">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            <Button onClick={onLogout} variant="outline" size="sm" className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400">
              <LogOut className="h-4 w-4" />
              <span className="ml-2">Logout</span>
            </Button>
          </div>

          <div className="md:hidden">
            <Button onClick={() => navigate('/tickets/create')} variant="outline" size="sm">Create</Button>
          </div>
        </div>
        </div>
      </header>
      {/* spacer to offset fixed header height */}
      <div className="h-16" aria-hidden />
    </>
  );
}
