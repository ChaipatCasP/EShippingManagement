import { useState, useEffect } from 'react';
import { Inbox } from '../components/Inbox';

interface InboxDocument {
  id: string;
  type: 'PST' | 'PSW';
  documentNumber: string;
  poNumber: string;
  supplierName: string;
  invoiceNumber: string;
  createdDate: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  description?: string;
  attachments?: string[];
  metadata: {
    currency?: string;
    totalAmount?: number;
    blAwbNumber?: string;
    etd?: string;
    eta?: string;
  };
}

export function InboxContainer() {
  const [documents, setDocuments] = useState<InboxDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Load documents from localStorage or API
  useEffect(() => {
    const loadDocuments = () => {
      try {
        // Try to load from localStorage first
        const savedPSTData = localStorage.getItem('pst-form-data');
        const savedPSWData = localStorage.getItem('psw-form-data');
        
        const loadedDocuments: InboxDocument[] = [];

        // Load PST documents
        if (savedPSTData) {
          try {
            const pstForms = JSON.parse(savedPSTData);
            if (Array.isArray(pstForms)) {
              pstForms.forEach((form, index) => {
                loadedDocuments.push({
                  id: `pst-${index + 1}`,
                  type: 'PST',
                  documentNumber: `PST-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`,
                  poNumber: form.poNumber || 'N/A',
                  supplierName: form.supplierName || 'N/A',
                  invoiceNumber: form.invoiceNumber || 'N/A',
                  createdDate: form.createdDate || new Date().toISOString(),
                  status: form.status || 'draft',
                  priority: form.priority || 'medium',
                  description: form.description || 'Prepare Shipping Tax document',
                  metadata: {
                    currency: form.currency || 'USD',
                    totalAmount: form.totalAmount ? parseFloat(form.totalAmount) : undefined,
                    blAwbNumber: form.blAwbNumber,
                    etd: form.etd,
                    eta: form.eta
                  }
                });
              });
            } else if (typeof pstForms === 'object') {
              // Single form object
              loadedDocuments.push({
                id: 'pst-1',
                type: 'PST',
                documentNumber: `PST-${new Date().getFullYear()}-001`,
                poNumber: pstForms.poNumber || 'N/A',
                supplierName: pstForms.supplierName || 'N/A',
                invoiceNumber: pstForms.invoiceNumber || 'N/A',
                createdDate: pstForms.createdDate || new Date().toISOString(),
                status: pstForms.status || 'draft',
                priority: pstForms.priority || 'medium',
                description: pstForms.description || 'Prepare Shipping Tax document',
                metadata: {
                  currency: pstForms.currency || 'USD',
                  totalAmount: pstForms.totalAmount ? parseFloat(pstForms.totalAmount) : undefined,
                  blAwbNumber: pstForms.blAwbNumber,
                  etd: pstForms.etd,
                  eta: pstForms.eta
                }
              });
            }
          } catch (e) {
            console.error('Error parsing PST data:', e);
          }
        }

        // Load PSW documents
        if (savedPSWData) {
          try {
            const pswForms = JSON.parse(savedPSWData);
            if (Array.isArray(pswForms)) {
              pswForms.forEach((form, index) => {
                loadedDocuments.push({
                  id: `psw-${index + 1}`,
                  type: 'PSW',
                  documentNumber: `PSW-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`,
                  poNumber: form.poNumber || 'N/A',
                  supplierName: form.supplierName || 'N/A',
                  invoiceNumber: form.invoiceNumber || 'N/A',
                  createdDate: form.createdDate || new Date().toISOString(),
                  status: form.status || 'draft',
                  priority: form.priority || 'medium',
                  description: form.description || 'Prepare Shipping Waybill document',
                  metadata: {
                    currency: form.currency || 'USD',
                    totalAmount: form.totalAmount ? parseFloat(form.totalAmount) : undefined,
                    blAwbNumber: form.blAwbNumber,
                    etd: form.etd,
                    eta: form.eta
                  }
                });
              });
            } else if (typeof pswForms === 'object') {
              // Single form object
              loadedDocuments.push({
                id: 'psw-1',
                type: 'PSW',
                documentNumber: `PSW-${new Date().getFullYear()}-001`,
                poNumber: pswForms.poNumber || 'N/A',
                supplierName: pswForms.supplierName || 'N/A',
                invoiceNumber: pswForms.invoiceNumber || 'N/A',
                createdDate: pswForms.createdDate || new Date().toISOString(),
                status: pswForms.status || 'draft',
                priority: pswForms.priority || 'medium',
                description: pswForms.description || 'Prepare Shipping Waybill document',
                metadata: {
                  currency: pswForms.currency || 'USD',
                  totalAmount: pswForms.totalAmount ? parseFloat(pswForms.totalAmount) : undefined,
                  blAwbNumber: pswForms.blAwbNumber,
                  etd: pswForms.etd,
                  eta: pswForms.eta
                }
              });
            }
          } catch (e) {
            console.error('Error parsing PSW data:', e);
          }
        }

        // Sort by creation date (newest first)
        loadedDocuments.sort((a, b) => 
          new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
        );

        // If no documents loaded from localStorage, set empty array
        // The Inbox component will use its mock data as fallback
        setDocuments(loadedDocuments);
      } catch (error) {
        console.error('Error loading documents:', error);
        // Set empty array, let Inbox component handle mock data
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();

    // Listen for storage changes to update in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pst-form-data' || e.key === 'psw-form-data') {
        loadDocuments();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleViewDocument = (document: InboxDocument) => {
    // TODO: Implement document viewer
    console.log('View document:', document);
    
    // For now, show an alert with document info
    alert(`Document: ${document.documentNumber}\nType: ${document.type}\nStatus: ${document.status}\nSupplier: ${document.supplierName}`);
  };

  const handleDownloadDocument = (document: InboxDocument) => {
    // TODO: Implement document download
    console.log('Download document:', document);
    
    // For now, show an alert
    alert(`กำลังดาวน์โหลดเอกสาร ${document.documentNumber}\n(ฟีเจอร์นี้จะเพิ่มในเวอร์ชันถัดไป)`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <Inbox
      documents={documents.length > 0 ? documents : undefined}
      onViewDocument={handleViewDocument}
      onDownloadDocument={handleDownloadDocument}
    />
  );
}
