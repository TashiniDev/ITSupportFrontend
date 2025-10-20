# Toast Notification System Documentation

## Overview
This project uses a professional toast notification system built on top of `react-toastify`. The system provides a consistent and user-friendly way to display notifications throughout the application.

## Components
- **ToastProvider**: React component that provides toast functionality
- **toastService**: Main service for creating toast notifications
- **notificationService**: Legacy-compatible service that wraps toastService

## Basic Usage

### Import the service
```javascript
import toastService from '../services/toastService';
// OR
import notificationService from '../services/notification';
```

### Basic Toast Types
```javascript
// Success notification
toastService.success('Operation completed successfully!');

// Error notification
toastService.error('Something went wrong!');

// Warning notification
toastService.warning('Please check your input.');

// Info notification
toastService.info('New update available.');

// Loading notification
const loadingId = toastService.loading('Processing...');
```

### Advanced Usage

#### Promise-based Toasts
```javascript
const apiCall = fetch('/api/data');

toastService.promise(
  apiCall,
  {
    pending: 'Loading data...',
    success: 'Data loaded successfully!',
    error: 'Failed to load data!'
  }
);
```

#### Update Existing Toast
```javascript
const loadingId = toastService.loading('Starting process...');

// Later, update the toast
toastService.update(loadingId, {
  type: 'success',
  message: 'Process completed!',
  autoClose: 5000
});
```

#### Custom Options
```javascript
toastService.success('Custom toast!', {
  position: 'bottom-left',
  autoClose: 3000,
  hideProgressBar: true,
  closeOnClick: false,
  pauseOnHover: false
});
```

### Application-Specific Shortcuts

#### Authentication
```javascript
toastService.auth.loginSuccess('John Doe');
toastService.auth.loginError('Invalid credentials');
toastService.auth.logoutSuccess();
toastService.auth.passwordResetSent();
toastService.auth.sessionExpired();
```

#### IT Support
```javascript
toastService.support.ticketCreated('TK-12345');
toastService.support.ticketUpdated('TK-12345');
toastService.support.ticketClosed('TK-12345');
toastService.support.fileUploaded('document.pdf');
toastService.support.assignmentSuccess('John Smith');
```

#### System Operations
```javascript
toastService.system.saveSuccess();
toastService.system.saveError();
toastService.system.networkError();
toastService.system.serverError();
toastService.system.validationError('Please fill all required fields');
toastService.system.permissionDenied();
```

### Utility Methods
```javascript
// Dismiss specific toast
toastService.dismiss(toastId);

// Dismiss all toasts
toastService.dismissAll();

// Check if toast is still active
if (toastService.isActive(toastId)) {
  console.log('Toast is still showing');
}
```

## Integration Examples

### In React Components
```javascript
import React, { useState } from 'react';
import toastService from '../services/toastService';

const ExampleComponent = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    const loadingId = toastService.loading('Submitting form...');
    setLoading(true);

    try {
      const response = await submitForm(formData);
      
      toastService.update(loadingId, {
        type: 'success',
        message: 'Form submitted successfully!',
      });
      
    } catch (error) {
      toastService.update(loadingId, {
        type: 'error',
        message: error.message || 'Failed to submit form',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => toastService.success('Button clicked!')}>
        Show Success Toast
      </button>
    </div>
  );
};
```

### With API Calls
```javascript
import toastService from '../services/toastService';

const apiService = {
  async createTicket(ticketData) {
    const promise = fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData)
    });

    return toastService.promise(promise, {
      pending: 'Creating ticket...',
      success: 'Ticket created successfully!',
      error: 'Failed to create ticket'
    });
  },

  async login(credentials) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        const user = await response.json();
        toastService.auth.loginSuccess(user.name);
        return user;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toastService.auth.loginError(error.message);
      throw error;
    }
  }
};
```

## Styling
The toast system comes with professional styling that includes:
- Modern gradient backgrounds
- Smooth animations
- Responsive design
- Dark mode support
- Hover effects
- Custom progress bars

### Custom Styling
You can customize the appearance by modifying `src/styles/toast.css` or by passing custom className in options:

```javascript
toastService.success('Custom styled toast!', {
  className: 'my-custom-toast'
});
```

## Configuration
Default configuration can be modified in `src/components/ToastProvider.js` and `src/services/toastService.js`.

### Available Options
- `position`: Toast position on screen
- `autoClose`: Auto-close duration (ms) or false to disable
- `hideProgressBar`: Hide/show progress bar
- `closeOnClick`: Allow closing by clicking
- `pauseOnHover`: Pause auto-close on hover
- `draggable`: Allow dragging to dismiss
- `theme`: 'light' or 'dark'
- `transition`: Animation transition type

## Best Practices

1. **Use appropriate toast types**: Match the toast type to the message context
2. **Keep messages concise**: Short, clear messages work best
3. **Use loading toasts for async operations**: Provide feedback during API calls
4. **Update loading toasts**: Convert loading toasts to success/error when operations complete
5. **Use application-specific shortcuts**: Leverage the built-in shortcuts for common scenarios
6. **Don't overuse**: Avoid showing too many toasts simultaneously
7. **Handle errors gracefully**: Always show user-friendly error messages

## Troubleshooting

### Toast not showing
- Ensure ToastProvider is wrapped around your app
- Check that toast.css is imported
- Verify the toast container is not hidden by other elements

### Styling issues
- Check CSS import order
- Verify custom styles don't override toast styles
- Use browser dev tools to inspect toast elements

### Performance concerns
- Use `dismissAll()` to clear toasts when navigating
- Limit the number of simultaneous toasts (max 5 by default)
- Avoid creating toasts in rapid succession