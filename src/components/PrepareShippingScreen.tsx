import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { 
  ArrowLeft,
  Search,
  Filter,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Package,
  Truck,
  User,
  Eye,
  Clock,
  Timer,
  Activity,
  PackageCheck,
  Ship,
  Plane,
  Calendar,
  Building
} from 'lucide-react';

interface DocumentStatus {
  name: string;
  status: 'uploaded' | 'missing' | 'invalid';
  uploadedDate?: string;
  fileName?: string;
}

interface PSTShipment {
  id: string;
  poNumber: string;
  supplierName: string;
  type: 'Air' | 'Oversea' | 'Truck';
  port: string;
  etd: string;
  totalValue: number;
  weight: string;
  assignedAgent?: string;
  isPacked: boolean;
  isAssigned: boolean;
  documents: DocumentStatus[];
  completionPercentage: number;
  priority: 'High' | 'Medium' | 'Low';
}

// Mock data for PST shipments
const mockPSTShipments: PSTShipment[] = [
  {
    id: '1',
    poNumber: 'PO-2025-005',
    supplierName: 'Asia Tech Solutions',
    type: 'Air',
    port: 'Hong Kong Airport',
    etd: '2025-07-15',
    totalValue: 76500,
    weight: '1,200 kg',
    assignedAgent: 'Lisa Wong',
    isPacked: false,
    isAssigned: true,
    completionPercentage: 45,
    priority: 'High',
    documents: [
      { name: 'Commercial Invoice', status: 'uploaded', uploadedDate: '2025-07-04', fileName: 'invoice_PO2025005.pdf' },
      { name: 'Packing List', status: 'missing' },
      { name: 'Delivery Order', status: 'invalid', uploadedDate: '2025-07-03', fileName: 'delivery_order_v1.pdf' }
    ]
  },
  {
    id: '2',
    poNumber: 'PO-2025-012',
    supplierName: 'Australian Mining Equipment',
    type: 'Oversea',
    port: 'Melbourne Port',
    etd: '2025-07-16',
    totalValue: 445000,
    weight: '35,600 kg',
    isPacked: false,
    isAssigned: false,
    completionPercentage: 20,
    priority: 'High',
    documents: [
      { name: 'Commercial Invoice', status: 'missing' },
      { name: 'Packing List', status: 'missing' },
      { name: 'Delivery Order', status: 'uploaded', uploadedDate: '2025-07-02', fileName: 'delivery_AME_2025.pdf' }
    ]
  },
  {
    id: '3',
    poNumber: 'PO-2025-023',
    supplierName: 'Moroccan Handicrafts',
    type: 'Air',
    port: 'Casablanca Port',
    etd: '2025-07-18',
    totalValue: 45600,
    weight: '890 kg',
    assignedAgent: 'Fatima Al-Zahra',
    isPacked: true,
    isAssigned: true,
    completionPercentage: 85,
    priority: 'Medium',
    documents: [
      { name: 'Commercial Invoice', status: 'uploaded', uploadedDate: '2025-07-01', fileName: 'invoice_moroccan_2025.pdf' },
      { name: 'Packing List', status: 'uploaded', uploadedDate: '2025-07-02', fileName: 'packing_handicrafts.pdf' },
      { name: 'Delivery Order', status: 'missing' }
    ]
  },
  {
    id: '4',
    poNumber: 'PO-2025-017',
    supplierName: 'African Minerals Trading',
    type: 'Oversea',
    port: 'Cape Town Port',
    etd: '2025-07-20',
    totalValue: 356000,
    weight: '45,000 kg',
    isPacked: false,
    isAssigned: false,
    completionPercentage: 10,
    priority: 'Medium',
    documents: [
      { name: 'Commercial Invoice', status: 'missing' },
      { name: 'Packing List', status: 'missing' },
      { name: 'Delivery Order', status: 'missing' }
    ]
  }
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Air': return <Plane className="w-4 h-4" />;
    case 'Oversea': return <Ship className="w-4 h-4" />;
    case 'Truck': return <Truck className="w-4 h-4" />;
    default: return null;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High': return 'bg-red-100 text-red-800 border-red-200';
    case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getDocumentStatusIcon = (status: string) => {
  switch (status) {
    case 'uploaded': return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'missing': return <XCircle className="w-4 h-4 text-red-600" />;
    case 'invalid': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    default: return <XCircle className="w-4 h-4 text-gray-400" />;
  }
};

const getDocumentStatusColor = (status: string) => {
  switch (status) {
    case 'uploaded': return 'bg-green-100 text-green-800 border-green-200';
    case 'missing': return 'bg-red-100 text-red-800 border-red-200';
    case 'invalid': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

interface PrepareShippingScreenProps {
  onBack: () => void;
}

export function PrepareShippingScreen({ onBack }: PrepareShippingScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [shipments, setShipments] = useState<PSTShipment[]>(mockPSTShipments);

  // Filter shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter(shipment => {
      const matchesSearch = searchTerm === '' || 
        shipment.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.poNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || shipment.type === selectedType;
      const matchesPriority = selectedPriority === 'all' || shipment.priority === selectedPriority;
      return matchesSearch && matchesType && matchesPriority;
    });
  }, [searchTerm, selectedType, selectedPriority, shipments]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalShipments = filteredShipments.length;
    const readyToShip = filteredShipments.filter(s => s.completionPercentage >= 85).length;
    const pendingDocuments = filteredShipments.reduce((total, shipment) => {
      return total + shipment.documents.filter(doc => doc.status !== 'uploaded').length;
    }, 0);
    const highPriority = filteredShipments.filter(s => s.priority === 'High').length;
    
    return {
      totalShipments,
      readyToShip,
      pendingDocuments,
      highPriority
    };
  }, [filteredShipments]);

  const handleUploadDocument = (shipmentId: string, documentName: string) => {
    // Simulate file upload
    setShipments(prev => prev.map(shipment => {
      if (shipment.id === shipmentId) {
        const updatedDocuments = shipment.documents.map(doc => {
          if (doc.name === documentName) {
            return {
              ...doc,
              status: 'uploaded' as const,
              uploadedDate: new Date().toISOString().split('T')[0],
              fileName: `${documentName.toLowerCase().replace(/\s+/g, '_')}_${shipmentId}.pdf`
            };
          }
          return doc;
        });
        
        const uploadedCount = updatedDocuments.filter(doc => doc.status === 'uploaded').length;
        const completionPercentage = Math.round((uploadedCount / updatedDocuments.length) * 100);
        
        return {
          ...shipment,
          documents: updatedDocuments,
          completionPercentage: Math.max(completionPercentage, shipment.isPacked ? 85 : 0)
        };
      }
      return shipment;
    }));
  };

  const handleMarkAsPacked = (shipmentId: string) => {
    setShipments(prev => prev.map(shipment => {
      if (shipment.id === shipmentId) {
        const newCompletionPercentage = shipment.completionPercentage < 85 ? 85 : shipment.completionPercentage;
        return {
          ...shipment,
          isPacked: true,
          completionPercentage: newCompletionPercentage
        };
      }
      return shipment;
    }));
  };

  const handleAssignShipment = (shipmentId: string) => {
    // Simulate agent assignment
    const agents = ['Sarah Chen', 'Mike Rodriguez', 'Jennifer Kim', 'David Mueller', 'Lisa Wong'];
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];
    
    setShipments(prev => prev.map(shipment => {
      if (shipment.id === shipmentId) {
        return {
          ...shipment,
          isAssigned: true,
          assignedAgent: randomAgent,
          completionPercentage: Math.max(shipment.completionPercentage, 25)
        };
      }
      return shipment;
    }));
  };

  const handleViewPODetails = (poNumber: string) => {
    alert(`View PO Details for ${poNumber} - This would open the detailed PO view`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Prepare for Shipping
              </h1>
              <p className="text-gray-600">Manage documents and prepare shipments for departure</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Monday, July 14, 2025</span>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Shipments</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.totalShipments}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ready to Ship</p>
                  <p className="text-2xl font-bold text-green-600">{summaryStats.readyToShip}</p>
                </div>
                <PackageCheck className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Documents</p>
                  <p className="text-2xl font-bold text-yellow-600">{summaryStats.pendingDocuments}</p>
                </div>
                <FileText className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold text-red-600">{summaryStats.highPriority}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by supplier or PO number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Transport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Air">Air</SelectItem>
                      <SelectItem value="Oversea">Oversea</SelectItem>
                      <SelectItem value="Truck">Truck</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main PST Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Shipments Requiring Preparation ({filteredShipments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredShipments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <div className="text-lg font-medium mb-2">No shipments found</div>
                <div className="text-sm">No shipments match the current filters.</div>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredShipments.map((shipment) => (
                  <Card key={shipment.id} className="border-l-4 border-l-blue-400">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Basic Information */}
                        <div className="lg:col-span-1">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  {getTypeIcon(shipment.type)}
                                  <span className="text-lg font-semibold text-gray-900">
                                    {shipment.poNumber}
                                  </span>
                                  <Badge className={getPriorityColor(shipment.priority)}>
                                    {shipment.priority}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 text-gray-600 mb-1">
                                  <Building className="w-4 h-4" />
                                  {shipment.supplierName}
                                </div>
                                <div className="text-sm text-gray-600">{shipment.port}</div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">ETD:</span>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {shipment.etd}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">Value:</span>
                                <div className="font-medium text-green-600">
                                  ${shipment.totalValue.toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">Weight:</span>
                                <div>{shipment.weight}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Agent:</span>
                                <div className="flex items-center gap-1">
                                  {shipment.isAssigned ? (
                                    <>
                                      <CheckCircle className="w-3 h-3 text-green-600" />
                                      {shipment.assignedAgent}
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3 h-3 text-red-600" />
                                      Not Assigned
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Progress */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Completion Progress</span>
                                <span className="font-medium">{shipment.completionPercentage}%</span>
                              </div>
                              <Progress value={shipment.completionPercentage} className="h-2" />
                            </div>
                          </div>
                        </div>

                        {/* Document Checklist */}
                        <div className="lg:col-span-1">
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Document Checklist</h4>
                            <div className="space-y-3">
                              {shipment.documents.map((document, index) => (
                                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      {getDocumentStatusIcon(document.status)}
                                      <span className="text-sm font-medium">{document.name}</span>
                                    </div>
                                    <Badge className={getDocumentStatusColor(document.status)} variant="outline">
                                      {document.status === 'uploaded' ? 'Uploaded' : 
                                       document.status === 'invalid' ? 'Invalid' : 'Missing'}
                                    </Badge>
                                  </div>
                                  
                                  {document.status === 'uploaded' && (
                                    <div className="text-xs text-gray-600 mb-2">
                                      <div>File: {document.fileName}</div>
                                      <div>Uploaded: {document.uploadedDate}</div>
                                    </div>
                                  )}
                                  
                                  {document.status === 'invalid' && (
                                    <div className="text-xs text-red-600 mb-2">
                                      Document validation failed. Please re-upload.
                                    </div>
                                  )}
                                  
                                  {(document.status === 'missing' || document.status === 'invalid') && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleUploadDocument(shipment.id, document.name)}
                                      className="flex items-center gap-1 w-full"
                                    >
                                      <Upload className="w-3 h-3" />
                                      {document.status === 'missing' ? 'Upload' : 'Re-upload'}
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Action Column */}
                        <div className="lg:col-span-1">
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Actions</h4>
                            
                            {/* Packing Status */}
                            <div className="border rounded-lg p-3 bg-gray-50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Packing Status</span>
                                {shipment.isPacked ? (
                                  <Badge className="bg-green-100 text-green-800 border-green-200">
                                    Packed
                                  </Badge>
                                ) : (
                                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                    Pending
                                  </Badge>
                                )}
                              </div>
                              {!shipment.isPacked && (
                                <Button
                                  size="sm"
                                  onClick={() => handleMarkAsPacked(shipment.id)}
                                  className="flex items-center gap-1 w-full"
                                >
                                  <PackageCheck className="w-3 h-3" />
                                  Mark as Packed
                                </Button>
                              )}
                            </div>

                            {/* Agent Assignment */}
                            <div className="border rounded-lg p-3 bg-gray-50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Agent Assignment</span>
                                {shipment.isAssigned ? (
                                  <Badge className="bg-green-100 text-green-800 border-green-200">
                                    Assigned
                                  </Badge>
                                ) : (
                                  <Badge className="bg-red-100 text-red-800 border-red-200">
                                    Unassigned
                                  </Badge>
                                )}
                              </div>
                              {!shipment.isAssigned ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAssignShipment(shipment.id)}
                                  className="flex items-center gap-1 w-full"
                                >
                                  <User className="w-3 h-3" />
                                  Assign Agent
                                </Button>
                              ) : (
                                <div className="text-xs text-gray-600 flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {shipment.assignedAgent}
                                </div>
                              )}
                            </div>

                            {/* View Details */}
                            <Button
                              variant="outline"
                              onClick={() => handleViewPODetails(shipment.poNumber)}
                              className="flex items-center gap-1 w-full"
                            >
                              <Eye className="w-3 h-3" />
                              View Full PO Detail
                            </Button>

                            {/* Ready Status */}
                            {shipment.completionPercentage >= 85 && (
                              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 text-green-800">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-sm font-medium">Ready for Shipping</span>
                                </div>
                                <div className="text-xs text-green-600 mt-1">
                                  All requirements completed
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}