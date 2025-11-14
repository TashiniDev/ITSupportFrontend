import { toast } from 'react-toastify';

// Toast configuration constants
const TOAST_CONFIG = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
};

// Toast service class for better organization
class ToastService {
  // Success toast
  success(message, options = {}) {
    return toast.success(message, { 
      ...TOAST_CONFIG, 
      ...options,
      className: 'toast-success'
    });
  }

  // Error toast
  error(message, options = {}) {
    return toast.error(message, { 
      ...TOAST_CONFIG, 
      autoClose: 7000, // Longer duration for errors
      ...options,
      className: 'toast-error'
    });
  }

  // Warning toast
  warning(message, options = {}) {
    return toast.warning(message, { 
      ...TOAST_CONFIG, 
      autoClose: 6000,
      ...options,
      className: 'toast-warning'
    });
  }

  // Info toast
  info(message, options = {}) {
    return toast.info(message, { 
      ...TOAST_CONFIG, 
      ...options,
      className: 'toast-info'
    });
  }

  // Loading toast (returns toast id for updates)
  loading(message = "Loading...", options = {}) {
    return toast.loading(message, { 
      ...TOAST_CONFIG, 
      autoClose: false,
      ...options,
      className: 'toast-loading'
    });
  }

  // Promise-based toast for async operations
  promise(promise, messages = {}, options = {}) {
    const defaultMessages = {
      pending: 'Processing...',
      success: 'Operation completed successfully!',
      error: 'Operation failed!'
    };

    return toast.promise(
      promise,
      { ...defaultMessages, ...messages },
      { ...TOAST_CONFIG, ...options }
    );
  }

  // Update existing toast
  update(toastId, options) {
    return toast.update(toastId, {
      ...TOAST_CONFIG,
      ...options,
      render: options.message || options.render,
      type: options.type || 'default',
      isLoading: false,
      autoClose: options.autoClose !== false ? 5000 : false
    });
  }

  // Dismiss specific toast
  dismiss(toastId) {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }

  // Dismiss all toasts
  dismissAll() {
    toast.dismiss();
  }

  // Check if toast is active
  isActive(toastId) {
    return toast.isActive(toastId);
  }

  // Custom toast for specific use cases
  custom(message, type = 'default', options = {}) {
    return toast(message, {
      ...TOAST_CONFIG,
      type,
      ...options,
      className: `toast-${type}`
    });
  }

  // Authentication related toasts
  auth = {
    loginSuccess: (username) => this.success(`Welcome back, ${username}!`),
    loginError: (error) => this.error(error || 'Login failed. Please check your credentials.'),
    logoutSuccess: () => this.success('You have been logged out successfully.'),
    registerSuccess: () => this.success('Account created successfully! Please verify your email.'),
    registerError: (error) => this.error(error || 'Registration failed. Please try again.'),
    passwordResetSent: () => this.success('Password reset link sent to your email.'),
    passwordResetError: (error) => this.error(error || 'Failed to send password reset email.'),
    emailVerified: () => this.success('Email verified successfully!'),
    sessionExpired: () => this.warning('Your session has expired. Please log in again.')
  };

  // IT Support specific toasts
  support = {
    ticketCreated: (ticketId) => this.success(`Support ticket #${ticketId} created successfully!`),
    ticketUpdated: (ticketId) => this.success(`Ticket #${ticketId} updated successfully!`),
    ticketClosed: (ticketId) => this.info(`Ticket #${ticketId} has been closed.`),
    assignmentSuccess: (technician) => this.success(`Ticket assigned to ${technician}.`),
    statusChanged: (status) => this.info(`Ticket status changed to ${status}.`),
    commentAdded: () => this.success('Comment added successfully!'),
    fileUploaded: (fileName) => this.success(`File "${fileName}" uploaded successfully!`), 
    severityChanged: (severity) => this.warning(`Ticket severity changed to ${severity}.`)
  };

  // System/Application toasts
  system = {
    saveSuccess: () => this.success('Changes saved successfully!'),
    saveError: () => this.error('Failed to save changes. Please try again.'),
    deleteSuccess: (item) => this.success(`${item} deleted successfully!`),
    deleteError: () => this.error('Failed to delete. Please try again.'),
    networkError: () => this.error('Network error. Please check your connection.'),
    serverError: () => this.error('Server error. Please try again later.'),
    validationError: (message) => this.warning(message || 'Please check your input.'),
    permissionDenied: () => this.error('You don\'t have permission to perform this action.'),
    maintenanceMode: () => this.warning('System is under maintenance. Some features may be unavailable.')
  };
}

// Create and export a singleton instance
const toastService = new ToastService();

export default toastService;
export { ToastService };