import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Label } from './ui/label';
import { apiCall, API_ENDPOINTS } from '../utils/api/config';

export default function TicketCreatorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
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

  useEffect(() => {
    const raw = localStorage.getItem('userData');
    if (!raw) return;
    try {
      setUser(JSON.parse(raw));
    } catch (e) {
      console.warn('invalid userData', e);
    }
  }, []);

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
  useEffect(() => {
    loadTickets(1);
  }, [selectedCategory, selectedAssignedTo, dateFrom, dateTo]);

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

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedAssignedTo('');
    setDateFrom('');
    setDateTo('');
  };

  return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Support Tickets</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">View and manage all your submitted tickets</p>
          </div>
          <div>
            <Button onClick={() => navigate('/tickets/create')} className="bg-blue-600 text-white">+ Create New Ticket</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Tickets</div>
            <div className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{ticketsSummary.total}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">New</div>
            <div className="mt-4 text-2xl font-bold text-blue-600">{ticketsSummary.new}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">Processing</div>
            <div className="mt-4 text-2xl font-bold text-orange-500">{ticketsSummary.processing}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
            <div className="mt-4 text-2xl font-bold text-green-600">{ticketsSummary.completed}</div>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            All My Tickets ({pagination.totalItems})
            {isLoadingTickets && <span className="text-sm text-gray-500 ml-2">Loading...</span>}
          </div>
          
          {!isLoadingTickets && tickets.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 6h18M3 14h6m0 0v6m0-6l-3 3"></path></svg>
              <div>No tickets found. Create your first ticket to get started!</div>
              <div className="mt-4">
                <Button onClick={() => navigate('/tickets/create')} className="bg-blue-600 text-white">+ Create New Ticket</Button>
              </div>
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
                        <div>
                          <div className="font-medium">Issue: {ticket.issueType?.name || ticket.issueType || 'troubleshooting'}</div>
                          <div className="text-gray-500 dark:text-gray-400">Request: {ticket.requestType?.name || ticket.requestType || ticket.description?.substring(0, 30) + '...' || 'N/A'}</div>
                        </div>
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
                        <div className="flex items-center">
                          {ticket.assignedTo?.name ? (
                            <>
                              <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                              {ticket.assignedTo.name}
                            </>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">Not assigned</span>
                          )}
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
      </main>
  );
}
