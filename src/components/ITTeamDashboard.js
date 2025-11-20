import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Label } from './ui/label';
import { apiCall, API_ENDPOINTS } from '../utils/api/config';

export default function ITTeamDashboard() {
  const navigate = useNavigate();
  const [userCategoryId, setUserCategoryId] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedAssignedTo, setSelectedAssignedTo] = useState('');
  const [tickets, setTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [ticketsSummary, setTicketsSummary] = useState({ total: 0, new: 0, processing: 0, completed: 0, teamTickets: 0 });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // user info is provided via parent props or localStorage elsewhere; avoid unused local state here

  // Load users when userCategoryId is available
  useEffect(() => {
    const loadUsers = async () => {
      if (!userCategoryId) {
        setUsers([]);
        return;
      }

      try {
        setIsLoadingUsers(true);
        const response = await apiCall(`${API_ENDPOINTS.USERS_BY_CATEGORY}/${userCategoryId}/users`);
        const usersData = response.data || response;
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (error) {
        console.error('Failed to load users for category:', error);
        setUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, [userCategoryId]);

  // Load tickets with filters
  const loadTickets = async (page = 1) => {
    try {
      setIsLoadingTickets(true);
      
      // Build query parameters (removed category filter since data is already filtered by user's category)
      const params = new URLSearchParams();
      if (selectedAssignedTo) params.append('assignedTo', selectedAssignedTo);
      if (selectedStatus) params.append('status', selectedStatus);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      params.append('page', page.toString());
      params.append('limit', '10');
      params.append('sort', 'createdAt');
      params.append('order', 'desc');

      const queryString = params.toString();
      const endpoint = queryString ? `/tickets/my-tickets?${queryString}` : '/tickets/my-tickets';
      
      const response = await apiCall(endpoint);
      
      if (response.data) {
        setTickets(response.data.tickets || []);
        setPagination(response.data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 });
        setTicketsSummary(response.data.summary || { total: 0, new: 0, processing: 0, completed: 0, teamTickets: 0 });
        
        // Extract category ID from the first ticket to load users for that category
        const tickets = response.data.tickets || [];
        if (tickets.length > 0 && tickets[0].category?.id && !userCategoryId) {
          setUserCategoryId(tickets[0].category.id);
        }
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
      setTickets([]);
      setTicketsSummary({ total: 0, new: 0, processing: 0, completed: 0, teamTickets: 0 });
    } finally {
      setIsLoadingTickets(false);
    }
  };

  // Load tickets on mount and when filters change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadTickets(1);
  }, [selectedAssignedTo, selectedStatus, dateFrom, dateTo]);

  // Close status dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editingTicketId && !event.target.closest('.status-dropdown')) {
        setEditingTicketId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingTicketId]);

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

  const handleStatusFilterChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const clearAllFilters = () => {
    setSelectedAssignedTo('');
    setSelectedStatus('');
    setDateFrom('');
    setDateTo('');
  };

  // Update ticket status
  const updateTicketStatus = async (ticketId, newStatusId) => {
    try {
      setIsUpdatingStatus(true);
      const response = await apiCall(`/tickets/${ticketId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ statusId: newStatusId })
      });

      // Refresh tickets after successful update
      await loadTickets(pagination.currentPage);
      setEditingTicketId(null);
      
      console.log('Status updated successfully:', response);
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      // You could add a toast notification here for better UX
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleStatusClick = (ticketId) => {
    setEditingTicketId(ticketId);
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    await updateTicketStatus(ticketId, newStatus);
  };

  return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">IT Team Dashboard</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Manage and track all tickets assigned to the IT team</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
           <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">Team Tickets</div>
            <div className="mt-4 text-2xl font-bold text-purple-600">{ticketsSummary.teamTickets || 0}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">Assign Tickets</div>
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
              <Label>Assigned To</Label>
              <Select value={selectedAssignedTo} onChange={handleAssignedToChange} disabled={isLoadingUsers || !userCategoryId}>
                <option value="">
                  {!userCategoryId 
                    ? 'Loading team members...' 
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
                {(!Array.isArray(users) || users.length === 0) && !isLoadingUsers && userCategoryId && (
                  <option disabled>No team members available</option>
                )}
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={selectedStatus} onChange={handleStatusFilterChange}>
                <option value="">All Statuses</option>
                <option value="New">New</option>
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
            All Team Tickets ({pagination.totalItems})
            {isLoadingTickets && <span className="text-sm text-gray-500 ml-2">Loading...</span>}
          </div>
          
          {!isLoadingTickets && tickets.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 6h18M3 14h6m0 0v6m0-6l-3 3"></path></svg>
              <div>No tickets found. All tickets will appear here!</div>
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
                        {editingTicketId === ticket.id ? (
                          <div className="relative status-dropdown">
                            <Select 
                              value={ticket.status} 
                              onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                              disabled={isUpdatingStatus}
                              className="text-xs rounded-full min-w-[120px]"
                              autoFocus
                              onBlur={() => setEditingTicketId(null)}
                            >
                              <option value="New">New</option>
                              <option value="Processing">Processing</option>
                              <option value="Completed">Completed</option>
                            </Select>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStatusClick(ticket.id)}
                            disabled={isUpdatingStatus}
                            className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                              ticket.status === 'Open' || ticket.status === 'New' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              ticket.status === 'Processing' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                              ticket.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}
                          >
                            {isUpdatingStatus && editingTicketId === ticket.id ? 'Updating...' : ticket.status}
                          </button>
                        )}
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
};