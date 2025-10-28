import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { apiCall, API_ENDPOINTS } from '../utils/api/config';
import { LoginForm } from '../components/LoginForm';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { RegisterForm } from '../components/RegisterForm';
import { useTheme } from '../components/ThemeProvider';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ITSupportImage, PrintcareLogoPlaceholder } from '../components/ImagePlaceholders';
import { Sun, Moon } from 'lucide-react';
import toastService from '../services/toastService';
import { normalizeRole } from '../utils/roleUtils';

function LoginPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [forgotOpen, setForgotOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Check for authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      toastService.info('You are already logged in. Redirecting to dashboard...');
      navigate('/dashboard');
    }
  }, [navigate]);

  // Handle successful tab switch
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await apiCall(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      // Store token and user data
      localStorage.setItem('authToken', response.token);
      
      // Decode JWT token to get role ID
      let roleId = null;
      let decodedToken = null;
      
      try {
        decodedToken = jwtDecode(response.token);
        roleId = decodedToken.roleId || decodedToken.role_id || decodedToken.role;
        console.log('Decoded token:', decodedToken);
        console.log('Extracted roleId:', roleId);
      } catch (decodeError) {
        console.warn('Failed to decode JWT token:', decodeError);
        // Fallback to response data if token decode fails
        roleId = response.user.role || response.user.roleId || 'ticket_creator';
      }
      
      // Create user object based on your backend response
      const canonicalRole = normalizeRole(roleId || 'ticket_creator') || 'ticket_creator';

      const userData = {
        id: response.user.uid,
        uid: response.user.uid,
        email: response.user.email,
        name: response.user.name || email.split('@')[0], // Use name from response or fallback
        role: canonicalRole,
        roleId: roleId, // Store original role ID for navigation
        team: response.user.team || null
      };
      
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Show welcome message
      toastService.auth.loginSuccess(userData.name);

      // Navigate based on role ID
      let dashboardRoute = '/dashboard';
      
      // Convert roleId to string for comparison
      const roleIdStr = String(roleId);
      
      if (roleIdStr === '1' || canonicalRole === 'ticket_creator') {
        dashboardRoute = '/dashboard'; // Ticket Creator Dashboard
        console.log('Navigating to Ticket Creator Dashboard');
      } else if (roleIdStr === '2' || canonicalRole === 'it_team') {
        dashboardRoute = '/dashboard'; // IT Team Dashboard
        console.log('Navigating to IT Team Dashboard');
      } else if (roleIdStr === '3' || canonicalRole === 'department_head') {
        dashboardRoute = '/dashboard'; // Department Head Dashboard
        console.log('Navigating to Department Head Dashboard');
      }

      setTimeout(() => {
        navigate(dashboardRoute);
      }, 800);
      
    } catch (error) {
      console.log('Login error:', error);
      throw error;
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await apiCall(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      return response;
    } catch (error) {
      console.log('Registration error:', error);
      throw error;
    }
  };

  const handleForgotPasswordOpen = () => {
    setForgotOpen(true);
  };

  const handleForgotPasswordClose = () => {
    setForgotOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-900 dark:to-blue-950 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute top-8 right-8">
          <Button onClick={toggleTheme} variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="max-w-lg z-10">
          <div className="text-center mb-8">
            <h2 className="text-white text-4xl mb-4">IT Support System</h2>
            <p className="text-blue-100 text-lg">
              An organized ticketing solution helps you track, manage and resolve IT issues with efficiency. 
              Assign tickets, update status, and collaborate with teams all in one centralized platform.
            </p>
          </div>
          
          <div className="mt-12 flex justify-center">
            <ITSupportImage
              className="w-full max-w-md h-64"
              alt="Support Illustration" 
            />
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/5 rounded-full translate-x-20 translate-y-20"></div>
      </div>

      {/* Right Panel - Login/Register Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md">
          {/* Mobile Theme Toggle */}
          <div className="lg:hidden flex justify-end mb-4">
            <Button onClick={toggleTheme} variant="outline" size="sm">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>

          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <PrintcareLogoPlaceholder className="h-25 w-25" alt="IT Supporter Logo" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Hello, IT Support</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Login to your account to manage tickets and collaborate with your team
            </p>
          </div>

          {/* Login/Register Card */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl">
            <CardContent className="pt-6">
              <Tabs value={activeTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger 
                    value="login" 
                    active={activeTab === 'login'}
                    onClick={() => handleTabChange('login')}
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register"
                    active={activeTab === 'register'}
                    onClick={() => handleTabChange('register')}
                  >
                    Register
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" activeTab={activeTab} className="mt-0">
                  <LoginForm onLogin={handleLogin} onOpenForgot={handleForgotPasswordOpen} />
                </TabsContent>
                
                <TabsContent value="register" activeTab={activeTab} className="mt-0">
                  <RegisterForm 
                    onRegister={handleRegister} 
                    onSuccess={() => handleTabChange('login')}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          {/* Forgot Password Modal */}
          <ForgotPasswordModal open={forgotOpen} onClose={handleForgotPasswordClose} />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;