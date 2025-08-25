export interface Shipment {
  id: string;
  supplierName: string;
  supplierCode: string; // Add supplier code for API matching
  referenceKey: string;
  insurance?: boolean;
  agentContact?: string;
  trackingNumber?: string;
  customsDeclaration?: string;
  priority?: 'High' | 'Medium' | 'Low';
  remarks?: string;
  specialInstructions?: string;
  documents?: string[];
  poNumber: string;
  poDate: string;
  invoiceNumber: string;
  invoiceDate: string;
  importEntryNo: string;
  originCountry: string;
  originPort: string;
  destinationPort: string;
  dateClear: string;
  type: 'Air' | 'Sea' | 'Land';
  poType: 'Single' | 'Co-load';
  term: string;
  permitStatus: boolean;
  blAwbNumber: string;
  qualityContainer: string;
  pstWebSeqId?: number; // Add for Update PST functionality
  taxStatus: boolean;
  etd: string;
  eta: string;
  status: 'pending' | 'pst-created' | 'pst-approved' | 'psw-waiting-approval' | 'completed';
  billStatus: 'New Entry' | 'In Progress' | 'Completed' | 'On Hold' | 'Documentation Pending' | 'Approved' | 'Pending' | 'Processing';
  jagotaStatus: 'Under Review' | 'Approved' | 'On Hold' | 'Completed' | 'Processing';
  billType: 'Urgent' | 'Regular' | 'Express' | 'Premium' | 'Cold Chain' | 'Bulk';
  pstStatus: 'N' | 'Y' | 'Z' | string;
  pstNumber: string | null;
  pstBook?: string | null; // PST Book จาก po-list API
  pstNo?: number | null;   // PST Number จาก po-list API
  pstJagotaStatus?: 'N' | 'Y' | 'Z' | string;
  pswStatus?: 'N' | 'Y' | 'Z' | string;
  pswNumber: string | null;
  pswBook?: string | null; // PSW Book จาก po-list API
  pswNo?: number | null;   // PSW Number จาก po-list API
  pswJagotaStatus?: 'N' | 'Y' | 'Z' | string;
  pswWebSeqId?: number;
  pstTransactionType?: string;
  pswTransactionType?: string;
  supplierContact: string;
  supplierEmail: string;
  supplierAddress: string;
  totalValue: number;
  weight: string;
  dimensions: string;
  assignedAgent: string;
  relatedSuppliers: RelatedSupplier[];
  originalPOData?: {
    supCode: string;
    poBook: string;
    poNo: number;
    transType: string;
    coLoadPOCount: number;
    coLoadSupplierCount: number;
  };

}

export interface RelatedSupplier {
  name: string;
  referenceKey: string;
  poNumber: string;
}

export interface Comment {
  id: string;
  author: string;
  role: string;
  content: string;
  timestamp: string;
  type: 'user' | 'system';
  messageType: 'internal' | 'external';
  tags: string[];
  mentions: string[];
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface Notification {
  id: string;
  type: 'mention' | 'comment' | 'system' | 'action' | 'update';
  title: string;
  message: string;
  poNumber: string;
  author?: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionRequired?: boolean;
}

export type SortOption = 'none' | 'clearDate-asc' | 'clearDate-desc' | 'status-asc' | 'status-desc';
export type CurrentView = 'dashboard' | 'create-pst' | 'create-psw' | 'inbox' | 'history' | 'completed-view';
export type DateFilterMode = 'today' | 'last7days' | 'custom';

// PSW API Response interface
export interface PSWApiResponse {
  pswWebSeqId?: number;
  pswBook?: string | null;
  pswNo?: number | null;
  pstWebSeqId?: number;
  supplierName?: string;
  poNumber?: string;
  invoiceNo?: string;
  currency?: string;
  transportMode?: string;
  importEntryNo?: string;
  // Tax and financial data
  importTaxRate?: number;
  importTaxAmount?: number;
  vatRate?: number;
  vatAmount?: number;
  dutyRate?: number;
  dutyAmount?: number;
  totalTaxDuty?: number;
  invoiceValue?: number;
  // Additional PSW specific data
  [key: string]: any; // For any additional fields from API
}