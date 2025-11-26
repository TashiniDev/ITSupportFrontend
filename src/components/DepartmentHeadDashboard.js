import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Label } from './ui/label';
import { apiCall, API_ENDPOINTS } from '../utils/api/config';

export const DepartmentHeadDashboard = ({ user: propUser, session }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedAssignedTo, setSelectedAssignedTo] = useState('');
  const [tickets, setTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [ticketsSummary, setTicketsSummary] = useState({ total: 0, new: 0, processing: 0, completed: 0 });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [allTicketsForCount, setAllTicketsForCount] = useState([]);
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);

  // Load all tickets for accurate counting (without pagination)
  const loadAllTicketsForCounting = async () => {
    try {
      setIsLoadingCounts(true);
      // Make API call without pagination to get all tickets for counting
      const params = new URLSearchParams();
      params.append('limit', '1000'); // Get a large number to ensure we get all tickets
      params.append('page', '1');
      
      // Apply current filters except status (to get all statuses for counting)
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedAssignedTo) params.append('assignedTo', selectedAssignedTo);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      
      const response = await apiCall(`${API_ENDPOINTS.TICKETS}?${params.toString()}`);
      
      if (response.data && response.data.tickets) {
        setAllTicketsForCount(response.data.tickets);
        console.log('Department Head - Loaded all tickets for counting:', response.data.tickets.length);
      }
    } catch (error) {
      console.error('Failed to load all tickets for counting:', error);
    } finally {
      setIsLoadingCounts(false);
    }
  };

  // Calculate filtered summary based on current filters
  const getFilteredSummary = () => {
    // If a status filter is applied, show that specific count
    if (selectedStatus) {
      const totalItemsForStatus = pagination.totalItems || tickets.length;
      return {
        total: totalItemsForStatus,
        new: selectedStatus === 'New' ? totalItemsForStatus : 0,
        pendingApproval: selectedStatus === 'Pending Approval' ? totalItemsForStatus : 0,
        approved: selectedStatus === 'Approved' ? totalItemsForStatus : 0,
        rejected: selectedStatus === 'Rejected' ? totalItemsForStatus : 0,
        processing: selectedStatus === 'Processing' ? totalItemsForStatus : 0,
        completed: selectedStatus === 'Completed' ? totalItemsForStatus : 0
      };
    }

    // Use all tickets for accurate counting
    const ticketsToCount = allTicketsForCount.length > 0 ? allTicketsForCount : tickets;
    
    const statusCounts = {
      new: 0,
      pendingApproval: 0,
      approved: 0,
      rejected: 0,
      processing: 0,
      completed: 0
    };

    // Count from all tickets
    ticketsToCount.forEach(ticket => {
      const status = (ticket.status || 'New').toLowerCase().trim();
      
      switch (status) {
        case 'new':
          statusCounts.new++;
          break;
        case 'pending approval':
        case 'pendingapproval':
          statusCounts.pendingApproval++;
          break;
        case 'approved':
          statusCounts.approved++;
          break;
        case 'rejected':
          statusCounts.rejected++;
          break;
        case 'processing':
          statusCounts.processing++;
          break;
        case 'completed':
          statusCounts.completed++;
          break;
        default:
          console.log(`Department Head - Unknown status: "${ticket.status}"`);
      }
    });

    // Calculate total from individual counts
    const calculatedTotal = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    
    console.log('Department Head - Status counts calculated from', ticketsToCount.length, 'tickets:', statusCounts);
    console.log('Department Head - Calculated total:', calculatedTotal);

    return {
      total: calculatedTotal, // Use calculated total to ensure it matches individual counts
      new: statusCounts.new,
      pendingApproval: statusCounts.pendingApproval,
      approved: statusCounts.approved,
      rejected: statusCounts.rejected,
      processing: statusCounts.processing,
      completed: statusCounts.completed
    };
  };

  const filteredSummary = getFilteredSummary();
  
  // Assignment modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [assignmentUsers, setAssignmentUsers] = useState([]);
  const [isLoadingAssignmentUsers, setIsLoadingAssignmentUsers] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // user is provided via props (`propUser`) in this component; avoid local unused state

  // Load categories for filter
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await apiCall(API_ENDPOINTS.CATEGORIES);
        const categoriesData = response.data || response;
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Load users when category changes
  useEffect(() => {
    const loadUsers = async () => {
      if (!selectedCategory) {
        setUsers([]);
        setSelectedAssignedTo('');
        return;
      }

      try {
        setIsLoadingUsers(true);
        const response = await apiCall(`${API_ENDPOINTS.USERS_BY_CATEGORY}/${selectedCategory}/users`);
        const usersData = response.data || response;
        setUsers(Array.isArray(usersData) ? usersData : []);
        // Reset assigned user when category changes
        setSelectedAssignedTo('');
      } catch (error) {
        console.error('Failed to load users for category:', error);
        setUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, [selectedCategory]);

  // Load tickets with filters
  const loadTickets = async (page = 1) => {
    try {
      setIsLoadingTickets(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedAssignedTo) params.append('assignedTo', selectedAssignedTo);
      if (selectedStatus) params.append('status', selectedStatus);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      params.append('page', page.toString());
      params.append('limit', '10');
      params.append('sort', 'createdAt');
      params.append('order', 'desc');

      const queryString = params.toString();
      const endpoint = queryString ? `${API_ENDPOINTS.TICKETS}?${queryString}` : API_ENDPOINTS.TICKETS;
      
      const response = await apiCall(endpoint);
      
      if (response.data) {
        setTickets(response.data.tickets || []);
        setPagination(response.data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 });
        setTicketsSummary(response.data.summary || { total: 0, new: 0, processing: 0, completed: 0 });
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
      setTickets([]);
      setTicketsSummary({ total: 0, new: 0, processing: 0, completed: 0 });
    } finally {
      setIsLoadingTickets(false);
    }
  };

  // Load tickets on mount and when filters change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadTickets(1);
  }, [selectedCategory, selectedAssignedTo, selectedStatus, dateFrom, dateTo]);

  // Load all tickets for counting when filters change (except status filter)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!selectedStatus) {
      // Only load all tickets when no status filter is applied
      loadAllTicketsForCounting();
    }
  }, [selectedCategory, selectedAssignedTo, dateFrom, dateTo]);

  // Load all tickets for counting on initial mount
  useEffect(() => {
    loadAllTicketsForCounting();
  }, []);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    console.log('Category filter changed to:', e.target.value);
  };

  const handleAssignedToChange = (e) => {
    setSelectedAssignedTo(e.target.value);
    console.log('Assigned To filter changed to:', e.target.value);
  };

  const handleDateFromChange = (e) => {
    setDateFrom(e.target.value);
  };

  const handleDateToChange = (e) => {
    setDateTo(e.target.value);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedAssignedTo('');
    setSelectedStatus('');
    setDateFrom('');
    setDateTo('');
  };

  // Load users for assignment modal based on ticket category
  const loadUsersForAssignment = async (categoryId) => {
    if (!categoryId) {
      setAssignmentUsers([]);
      return;
    }

    try {
      setIsLoadingAssignmentUsers(true);
      const response = await apiCall(`${API_ENDPOINTS.USERS_BY_CATEGORY}/${categoryId}/users`);
      const usersData = response.data || response;
      setAssignmentUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Failed to load users for assignment:', error);
      setAssignmentUsers([]);
    } finally {
      setIsLoadingAssignmentUsers(false);
    }
  };

  // Handle ticket assignment
  const assignTicket = async (ticketId, assignToId) => {
    try {
      setIsAssigning(true);
      const response = await apiCall(`${API_ENDPOINTS.TICKETS}/${ticketId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignToId: assignToId
        })
      });

      if (response.ok || response.success) {
        // Refresh tickets to show updated assignment
        await loadTickets(pagination.currentPage);
        setIsAssignModalOpen(false);
        setSelectedTicket(null);
        console.log('Ticket assigned successfully');
      } else {
        console.error('Failed to assign ticket:', response);
      }
    } catch (error) {
      console.error('Error assigning ticket:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  // Open assignment modal
  const openAssignmentModal = async (ticket) => {
    setSelectedTicket(ticket);
    setIsAssignModalOpen(true);
    
    // Load users for this ticket's category
    const categoryId = ticket.category?.id || ticket.category?.Id || ticket.categoryId;
    if (categoryId) {
      await loadUsersForAssignment(categoryId);
    }
  };

  // Close assignment modal
  const closeAssignmentModal = () => {
    setIsAssignModalOpen(false);
    setSelectedTicket(null);
    setAssignmentUsers([]);
  };

  return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Department Head Dashboard</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">View and manage all department tickets</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6 mb-8">
          {/* Total Tickets */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 cursor-pointer group">
            <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-sm"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white/90 group-hover:text-white transition-all duration-300">Total Tickets</div>
                  <div className="mt-3 text-4xl font-black text-white drop-shadow-lg">{filteredSummary.total || 0}</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-300"></div>
          </div>

          {/* New Tickets */}
          <div className="relative overflow-hidden bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 dark:from-cyan-500 dark:via-blue-600 dark:to-indigo-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 cursor-pointer group">
            <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-sm"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white/90 group-hover:text-white transition-all duration-300">New</div>
                  <div className="mt-3 text-4xl font-black text-white drop-shadow-lg">{filteredSummary.new || 0}</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-300"></div>
          </div>

          {/* Pending Approval */}
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 dark:from-amber-500 dark:via-orange-600 dark:to-red-600 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 cursor-pointer group">
            <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-sm"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white/90 group-hover:text-white transition-all duration-300">Pending Approval</div>
                  <div className="mt-3 text-4xl font-black text-white drop-shadow-lg">{filteredSummary.pendingApproval || 0}</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-300"></div>
          </div>

          {/* Approved */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 dark:from-emerald-500 dark:via-teal-600 dark:to-cyan-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 cursor-pointer group">
            <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-sm"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white/90 group-hover:text-white transition-all duration-300">Approved</div>
                  <div className="mt-3 text-4xl font-black text-white drop-shadow-lg">{filteredSummary.approved || 0}</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-300"></div>
          </div>

          {/* Rejected */}
          <div className="relative overflow-hidden bg-gradient-to-br from-red-500 via-pink-500 to-rose-600 dark:from-red-600 dark:via-pink-600 dark:to-rose-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 cursor-pointer group">
            <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-sm"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white/90 group-hover:text-white transition-all duration-300">Rejected</div>
                  <div className="mt-3 text-4xl font-black text-white drop-shadow-lg">{filteredSummary.rejected || 0}</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-300"></div>
          </div>

          {/* Processing */}
          <div className="relative overflow-hidden bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 dark:from-yellow-500 dark:via-amber-600 dark:to-orange-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 cursor-pointer group">
            <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-sm"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white/90 group-hover:text-white transition-all duration-300">Processing</div>
                  <div className="mt-3 text-4xl font-black text-white drop-shadow-lg">{filteredSummary.processing || 0}</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-300"></div>
          </div>

          {/* Completed */}
          <div className="relative overflow-hidden bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 dark:from-green-500 dark:via-emerald-600 dark:to-teal-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 cursor-pointer group">
            <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-sm"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white/90 group-hover:text-white transition-all duration-300">Completed</div>
                  <div className="mt-3 text-4xl font-black text-white drop-shadow-lg">{filteredSummary.completed || 0}</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-300"></div>
          </div>
        </div>

  <div className="bg-white dark:bg-[rgb(12,16,20)] dark:border dark:border-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18"></path></svg>
              <span>Filters</span>
            </div>
            <button onClick={clearAllFilters} className="text-sm text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100">Clear All</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={selectedCategory} onChange={handleCategoryChange} disabled={isLoadingCategories}>
                <option value="">
                  {isLoadingCategories ? 'Loading categories...' : 'All Categories'}
                </option>
                {Array.isArray(categories) && categories.map((category, index) => (
                  <option key={category.Id || category.id || category.value || category._id || index} value={category.Id || category.id || category.value || category._id}>
                    {category.Name || category.name || category.label || category.title || category.categoryName || `Category ${index + 1}`}
                  </option>
                ))}
                {(!Array.isArray(categories) || categories.length === 0) && !isLoadingCategories && (
                  <option disabled>No categories available</option>
                )}
              </Select>
            </div>
            <div>
              <Label>Assigned To</Label>
              <Select value={selectedAssignedTo} onChange={handleAssignedToChange} disabled={isLoadingUsers || !selectedCategory}>
                <option value="">
                  {!selectedCategory 
                    ? 'Select category first' 
                    : isLoadingUsers 
                      ? 'Loading users...' 
                      : 'All Team Members'
                  }
                </option>
                {Array.isArray(users) && users.map((user, index) => (
                  <option key={user.Id || user.id || user._id || index} value={user.Id || user.id || user._id}>
                    {user.Name || user.name || user.fullName || user.username || `User ${index + 1}`}
                  </option>
                ))}
                {(!Array.isArray(users) || users.length === 0) && !isLoadingUsers && selectedCategory && (
                  <option disabled>No users available for this category</option>
                )}
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={selectedStatus} onChange={handleStatusChange}>
                <option value="">All Statuses</option>
                <option value="New">New</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
              </Select>
            </div>
            <div>
              <Label>Date From</Label>
              <Input type="date" value={dateFrom} onChange={handleDateFromChange} />
            </div>
            <div>
              <Label>Date To</Label>
              <Input type="date" value={dateTo} onChange={handleDateToChange} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-lg shadow p-6">
          <div className="font-medium text-gray-800 dark:text-gray-200 mb-4">
            All Department Tickets ({pagination.totalItems})
            {isLoadingTickets && <span className="text-sm text-gray-500 ml-2">Loading...</span>}
          </div>
          
          {!isLoadingTickets && tickets.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 6h18M3 14h6m0 0v6m0-6l-3 3"></path></svg>
              <div>No tickets found. Create your first ticket to get started!</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Issue/Request Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {ticket.ticketNumber || ticket.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {ticket.category?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {/* Conditionally show either Issue Type or Request Type */}
                        {ticket.issueType ? (
                          <div>
                            <div className="font-medium text-blue-600 dark:text-blue-400">Issue Type</div>
                            <div className="text-gray-900 dark:text-white">{ticket.issueType?.name || ticket.issueType}</div>
                          </div>
                        ) : ticket.requestType ? (
                          <div>
                            <div className="font-medium text-green-600 dark:text-green-400">Request Type</div>
                            <div className="text-gray-900 dark:text-white">{ticket.requestType?.name || ticket.requestType}</div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-gray-500 dark:text-gray-400">Type</div>
                            <div className="text-gray-500 dark:text-gray-400">N/A</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.status === 'Open' || ticket.status === 'New' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          ticket.status === 'Processing' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                          ticket.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div 
                          className="flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-2 -m-2 transition-colors"
                          onClick={() => openAssignmentModal(ticket)}
                          title="Click to assign ticket"
                        >
                          {ticket.assignedTo?.name ? (
                            <>
                              <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                              {ticket.assignedTo.name}
                            </>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">Not assigned</span>
                          )}
                          <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          onClick={() => navigate(`/tickets/${ticket.id}`)}
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {!isLoadingTickets && tickets.length > 0 && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6 p-4">
              <Button 
                onClick={() => loadTickets(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total)
              </span>
              <Button 
                onClick={() => loadTickets(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Assignment Modal */}
        {isAssignModalOpen && selectedTicket && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Assign Ticket to Team Member
                </h3>
                <button
                  onClick={closeAssignmentModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span className="font-medium">Ticket ID:</span> {selectedTicket.ticketNumber || selectedTicket.id}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span className="font-medium">Category:</span> {selectedTicket.category?.name || 'N/A'}
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                    Select team member:
                  </h4>
                  
                  {isLoadingAssignmentUsers ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading team members...</p>
                    </div>
                  ) : assignmentUsers.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">No team members available for this category</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {assignmentUsers.map((user) => (
                        <div
                          key={user.Id || user.id || user._id}
                          onClick={() => assignTicket(selectedTicket.id, user.Id || user.id || user._id)}
                          className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.Name || user.name || user.fullName || user.username || 'Unknown User'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user.department || user.team || user.role || 'Team Member'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={closeAssignmentModal}
                  variant="outline"
                  disabled={isAssigning}
                  className="text-gray-600 border-gray-300 hover:bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
              </div>

              {/* Loading overlay when assigning */}
              {isAssigning && (
                <div className="absolute inset-0 bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Assigning ticket...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
  );
};