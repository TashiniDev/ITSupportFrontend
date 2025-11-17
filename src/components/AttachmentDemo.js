import React from 'react';
import attachmentService from '../services/attachmentService';

const AttachmentDemo = () => {
  // Demo attachment data
  const demoAttachments = [
    { id: '1', originalName: 'document.pdf', size: 1024000 },
    { id: '2', originalName: 'image.jpg', size: 512000 },
    { id: '3', originalName: 'spreadsheet.xlsx', size: 256000 },
    { id: '4', originalName: 'presentation.pptx', size: 2048000 },
    { id: '5', originalName: 'archive.zip', size: 5120000 },
  ];

  const handleDownload = (id, name) => {
    console.log(`Downloading attachment ${id}: ${name}`);
    // In real app: attachmentService.downloadAttachment(id, name);
  };

  const handleView = (id) => {
    console.log(`Viewing attachment ${id}`);
    // In real app: attachmentService.viewAttachment(id);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Attachment Demo</h2>
      
      <div className="space-y-2">
        {demoAttachments.map((attachment) => {
          const fileIcon = attachmentService.getFileIcon(attachment.originalName);
          const isViewable = attachmentService.isViewableInline(attachment.originalName);
          const sizeLabel = `${Math.round(attachment.size / 1024)} KB`;

          return (
            <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-300 text-sm">{fileIcon}</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {attachment.originalName}
                    {isViewable && (
                      <span className="ml-2 text-xs text-green-600 dark:text-green-400">(Viewable)</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {sizeLabel}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleView(attachment.id)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 hover:underline"
                >
                  View
                </button>
                <button 
                  onClick={() => handleDownload(attachment.id, attachment.originalName)}
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800"
                  aria-label={`Download ${attachment.originalName}`}
                  title="Download"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l4-4m-4 4l-4-4M4 21h16" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <h3 className="font-medium mb-2">API Endpoints</h3>
        <ul className="text-sm space-y-1">
          <li><code>/api/attachments/:attachmentId/view</code> - View attachment inline</li>
          <li><code>/api/tickets/attachments/:attachmentId/download</code> - Download attachment</li>
        </ul>
      </div>
    </div>
  );
};

export default AttachmentDemo;