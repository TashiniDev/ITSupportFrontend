# Attachment View and Download Feature

This document describes the implementation of the attachment view and download functionality for the IT Support Frontend application.

## Features Implemented

### 1. Attachment Service (`src/services/attachmentService.js`)
A dedicated service class for handling all attachment-related operations:

- **Download Attachment**: Downloads files with proper authentication
- **View Attachment**: Opens files in a new tab/window for viewing
- **File Type Detection**: Automatically detects viewable file types
- **File Icons**: Provides appropriate icons based on file extensions

### 2. API Integration
Updated API configuration to support:

- **Download Endpoint**: `/api/tickets/attachments/:attachmentId/download`
- **View Endpoint**: `/api/attachments/:attachmentId/view`

### 3. Enhanced UI
Improved attachment display in ticket details with:

- **File Type Icons**: Visual indicators for different file types (📄 PDF, 🖼️ images, etc.)
- **Viewable Indicators**: Shows "(Viewable)" for files that can be previewed
- **Dedicated View Button**: Separate view action for all file types
- **Better Download Button**: Enhanced download functionality with error handling

## File Types Supported

### Viewable Files (Open inline)
- **Images**: .jpg, .jpeg, .png, .gif, .bmp, .webp, .svg
- **Documents**: .pdf, .txt, .md, .csv, .html, .htm

### Downloadable Files (All types)
All file types are downloadable, including:
- Office documents (.doc, .docx, .xls, .xlsx, .ppt, .pptx)
- Archives (.zip, .rar, .7z)
- Media files (.mp4, .avi, .mov, .mp3, .wav)
- And many more...

## Usage in Components

### Import the Service
```javascript
import attachmentService from '../services/attachmentService';
```

### Download an Attachment
```javascript
const handleDownload = async (attachmentId, filename) => {
  try {
    await attachmentService.downloadAttachment(attachmentId, filename);
    toastService.success('File downloaded successfully');
  } catch (error) {
    toastService.error('Download failed');
  }
};
```

### View an Attachment
```javascript
const handleView = (attachmentId) => {
  try {
    attachmentService.viewAttachment(attachmentId);
  } catch (error) {
    toastService.error('View failed');
  }
};
```

### Check if File is Viewable
```javascript
const isViewable = attachmentService.isViewableInline(filename);
const fileIcon = attachmentService.getFileIcon(filename);
```

## Backend Requirements

The backend should support these endpoints with proper authentication:

### Download Endpoint
```
GET /api/tickets/attachments/:attachmentId/download
Headers: Authorization: Bearer <token>
Response: File stream with appropriate Content-Type and Content-Disposition headers
```

### View Endpoint
```
GET /api/attachments/:attachmentId/view?token=<token>
Response: 
  - For images: Direct image display
  - For PDFs: PDF viewer
  - For other types: HTML page with download link
```

## Security Considerations

1. **Authentication**: All requests include JWT tokens for security
2. **Token in URL**: View endpoint accepts token as query parameter for new tab/window access
3. **CORS**: Ensure backend allows cross-origin requests for the frontend domain
4. **File Validation**: Backend should validate file types and scan for malicious content

## Files Modified

1. `src/services/attachmentService.js` - New service class
2. `src/utils/api/config.js` - Added attachment endpoints
3. `src/pages/TicketDetailsPage.js` - Updated to use new service and UI
4. `src/components/AttachmentDemo.js` - Demo component (optional)

## Testing

To test the functionality:

1. Create a ticket with attachments
2. Navigate to ticket details page
3. Verify file icons appear correctly
4. Test "View" button opens files in new tab
5. Test "Download" button downloads files
6. Check that viewable files show "(Viewable)" indicator

## Future Enhancements

1. **Inline Preview Modal**: Display files in a modal within the app
2. **Thumbnail Generation**: Show image thumbnails
3. **Progress Indicators**: Show download/upload progress
4. **Drag & Drop**: Enhanced file upload experience
5. **File Previews**: Quick previews on hover