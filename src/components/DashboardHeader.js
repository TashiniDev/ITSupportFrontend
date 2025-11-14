import React, { useState } from 'react';
// registration for ticket creators will be available via modal
import { Button } from './ui/button';
import { PrintcareLogoPlaceholder } from './ImagePlaceholders';
import { LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { normalizeRole } from '../utils/roleUtils';
import { RegisterForm } from './RegisterForm';
import { apiCall, API_ENDPOINTS } from '../utils/api/config';
import toastService from '../services/toastService';

export default function DashboardHeader({ onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const [showRegister, setShowRegister] = useState(false);

  const raw = localStorage.getItem('userData');
  let user = null;
  try { user = raw ? JSON.parse(raw) : null; } catch(e) { user = null; }

  const displayName = user?.name || user?.name || 'User';
  const role = user?.role || user?.roleId || 'ticket_creator';
  const normalizedRole = normalizeRole(role);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
         <PrintcareLogoPlaceholder className="h-15 w-12 scale-150 origin-center" alt="IT Supporter Logo" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">IT Supporter</h1>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Welcome, <span className="font-medium">{displayName}</span>
              <span className="ml-2 inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                {role === 'it_team' ? 'IT Team' : role === 'department_head' ? 'IT Head' : 'Ticket Creator'}
              </span>
              {/* Show Register button only to Ticket Creators */}
              {normalizedRole === 'ticket_creator' && (
                <Button
                  onClick={() => setShowRegister(true)}
                  variant="default"
                  size="sm"
                  className="ml-2 bg-green-600 hover:bg-green-700 focus:ring-green-500 border-green-600 text-white"
                >
                  Register
                </Button>
              )}
            </div>

            <Button onClick={toggleTheme} variant="outline" size="sm">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            <Button onClick={onLogout} variant="outline" size="sm" className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400">
              <LogOut className="h-4 w-4" />
              <span className="ml-2">Logout</span>
            </Button>
          </div>

          {/* mobile actions removed - no Create button for any role */}
          {/* Register modal (simple) */}
          {showRegister && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Register New User</h3>
                  <Button onClick={() => setShowRegister(false)} variant="ghost">Close</Button>
                </div>
                <div>
                  <RegisterForm onRegister={async (userData) => {
                    try {
                      const resp = await apiCall(API_ENDPOINTS.REGISTER, { method: 'POST', body: JSON.stringify(userData) });
                      toastService.success('Account created successfully!');
                      return resp;
                    } catch (err) {
                      console.error('Registration failed:', err);
                      throw err;
                    }
                  }} onSuccess={() => setShowRegister(false)} />
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </header>
      {/* spacer to offset fixed header height */}
      <div className="h-16" aria-hidden />
    </>
  );
}
