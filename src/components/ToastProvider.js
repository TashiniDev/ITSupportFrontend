import React from 'react';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom toast configuration
const toastConfig = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
  transition: Bounce,
};

// Toast service with different notification types
export const toastService = {
  success: (message, options = {}) => {
    toast.success(message, { ...toastConfig, ...options });
  },
  
  error: (message, options = {}) => {
    toast.error(message, { ...toastConfig, ...options });
  },
  
  warning: (message, options = {}) => {
    toast.warning(message, { ...toastConfig, ...options });
  },
  
  info: (message, options = {}) => {
    toast.info(message, { ...toastConfig, ...options });
  },
  
  // Custom toast with custom styling
  custom: (message, type = 'default', options = {}) => {
    toast(message, { 
      ...toastConfig, 
      className: `toast-${type}`,
      ...options 
    });
  },
  
  // Promise-based toast for async operations
  promise: (promise, messages, options = {}) => {
    return toast.promise(
      promise,
      {
        pending: messages.pending || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Something went wrong!'
      },
      { ...toastConfig, ...options }
    );
  },
  
  // Dismiss all toasts
  dismissAll: () => {
    toast.dismiss();
  },
  
  // Update existing toast
  update: (toastId, options) => {
    toast.update(toastId, options);
  }
};

// ToastProvider component
const ToastProvider = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
        className="toast-container"
        toastClassName="toast-item"
        bodyClassName="toast-body"
        progressClassName="toast-progress"
        limit={5}
      />
    </>
  );
};

export default ToastProvider;