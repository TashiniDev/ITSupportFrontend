import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Eye, EyeOff } from 'lucide-react';
import toastService from '../services/toastService';

// Validation schema for login form
const loginValidationSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters long')
    .required('Password is required')
});

export const LoginForm = ({ onLogin, onOpenForgot }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    // Show loading toast
    const loadingToastId = toastService.loading('Signing you in...');
    
    try {
      await onLogin(values.email, values.password);
      
      // Update loading toast to success
      toastService.update(loadingToastId, {
        type: 'success',
        message: 'Login successful! Redirecting...',
        autoClose: 2000
      });
      
    } catch (err) {
      // Update loading toast to error
      toastService.update(loadingToastId, {
        type: 'error',
        message: err.message || 'Login failed. Please check your credentials.',
        autoClose: 5000
      });
      
      // Set field-specific errors if the API returns them
      if (err.message.toLowerCase().includes('email')) {
        setFieldError('email', err.message);
      } else if (err.message.toLowerCase().includes('password')) {
        setFieldError('password', err.message);
      } else {
        setFieldError('email', err.message || 'Login failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{
        email: '',
        password: ''
      }}
      validationSchema={loginValidationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Field name="email">
              {({ field, meta }) => (
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className={`bg-white text-black dark:bg-gray-900 dark:text-white ${meta.touched && meta.error ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
              )}
            </Field>
            <ErrorMessage name="email" component="div" className="text-sm text-red-600 dark:text-red-400" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Field name="password">
              {({ field, meta }) => (
                <div className="relative">
                  <Input
                    {...field}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => onOpenForgot?.()}
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              Forgot your password?
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};