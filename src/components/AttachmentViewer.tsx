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
  AlertCircle,
  Eye,
  ExternalLink,
} from "lucide-react";
import {
  attachmentService,
  type AttachmentItem,
} from "../api/services/attachmentService";

interface AttachmentViewerProps {
  transType: string; // PS, PSW, etc.
  poBook: string; // PST, PSW, etc.
  poNo: string; // Document number like "21978"
  title?: string;
}

export function AttachmentViewer({
  transType,
  poBook,
  poNo,
  title = "Uploaded Files",
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
      console.log("📎 Loading attachments with params:", {
        transType,
        poBook,
        poNo,
      });
      const response = await attachmentService.getAttachments(
        transType,
        poBook,
        poNo
      );

      if (response.success) {
        setAttachments(response.data);
        console.log("✅ Attachments loaded:", response.data);
      } else {
        const errorMsg = response.error || "Failed to load attachments";
        setError(errorMsg);
        console.error("❌ Failed to load attachments:", {
          error: response.error,
          message: response.message,
          params: { transType, poBook, poNo },
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("❌ Error loading attachments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (attachment: AttachmentItem) => {
    const ext = attachment.fileExtension.toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(ext)) {
      return <ImageIcon className="w-4 h-4 text-blue-500" />;
    } else if (ext === "pdf") {
      return <FileText className="w-4 h-4 text-red-500" />;
    }

    return <FileText className="w-4 h-4 text-gray-500" />;
  };

  const getFileTypeBadge = (attachment: AttachmentItem) => {
    const ext = attachment.fileExtension.toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(ext)) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Image
        </Badge>
      );
    } else if (ext === "pdf") {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          PDF
        </Badge>
      );
    }

    return <Badge variant="outline">{ext.toUpperCase()}</Badge>;
  };

  const handleDownload = (attachment: AttachmentItem) => {
    if (attachment.downloadUrl) {
      window.open(attachment.downloadUrl, "_blank");
    } else {
      console.warn("No download URL available for:", attachment.fileName);
    }
  };

  const handleViewFile = (attachment: AttachmentItem) => {
    if (attachment.viewUrl) {
      window.open(attachment.viewUrl, "_blank");
    } else {
      console.warn("No view URL available for:", attachment.fileName);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown date";
    }
  };

  return (
    <Card className="w-full mt-6 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 max-w-full">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FolderOpen className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-gray-900 font-semibold">{title}</div>
              <div className="text-xs font-normal text-gray-600 mt-0.5">
                {poBook}-{poNo} • {transType}
              </div>
            </div>
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadAttachments}
            disabled={isLoading}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 h-8 px-3"
          >
            <RefreshCw
              className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`}
            />
            <span className="text-xs">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 max-h-96 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <div className="relative">
                <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-sm font-medium">Loading attachments...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertCircle className="w-5 h-5 mt-0.5 text-red-500" />
              <div className="flex-1">
                <span className="text-sm font-semibold">
                  Failed to load attachments
                </span>
                <p className="text-xs mt-1 text-red-600">{error}</p>
                {error.includes("invalid signature") && (
                  <p className="text-xs mt-2 p-2 bg-red-100 rounded border text-red-700">
                    💡 <strong>Tip:</strong> Authentication issue detected.
                    Please check your login status or contact support.
                  </p>
                )}
              </div>
            </div>
            <details className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg border">
              <summary className="cursor-pointer hover:text-gray-700 font-medium">
                🔧 Debug Information
              </summary>
              <div className="mt-2 p-2 bg-white rounded border font-mono text-xs">
                <div>
                  <strong>transType:</strong> {transType}
                </div>
                <div>
                  <strong>poBook:</strong> {poBook}
                </div>
                <div>
                  <strong>poNo:</strong> {poNo}
                </div>
              </div>
            </details>
          </div>
        )}

        {!isLoading && !error && attachments.length === 0 && (
          <div className="text-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <FolderOpen className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  No files uploaded yet
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Files will appear here when uploaded
                </p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && attachments.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Files ({attachments.length})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="group relative bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-blue-300 transition-all duration-200"
                  title={attachment.fileName}
                >
                  <div className="flex items-center gap-3">
                    {/* File Info - Compact */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors leading-tight">
                            {attachment.fileName}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            {getFileTypeBadge(attachment)}
                          </div>
                        </div>

                        {/* Action Buttons - Compact */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* View Button */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewFile(attachment)}
                            className="h-7 px-2 text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
                            disabled={!attachment.viewUrl}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
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
  );
}
