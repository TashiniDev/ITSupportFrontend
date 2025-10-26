import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { apiCall, API_ENDPOINTS } from '../utils/api/config';
import toastService from '../services/toastService';
import DashboardHeader from '../components/DashboardHeader';

export default function TicketDetailsPage() {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  // Load ticket details
  useEffect(() => {
    const loadTicketDetails = async () => {
      try {
        setIsLoading(true);
        const response = await apiCall(`${API_ENDPOINTS.TICKETS}/${ticketId}`);
        setTicket(response.data || response);
      } catch (error) {
        console.error('Failed to load ticket details:', error);
        toastService.error('Failed to load ticket details');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (ticketId) {
      loadTicketDetails();
    }
  }, [ticketId, navigate]);

  // Load comments from separate endpoint
  useEffect(() => {
    const loadComments = async () => {
      try {
        const response = await apiCall(`${API_ENDPOINTS.TICKETS}/${ticketId}/comments`);
        setComments(response.data || response || []);
      } catch (error) {
        console.error('Failed to load comments:', error);
        // Don't show error toast for comments as it's not critical
        setComments([]);
      }
    };

    if (ticketId) {
      loadComments();
    }
  }, [ticketId]);

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      const response = await apiCall(`${API_ENDPOINTS.TICKETS}/${ticketId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ comment: comment.trim() })
      });

      // Add the new comment to the list
      setComments([...comments, response.data || { comment: comment.trim(), createdAt: new Date().toISOString() }]);
      setComment('');
      toastService.success('Comment added successfully');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toastService.error('Failed to add comment');
    }
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <DashboardHeader onLogout={() => navigate('/login')} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-300">Loading ticket details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <DashboardHeader onLogout={() => navigate('/login')} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ticket Not Found</h1>
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <DashboardHeader onLogout={() => navigate('/login')} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => navigate('/dashboard')} 
              variant="ghost" 
              className="text-gray-600 dark:text-gray-300"
            >
              ← Back to Tickets
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Header */}
            <Card className="bg-white dark:bg-gray-900 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {ticket.title || ticket.fullName || 'Ticket Details'}
                  </h1>
                  <div className="flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      ticket.status === 'Open' || ticket.status === 'New' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      ticket.status === 'Processing' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      ticket.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {ticket.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      ticket.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {ticket.description || 'No description provided'}
                  </p>
                </div>

                {/* Attachments */}
                {ticket.attachments && ticket.attachments.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Attachments ({ticket.attachments.length})
                    </h3>
                    <div className="space-y-2">
                      {ticket.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-300 text-sm">📎</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {attachment.originalName || attachment.fileName || `Attachment ${index + 1}`}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {attachment.size ? `${Math.round(attachment.size / 1024)} KB` : ''}
                              </div>
                            </div>
                          </div>
                        
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="bg-white dark:bg-gray-900 dark:border-gray-700">
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Comments & Updates</h3>
              </CardHeader>
              <CardContent>
                {comments.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">No comments yet</p>
                ) : (
                  <div className="space-y-4 mb-6">
                    {comments.map((comment, index) => (
                      <div key={index} className="border-l-4 border-blue-200 dark:border-blue-800 pl-4 py-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {comment.author || 'System'} • {new Date(comment.createdAt).toLocaleDateString()}
                        </div>
                        <p className="text-gray-900 dark:text-white">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment */}
                <div className="border-t dark:border-gray-700 pt-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Add a comment</h4>
                  <div className="space-y-3">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write your comment here..."
                      rows={3}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleAddComment}
                        disabled={!comment.trim()}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Ticket Information */}
          <div className="space-y-6">
            <Card className="bg-white dark:bg-gray-900 dark:border-gray-700">
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ticket Information</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Ticket ID</div>
                  <div className="text-sm text-gray-900 dark:text-white">{ticket.ticketNumber || ticket.id}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</div>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-sm">
                    {ticket.category?.name || 'N/A'}
                  </span>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned Team</div>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {ticket.category?.name} Team ({ticket.assignedTo?.name || 'Unassigned'})
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Name</div>
                  <div className="text-sm text-gray-900 dark:text-white">{ticket.fullName || 'N/A'}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Number</div>
                  <div className="text-sm text-gray-900 dark:text-white">{ticket.contactNumber || 'N/A'}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</div>
                  <div className="text-sm text-gray-900 dark:text-white">{ticket.department?.name || ticket.department || 'N/A'}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</div>
                  <div className="text-sm text-gray-900 dark:text-white">{ticket.company?.name || ticket.company || 'N/A'}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Issue Type</div>
                  <div className="text-sm text-gray-900 dark:text-white">{ticket.issueType?.name || ticket.issueType || 'N/A'}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned To</div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-block w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span className="text-sm text-blue-600 dark:text-blue-400">{ticket.assignedTo?.name || 'Unassigned'}</span>
                  </div>
                  {ticket.assignedAt && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Assigned on: {new Date(ticket.assignedAt).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="border-t dark:border-gray-700 pt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">📅 Created</span>
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">🕐 Last Updated</span>
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {new Date(ticket.updatedAt || ticket.createdAt).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}