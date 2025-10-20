import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { apiCall, API_ENDPOINTS } from '../utils/api/config';
import toastService from '../services/toastService';

const forgotSchema = Yup.object({
  email: Yup.string().email('Please enter a valid email address').required('Email is required'),
});

export const ForgotPasswordModal = ({ open, onClose }) => {
  if (!open) return null;

  const handleSubmit = async (values, { setSubmitting, setStatus, resetForm }) => {
    // Show loading toast
    const loadingToastId = toastService.loading('Sending password reset link...');
    
    try {
      setStatus(null);
      await apiCall(API_ENDPOINTS.FORGOT_PASSWORD, {
        method: 'POST',
        body: JSON.stringify({ email: values.email })
      });

      // Update loading toast to success
      toastService.update(loadingToastId, {
        type: 'success',
        message: 'Password reset link sent successfully! Check your email.',
        autoClose: 5000
      });

      setStatus({ type: 'success', message: 'Password reset link sent. Check your email.' });
      
      // Clear form and close modal after success
      resetForm();
      setTimeout(() => {
        onClose();
      }, 3000);
      
    } catch (err) {
      // Update loading toast to error
      toastService.update(loadingToastId, {
        type: 'error',
        message: err.message || 'Failed to send password reset link. Please try again.',
        autoClose: 6000
      });
      
      setStatus({ type: 'error', message: err.message || 'Failed to send reset link' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-gray-800 text-white rounded shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <div>
              <h3 className="text-lg font-semibold">Forgot Password</h3>
              <p className="text-sm text-gray-300">Enter your email address to receive a password reset link.</p>
            </div>
            <button onClick={onClose} className="text-gray-300 hover:text-white">✕</button>
          </div>

          <div className="p-4">
            <Formik
              initialValues={{ email: '' }}
              validationSchema={forgotSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, status }) => (
                <Form className="space-y-4">
                  {status && (
                    <div className={`p-3 text-sm rounded-md ${status.type === 'error' ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : 'text-green-600 bg-green-50 dark:bg-green-900/20'}`}>
                      {status.message}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                    <Field name="email">
                      {({ field, meta }) => (
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          required
                          placeholder="Enter your email"
                          className={`bg-white text-black dark:bg-gray-900 dark:text-white ${meta.touched && meta.error ? 'border-red-500 focus:ring-red-500' : ''}`}
                        />
                      )}
                    </Field>
                    <ErrorMessage name="email" component="div" className="text-sm text-red-600 dark:text-red-400" />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send Reset Link'}</Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
