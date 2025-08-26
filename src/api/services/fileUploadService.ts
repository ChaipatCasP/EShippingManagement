/**
 * File Upload Service for PST/PSW documents
 * Handles uploading of images and PDF files
 */
import { env } from '../../config/env';


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
    
    private baseUrl = `${env.jagotaApi.baseUrljagota}/FileUpload/`;
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

            // Log file information for debugging
            console.log("📁 Files to upload:", request.files.map(f => ({
                name: f.name,
                size: f.size,
                type: f.type,
                isValid: f instanceof File
            })));

            // Add files to form data with proper validation
            let fileCount = 0;
            for (let index = 0; index < request.files.length; index++) {
                const file = request.files[index];

                if (file && file instanceof File && file.size > 0) {
                    console.log(`📎 Processing file ${index + 1}:`, {
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        lastModified: file.lastModified,
                        constructor: file.constructor.name
                    });

                    // Create a new File object to avoid any reference issues
                    const clonedFile = new File([file], file.name, {
                        type: file.type,
                        lastModified: file.lastModified
                    });

                    console.log(`📋 Cloned file ${index + 1}:`, {
                        name: clonedFile.name,
                        size: clonedFile.size,
                        type: clonedFile.type,
                        lastModified: clonedFile.lastModified
                    });

                    // Verify file content by reading first few bytes
                    try {
                        const chunk = file.slice(0, 100);
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const arrayBuffer = e.target?.result as ArrayBuffer;
                            const bytes = new Uint8Array(arrayBuffer);
                            console.log(`📖 File ${file.name} first 10 bytes:`, Array.from(bytes.slice(0, 10)));
                        };
                        reader.readAsArrayBuffer(chunk);
                    } catch (readError) {
                        console.warn(`⚠️ Could not read file ${file.name}:`, readError);
                    }

                    formData.append("FILE2UPLOAD[]", clonedFile, clonedFile.name);
                    fileCount++;
                } else {
                    console.warn(`⚠️ Skipping invalid file ${index + 1}:`, {
                        file: file,
                        isFile: file instanceof File,
                        size: file?.size,
                        name: file?.name,
                        type: file?.type
                    });
                }
            }

            // Debug FormData contents
            console.log("📦 FormData entries:");
            for (const [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`  ${key}:`, {
                        name: value.name,
                        size: value.size,
                        type: value.type,
                        lastModified: value.lastModified
                    });
                } else {
                    console.log(`  ${key}:`, value);
                }
            }

            if (fileCount === 0) {
                return {
                    success: false,
                    message: "No valid files to upload",
                    error: "All files were invalid or empty",
                };
            }

            // Document number like "JB.PS.PST.21978"
            const documentId = `${this.company}.${request.docType}.${request.docBook}.${request.docNo}`;

            // Add document information
            formData.append("DOCUMENT", documentId);
            formData.append("DOCUMENT_SEQ", "0");
            formData.append("DOCUMENT_TYPE", request.docType);
            formData.append("REMARK", request.remark || `${request.docType} document attachments`);

            console.log("📄 Document info:", {
                DOCUMENT: documentId,
                DOCUMENT_SEQ: "0",
                DOCUMENT_TYPE: request.docType,
                REMARK: request.remark || `${request.docType} document attachments`,
                fileCount: fileCount
            });

            console.log("📡 Sending upload request to:", this.baseUrl);
            console.log("🔑 Headers:", {
                Authorization: this.token.substring(0, 20) + "...",
                Username: this.username
            });

            // Verify FormData size before sending
            let totalFormDataSize = 0;
            for (const [, value] of formData.entries()) {
                if (value instanceof File) {
                    totalFormDataSize += value.size;
                }
            }
            console.log("📏 Total FormData size:", totalFormDataSize, "bytes");

            if (totalFormDataSize === 0) {
                console.error("❌ FormData contains no file data!");
                return {
                    success: false,
                    message: "No file data in FormData",
                    error: "FormData is empty or files are corrupted",
                };
            }

            // Make the API call
            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: headers,
                body: formData,
            });

            const result = await response.text();
            console.log("📬 Upload response:", result);

            // Try to parse the response as JSON
            let parsedResult;
            try {
                parsedResult = JSON.parse(result);
                console.log("📝 Parsed response:", parsedResult);
            } catch (parseError) {
                console.warn("Failed to parse response as JSON:", parseError);
                parsedResult = { message: result };
            }

            // Check for successful response
            if (response.ok) {
                // Check for API-level errors in the response
                if (parsedResult.jwt === 1 && parsedResult.flag === 0) {
                    // This indicates an API error even though HTTP status is OK
                    return {
                        success: false,
                        message: "Upload failed",
                        error: parsedResult.message || "Unknown API error",
                    };
                }

                return {
                    success: true,
                    message: parsedResult.message || "Files uploaded successfully",
                    data: parsedResult,
                };
            } else {
                return {
                    success: false,
                    message: "Upload failed",
                    error: `HTTP ${response.status}: ${parsedResult.message || result}`,
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
