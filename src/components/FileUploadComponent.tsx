import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  fileUploadService,
  type FileUploadRequest,
} from "../api/services/fileUploadService";

interface FileUploadComponentProps {
  docType: string; // PST, PSW
  docBook: string;
  docNo: string; // Document number
  onUploadSuccess?: (response: any) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
}

interface UploadFile {
  id: string;
  file: File; // Reference to the original File object
  preview?: string;
  uploadStatus?: "pending" | "uploading" | "success" | "error";
  errorMessage?: string;
  // File properties for convenience
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export function FileUploadComponent({
  docBook,
  docType,
  docNo,
  onUploadSuccess,
  onUploadError,
  disabled = false,
}: FileUploadComponentProps) {

console.log("📁 FileUploadComponent rendered with:", { docType, docBook, docNo });

  const [selectedFiles, setSelectedFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    console.log("📁 Selected files:", files.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      isFile: f instanceof File
    })));

    // Convert to UploadFile objects with preview
    const uploadFiles: UploadFile[] = files.map((file) => {
      // Validate file before processing
      if (!file || !(file instanceof File)) {
        console.error("Invalid file object:", file);
        return null;
      }

      if (file.size === 0) {
        console.error("File is empty:", file.name);
        return null;
      }

      // Create a wrapper object that preserves the original File
      const uploadFile: UploadFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file: file, // Keep reference to original File object
        uploadStatus: "pending",
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      };

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? { ...f, preview: e.target?.result as string }
                : f
            )
          );
        };
        reader.readAsDataURL(file);
      }

      return uploadFile;
    }).filter(Boolean) as UploadFile[]; // Remove null values

    setSelectedFiles((prev) => [...prev, ...uploadFiles]);
    
    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove file from list
  const removeFile = (fileId: string) => {
    setSelectedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  // Upload files
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select files to upload");
      return;
    }

    if (!docNo) {
      alert("Document number is required");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Update all files to uploading status
      setSelectedFiles((prev) =>
        prev.map((file) => ({ ...file, uploadStatus: "uploading" }))
      );

      console.log("📁 Upload Request Details:", {
        docType,
        docBook, 
        docNo,
        remark: `${docType} document attachments`,
        filesCount: selectedFiles.length,
        files: selectedFiles.map(f => ({
          id: f.id,
          name: f.name,
          size: f.size,
          type: f.type,
          isFile: f.file instanceof File,
          constructor: f.file.constructor.name,
          originalFile: {
            name: f.file.name,
            size: f.file.size,
            type: f.file.type,
            lastModified: f.file.lastModified
          }
        }))
      });

      // Validate files before upload - check the actual File objects
      const validFiles = selectedFiles
        .map(uploadFile => uploadFile.file)
        .filter(file => {
          const isValid = file && 
            file instanceof File && 
            file.size > 0 && 
            file.name && 
            file.name.length > 0;
          
          if (!isValid) {
            console.error("❌ Invalid file detected:", {
              file: file,
              isFile: file instanceof File,
              size: file?.size,
              name: file?.name,
              hasName: file?.name && file.name.length > 0
            });
          }
          
          return isValid;
        });

      console.log("✅ Valid files after filtering:", validFiles.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
        constructor: f.constructor.name
      })));

      if (validFiles.length === 0) {
        alert("No valid files selected. Please select valid image or PDF files.");
        setSelectedFiles((prev) =>
          prev.map((file) => ({
            ...file,
            uploadStatus: "error",
            errorMessage: "File validation failed"
          }))
        );
        return;
      }

      if (validFiles.length !== selectedFiles.length) {
        console.warn(`⚠️ Some files were filtered out. Valid: ${validFiles.length}, Total: ${selectedFiles.length}`);
      }

      // Create upload request with validated files
      const uploadRequest: FileUploadRequest = {
        files: validFiles,
        docType,
        docBook,
        docNo,
        remark: `${docType} document attachments`,
      };

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 200);

      const response = await fileUploadService.uploadFiles(uploadRequest);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        // Update files to success status
        setSelectedFiles((prev) =>
          prev.map((file) => ({ ...file, uploadStatus: "success" }))
        );

        console.log("✅ Upload successful:", response);
        onUploadSuccess?.(response);

        // Clear files after successful upload
        setTimeout(() => {
          setSelectedFiles([]);
          setUploadProgress(0);
        }, 2000);
      } else {
        // Update files to error status
        setSelectedFiles((prev) =>
          prev.map((file) => ({
            ...file,
            uploadStatus: "error",
            errorMessage: response.error || response.message,
          }))
        );

        console.error("❌ Upload failed:", response);
        onUploadError?.(response.error || response.message);
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      
      setSelectedFiles((prev) =>
        prev.map((file) => ({
          ...file,
          uploadStatus: "error",
          errorMessage,
        }))
      );

      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Get file icon
  const getFileIcon = (file: UploadFile) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="w-4 h-4" />;
    } else if (file.type === "application/pdf") {
      return <FileText className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  // Get status badge
  const getStatusBadge = (file: UploadFile) => {
    switch (file.uploadStatus) {
      case "uploading":
        return <Badge variant="secondary">Uploading...</Badge>;
      case "success":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Success
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return <Badge variant="outline">Ready</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          File Upload
        </CardTitle>
        <p className="text-sm text-gray-600">
          Upload images (PNG, JPG, JPEG) and PDF files for {docType} document: {docNo}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Input */}
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpg,image/jpeg,application/pdf"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button
              type="button"
              variant="outline"
              disabled={disabled || isUploading}
              className="w-full h-20 border-dashed border-2 hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
              asChild
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Click to select files or drag and drop
                </span>
                <span className="text-xs text-gray-500">
                  Images (PNG, JPG, JPEG) and PDF files only
                </span>
              </div>
            </Button>
          </label>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Selected Files ({selectedFiles.length})</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
                >
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        {getFileIcon(file)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {fileUploadService.formatFileSize(file.size)}
                    </p>
                    {file.uploadStatus === "error" && file.errorMessage && (
                      <p className="text-xs text-red-600 mt-1">
                        {file.errorMessage}
                      </p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    {getStatusBadge(file)}
                  </div>

                  {/* Remove Button */}
                  {!isUploading && file.uploadStatus !== "success" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="flex-shrink-0 h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uploading files...</span>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Upload Button */}
        {selectedFiles.length > 0 && (
          <Button
            type="button"
            onClick={handleUpload}
            disabled={disabled || isUploading || selectedFiles.length === 0}
            className="w-full"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading {selectedFiles.length} file(s)...
              </div>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {selectedFiles.length} file(s)
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
