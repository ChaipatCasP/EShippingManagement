import { AuthUtils } from '../../utils/authUtils';
import { env } from '../../config/env';

/**
 * Attachment Service for viewing uploaded files
 * Fetches attachment data from the API
 */

export interface AttachmentItem {
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedDate: string;
    downloadUrl?: string;
    viewUrl?: string; // For FileViewer URL
    fileExtension: string;
}

export interface AttachmentResponse {
    success: boolean;
    data: AttachmentItem[];
    message?: string;
    error?: string;
}

class AttachmentService {
    private fileViewerBaseUrl = "https://apis-staging.jagota.com/FileViewer/";
    
    private getToken(): string {
        return AuthUtils.getAuthToken();
    }

    /**
     * Convert API URL format to FileViewer format
     * IBMattachments/PS/202508/152078825.jpg -> PS_202508_152078825.jpg
     */
    private convertToFileViewerUrl(apiUrl: string): string {
        try {
            // Remove IBMattachments/ prefix if exists
            let cleanUrl = apiUrl.replace(/^IBMattachments\//, '');
            
            // Split by '/' to get parts: [PS, 202508, 152078825.jpg]
            const parts = cleanUrl.split('/');
            
            if (parts.length >= 3) {
                const transType = parts[0]; // PS
                const yearMonth = parts[1]; // 202508
                const fileName = parts[2]; // 152078825.jpg
                
                // Create file format: PS_202508_152078825.jpg
                const fileUrl = `${transType}_${yearMonth}_${fileName}`;
                
                // Return full FileViewer URL
                return `${this.fileViewerBaseUrl}?file=${fileUrl}&token=jagota`;
            }
            
            // Fallback if format doesn't match expected pattern
            return `${this.fileViewerBaseUrl}?file=${cleanUrl.replace(/\//g, '_')}&token=jagota`;
            
        } catch (error) {
            console.warn("Failed to convert URL format:", error);
            return `${this.fileViewerBaseUrl}?file=${apiUrl}&token=jagota`;
        }
    }

    async getAttachments(transType: string, poBook: string, poNo: string): Promise<AttachmentResponse> {
        try {
            console.log("📎 Fetching attachments for:", { transType, poBook, poNo });

            const headers = new Headers();
            headers.append("Authorization", this.getToken());
            // headers.append("Username", this.username);

            const url = `${env.jagotaApi.baseUrl}/v1/es/eshipping/attachments?transType=${transType}&poBook=${poBook}&poNo=${poNo}`;

            const response = await fetch(url, {
                method: "GET",
                headers: headers,
                redirect: "follow",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.text();
            console.log("📎 Raw API response:", result);

            // Try to parse as JSON, if it fails, treat as text
            let data;
            try {
                data = JSON.parse(result);

                // Check if API returned an error response
                if (data.error && data.message) {
                    console.error("📎 API Error Response:", data);
                    return {
                        success: false,
                        data: [],
                        error: `API Error: ${data.message}`,
                    };
                }

            } catch (parseError) {
                console.warn("Failed to parse as JSON, treating as text:", parseError);
                return {
                    success: false,
                    data: [],
                    error: "Invalid JSON response from server",
                };
            }

            // Handle different response formats based on API structure
            let attachmentData: any[] = [];
            
            // Check if this is the new API format with error, message, data structure
            if (data.hasOwnProperty('error') && data.hasOwnProperty('data')) {
                if (data.error === true) {
                    return {
                        success: false,
                        data: [],
                        error: data.message || "API returned error",
                    };
                }
                
                // Use the data array from the new format
                attachmentData = data.data || [];
            } else if (data.data && Array.isArray(data.data)) {
                // Legacy format
                attachmentData = data.data;
            } else if (Array.isArray(data)) {
                // Direct array format
                attachmentData = data;
            } else {
                // Unknown format, treat as empty
                attachmentData = [];
            }

            // Transform the response data to our interface
            const attachments: AttachmentItem[] = Array.isArray(attachmentData) ? attachmentData.map((item: any, index: number) => {
                const fileName = item.fileName || item.filename || item.name || "Unknown";
                const originalUrl = item.downloadUrl || item.url || "";
                
                return {
                    id: item.id || `attachment-${index}`,
                    fileName: fileName,
                    fileSize: item.fileSize || item.size || this.estimateFileSize(fileName),
                    fileType: item.fileType || item.type || item.mimeType || this.getFileTypeFromName(fileName),
                    uploadedDate: item.uploadedDate || item.createdDate || item.date || new Date().toISOString(),
                    downloadUrl: originalUrl,
                    viewUrl: originalUrl ? this.convertToFileViewerUrl(originalUrl) : undefined,
                    fileExtension: this.getFileExtension(fileName),
                };
            }) : [];

            return {
                success: true,
                data: attachments,
                message: `Found ${attachments.length} attachments`,
            };

        } catch (error) {
            console.error("❌ Error fetching attachments:", error);
            return {
                success: false,
                data: [],
                error: error instanceof Error ? error.message : "Failed to fetch attachments",
            };
        }
    }

    /**
     * Get file extension from filename
     */
    private getFileExtension(fileName: string): string {
        const lastDot = fileName.lastIndexOf('.');
        return lastDot !== -1 ? fileName.substring(lastDot + 1).toLowerCase() : '';
    }

    /**
     * Get file type from filename
     */
    private getFileTypeFromName(fileName: string): string {
        const extension = this.getFileExtension(fileName);
        
        switch (extension) {
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'bmp':
                return 'image';
            case 'pdf':
                return 'application/pdf';
            case 'doc':
            case 'docx':
                return 'application/msword';
            case 'xls':
            case 'xlsx':
                return 'application/excel';
            default:
                return 'unknown';
        }
    }

    /**
     * Estimate file size (fallback when not provided)
     */
    private estimateFileSize(fileName: string): number {
        // Return a default size if not provided
        return 0;
    }

    /**
     * Format file size in human readable format
     */
    formatFileSize(bytes: number): string {
        if (bytes === 0) return "0 Bytes";

        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    /**
     * Get file icon based on file type
     */
    getFileIcon(fileExtension: string): string {
        switch (fileExtension.toLowerCase()) {
            case 'pdf':
                return '📄';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'bmp':
                return '🖼️';
            case 'doc':
            case 'docx':
                return '📝';
            case 'xls':
            case 'xlsx':
                return '📊';
            default:
                return '📎';
        }
    }
}

export const attachmentService = new AttachmentService();
