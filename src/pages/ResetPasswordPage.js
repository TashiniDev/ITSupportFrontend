import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { useTheme } from '../components/ThemeProvider';
import { ITSupportImage, PrintcareLogoPlaceholder } from '../components/ImagePlaceholders';
import { apiCall, API_ENDPOINTS } from '../utils/api/config';
import { Sun, Moon, Eye, EyeOff } from 'lucide-react';

// Validation schema for reset password
const resetPasswordSchema = Yup.object({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters long')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/\d/, 'Password must contain at least one number')
    .matches(/[@$!%*?&]/, 'Password must contain at least one special character')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password')
});

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [token, setToken] = useState('');
  const [isValidToken, setIsValidToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      setIsValidToken(true); // Assume valid for now - you can add token validation API call here
    } else {
      setIsValidToken(false);
    }
  }, [searchParams]);

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      setStatus(null);
      await apiCall(`${API_ENDPOINTS.RESET_PASSWORD || '/auth/reset-password'}`, {
        method: 'POST',
        body: JSON.stringify({ 
          token: token,
          password: values.password 
        })
      });

      setStatus({ type: 'success', message: 'Password reset successfully! You can now login with your new password.' });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to reset password' });
    } finally {
      setSubmitting(false);
    }
  };

  if (isValidToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Invalid Reset Link</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The password reset link is invalid or has expired. Please request a new one.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

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
            <h2 className="text-white text-4xl mb-4">Reset Your Password</h2>
            <p className="text-blue-100 text-lg">
              Create a new strong password for your IT Support System account. 
              Make sure it's unique and secure.
            </p>
          </div>
          
          <div className="mt-12 flex justify-center">
            <ITSupportImage
              className="w-full max-w-md h-64"
              alt="Password Reset Illustration" 
            />
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/5 rounded-full translate-x-20 translate-y-20"></div>
      </div>

      {/* Right Panel - Reset Password Form */}
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your new password below
            </p>
          </div>

          {/* Reset Password Card */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl">
            <CardContent className="pt-6">
              <Formik
                initialValues={{
                  password: '',
                  confirmPassword: ''
                }}
                validationSchema={resetPasswordSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, status }) => (
                  <Form className="space-y-6">
                    {status && (
                      <div className={`p-3 text-sm rounded-md ${
                        status.type === 'error' 
                          ? 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' 
                          : 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {status.message}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="password">New Password <span className="text-red-500">*</span></Label>
                      <Field name="password">
                        {({ field, meta }) => (
                          <div className="relative">
                            <Input
                              {...field}
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your new password"
                              className={`bg-white text-black dark:bg-gray-900 dark:text-white pr-10 ${meta.touched && meta.error ? 'border-red-500 focus:ring-red-500' : ''}`}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        )}
                      </Field>
                      <ErrorMessage name="password" component="div" className="text-sm text-red-600 dark:text-red-400" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                      <Field name="confirmPassword">
                        {({ field, meta }) => (
                          <div className="relative">
                            <Input
                              {...field}
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your new password"
                              className={`bg-white text-black dark:bg-gray-900 dark:text-white pr-10 ${meta.touched && meta.error ? 'border-red-500 focus:ring-red-500' : ''}`}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        )}
                      </Field>
                      <ErrorMessage name="confirmPassword" component="div" className="text-sm text-red-600 dark:text-red-400" />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                    </Button>
                    
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline"
                      >
                        Back to Login
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;