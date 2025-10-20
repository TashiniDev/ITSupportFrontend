import toastService from './toastService';

// Legacy notification service that now uses the new toast system
// This maintains backward compatibility while providing enhanced functionality

class NotificationService {
  // Basic notification methods
  success(message, options) {
    return toastService.success(message, options);
  }

  error(message, options) {
    return toastService.error(message, options);
  }

  warning(message, options) {
    return toastService.warning(message, options);
  }

  info(message, options) {
    return toastService.info(message, options);
  }

  // Legacy method names for backward compatibility
  showSuccess(message, options) {
    return this.success(message, options);
  }

  showError(message, options) {
    return this.error(message, options);
  }

  showWarning(message, options) {
    return this.warning(message, options);
  }

  showInfo(message, options) {
    return this.info(message, options);
  }

  // Notification with loading state
  loading(message, options) {
    return toastService.loading(message, options);
  }

  // Update notification
  update(toastId, options) {
    return toastService.update(toastId, options);
  }

  // Promise-based notification
  promise(promise, messages, options) {
    return toastService.promise(promise, messages, options);
  }

  // Dismiss notifications
  dismiss(toastId) {
    return toastService.dismiss(toastId);
  }

  dismissAll() {
    return toastService.dismissAll();
  }

  // Application-specific notification shortcuts
  loginSuccess(username) {
    return toastService.auth.loginSuccess(username);
  }

  loginError(error) {
    return toastService.auth.loginError(error);
  }

  logoutSuccess() {
    return toastService.auth.logoutSuccess();
  }

  networkError() {
    return toastService.system.networkError();
  }

  serverError() {
    return toastService.system.serverError();
  }

  saveSuccess() {
    return toastService.system.saveSuccess();
  }

  saveError() {
    return toastService.system.saveError();
  }

  validationError(message) {
    return toastService.system.validationError(message);
  }

  permissionDenied() {
    return toastService.system.permissionDenied();
  }

  // IT Support specific notifications
  ticketCreated(ticketId) {
    return toastService.support.ticketCreated(ticketId);
  }

  ticketUpdated(ticketId) {
    return toastService.support.ticketUpdated(ticketId);
  }

  ticketClosed(ticketId) {
    return toastService.support.ticketClosed(ticketId);
  }

  fileUploaded(fileName) {
    return toastService.support.fileUploaded(fileName);
  }

  // Utility methods
  isActive(toastId) {
    return toastService.isActive(toastId);
  }

  // Get direct access to toast service for advanced usage
  get toastService() {
    return toastService;
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
export { NotificationService };