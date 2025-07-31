import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { 
  Search, 
  FileText, 
  Download, 
  Eye, 
  Clock, 
  CheckCircle2, 
  Package, 
  Truck,
  Ship,
  Plane,
  ArrowLeft,
  Filter,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  FileJson,
  X,
  ChevronDown
} from 'lucide-react';
import { mockShipments } from '../data/mockData';
import { exportShipmentHistory, exportSummaryReport, ExportConfig } from '../utils/exportUtils';
import type { Shipment } from '../types/shipment';

interface HistoryViewProps {
  onBack: () => void;
}

export function HistoryView({ onBack }: HistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('3months');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDetailShipment, setSelectedDetailShipment] = useState<Shipment | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Filter completed shipments (PSW completed)
  const completedShipments = useMemo(() => {
    return mockShipments.filter(shipment => shipment.pswNumber && shipment.pswStatus === 'approved');
  }, []);

  // Apply filters
  const filteredCompletedShipments = useMemo(() => {
    let filtered = completedShipments;

    // Period filter
    if (selectedPeriod !== 'all') {
      const now = new Date();
      let cutoffDate: Date;
      
      switch (selectedPeriod) {
        case '1month':
          cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case '3months':
          cutoffDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          break;
        case '6months':
          cutoffDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
          break;
        case '1year':
          cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
        default:
          cutoffDate = new Date(0); // Show all
      }
      
      filtered = filtered.filter(shipment => {
        const clearDate = new Date(shipment.dateClear);
        return clearDate >= cutoffDate;
      });
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(shipment =>
        shipment.supplierName.toLowerCase().includes(term) ||
        shipment.poNumber.toLowerCase().includes(term) ||
        shipment.pstNumber?.toLowerCase().includes(term) ||
        shipment.pswNumber?.toLowerCase().includes(term) ||
        shipment.referenceKey.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(shipment => {
        if (selectedStatus === 'pst-only') return shipment.pstNumber && !shipment.pswNumber;
        if (selectedStatus === 'psw-completed') return shipment.pswNumber;
        return true;
      });
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(shipment => shipment.type === selectedType);
    }

    return filtered;
  }, [completedShipments, searchTerm, selectedStatus, selectedType, selectedPeriod]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCompleted = completedShipments.length;
    const pstOnlyCount = completedShipments.filter(s => s.pstNumber && !s.pswNumber).length;
    const pswCompletedCount = completedShipments.filter(s => s.pswNumber).length;
    const seaCount = completedShipments.filter(s => s.type === 'Sea').length;
    const airCount = completedShipments.filter(s => s.type === 'Air').length;
    const landCount = completedShipments.filter(s => s.type === 'Land').length;
    const totalValue = completedShipments.reduce((sum, s) => sum + s.totalValue, 0);

    return {
      totalCompleted,
      pstOnlyCount,
      pswCompletedCount,
      seaCount,
      airCount,
      landCount,
      totalValue,
      completionRate: totalCompleted > 0 ? Math.round((pswCompletedCount / totalCompleted) * 100) : 0
    };
  }, [completedShipments]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Sea':
        return <Ship className="w-4 h-4 text-blue-600" />;
      case 'Air':
        return <Plane className="w-4 h-4 text-green-600" />;
      case 'Land':
        return <Truck className="w-4 h-4 text-orange-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleExport = async (format: 'csv' | 'excel' | 'json') => {
    setIsExporting(true);
    try {
      const config: ExportConfig = {
        format,
        includeHeaders: true,
        filename: `jagota_shipment_history_${selectedPeriod}.${format === 'excel' ? 'csv' : format}`
      };
      
      await exportShipmentHistory(filteredCompletedShipments, config);
      
      // Show success message
      console.log(`Successfully exported ${filteredCompletedShipments.length} records as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSummary = () => {
    exportSummaryReport(filteredCompletedShipments);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPeriod('3months');
    setSelectedStatus('all');
    setSelectedType('all');
  };

  const hasActiveFilters = () => {
    return searchTerm !== '' || selectedStatus !== 'all' || selectedType !== 'all' || selectedPeriod !== '3months';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Shipment History</h1>
                <p className="text-sm text-gray-600">View completed PST/PSW records and shipment archive</p>
              </div>
            </div>
            
            {/* Export Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isExporting} className="flex items-center gap-2">
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export History
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport('csv')} className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')} className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')} className="flex items-center gap-2">
                  <FileJson className="w-4 h-4" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportSummary} className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Export Summary Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Completed</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalCompleted}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">PSW Completed</p>
                    <p className="text-2xl font-semibold text-blue-600">{stats.pswCompletedCount}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-semibold text-green-600">{stats.completionRate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-lg font-semibold text-purple-600">{formatCurrency(stats.totalValue)}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Most Common</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stats.seaCount >= stats.airCount && stats.seaCount >= stats.landCount ? 'Sea' :
                       stats.airCount >= stats.landCount ? 'Air' : 'Land'}
                    </p>
                  </div>
                  {stats.seaCount >= stats.airCount && stats.seaCount >= stats.landCount ? 
                    <Ship className="w-8 h-8 text-blue-500" /> :
                    stats.airCount >= stats.landCount ? 
                    <Plane className="w-8 h-8 text-green-500" /> : 
                    <Truck className="w-8 h-8 text-orange-500" />
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                {/* Search */}
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by supplier, PO, PST, PSW, or reference..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Filter className="w-3 h-3" />
                    Filters:
                  </div>

                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1month">Last Month</SelectItem>
                      <SelectItem value="3months">Last 3 Months</SelectItem>
                      <SelectItem value="6months">Last 6 Months</SelectItem>
                      <SelectItem value="1year">Last Year</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pst-only">PST Only</SelectItem>
                      <SelectItem value="psw-completed">PSW Completed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Sea">Sea</SelectItem>
                      <SelectItem value="Air">Air</SelectItem>
                      <SelectItem value="Land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Results and Clear */}
                <div className="flex items-center gap-3">
                  {hasActiveFilters() && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs px-2 py-1"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                  )}
                  
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    {filteredCompletedShipments.length} records
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Completed Shipments History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredCompletedShipments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>No completed shipments found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>PST Number</TableHead>
                      <TableHead>PSW Number</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Completed Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompletedShipments.map((shipment) => (
                      <TableRow key={shipment.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(shipment.type)}
                            <span className="font-medium text-blue-600">{shipment.poNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-900">{shipment.supplierName}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {shipment.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {shipment.pstNumber ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              {shipment.pstNumber}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {shipment.pswNumber ? (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                              {shipment.pswNumber}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-green-600">
                            {formatCurrency(shipment.totalValue)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatDate(shipment.dateClear)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDetailShipment(shipment)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedDetailShipment} onOpenChange={() => setSelectedDetailShipment(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Shipment History Details
            </DialogTitle>
            <DialogDescription>
              Complete record for {selectedDetailShipment?.poNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedDetailShipment && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Shipment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">PO Number:</span>
                      <span className="font-medium">{selectedDetailShipment.poNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Supplier:</span>
                      <span className="font-medium">{selectedDetailShipment.supplierName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Type:</span>
                      <Badge variant="outline">{selectedDetailShipment.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Reference Key:</span>
                      <span className="font-medium">{selectedDetailShipment.referenceKey}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Invoice:</span>
                      <span className="font-medium">{selectedDetailShipment.invoiceNumber}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Process Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">PST Number:</span>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        {selectedDetailShipment.pstNumber || 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">PSW Number:</span>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        {selectedDetailShipment.pswNumber || 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Completed Date:</span>
                      <span className="font-medium">{formatDate(selectedDetailShipment.dateClear)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Value:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(selectedDetailShipment.totalValue)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Shipping Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full mx-auto mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium">ETD</p>
                      <p className="text-xs text-gray-600">{selectedDetailShipment.etd}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 text-white rounded-full mx-auto mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium">ETA</p>
                      <p className="text-xs text-gray-600">{selectedDetailShipment.eta}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full mx-auto mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium">Cleared</p>
                      <p className="text-xs text-gray-600">{selectedDetailShipment.dateClear}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Route Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Route & Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Origin:</span>
                    <span className="font-medium">{selectedDetailShipment.originPort}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Destination:</span>
                    <span className="font-medium">{selectedDetailShipment.destinationPort}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">AWB/BL Number:</span>
                    <span className="font-medium">{selectedDetailShipment.blAwbNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Import Entry:</span>
                    <span className="font-medium">{selectedDetailShipment.importEntryNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Assigned Agent:</span>
                    <span className="font-medium">{selectedDetailShipment.assignedAgent}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}