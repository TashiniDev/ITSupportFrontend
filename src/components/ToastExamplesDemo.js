import React from 'react';
import toastService from '../services/toastService';

// Example component showing how to use toast notifications
const ToastExamplesDemo = () => {
  
  const showBasicToasts = () => {
    toastService.success('This is a success message!');
    setTimeout(() => toastService.error('This is an error message!'), 1000);
    setTimeout(() => toastService.warning('This is a warning message!'), 2000);
    setTimeout(() => toastService.info('This is an info message!'), 3000);
  };

  const showAuthenticationToasts = () => {
    // Authentication related toasts
    toastService.auth.loginSuccess('John Doe');
    setTimeout(() => toastService.auth.logoutSuccess(), 2000);
    setTimeout(() => toastService.auth.sessionExpired(), 4000);
  };

  const showLoadingToast = () => {
    const loadingId = toastService.loading('Processing your request...');
    
    // Simulate API call
    setTimeout(() => {
      toastService.update(loadingId, {
        type: 'success',
        message: 'Request completed successfully!',
        autoClose: 3000
      });
    }, 3000);
  };

  const showPromiseToast = () => {
    // Simulate an API call
    const apiCall = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 ? resolve('Success!') : reject(new Error('Failed!'));
      }, 2000);
    });

    toastService.promise(apiCall, {
      pending: 'Loading data...',
      success: 'Data loaded successfully! 🎉',
      error: 'Failed to load data 😞'
    });
  };

  const showITSupportToasts = () => {
    toastService.support.ticketCreated('TK-12345');
    setTimeout(() => toastService.support.assignmentSuccess('John Smith'), 1500);
    setTimeout(() => toastService.support.fileUploaded('screenshot.png'), 3000);
  };

  const showSystemToasts = () => {
    toastService.system.saveSuccess();
    setTimeout(() => toastService.system.networkError(), 1500);
    setTimeout(() => toastService.system.validationError('Please fill all required fields'), 3000);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Toast Notification Examples</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button 
          onClick={showBasicToasts}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Show Basic Toasts
        </button>

        <button 
          onClick={showAuthenticationToasts}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Show Auth Toasts
        </button>

        <button 
          onClick={showLoadingToast}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Show Loading Toast
        </button>

        <button 
          onClick={showPromiseToast}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Show Promise Toast
        </button>

        <button 
          onClick={showITSupportToasts}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
        >
          Show IT Support Toasts
        </button>

        <button 
          onClick={showSystemToasts}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Show System Toasts
        </button>

        <button 
          onClick={() => toastService.dismissAll()}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Dismiss All Toasts
        </button>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Authentication Flow Examples:</h3>
        <ul className="text-sm space-y-1">
          <li>• Login: Shows loading → success/error with user name</li>
          <li>• Register: Shows loading → success with email verification notice</li>
          <li>• Forgot Password: Shows loading → success with email check notice</li>
          <li>• Tab switching: Shows helpful info messages</li>
          <li>• Session expired: Shows warning when token expires</li>
        </ul>
      </div>
    </div>
  );
};

export default ToastExamplesDemo;