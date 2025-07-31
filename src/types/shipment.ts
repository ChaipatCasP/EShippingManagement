export interface Shipment {
  id: string;
  supplierName: string;
  referenceKey: string;
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
  poType: 'Single' | 'Multiple' | 'Co-load';
  term: string;
  permitStatus: boolean;
  blAwbNumber: string;
  qualityContainer: string;
  taxStatus: boolean;
  etd: string;
  eta: string;
  status: 'pending' | 'pst-created' | 'pst-approved' | 'psw-waiting-approval' | 'completed';
  billStatus: 'New Entry' | 'In Progress' | 'Completed' | 'On Hold' | 'Documentation Pending' | 'Approved' | 'Pending' | 'Processing';
  jagotaStatus: 'Under Review' | 'Approved' | 'On Hold' | 'Completed' | 'Processing';
  billType: 'Urgent' | 'Regular' | 'Express' | 'Premium' | 'Cold Chain' | 'Bulk';
  pstStatus: 'new-entry' | 'not-started' | 'in-progress' | 'completed';
  pstNumber: string | null;
  pswStatus?: 'not-started' | 'in-progress' | 'waiting-approval' | 'approved';
  pswNumber: string | null;
  supplierContact: string;
  supplierEmail: string;
  supplierAddress: string;
  totalValue: number;
  weight: string;
  dimensions: string;
  assignedAgent: string;
  agentContact: string;
  trackingNumber: string;
  customsDeclaration: string;
  insurance: boolean;
  priority: 'High' | 'Medium' | 'Low';
  remarks: string;
  specialInstructions: string;
  documents: string[];
  relatedSuppliers: RelatedSupplier[];
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
export type CurrentView = 'dashboard' | 'create-pst' | 'create-psw' | 'inbox';
export type DateFilterMode = 'today' | 'last7days' | 'custom';