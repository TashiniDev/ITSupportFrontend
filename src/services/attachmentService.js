// Attachment service for handling attachment downloads and views
import { API_ENDPOINTS } from '../utils/api/config';

class AttachmentService {
  // Base URL for the API (should match your backend)
  baseUrl = 'http://10.1.1.57:3001/api';

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // Download attachment
  async downloadAttachment(attachmentId, filename = 'attachment') {
    try {
      const token = this.getAuthToken();
      const response = await fetch(`${this.baseUrl}/tickets/attachments/${attachmentId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to download attachment: ${response.statusText}`);
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to download attachment:', error);
      throw error;
    }
  }

  // View attachment in new tab/window
  viewAttachment(attachmentId) {
    try {
      const token = this.getAuthToken();
      const viewUrl = `${this.baseUrl}/attachments/${attachmentId}/view`;
      
      // Open with token as query parameter (backend should support this)
      const urlWithToken = `${viewUrl}?token=${encodeURIComponent(token)}`;
      
      window.open(urlWithToken, '_blank', 'noopener,noreferrer');
      
      return { success: true };
    } catch (error) {
      console.error('Failed to view attachment:', error);
      throw error;
    }
  }

  // Get attachment info/metadata
  async getAttachmentInfo(attachmentId) {
    try {
      const token = this.getAuthToken();
      const response = await fetch(`${this.baseUrl}/attachments/${attachmentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get attachment info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get attachment info:', error);
      throw error;
    }
  }

  // Check if file type is viewable inline
  isViewableInline(filename) {
    if (!filename) return false;
    
    const viewableExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', // Images
      '.pdf', // PDFs
      '.txt', '.md', '.csv', // Text files
      '.html', '.htm', // HTML files
      '.svg' // SVG files
    ];
    
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return viewableExtensions.includes(extension);
  }

  // Get appropriate icon for file type
  getFileIcon(filename) {
    if (!filename) return '📎';
    
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    
    const iconMap = {
      '.jpg': '🖼️', '.jpeg': '🖼️', '.png': '🖼️', '.gif': '🖼️', '.bmp': '🖼️', '.webp': '🖼️',
      '.pdf': '📄',
      '.doc': '📝', '.docx': '📝',
      '.xls': '📊', '.xlsx': '📊',
      '.ppt': '📊', '.pptx': '📊',
      '.txt': '📄', '.md': '📄',
      '.zip': '🗜️', '.rar': '🗜️', '.7z': '🗜️',
      '.mp4': '🎬', '.avi': '🎬', '.mov': '🎬',
      '.mp3': '🎵', '.wav': '🎵', '.flac': '🎵'
    };
    
    return iconMap[extension] || '📎';
  }
}

// Export a singleton instance
const attachmentService = new AttachmentService();
export default attachmentService;