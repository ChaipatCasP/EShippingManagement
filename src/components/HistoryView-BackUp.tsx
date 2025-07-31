import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  ArrowLeft, 
  Search, 
  FileText,
  Package,
  Ship,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface HistoryRecord {
  id: string;
  date: Date;
  action: string;
  actionType: 'pst_created' | 'psw_created' | 'shipment_created' | 'status_updated' | 'document_uploaded';
  poNumber: string;
  pstNumber?: string;
  pswNumber?: string;
  status: 'completed' | 'pending' | 'failed';
  details: string;
  user: string;
  department: 'shipping' | 'customs' | 'finance' | 'operations';
}

interface HistoryViewProps {
  onClose: () => void;
}

// Mock history data
const mockHistoryRecords: HistoryRecord[] = [
  {
    id: '1',
    date: new Date('2025-01-30T14:30:00'),
    action: 'PSW Created',
    actionType: 'psw_created',
    poNumber: 'PO-2025-001',
    pstNumber: 'PST-2025-001',
    pswNumber: 'PSW-2025-001',
    status: 'completed',
    details: 'Payment Shipping Worksheet created successfully for Global Foods Ltd.',
    user: 'John Doe',
    department: 'finance'
  },
  {
    id: '2',
    date: new Date('2025-01-30T11:15:00'),
    action: 'PST Created',
    actionType: 'pst_created',
    poNumber: 'PO-2025-001',
    pstNumber: 'PST-2025-001',
    status: 'completed',
    details: 'Prepare Shipping Tax document created and submitted to customs.',
    user: 'Jane Smith',
    department: 'customs'
  },
  {
    id: '3',
    date: new Date('2025-01-30T09:45:00'),
    action: 'Shipment Created',
    actionType: 'shipment_created',
    poNumber: 'PO-2025-001',
    status: 'completed',
    details: 'New shipment entry created for frozen seafood from Thailand.',
    user: 'Mike Johnson',
    department: 'operations'
  },
  {
    id: '4',
    date: new Date('2025-01-29T16:20:00'),
    action: 'Document Uploaded',
    actionType: 'document_uploaded',
    poNumber: 'PO-2025-002',
    status: 'completed',
    details: 'Commercial invoice and packing list uploaded for customs review.',
    user: 'Sarah Wilson',
    department: 'shipping'
  },
  {
    id: '5',
    date: new Date('2025-01-29T14:10:00'),
    action: 'Status Updated',
    actionType: 'status_updated',
    poNumber: 'PO-2025-003',
    status: 'completed',
    details: 'Shipment status changed from "In Transit" to "Arrived at Port".',
    user: 'Tom Brown',
    department: 'operations'
  },
  {
    id: '6',
    date: new Date('2025-01-29T10:30:00'),
    action: 'PST Created',
    actionType: 'pst_created',
    poNumber: 'PO-2025-004',
    pstNumber: 'PST-2025-002',
    status: 'pending',
    details: 'PST document created, waiting for customs approval.',
    user: 'Lisa Davis',
    department: 'customs'
  }
];

export function HistoryView({ onClose }: HistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedActionType, setSelectedActionType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Filter history records
  const filteredRecords = useMemo(() => {
    return mockHistoryRecords.filter(record => {
      const matchesSearch = searchTerm === '' || 
        record.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.pstNumber && record.pstNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (record.pswNumber && record.pswNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDepartment = selectedDepartment === 'all' || record.department === selectedDepartment;
      const matchesActionType = selectedActionType === 'all' || record.actionType === selectedActionType;
      const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;

      return matchesSearch && matchesDepartment && matchesActionType && matchesStatus;
    });
  }, [searchTerm, selectedDepartment, selectedActionType, selectedStatus]);

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'pst_created':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'psw_created':
        return <Package className="w-4 h-4 text-green-600" />;
      case 'shipment_created':
        return <Ship className="w-4 h-4 text-purple-600" />;
      case 'status_updated':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'document_uploaded':
        return <FileText className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case 'shipping':
        return 'bg-blue-100 text-blue-800';
      case 'customs':
        return 'bg-green-100 text-green-800';
      case 'finance':
        return 'bg-purple-100 text-purple-800';
      case 'operations':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Shipment History</h1>
              <p className="text-sm text-gray-600">Track all activities and document changes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Filters */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Filter History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search PO, PST, PSW numbers or actions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Department Filter */}
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="shipping">Shipping</SelectItem>
                    <SelectItem value="customs">Customs</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                  </SelectContent>
                </Select>

                {/* Action Type Filter */}
                <Select value={selectedActionType} onValueChange={setSelectedActionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Action Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="pst_created">PST Created</SelectItem>
                    <SelectItem value="psw_created">PSW Created</SelectItem>
                    <SelectItem value="shipment_created">Shipment Created</SelectItem>
                    <SelectItem value="status_updated">Status Updated</SelectItem>
                    <SelectItem value="document_uploaded">Document Uploaded</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Records</p>
                  <p className="text-xl font-semibold">{filteredRecords.length}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-xl font-semibold">
                    {filteredRecords.filter(r => r.status === 'completed').length}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-semibold">
                    {filteredRecords.filter(r => r.status === 'pending').length}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-xl font-semibold">
                    {filteredRecords.filter(r => r.status === 'failed').length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {formatDateTime(record.date)}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getActionIcon(record.actionType)}
                            <div>
                              <div className="font-medium text-sm">{record.action}</div>
                              <div className="text-xs text-gray-600 max-w-xs">
                                {record.details}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {record.poNumber}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            {record.pstNumber && (
                              <Badge variant="secondary" className="text-xs">
                                {record.pstNumber}
                              </Badge>
                            )}
                            {record.pswNumber && (
                              <Badge variant="secondary" className="text-xs">
                                {record.pswNumber}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm font-medium">{record.user}</div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={`text-xs ${getDepartmentColor(record.department)}`}>
                            {record.department.charAt(0).toUpperCase() + record.department.slice(1)}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(record.status)}
                            <span className="text-sm capitalize">{record.status}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
