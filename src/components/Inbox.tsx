import { useState, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Search, 
  FileText, 
  Calendar, 
  Building, 
  Package, 
  Eye,
  Download,
  SortAsc,
  SortDesc,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

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

interface InboxProps {
  documents?: InboxDocument[];
  onViewDocument: (document: InboxDocument) => void;
  onDownloadDocument: (document: InboxDocument) => void;
}

// Mock data for demonstration
const mockInboxDocuments: InboxDocument[] = [
  {
    id: '1',
    type: 'PST',
    documentNumber: 'PST-2025-001',
    poNumber: 'PO-2024-12345',
    supplierName: 'ABC Trading Co., Ltd.',
    invoiceNumber: 'INV-001-2025',
    createdDate: '2025-01-30T10:30:00Z',
    status: 'submitted',
    priority: 'high',
    description: 'Prepare Shipping Tax for electronics shipment',
    metadata: {
      currency: 'USD',
      totalAmount: 15250.00,
      blAwbNumber: 'BL-2025-001',
      etd: '2025-02-01',
      eta: '2025-02-15'
    }
  },
  {
    id: '2',
    type: 'PSW',
    documentNumber: 'PSW-2025-002',
    poNumber: 'PO-2024-12346',
    supplierName: 'XYZ Manufacturing Ltd.',
    invoiceNumber: 'INV-002-2025',
    createdDate: '2025-01-30T14:15:00Z',
    status: 'approved',
    priority: 'medium',
    description: 'Prepare Shipping Waybill for textile goods',
    metadata: {
      currency: 'EUR',
      totalAmount: 8750.50,
      blAwbNumber: 'AWB-2025-002',
      etd: '2025-02-03',
      eta: '2025-02-18'
    }
  },
  {
    id: '3',
    type: 'PST',
    documentNumber: 'PST-2025-003',
    poNumber: 'PO-2024-12347',
    supplierName: 'Global Supplies Inc.',
    invoiceNumber: 'INV-003-2025',
    createdDate: '2025-01-29T16:45:00Z',
    status: 'draft',
    priority: 'low',
    description: 'Prepare Shipping Tax for machinery parts',
    metadata: {
      currency: 'USD',
      totalAmount: 25000.00,
      blAwbNumber: 'BL-2025-003',
      etd: '2025-02-05',
      eta: '2025-02-20'
    }
  }
];

export function Inbox({ 
  documents = mockInboxDocuments, 
  onViewDocument,
  onDownloadDocument 
}: InboxProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'PST' | 'PSW'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents.filter(doc => {
      const matchesSearch = 
        doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = selectedType === 'all' || doc.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort documents
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [documents, searchTerm, selectedType, selectedStatus, sortBy, sortOrder]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'submitted':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="px-6 pb-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
            <p className="text-gray-600">จัดการเอกสาร PST และ PSW ที่ได้รับ</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {filteredDocuments.length} เอกสาร
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ค้นหาเอกสาร..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="ประเภทเอกสาร" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="PST">PST</SelectItem>
                  <SelectItem value="PSW">PSW</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="สถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกสถานะ</SelectItem>
                  <SelectItem value="draft">ร่าง</SelectItem>
                  <SelectItem value="submitted">ส่งแล้ว</SelectItem>
                  <SelectItem value="approved">อนุมัติ</SelectItem>
                  <SelectItem value="rejected">ปฏิเสธ</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="เรียงตาม" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">วันที่สร้าง</SelectItem>
                    <SelectItem value="priority">ความสำคัญ</SelectItem>
                    <SelectItem value="status">สถานะ</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <div className="space-y-4">
          {filteredDocuments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบเอกสาร</h3>
                  <p className="text-gray-600">ไม่มีเอกสารที่ตรงกับเงื่อนไขการค้นหา</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header Row */}
                      <div className="flex items-center gap-3">
                        <Badge 
                          className={`${document.type === 'PST' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}
                        >
                          {document.type}
                        </Badge>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {document.documentNumber}
                        </h3>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(document.status)}
                          <Badge className={getStatusColor(document.status)}>
                            {document.status === 'draft' && 'ร่าง'}
                            {document.status === 'submitted' && 'ส่งแล้ว'}
                            {document.status === 'approved' && 'อนุมัติ'}
                            {document.status === 'rejected' && 'ปฏิเสธ'}
                          </Badge>
                        </div>
                        <Badge className={getPriorityColor(document.priority)}>
                          {document.priority === 'high' && 'สำคัญมาก'}
                          {document.priority === 'medium' && 'สำคัญปานกลาง'}
                          {document.priority === 'low' && 'สำคัญน้อย'}
                        </Badge>
                      </div>

                      {/* Document Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">PO:</span>
                          <span className="font-medium">{document.poNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">ผู้จำหน่าย:</span>
                          <span className="font-medium">{document.supplierName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Invoice:</span>
                          <span className="font-medium">{document.invoiceNumber}</span>
                        </div>
                      </div>

                      {/* Additional Info */}
                      {document.metadata && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          {document.metadata.totalAmount && (
                            <div>
                              <span className="font-medium">จำนวนเงิน:</span>
                              <br />
                              {document.metadata.totalAmount.toLocaleString()} {document.metadata.currency}
                            </div>
                          )}
                          {document.metadata.blAwbNumber && (
                            <div>
                              <span className="font-medium">BL/AWB:</span>
                              <br />
                              {document.metadata.blAwbNumber}
                            </div>
                          )}
                          {document.metadata.etd && (
                            <div>
                              <span className="font-medium">ETD:</span>
                              <br />
                              {format(new Date(document.metadata.etd), 'dd/MM/yyyy')}
                            </div>
                          )}
                          {document.metadata.eta && (
                            <div>
                              <span className="font-medium">ETA:</span>
                              <br />
                              {format(new Date(document.metadata.eta), 'dd/MM/yyyy')}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Description */}
                      {document.description && (
                        <p className="text-sm text-gray-600 italic">
                          {document.description}
                        </p>
                      )}

                      {/* Created Date */}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>สร้างเมื่อ: {format(new Date(document.createdDate), 'dd/MM/yyyy HH:mm')}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDocument(document)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        ดู
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownloadDocument(document)}
                        className="flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        ดาวน์โหลด
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
