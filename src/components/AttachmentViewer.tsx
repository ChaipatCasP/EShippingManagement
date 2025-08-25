import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  FileText, 
  Image as ImageIcon, 
  Download, 
  RefreshCw,
  FolderOpen,
  AlertCircle
} from "lucide-react";
import { 
  attachmentService, 
  type AttachmentItem 
} from "../api/services/attachmentService";

interface AttachmentViewerProps {
  transType: string; // PS, PSW, etc.
  poBook: string;    // PST, PSW, etc.
  poNo: string;      // Document number like "21978"
  title?: string;
}

export function AttachmentViewer({ 
  transType, 
  poBook, 
  poNo, 
  title = "Uploaded Files" 
}: AttachmentViewerProps) {
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load attachments on component mount and when parameters change
  useEffect(() => {
    if (transType && poBook && poNo) {
      loadAttachments();
    }
  }, [transType, poBook, poNo]);

  const loadAttachments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("📎 Loading attachments with params:", { transType, poBook, poNo });
      const response = await attachmentService.getAttachments(transType, poBook, poNo);
      
      if (response.success) {
        setAttachments(response.data);
        console.log("✅ Attachments loaded:", response.data);
      } else {
        const errorMsg = response.error || "Failed to load attachments";
        setError(errorMsg);
        console.error("❌ Failed to load attachments:", {
          error: response.error,
          message: response.message,
          params: { transType, poBook, poNo }
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("❌ Error loading attachments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (attachment: AttachmentItem) => {
    const ext = attachment.fileExtension.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) {
      return <ImageIcon className="w-4 h-4 text-blue-500" />;
    } else if (ext === 'pdf') {
      return <FileText className="w-4 h-4 text-red-500" />;
    }
    
    return <FileText className="w-4 h-4 text-gray-500" />;
  };

  const getFileTypeBadge = (attachment: AttachmentItem) => {
    const ext = attachment.fileExtension.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Image</Badge>;
    } else if (ext === 'pdf') {
      return <Badge variant="secondary" className="bg-red-100 text-red-800">PDF</Badge>;
    }
    
    return <Badge variant="outline">{ext.toUpperCase()}</Badge>;
  };

  const handleDownload = (attachment: AttachmentItem) => {
    if (attachment.downloadUrl) {
      window.open(attachment.downloadUrl, '_blank');
    } else {
      console.warn("No download URL available for:", attachment.fileName);
      // You could implement alternative download logic here
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <Card className="w-full mt-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FolderOpen className="w-5 h-5 text-gray-500" />
            {title}
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadAttachments}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Document: {poBook}-{poNo} (Type: {transType})
        </p>
      </CardHeader>
      
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading attachments...
            </div>
          </div>
        )}

        {error && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-4 h-4" />
              <div className="flex-1">
                <span className="text-sm font-medium">Failed to load attachments</span>
                <p className="text-xs mt-1">{error}</p>
                {error.includes("invalid signature") && (
                  <p className="text-xs mt-1 text-red-600">
                    Authentication issue. Please check your login status or contact support.
                  </p>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded border">
              <strong>Debug Info:</strong> transType={transType}, poBook={poBook}, poNo={poNo}
            </div>
          </div>
        )}

        {!isLoading && !error && attachments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FolderOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No files uploaded yet</p>
          </div>
        )}

        {!isLoading && !error && attachments.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Files ({attachments.length})
              </span>
            </div>
            
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    {getFileIcon(attachment)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {attachment.fileName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {attachmentService.formatFileSize(attachment.fileSize)}
                      </span>
                      {getFileTypeBadge(attachment)}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Uploaded: {formatDate(attachment.uploadedDate)}
                    </p>
                  </div>

                  {/* Download Button */}
                  <div className="flex-shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(attachment)}
                      className="flex items-center gap-1"
                      disabled={!attachment.downloadUrl}
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
