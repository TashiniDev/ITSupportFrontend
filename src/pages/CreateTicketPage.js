import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import toastService from '../services/toastService';
import lookupService from '../services/lookupService';
import { apiCall, API_ENDPOINTS } from '../utils/api/config';
import DashboardHeader from '../components/DashboardHeader';
import { LogoutDialog } from '../components/LogoutDialog';
import { X, Paperclip, FileText, Image, FileType } from 'lucide-react';

// Validation schema for the form
const validationSchema = Yup.object({
  fullName: Yup.string()
    .trim()
    .min(2, 'Requester name must be at least 2 characters')
    .max(100, 'Requester name must be less than 100 characters')
    .required('Requester name is required'),
  department: Yup.string()
    .required('Department is required'),
  company: Yup.string()
    .required('Company is required'),
  category: Yup.string()
    .required('Category is required'),
  assignedTo: Yup.string()
    .required('Assign to user is required'),
  severityLevel: Yup.string()
    .oneOf(['Low', 'Medium', 'High', 'Critical'], 'Please select a valid severity')
    .required('Severity level is required'),
  // Optional fields validation
  contactNumber: Yup.string()
    .matches(/^[0-9+\-\s()]*$/, 'Please enter a valid phone number'),
  description: Yup.string()
    .max(2000, 'Description must be less than 2000 characters')
}).test(
  'either-type-required',
  'Either Request Type or Issue Type must be selected',
  function(value) {
    const { requestType, issueType } = value;
    if ((!requestType || requestType === '') && (!issueType || issueType === '')) {
      return this.createError({
        path: 'requestType',
        message: 'Either Request Type or Issue Type must be selected'
      });
    }
    return true;
  }
);

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    contactNumber: '',
    department: '',
    company: '',
    category: '',
    assignedTo: '',
    issueType: '',
    requestType: '',
    severityLevel: '',
    description: '',
  });

  const [attachments, setAttachments] = useState([]);
  
  // State for dropdown data
  const [lookupData, setLookupData] = useState({
    departments: [],
    companies: [],
    categories: [],
    requestTypes: [],
    issueTypes: []
  });
  
  // Loading state for dropdowns
  const [isLoadingLookups, setIsLoadingLookups] = useState(true);
  const [lookupError, setLookupError] = useState(null);
  
  // State for users based on selected category
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(null);

  // State for request types based on selected category
  const [isLoadingRequestTypes, setIsLoadingRequestTypes] = useState(false);
  const [requestTypesError, setRequestTypesError] = useState(null);

  // State for issue types based on selected category
  const [isLoadingIssueTypes, setIsLoadingIssueTypes] = useState(false);
  const [issueTypesError, setIssueTypesError] = useState(null);

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Load lookup data on component mount
  useEffect(() => {
    const loadLookupData = async () => {
      try {
        setIsLoadingLookups(true);
        setLookupError(null);
        const data = await lookupService.getAllLookupData();
        setLookupData(data);
      } catch (error) {
        console.error('Failed to load lookup data:', error);
        setLookupError(error.message);
        toastService.error('Failed to load form data. Please try again.');
      } finally {
        setIsLoadingLookups(false);
      }
    };

    loadLookupData();
  }, []);

  // Load users when category changes
  useEffect(() => {
    const loadUsers = async () => {
      if (!form.category) {
        setUsers([]);
        setForm(prevForm => ({ ...prevForm, assignedTo: '' }));
        return;
      }

      try {
        setIsLoadingUsers(true);
        setUsersError(null);
        const usersData = await lookupService.getUsersByCategory(form.category);
        setUsers(Array.isArray(usersData) ? usersData : []);
        // Reset assigned user when category changes
        setForm(prevForm => ({ ...prevForm, assignedTo: '' }));
      } catch (error) {
        console.error('Failed to load users:', error);
        setUsersError(error.message);
        setUsers([]);
        toastService.error('Failed to load users for selected category');
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, [form.category]);

  // Load request types when category changes
  useEffect(() => {
    const loadRequestTypes = async () => {
      if (!form.category) {
        setLookupData(prevData => ({ 
          ...prevData, 
          requestTypes: [] 
        }));
        setForm(prevForm => ({ ...prevForm, requestType: '' }));
        return;
      }

      try {
        setIsLoadingRequestTypes(true);
        setRequestTypesError(null);
        const requestTypesData = await lookupService.getRequestTypesByCategory(form.category);
        setLookupData(prevData => ({ 
          ...prevData, 
          requestTypes: Array.isArray(requestTypesData) ? requestTypesData : [] 
        }));
        // Reset request type when category changes
        setForm(prevForm => ({ ...prevForm, requestType: '' }));
      } catch (error) {
        console.error('Failed to load request types:', error);
        setRequestTypesError(error.message);
        setLookupData(prevData => ({ 
          ...prevData, 
          requestTypes: [] 
        }));
        toastService.error('Failed to load request types for selected category');
      } finally {
        setIsLoadingRequestTypes(false);
      }
    };

    loadRequestTypes();
  }, [form.category]);

  // Load issue types when category changes
  useEffect(() => {
    const loadIssueTypes = async () => {
      if (!form.category) {
        setLookupData(prevData => ({ 
          ...prevData, 
          issueTypes: [] 
        }));
        setForm(prevForm => ({ ...prevForm, issueType: '' }));
        return;
      }

      try {
        setIsLoadingIssueTypes(true);
        setIssueTypesError(null);
        const issueTypesData = await lookupService.getIssueTypesByCategory(form.category);
        setLookupData(prevData => ({ 
          ...prevData, 
          issueTypes: Array.isArray(issueTypesData) ? issueTypesData : [] 
        }));
        // Reset issue type when category changes
        setForm(prevForm => ({ ...prevForm, issueType: '' }));
      } catch (error) {
        console.error('Failed to load issue types:', error);
        setIssueTypesError(error.message);
        setLookupData(prevData => ({ 
          ...prevData, 
          issueTypes: [] 
        }));
        toastService.error('Failed to load issue types for selected category');
      } finally {
        setIsLoadingIssueTypes(false);
      }
    };

    loadIssueTypes();
  }, [form.category]);

  // Retry loading lookup data
  const retryLoadLookupData = () => {
    const loadLookupData = async () => {
      try {
        setIsLoadingLookups(true);
        setLookupError(null);
        const data = await lookupService.getAllLookupData();
        setLookupData(data);
        toastService.success('Form data loaded successfully');
      } catch (error) {
        console.error('Failed to load lookup data:', error);
        setLookupError(error.message);
        toastService.error('Failed to load form data. Please try again.');
      } finally {
        setIsLoadingLookups(false);
      }
    };

    loadLookupData();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // If user selects a requestType, clear issueType and vice-versa so only one can be active
    if (name === 'requestType' && value) {
      setForm((s) => ({ ...s, requestType: value, issueType: '' }));
      // clear validation errors for both fields
      setValidationErrors((prev) => ({ ...prev, requestType: '', issueType: '' }));
      return;
    }

    if (name === 'issueType' && value) {
      setForm((s) => ({ ...s, issueType: value, requestType: '' }));
      // clear validation errors for both fields
      setValidationErrors((prev) => ({ ...prev, issueType: '', requestType: '' }));
      return;
    }

    setForm((s) => ({ ...s, [name]: value }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFile = (e) => {
    const files = Array.from(e.target.files || []);
    const allowedTypes = [
      'image/png', 'image/jpg', 'image/jpeg', 
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const validFiles = [];
    const invalidFiles = [];

    files.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        invalidFiles.push({ file: file.name, reason: 'Invalid file type' });
      } else if (file.size > maxSize) {
        invalidFiles.push({ file: file.name, reason: 'File too large (max 10MB)' });
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      const errorMessage = invalidFiles.map(item => `${item.file}: ${item.reason}`).join('\n');
      toastService.error(`Some files could not be uploaded:\n${errorMessage}`);
    }

    if (validFiles.length > 0) {
      setAttachments((a) => [...a, ...validFiles]);
      toastService.success(`${validFiles.length} file(s) uploaded successfully`);
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(extension)) {
      return <Image className="h-4 w-4 text-blue-500" />;
    } else if (['pdf'].includes(extension)) {
      return <FileType className="h-4 w-4 text-red-500" />;
    } else if (['doc', 'docx', 'txt'].includes(extension)) {
      return <FileText className="h-4 w-4 text-blue-600" />;
    } else {
      return <Paperclip className="h-4 w-4 text-gray-400" />;
    }
  };

  const isImageFile = (file) => {
    return file.type.startsWith('image/');
  };

  const createImagePreview = (file) => {
    return URL.createObjectURL(file);
  };

  const removeAttachment = (indexToRemove) => {
    const removedFile = attachments[indexToRemove];
    setAttachments((a) => a.filter((_, index) => index !== indexToRemove));
    toastService.success(`Removed ${removedFile.name}`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      // Create a fake event object to reuse the existing handleFile logic
      const fakeEvent = {
        target: { files: files }
      };
      handleFile(fakeEvent);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Clear previous validation errors
      setValidationErrors({});
      setIsSubmitting(true);
      
      // Validate form data against schema
      await validationSchema.validate(form, { abortEarly: false });
      
      // If validation passes, proceed with form submission
      const toastId = toastService.loading('Creating ticket...');

      // Build FormData to include attachments
      const formData = new FormData();
      // Append text fields
      formData.append('fullName', form.fullName || '');
      if (form.contactNumber) formData.append('contactNumber', form.contactNumber);
      if (form.department) formData.append('department', form.department);
      if (form.company) formData.append('company', form.company);
      if (form.category) formData.append('category', form.category);
      if (form.assignedTo) formData.append('assignedTo', form.assignedTo);
      if (form.issueType) formData.append('issueType', form.issueType);
      if (form.requestType) formData.append('requestType', form.requestType);
      if (form.severityLevel) {
        // Send a single severityLevel field normalized to uppercase so backends
        // receiving it get a canonical value (LOW/MEDIUM/HIGH/CRITICAL).
        formData.append('severityLevel', String(form.severityLevel).toUpperCase());
      }
      if (form.description) formData.append('description', form.description);

      // Append files. Many backends accept multiple parts with same key 'attachments'
      if (attachments && attachments.length > 0) {
        attachments.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      try {
        // POST to tickets endpoint
        const response = await apiCall(API_ENDPOINTS.TICKETS, {
          method: 'POST',
          body: formData
        });

        toastService.dismiss(toastId);
        
        // Show success message with ticket ID if available
        const ticketId = response?.ticketId || response?.id || response?.data?.id;
        if (ticketId) {
          toastService.success(`Ticket created successfully! ID: ${ticketId}`);
        } else {
          toastService.success('Ticket created successfully');
        }
        
        navigate('/dashboard');
      } catch (err) {
        toastService.dismiss(toastId);
        console.error('Ticket creation failed:', err);
        toastService.error(err.message || 'Failed to create ticket');
      }
      
      setIsSubmitting(false);
      
    } catch (error) {
      if (error.name === 'ValidationError') {
        // Handle Yup validation errors
        const errors = {};
        error.inner.forEach((err) => {
          errors[err.path] = err.message;
        });
        setValidationErrors(errors);

        // Show general error message
        toastService.error('Please fix the validation errors below');

        // Reset submitting flag so submit button returns to normal
        setIsSubmitting(false);
      } else {
        // Handle other errors
        console.error('Form submission error:', error);
        toastService.error('An error occurred while creating the ticket');
        setIsSubmitting(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      // First, immediately clear authentication state
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      // Close the dialog
      setShowLogoutDialog(false);
      
      // Show logout success message
      toastService.auth.logoutSuccess();
      
      // Small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, ensure we clean up and redirect
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      setShowLogoutDialog(false);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <DashboardHeader onLogout={() => setShowLogoutDialog(true)} />
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Button onClick={() => navigate(-1)} variant="ghost">&larr; Back to Tickets</Button>
          <h1 className="text-3xl font-bold mt-4 text-gray-900 dark:text-white">Create New Support Ticket</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">Fill out all details for faster resolution</p>
        </div>

        <form onSubmit={handleSubmit}>
          {isLoadingLookups && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-700">Loading form data...</span>
              </div>
            </div>
          )}

          {lookupError && !isLoadingLookups && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="text-red-600">⚠️</div>
                  <span className="text-red-700">Failed to load form data</span>
                </div>
                <Button 
                  onClick={retryLoadLookupData} 
                  variant="ghost" 
                  className="text-red-600 hover:text-red-800"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}
          
          <Card className="mb-4 dark:bg-[rgb(8,10,12)] dark:border-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="text-xl text-gray-900 dark:text-white">Personal Information</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Requester Name *</Label>
                  <Input 
                    name="fullName" 
                    value={form.fullName} 
                    onChange={handleChange} 
                    placeholder="Your full name"
                    className={validationErrors.fullName ? 'border-red-500' : ''}
                  />
                  {validationErrors.fullName && (
                    <div className="text-sm text-red-600 mt-1">
                      {validationErrors.fullName}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Contact Number</Label>
                  <Input 
                    name="contactNumber" 
                    value={form.contactNumber} 
                    onChange={handleChange} 
                    placeholder="Your contact number (optional)"
                    className={validationErrors.contactNumber ? 'border-red-500' : ''}
                  />
                  {validationErrors.contactNumber && (
                    <div className="text-sm text-red-600 mt-1">
                      {validationErrors.contactNumber}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-4 dark:bg-[rgb(8,10,12)] dark:border-gray-800">
            <CardHeader>
              <div className="text-xl text-gray-900 dark:text-white">Company & Department</div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Department *</Label>
                  <Select 
                    name="department" 
                    value={form.department} 
                    onChange={handleChange} 
                    disabled={isLoadingLookups}
                    className={validationErrors.department ? 'border-red-500' : ''}
                  >
                    <option value="">
                      {isLoadingLookups ? 'Loading departments...' : 'Select your department'}
                    </option>
                    {Array.isArray(lookupData.departments) && lookupData.departments.map((dept, index) => (
                      <option key={dept.Id || dept.id || dept.value || dept._id || index} value={dept.Id || dept.id || dept.value || dept._id}>
                        {dept.Name || dept.name || dept.label || dept.title || dept.departmentName || `Department ${index + 1}`}
                      </option>
                    ))}
                    {(!Array.isArray(lookupData.departments) || lookupData.departments.length === 0) && !isLoadingLookups && (
                      <option disabled>No departments available</option>
                    )}
                  </Select>
                  {validationErrors.department && (
                    <div className="text-sm text-red-600 mt-1">
                      {validationErrors.department}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Company *</Label>
                  <Select 
                    name="company" 
                    value={form.company} 
                    onChange={handleChange} 
                    disabled={isLoadingLookups}
                    className={validationErrors.company ? 'border-red-500' : ''}
                  >
                    <option value="">
                      {isLoadingLookups ? 'Loading companies...' : 'Select company'}
                    </option>
                    {Array.isArray(lookupData.companies) && lookupData.companies.map((company, index) => (
                      <option key={company.Id || company.id || company.value || company._id || index} value={company.Id || company.id || company.value || company._id}>
                        {company.Name || company.name || company.label || company.title || company.companyName || `Company ${index + 1}`}
                      </option>
                    ))}
                    {(!Array.isArray(lookupData.companies) || lookupData.companies.length === 0) && !isLoadingLookups && (
                      <option disabled>No companies available</option>
                    )}
                  </Select>
                  {validationErrors.company && (
                    <div className="text-sm text-red-600 mt-1">
                      {validationErrors.company}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-4 dark:bg-[rgb(8,10,12)] dark:border-gray-800">
            <CardHeader>
              <div className="text-xl text-gray-900 dark:text-white">Issue Classification</div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Select 
                    name="category" 
                    value={form.category} 
                    onChange={handleChange} 
                    disabled={isLoadingLookups}
                    className={validationErrors.category ? 'border-red-500' : ''}
                  >
                    <option value="">
                      {isLoadingLookups ? 'Loading categories...' : 'Select category'}
                    </option>
                    {Array.isArray(lookupData.categories) && lookupData.categories.map((category, index) => (
                      <option key={category.Id || category.id || category.value || category._id || index} value={category.Id || category.id || category.value || category._id}>
                        {category.Name || category.name || category.label || category.title || category.categoryName || `Category ${index + 1}`}
                      </option>
                    ))}
                    {(!Array.isArray(lookupData.categories) || lookupData.categories.length === 0) && !isLoadingLookups && (
                      <option disabled>No categories available</option>
                    )}
                  </Select>
                  {validationErrors.category && (
                    <div className="text-sm text-red-600 mt-1">
                      {validationErrors.category}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Assign To *</Label>
                  <Select 
                    name="assignedTo" 
                    value={form.assignedTo} 
                    onChange={handleChange} 
                    disabled={isLoadingUsers || !form.category}
                    className={validationErrors.assignedTo ? 'border-red-500' : ''}
                  >
                    <option value="">
                      {!form.category 
                        ? 'Select category first' 
                        : isLoadingUsers 
                          ? 'Loading users...' 
                          : 'Select user to assign'
                      }
                    </option>
                    {Array.isArray(users) && users.map((user, index) => (
                      <option key={user.Id || user.id || user._id || index} value={user.Id || user.id || user._id}>
                        {user.Name || user.name || user.fullName || user.username || `User ${index + 1}`}
                      </option>
                    ))}
                    {(!Array.isArray(users) || users.length === 0) && !isLoadingUsers && form.category && (
                      <option disabled>No users available for this category</option>
                    )}
                  </Select>
                  {validationErrors.assignedTo && (
                    <div className="text-sm text-red-600 mt-1">
                      {validationErrors.assignedTo}
                    </div>
                  )}
                  {usersError && (
                    <div className="text-sm text-red-600 mt-1">
                      {usersError}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Issue Type *</Label>
                    <Select 
                      name="issueType" 
                      value={form.issueType} 
                      onChange={handleChange} 
                      disabled={isLoadingIssueTypes || !form.category || !!form.requestType}
                      className={validationErrors.issueType ? 'border-red-500' : ''}
                    >
                      <option value="">
                        {!form.category 
                          ? 'Select category first' 
                          : isLoadingIssueTypes 
                            ? 'Loading issue types...' 
                            : 'Select issue type'
                        }
                      </option>
                      {Array.isArray(lookupData.issueTypes) && lookupData.issueTypes.map((issueType, index) => (
                        <option key={issueType.Id || issueType.id || issueType.value || issueType._id || index} value={issueType.Id || issueType.id || issueType.value || issueType._id}>
                          {issueType.Name || issueType.name || issueType.label || issueType.title || issueType.typeName || `Issue Type ${index + 1}`}
                        </option>
                      ))}
                      {(!Array.isArray(lookupData.issueTypes) || lookupData.issueTypes.length === 0) && !isLoadingIssueTypes && form.category && (
                        <option disabled>No issue types available for this category</option>
                      )}
                    </Select>
                    {issueTypesError && (
                      <div className="text-sm text-red-600 mt-1">
                        {issueTypesError}
                      </div>
                    )}
                    {validationErrors.issueType && (
                      <div className="text-sm text-red-600 mt-1">
                        {validationErrors.issueType}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Request Type *</Label>
                    <Select 
                      name="requestType" 
                      value={form.requestType} 
                      onChange={handleChange} 
                      disabled={isLoadingRequestTypes || !form.category || !!form.issueType}
                      className={validationErrors.requestType ? 'border-red-500' : ''}
                    >
                      <option value="">
                        {!form.category 
                          ? 'Select category first' 
                          : isLoadingRequestTypes 
                            ? 'Loading request types...' 
                            : 'Select request type'
                        }
                      </option>
                      {Array.isArray(lookupData.requestTypes) && lookupData.requestTypes.map((requestType, index) => (
                        <option key={requestType.Id || requestType.id || requestType.value || requestType._id || index} value={requestType.Id || requestType.id || requestType.value || requestType._id}>
                          {requestType.Name || requestType.name || requestType.label || requestType.title || requestType.typeName || `Request Type ${index + 1}`}
                        </option>
                      ))}
                      {(!Array.isArray(lookupData.requestTypes) || lookupData.requestTypes.length === 0) && !isLoadingRequestTypes && form.category && (
                        <option disabled>No request types available for this category</option>
                      )}
                    </Select>
                    {requestTypesError && (
                      <div className="text-sm text-red-600 mt-1">
                        {requestTypesError}
                      </div>
                    )}
                    {validationErrors.requestType && (
                      <div className="text-sm text-red-600 mt-1">
                        {validationErrors.requestType}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Severity Level *</Label>
                  <Select 
                    name="severityLevel" 
                    value={form.severityLevel} 
                    onChange={handleChange}
                    className={validationErrors.severityLevel ? 'border-red-500' : ''}
                  >
                      <option value="">Select severity level</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </Select>
                  {validationErrors.severityLevel && (
                    <div className="text-sm text-red-600 mt-1">
                      {validationErrors.severityLevel}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-4 dark:bg-[rgb(8,10,12)] dark:border-gray-800">
            <CardHeader>
              <div className="text-xl text-gray-900 dark:text-white">Issue Description</div>
            </CardHeader>
            <CardContent>
              <Label>Detailed Problem Description</Label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={6} className="w-full rounded-md border-gray-200 bg-gray-50 p-3 dark:bg-[rgb(6,8,10)] dark:border-gray-800 dark:text-gray-200" placeholder="Please provide (optional):\n- What exactly happened?\n- When did it start?\n- Steps you've already tried\n- Any error messages\n- Impact on your work" />
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <div className="text-xl text-gray-900 dark:text-white">Screenshots & Attachments</div>
            </CardHeader>
            <CardContent>
              <div 
                className="border-dashed border-2 border-gray-200 rounded-md p-6 text-center dark:border-gray-800 dark:bg-[rgb(6,8,10)] hover:border-blue-300 transition-colors"
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="space-y-2">
                  <Paperclip className="h-8 w-8 text-gray-400 mx-auto" />
                  <div>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-blue-600 hover:text-blue-500">
                        Choose Files
                      </span>
                      <input 
                        id="file-upload"
                        type="file" 
                        multiple 
                        onChange={handleFile}
                        className="hidden"
                        accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.txt"
                      />
                    </label>
                  </div>
                  <div className="text-sm text-gray-500">Click to upload files or drag and drop. Screenshots, PNG, JPG, PDF, DOC, TXT files up to 10MB</div>
                </div>
              </div>
              
              {/* Attachment List */}
              {attachments.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Attached Files ({attachments.length})
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAttachments([]);
                        toastService.success('All attachments removed');
                      }}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {attachments.map((file, index) => (
                      <div 
                        key={index}
                        className="relative flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm min-w-[140px] max-w-[160px] overflow-hidden"
                      >
                        {/* Remove button - positioned at top right */}
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="absolute top-2 right-2 z-20 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white w-7 h-7 rounded-full shadow-lg border-2 border-white flex items-center justify-center transition-all duration-200 cursor-pointer transform hover:scale-110"
                          style={{ zIndex: 20 }}
                        >
                          <X className="h-4 w-4 stroke-2 text-white" />
                        </button>
                        
                        {/* File preview/icon */}
                        <div className="p-3 flex items-center justify-center h-24 bg-gray-50 dark:bg-gray-700">
                          {isImageFile(file) ? (
                            <img 
                              src={createImagePreview(file)} 
                              alt={file.name}
                              className="max-h-full max-w-full object-contain rounded"
                            />
                          ) : (
                            <div className="text-center">
                              {getFileIcon(file.name)}
                              <div className="text-xs text-gray-500 mt-1 uppercase font-semibold">
                                {file.name.split('.').pop()}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* File info */}
                        <div className="p-2 bg-gray-50 dark:bg-gray-700 border-t">
                          <div className="text-xs font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                            {file.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ({Math.round(file.size / 1024)} KB)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center space-x-3">
            <Button 
              type="submit" 
              className="bg-blue-600 text-white" 
              disabled={isLoadingLookups || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : (isLoadingLookups ? 'Loading...' : 'Create Ticket')}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>Cancel</Button>
          </div>
        </form>
      </div>

      <LogoutDialog 
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogout}
      />
    </div>
  );
}
