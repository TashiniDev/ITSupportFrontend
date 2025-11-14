import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { apiCall, API_ENDPOINTS } from '../utils/api/config';
import toastService from '../services/toastService';
import DashboardHeader from '../components/DashboardHeader';
import { LogoutDialog } from '../components/LogoutDialog';

export default function TicketDetailsPage() {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('userData');
    if (!raw) return;
    try {
      setCurrentUser(JSON.parse(raw));
    } catch (e) {
      console.warn('Invalid userData in localStorage', e);
    }
  }, []);

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
  // Extracted loader so it can be called from multiple places (initial load and after posting a comment)
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

  useEffect(() => {
    if (ticketId) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      loadComments();
    }
  }, [ticketId]);

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    const trimmed = comment.trim();
    const prevStatus = ticket?.status;
    // Only update when the ticket is currently 'new' and there are no existing comments
    const shouldUpdateStatus = prevStatus && String(prevStatus).toLowerCase() === 'new' && comments.length === 0;

    // Optimistically update status in UI so user sees immediate change (use uppercase to match UI style)
    if (shouldUpdateStatus) {
      setTicket(prev => prev ? { ...prev, status: 'PROCESSING' } : prev);
    }

    try {
      // Post the comment
      await apiCall(`${API_ENDPOINTS.TICKETS}/${ticketId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ comment: trimmed })
      });

      // Persist status change on the server if needed
      if (shouldUpdateStatus) {
        try {
          await apiCall(`${API_ENDPOINTS.TICKETS}/${ticketId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'PROCESSING' })
          });
        } catch (statusErr) {
          console.error('Failed to persist status change:', statusErr);
          // rollback optimistic change
          setTicket(prev => prev ? { ...prev, status: prevStatus } : prev);
              // Intentionally NOT showing a toast to avoid alarming the user for this backend endpoint issue.
        }
      }

      // Reload comments from server so the list is authoritative and updated
      await loadComments();

      // Fetch latest ticket from server to ensure status reflects what backend has
      try {
        const fresh = await apiCall(`${API_ENDPOINTS.TICKETS}/${ticketId}`);
        setTicket(fresh.data || fresh);
      } catch (freshErr) {
        // non-fatal: we already optimistically updated; log for debugging
        console.warn('Failed to refresh ticket after comment:', freshErr);
      }

      setComment('');
      toastService.success('Comment added successfully');
    } catch (error) {
      console.error('Failed to add comment:', error);
      // rollback optimistic status change if comment fails
      if (shouldUpdateStatus) {
        setTicket(prev => prev ? { ...prev, status: prevStatus } : prev);
      }
      toastService.error('Failed to add comment');
    }
  };

  const handleLogout = async () => {
    try {
      // First, immediately clear authentication state
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      // Clear user state immediately
      setCurrentUser(null);
      
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
      setCurrentUser(null);
      setShowLogoutDialog(false);
      navigate('/login');
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <DashboardHeader onLogout={() => setShowLogoutDialog(true)} />
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
        <DashboardHeader onLogout={() => setShowLogoutDialog(true)} />
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
      <DashboardHeader onLogout={() => setShowLogoutDialog(true)} />
      
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
                <div className="mb-6">
                  <p className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
                    This Ticket Requested By <span className="font-bold">{ticket.fullName || 'Requester Name Not Provided'}</span>
                  </p>
                </div>
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(ticket.title && ticket.title !== ticket.fullName) ? ticket.title : ''}
                  </h1>
                  <div className="flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-500 to-indigo-700 text-white shadow-lg`}>Status: {ticket.status}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-teal-500 to-teal-700 text-white shadow-lg`}>Severity Level: {ticket.severityLevel}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {ticket.description || 'No description provided'}
                  </p>
                </div>

                {/* Attachments */}
                {Array.isArray(ticket.attachments) && ticket.attachments.length > 0 && (() => {
                  // filter out empty/null/invalid attachment entries returned by backend
                  // Stronger filtering and deduplication to avoid empty/placeholder entries
                  const rawAttachments = ticket.attachments || [];
                  const filtered = rawAttachments.filter(a => {
                    if (!a) return false;
                    if (typeof a === 'string') {
                      const s = a.trim();
                      if (!s) return false;
                      const lower = s.toLowerCase();
                      if (lower === 'null' || lower === 'undefined') return false;
                      return true;
                    }
                    // object attachment: require at least a filename or a URL/path or a positive size
                    const hasName = Boolean(a.originalName || a.fileName || a.name);
                    const hasUrl = Boolean(a.url || a.fileUrl || a.path || a.downloadUrl || a.location || a.href);
                    const hasSize = typeof a.size === 'number' && a.size > 0;
                    return hasName || hasUrl || hasSize;
                  });

                  if (filtered.length === 0) return null;

                  // Deduplicate by URL or filename to avoid duplicate entries
                  const seen = new Set();
                  const validAttachments = [];
                  filtered.forEach(att => {
                    const href = (typeof att === 'string') ? att : (att.url || att.fileUrl || att.path || att.downloadUrl || att.location || att.href || '');
                    const nameKey = (typeof att === 'string') ? att : (att.originalName || att.fileName || att.name || '');
                    const key = href || nameKey || JSON.stringify(att);
                    if (!key) return;
                    if (seen.has(key)) return;
                    seen.add(key);
                    validAttachments.push(att);
                  });

                  if (validAttachments.length === 0) return null;

                  const getHref = (att) => {
                    if (!att) return null;
                    if (typeof att === 'string') return att;
                    return att.url || att.fileUrl || att.path || att.downloadUrl || att.location || att.href || null;
                  };

                  const getDisplayName = (att, idx) => {
                    if (!att) return `Attachment ${idx + 1}`;
                    if (typeof att === 'string') {
                      try {
                        const url = new URL(att);
                        return url.pathname.split('/').pop() || att;
                      } catch (e) {
                        return att;
                      }
                    }
                    return att.originalName || att.fileName || att.name || `Attachment ${idx + 1}`;
                  };

                  const isImageUrl = (href) => {
                    if (!href) return false;
                    return /\.(png|jpe?g|gif|bmp|webp)(\?.*)?$/i.test(href);
                  };

                  return (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                        Attachments ({validAttachments.length})
                      </h3>
                      <div className="space-y-2">
                        {validAttachments.map((attachment, index) => {
                          const href = getHref(attachment);
                          const name = getDisplayName(attachment, index);
                          const sizeLabel = (attachment && attachment.size) ? `${Math.round(attachment.size / 1024)} KB` : '';

                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                                  <span className="text-blue-600 dark:text-blue-300 text-sm">📎</span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {href ? (
                                      <a href={href} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-700">
                                        {name}
                                      </a>
                                    ) : (
                                      <span>{name}</span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {sizeLabel}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                {href && isImageUrl(href) && (
                                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">View</a>
                                )}
                                {href && (
                                  <a href={href} download className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800">Download</a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="bg-white dark:bg-gray-900 dark:border-gray-700">
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Comments & Updates</h3>
              </CardHeader>
              <CardContent>
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-purple-200 to-indigo-200 dark:from-purple-800 dark:to-indigo-700 flex items-center justify-center shadow-md">
                      <div className="text-3xl">💬</div>
                    </div>
                    <p className="mt-4 text-gray-500 dark:text-gray-400">No comments yet — be the first to add an update.</p>
                  </div>
                ) : (
                  <div className="space-y-4 mb-6">
                    {comments.map((c, i) => {
                      const author = c.author || 'System';
                      const initials = (String(author) || 'S').split(' ').map(n => n[0]).slice(0,2).join('');
                      const isMine = currentUser && (
                        (author === currentUser.name) ||
                        (author === currentUser.email) ||
                        (author === currentUser.uid) ||
                        (currentUser.name && String(author).toLowerCase().includes(String(currentUser.name).toLowerCase()))
                      );

                      return (
                        <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex items-start ${isMine ? 'flex-row-reverse space-x-3 space-x-reverse' : 'space-x-3'}`}>
                            <div className="flex-shrink-0">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold shadow ${isMine ? 'bg-gradient-to-tr from-green-500 to-teal-500 text-white' : 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white'}`}>
                                {initials}
                              </div>
                            </div>
                            <div className={`max-w-xl ${isMine ? 'text-right' : 'text-left'}`}>
                              <div className="flex items-center justify-between mb-1">
                                <div className={`text-sm font-medium ${isMine ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>{author}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(c.createdAt).toLocaleString()}</div>
                              </div>
                              <div className={`inline-block px-4 py-2 rounded-lg shadow-sm ${isMine ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'}`}>
                                {c.comment}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-4 border-t dark:border-gray-700 pt-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Add a comment</h4>
                  <div className="space-y-3">
                    <div className="relative">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write your comment here..."
                        rows={3}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 transition-shadow"
                      />
                      <div className="absolute right-3 bottom-3 text-xs text-gray-400 dark:text-gray-500">{Math.min(comment.length, 1000)}/1000</div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Be respectful — markdown supported</div>
                      <Button 
                        onClick={handleAddComment}
                        disabled={!comment.trim()}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-md"
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
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Requester Name</div>
                  <div className="text-sm text-gray-900 dark:text-white">{ticket.fullName || 'N/A'}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Requester Contact No</div>
                  <div className="text-sm text-gray-900 dark:text-white">{ticket.contactNumber || 'N/A'}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Requester Department</div>
                  <div className="text-sm text-gray-900 dark:text-white">{ticket.department?.name || ticket.department || 'N/A'}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Requester Company</div>
                  <div className="text-sm text-gray-900 dark:text-white">{ticket.company?.name || ticket.company || 'N/A'}</div>
                </div>

                {/* Conditionally show either Issue Type or Request Type */}
                {ticket.issueType ? (
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Issue Type</div>
                    <div className="text-sm text-gray-900 dark:text-white">{ticket.issueType?.name || ticket.issueType}</div>
                  </div>
                ) : ticket.requestType ? (
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Request Type</div>
                    <div className="text-sm text-gray-900 dark:text-white">{ticket.requestType?.name || ticket.requestType}</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</div>
                    <div className="text-sm text-gray-900 dark:text-white">N/A</div>
                  </div>
                )}

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

      <LogoutDialog 
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogout}
      />
    </div>
  );
}