/**
 * File Upload Service for PST/PSW documents
 * Handles uploading of images and PDF files
 */

export interface FileUploadRequest {
    files: File[];
    docType: string; // PST, PSW, etc.
    docBook: string;
    docNo: string; // Document number like "JB.PS.PST.21978"
    remark?: string;
    documentSeq?: string;
}

export interface FileUploadResponse {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}

class FileUploadService {
    private baseUrl = "https://apis-staging.jagota.com/FileUpload/";
    private token = "Bearer eyJ0eXAiOiJqd3QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiItIiwiaXNzdWVkQXQiOiIxNjkzMzkyNTU4IiwidHRsIjozMTU1Njk1MjB9.6pzO34CuZ7Vya8UdHdOVsDoT_Tc12MK32VvLvCegx_s";
    //   private username = "JBT04";
    private username = "GUEST04";
    private user_data = localStorage.getItem('user_data');
    private company = this.user_data ? JSON.parse(this.user_data).company : ""; //"JB"


    /**
     * Upload files for PST/PSW documents
     */
    async uploadFiles(request: FileUploadRequest): Promise<FileUploadResponse> {
        try {
            console.log("📁 Starting file upload:", {
                fileCount: request.files.length,
                docType: request.docType,
                docNo: request.docNo,
            });

            // Validate files
            const validationResult = this.validateFiles(request.files);
            if (!validationResult.isValid) {
                return {
                    success: false,
                    message: "File validation failed",
                    error: validationResult.message,
                };
            }

            // Prepare headers
            const headers = new Headers();
            headers.append("Authorization", this.token);
            headers.append("Username", this.username);

            // Prepare form data
            const formData = new FormData();

            // Add files to form data
            request.files.forEach((file) => {
                formData.append("FILE2UPLOAD[]", file, file.name);
            });

            // Document number like "JB.PS.PST.21978"
            // Add document information
            formData.append("DOCUMENT", this.company + '.' + request.docType + '.' + request.docBook + '.' + request.docNo);
            formData.append("DOCUMENT_SEQ", "0");
            formData.append("DOCUMENT_TYPE", request.docType);
            formData.append("REMARK", request.remark || "");

            console.log("📡 Sending upload request to:", this.baseUrl);

            // Make the API call
            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: headers,
                body: formData,
            });

            const result = await response.text();
            console.log("📬 Upload response:", result);

            if (response.ok) {
                return {
                    success: true,
                    message: "Files uploaded successfully",
                    data: result,
                };
            } else {
                return {
                    success: false,
                    message: "Upload failed",
                    error: `HTTP ${response.status}: ${result}`,
                };
            }
        } catch (error) {
            console.error("❌ File upload error:", error);
            return {
                success: false,
                message: "Upload failed due to network error",
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    /**
     * Validate uploaded files
     */
    private validateFiles(files: File[]): { isValid: boolean; message?: string } {
        if (!files || files.length === 0) {
            return { isValid: false, message: "No files selected" };
        }

        // Check file count limit
        if (files.length > 10) {
            return { isValid: false, message: "Maximum 10 files allowed" };
        }

        // Check each file
        for (const file of files) {
            // Check if file object is valid
            if (!file) {
                return {
                    isValid: false,
                    message: "Invalid file object detected",
                };
            }

            // Check file name
            if (!file.name) {
                return {
                    isValid: false,
                    message: "File name is missing",
                };
            }

            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                return {
                    isValid: false,
                    message: `File "${file.name}" is too large. Maximum size is 10MB.`,
                };
            }

            // Check file type (only images and PDF)
            if (!this.isValidFileType(file)) {
                return {
                    isValid: false,
                    message: `File "${file.name}" is not supported. Only images (PNG, JPG, JPEG) and PDF files are allowed.`,
                };
            }
        }

        return { isValid: true };
    }

    /**
     * Check if file type is valid (images and PDF only)
     */
    private isValidFileType(file: File): boolean {
        // Check if file and file.name exist
        if (!file || !file.name) {
            console.warn("⚠️ File or file.name is undefined:", file);
            return false;
        }

        const allowedTypes = [
            "image/png",
            "image/jpg",
            "image/jpeg",
            "application/pdf",
        ];

        const allowedExtensions = [".png", ".jpg", ".jpeg", ".pdf"];

        // Safely get file extension
        const fileName = file.name.toLowerCase();
        const lastDotIndex = fileName.lastIndexOf('.');
        const fileExtension = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : "";

        // Check file type
        const hasValidType = file.type && allowedTypes.includes(file.type.toLowerCase());
        const hasValidExtension = fileExtension && allowedExtensions.includes(fileExtension);

        console.log("🔍 File validation:", {
            fileName: file.name,
            fileType: file.type,
            fileExtension,
            hasValidType: !!hasValidType,
            hasValidExtension: !!hasValidExtension,
        });

        return Boolean(hasValidType || hasValidExtension);
    }

    /**
     * Format file size for display
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
    getFileIcon(file: File): string {
        if (file.type.startsWith("image/")) {
            return "🖼️";
        } else if (file.type === "application/pdf") {
            return "📄";
        }
        return "📎";
    }
}

// Export singleton instance
export const fileUploadService = new FileUploadService();
