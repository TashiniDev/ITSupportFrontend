import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { Eye, EyeOff } from 'lucide-react';
import toastService from '../services/toastService';

// Validation schema for registration form
const registerValidationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .required('Full name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  role: Yup.string()
    .required('Please select a role'),
    category: Yup.string()
      .when('role', {
        is: (val) => String(val) === '2' || val === 2, // IT Team Member (role id = 2)
        then: (schema) => schema.required('Please select an IT category'),
        otherwise: (schema) => schema.nullable()
      }),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
    .matches(/^(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .matches(/^(?=.*\d)/, 'Password must contain at least one number')
    .matches(/^(?=.*[@$!%*?&])/, 'Password must contain at least one special character (@$!%*?&)')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password')
});

export const RegisterForm = ({ onRegister, onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Role options based on your backend
  const roleOptions = [
  { value: '1', label: 'Ticket Creator' },
  { value: '2', label: 'IT Team' },
  { value: '3', label: 'IT Head' }
  ];

  // Category options (sourced from the database; ids and labels match the provided rows)
  const categoryOptions = [
    { value: '1', label: 'Power Apps' },
    { value: '2', label: 'Server Application' },
    { value: '3', label: 'HRIS' },
    { value: '4', label: 'Development' },
    { value: '5', label: 'Network' },
    { value: '6', label: 'Hardware' },
    { value: '7', label: 'Development & Power Apps' },
    { value: '8', label: 'Network & Hardware' }
  ];

  const handleSubmit = async (values, { setSubmitting, setFieldError, setStatus, resetForm }) => {
    // Show loading toast
    const loadingToastId = toastService.loading('Creating your account...');
    
    try {
      setStatus(null);
      
      const userData = {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role || null,
        category: values.category || null
      };

      await onRegister(userData);
      
      // Update loading toast to success
      toastService.update(loadingToastId, {
        type: 'success',
        message: 'Account created successfully! Please check your email for verification.',
        autoClose: 4000
      });
      
      setStatus({
        type: 'success',
        message: 'Registration successful! Please check your email for verification.'
      });
      
      // Clear form
      resetForm();

      // Switch to login tab after 2 seconds
      setTimeout(() => {
        toastService.info('Please login with your credentials to continue.');
        onSuccess();
      }, 2000);

    } catch (err) {
      // Update loading toast to error
      toastService.update(loadingToastId, {
        type: 'error',
        message: err.message || 'Registration failed. Please try again.',
        autoClose: 6000
      });
      
      // Set field-specific errors if the API returns them
      if (err.message.toLowerCase().includes('email')) {
        setFieldError('email', err.message);
        toastService.warning('Please check your email address.');
      } else if (err.message.toLowerCase().includes('password')) {
        setFieldError('password', err.message);
        toastService.warning('Please check your password requirements.');
      } else {
        setStatus({
          type: 'error',
          message: err.message || 'Registration failed'
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        category: ''
      }}
      validationSchema={registerValidationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, errors, touched, status, values }) => (
        <Form className="space-y-4">
          {status && (
            <div className={`p-3 text-sm rounded-md ${
              status.type === 'error' 
                ? 'text-red-600 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                : 'text-green-600 bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
            }`}>
              {status.message}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Field name="name">
              {({ field, meta }) => (
                <Input
                  {...field}
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className={`bg-white text-black dark:bg-gray-900 dark:text-white ${meta.touched && meta.error ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
              )}
            </Field>
            <ErrorMessage name="name" component="div" className="text-sm text-red-600 dark:text-red-400" />
          </div>
          
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
            <Label htmlFor="role">Role</Label>
            <Field name="role">
              {({ field, meta }) => (
                <Select
                  {...field}
                  id="role"
                  className={meta.touched && meta.error ? 'border-red-500 focus:ring-red-500' : ''}
                >
                  <option value="">Select a role</option>
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <ErrorMessage name="role" component="div" className="text-sm text-red-600 dark:text-red-400" />
          </div>
          
          {(values.role === '2' || String(values.role) === '2') && ( // Show category only for IT Team Members (role value '2')
            <div className="space-y-2">
              <Label htmlFor="category">IT Category</Label>
              <Field name="category">
                {({ field, meta }) => (
                  <Select
                    {...field}
                    id="category"
                    className={meta.touched && meta.error ? 'border-red-500 focus:ring-red-500' : ''}
                  >
                    <option value="">Select a category</option>
                    {categoryOptions.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <ErrorMessage name="category" component="div" className="text-sm text-red-600 dark:text-red-400" />
            </div>
          )}
          
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
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Password must contain: 8+ characters, uppercase, lowercase, number, and special character
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Field name="confirmPassword">
              {({ field, meta }) => (
                <div className="relative">
                  <Input
                    {...field}
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
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
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};