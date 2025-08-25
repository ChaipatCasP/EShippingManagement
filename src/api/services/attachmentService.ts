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
    fileExtension: string;
}

export interface AttachmentResponse {
    success: boolean;
    data: AttachmentItem[];
    message?: string;
    error?: string;
}

class AttachmentService {
    private baseUrl = "https://jnodeapi-staging.jagota.com/v1/es/eshipping/attachments";
    private token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21wYW55IjoiSkIiLCJ1c2VybmFtZSI6Imt1c3VtYUBzYW5ndGhvbmdzdWtzaGlwcGluZ3NvbHV0aW9uLmNvLnRoIiwic3VwcGxpZXJDb2RlIjoiNjIzMiIsImlhdCI6MTc1NDI4MDIxMywiZXhwIjoxNzg1ODE2MjEzfQ.1bys3p_-9kQ-DlgWfz7g3m2ap3_0jypyQDF8FUuQIR0";

    async getAttachments(transType: string, poBook: string, poNo: string): Promise<AttachmentResponse> {
        try {
            console.log("📎 Fetching attachments for:", { transType, poBook, poNo });

            const headers = new Headers();
            headers.append("Authorization", this.token);
            // headers.append("Username", this.username);

            const url = `${this.baseUrl}?transType=${transType}&poBook=${poBook}&poNo=${poNo}`;

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

            // Handle different response formats
            let attachmentData = data;
            if (data.data && Array.isArray(data.data)) {
                attachmentData = data.data;
            } else if (!Array.isArray(data)) {
                // If it's not an array and doesn't have a data property, treat as empty
                attachmentData = [];
            }

            // Transform the response data to our interface
            const attachments: AttachmentItem[] = Array.isArray(attachmentData) ? attachmentData.map((item: any, index: number) => ({
                id: item.id || `attachment-${index}`,
                fileName: item.fileName || item.filename || item.name || "Unknown",
                fileSize: item.fileSize || item.size || 0,
                fileType: item.fileType || item.type || item.mimeType || "unknown",
                uploadedDate: item.uploadedDate || item.createdDate || item.date || new Date().toISOString(),
                downloadUrl: item.downloadUrl || item.url,
                fileExtension: this.getFileExtension(item.fileName || item.filename || item.name || ""),
            })) : [];

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
