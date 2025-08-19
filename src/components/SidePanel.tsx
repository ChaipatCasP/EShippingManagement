import { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { 
  Eye,
  Ship,
  Plane,
  Truck,
  Package2,
  Layers,
  Flag,
  Calendar,
  Package,
  Loader2,
  Users,
  FileText
} from 'lucide-react';
import { useConsolidatedSuppliers } from '../hooks/useConsolidatedSuppliers';
import { CreatePSTConfirmation } from './CreatePSTConfirmationModal';
import type { Shipment } from '../types/shipment';
import type { ConsolidatedSupplier } from '../api/types';

// Helper function to format date to yyyy-mm-dd
const formatDate = (dateString: string): string => {
  if (!dateString) return dateString;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    return dateString;
  }
};

interface SidePanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedShipment: Shipment | null;
  onCreatePST: (poNumber: string) => void;
  onUpdatePST?: (pstWebSeqId: number) => void;
  onCreatePSW: (poNumber: string) => void;
  onNavigate?: (path: string) => void;
  onViewDocs: () => void;
}

export function SidePanel({ 
  isOpen, 
  onOpenChange, 
  selectedShipment, 
  onCreatePST,
  onUpdatePST,
  onCreatePSW,
  onNavigate,
  onViewDocs 
}: SidePanelProps) {
  // State for PSW confirmation
  const [pswConfirmationOpen, setPswConfirmationOpen] = useState(false);
  const [selectedPswShipment, setSelectedPswShipment] = useState<Shipment | null>(null);
  const [isPswCreating, setIsPswCreating] = useState(false);

  // Handler for PSW creation with confirmation
  const handleCreatePSWWithConfirmation = (shipment: Shipment) => {
    console.log('🚀 SidePanel - handleCreatePSWWithConfirmation called with:', shipment.poNumber);
    
    // ปิด SidePanel ก่อน
    onOpenChange(false);
    
    // ใช้ setTimeout เพื่อให้ SidePanel ปิดเสร็จก่อน แล้วค่อยแสดง popup
    setTimeout(() => {
      setSelectedPswShipment(shipment);
      setPswConfirmationOpen(true);
    }, 300); // รอ 300ms ให้ animation ของ SidePanel เสร็จ
  };

  // Handler for PSW confirmation
  const handleConfirmCreatePSW = async () => {
    console.log('✅ SidePanel - handleConfirmCreatePSW called with:', selectedPswShipment?.poNumber);

    if (!selectedPswShipment) {
      console.log("❌ No selectedPswShipment found");
      return;
    }

    try {
      setIsPswCreating(true);
      onCreatePSW(selectedPswShipment.poNumber);
      setPswConfirmationOpen(false);
      setSelectedPswShipment(null);
    } catch (error) {
      console.error("❌ Error creating PSW:", error);
    } finally {
      setIsPswCreating(false);
    }
  };

  // Use consolidated suppliers API for co-load data
  const {
    suppliers,
    loading: suppliersLoading,
    error: suppliersError,
    refetch: refetchSuppliers
  } = useConsolidatedSuppliers({
    startDate: selectedShipment?.poDate || '',
    endDate: selectedShipment?.dateClear || '',
    poBook: selectedShipment?.originalPOData?.poBook,
    transType: selectedShipment?.originalPOData?.transType,
    poNo: selectedShipment?.originalPOData?.poNo,
    enabled: selectedShipment?.poType === 'Co-load'
  });

  // Helper function to check if supplier is current
  const isCurrentSupplier = (supplier: ConsolidatedSupplier) => {
    if (!selectedShipment) return false;
    
    const currentSupCode = selectedShipment.originalPOData?.supCode || selectedShipment.supplierCode;
    
    if (currentSupCode && supplier.supCode === currentSupCode) {
      if (selectedShipment.originalPOData && supplier.pos) {
        return supplier.pos.some(po => 
          po.poBook === selectedShipment.originalPOData?.poBook && 
          po.poNo === selectedShipment.originalPOData?.poNo
        );
      }
      return true;
    }
    return false;
  };
  if (!selectedShipment) return null;

  // Helper function to get action button configuration based on PST/PSW status (same as ShipmentTimeline)
  const getCustomActionConfig = (shipment: Shipment) => {
    const { pstStatus, pswStatus } = shipment;
    
    // ถ้า pstStatus เป็นว่าง หรือ null ให้แสดงปุ่ม CreatePst
    if (!pstStatus || pstStatus === '' || pstStatus === null) {
      return {
        text: 'Create PST',
        action: 'create-pst',
        color: 'bg-blue-600 hover:bg-blue-700 text-white',
        enabled: true,
        tooltip: 'Create PST document',
        icon: <Flag className="w-4 h-4" />
      };
    }
    
    // ถ้า pstStatus เป็น N ให้แสดงปุ่ม UpdatePst
    if (pstStatus === 'N') {
      return {
        text: 'Update PST',
        action: 'edit-pst',
        color: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        enabled: true,
        tooltip: 'Update PST document',
        icon: <Flag className="w-4 h-4" />
      };
    }
    
    // ถ้า shipment มี pswNo และ pswStatus = N → แสดง Update PSW
    if (shipment.pswNo && pswStatus === 'N') {
      return {
        text: 'Update PSW',
        action: 'update-psw',
        color: 'bg-orange-600 hover:bg-orange-700 text-white',
        enabled: true,
        tooltip: 'Update PSW document',
        icon: <Calendar className="w-4 h-4" />
      };
    }
    
    // ถ้า pswNo ไม่มีค่า แต่มี pstNo มีค่า → แสดง Create PSW
    if (!shipment.pswNo && shipment.pstNo) {
      return {
        text: 'Create PSW',
        action: 'create-psw-with-confirmation',
        color: 'bg-green-600 hover:bg-green-700 text-white',
        enabled: true,
        tooltip: 'Create PSW document',
        icon: <Calendar className="w-4 h-4" />
      };
    }
    
    // ถ้า pstStatus และ pswStatus เป็น Y ทั้งคู่ แสดงปุ่ม Completed
    if (pstStatus === 'Y' && pswStatus === 'Y') {
      return {
        text: 'Completed',
        action: 'completed',
        color: 'bg-gray-500 text-white cursor-not-allowed',
        enabled: false,
        tooltip: 'Process completed',
        icon: <Flag className="w-4 h-4" />
      };
    }
    
    // Default fallback
    return {
      text: 'No Action',
      action: 'none',
      color: 'bg-gray-400 text-white cursor-not-allowed',
      enabled: false,
      tooltip: 'No action available',
      icon: <Flag className="w-4 h-4" />
    };
  };

  const actionConfig = getCustomActionConfig(selectedShipment);
  const totalSuppliers = suppliers.length;

  const handleActionClick = () => {
    if (!actionConfig.enabled) return;
    
    switch (actionConfig.action) {
      case 'create-pst':
        onCreatePST(selectedShipment.poNumber);
        break;
      case 'edit-pst':
        if (onUpdatePST && selectedShipment.pstWebSeqId) {
          onUpdatePST(selectedShipment.pstWebSeqId);
        } else {
          console.error('No pstWebSeqId found for shipment:', selectedShipment);
        }
        break;
      case 'create-psw':
        onCreatePSW(selectedShipment.poNumber);
        break;
      case 'create-psw-with-confirmation':
        // Show confirmation dialog for PSW creation
        handleCreatePSWWithConfirmation(selectedShipment);
        break;
      case 'update-psw':
        console.log("🔄 SidePanel Update PSW - Bypassing API, navigating directly:", {
          pswWebSeqId: selectedShipment.pswWebSeqId,
          poNumber: selectedShipment.poNumber,
        });

        // ใช้ pswWebSeqId bypass ไปที่หน้า create-psw เป็นโหมด update เลย
        if (onNavigate && selectedShipment.pswWebSeqId) {
          onNavigate(`/create-psw?update=${selectedShipment.pswWebSeqId}&po=${selectedShipment.poNumber}`);
        } else {
          console.warn('Cannot update PSW: Missing onNavigate function or pswWebSeqId');
        }
        break;
      case 'view-psw':
        alert(`View PSW ${selectedShipment.pswNumber} - This feature will be implemented`);
        break;
      case 'completed':
      case 'none':
        // No action for completed or none
        break;
    }
  };

  // Helper function to get border color based on bill type (consistent with timeline cards)
  const getBorderColor = (billType: string) => {
    switch (billType) {
      case 'Urgent': return 'border-l-red-500';
      case 'Regular': return 'border-l-blue-500';
      default: return 'border-l-blue-500';
    }
  };

  // Helper function to get PO type icon and styling with label text
  const getPOTypeDisplay = (poType: string) => {
    switch (poType) {
      case 'Single': 
        return {
          icon: <Package2 className="w-5 h-5 text-gray-500" />,
          label: 'Single PO',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'Co-load': 
        return {
          icon: <Layers className="w-5 h-5 text-gray-500" />,
          label: 'Co-load PO',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200'
        };
      default: 
        return {
          icon: <Package2 className="w-5 h-5 text-gray-600" />,
          label: 'Standard PO',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
    }
  };

  // Helper function to get transportation type icon
  const getTransportationIcon = (type: string) => {
    switch (type) {
      case 'Sea': 
        return <Ship className="w-4 h-4 text-blue-600" />;
      case 'Air': 
        return <Plane className="w-4 h-4 text-sky-600" />;
      case 'Land': 
        return <Truck className="w-4 h-4 text-green-600" />;
      default: 
        return <Ship className="w-4 h-4 text-blue-600" />;
    }
  };

  const borderColor = getBorderColor(selectedShipment.billType);
  const poTypeDisplay = getPOTypeDisplay(selectedShipment.poType);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent 
        className="w-[600px] sm:w-[600px] overflow-y-auto m-4 rounded-lg border bg-white shadow-lg" 
        style={{ right: '16px', top: '16px', bottom: '16px', height: 'calc(100vh - 32px)' }}
      >
        
        {/* New Structured Header */}
        <div className={`border-l-4 ${borderColor} pl-4 pr-6 pt-6 pb-4`}>
          <SheetHeader className="space-y-3">
            {/* Line 1: Transportation Icon + PO Type (separated) */}
            <div className="flex items-center gap-3">
              {/* Transportation Type Icon - Separate container */}
              <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg border">
                {getTransportationIcon(selectedShipment.type)}
              </div>
              
              {/* PO Type with Label - Separate container */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${poTypeDisplay.bgColor} ${poTypeDisplay.borderColor}`}>
                {poTypeDisplay.icon}
                <span className={`font-medium text-sm ${poTypeDisplay.textColor}`}>
                  {poTypeDisplay.label}
                </span>
                {totalSuppliers > 1 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-medium ${poTypeDisplay.textColor} border border-current`}>
                    {totalSuppliers}
                  </span>
                )}
              </div>
            </div>

            {/* Line 2: Supplier Name - Separate Row with Fit-Hug */}
            <div className="w-fit">
              <SheetTitle className="text-xl font-semibold text-gray-900">
                {selectedShipment.supplierName}
              </SheetTitle>
            </div>
            
            {/* Proper SheetDescription for accessibility */}
            <SheetDescription className="sr-only">
              Detailed information panel for {selectedShipment.supplierName} shipment with reference {selectedShipment.referenceKey} and PO number {selectedShipment.poNumber}. Current status: {selectedShipment.billStatus} bill status and {selectedShipment.jagotaStatus} Jagota status.
            </SheetDescription>
            
            {/* Row 3: Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm">
                <span className="text-gray-500">Bill:</span>
                <span className={`font-medium ${
                  selectedShipment.billStatus === 'Approved' ? 'text-green-700' :
                  selectedShipment.billStatus === 'Pending' ? 'text-yellow-700' :
                  selectedShipment.billStatus === 'Processing' ? 'text-blue-700' :
                  'text-red-700'
                }`}>
                  {selectedShipment.billStatus}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-gray-500">Jagota:</span>
                <span className={`font-medium ${
                  selectedShipment.jagotaStatus === 'Approved' ? 'text-green-700' :
                  selectedShipment.jagotaStatus === 'Under Review' ? 'text-blue-700' :
                  selectedShipment.jagotaStatus === 'Completed' ? 'text-green-700' :
                  'text-yellow-700'
                }`}>
                  {selectedShipment.jagotaStatus}
                </span>
              </div>
            </div>

            {/* Row 4: Ref Key (conditional) + PO Number */}
            <div className="flex items-center gap-4 text-sm">
              {/* Only show Ref Key if pstNo has value */}
              {selectedShipment.pstNo && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Ref:</span>
                  <span className="font-medium text-gray-900">
                    {selectedShipment.pstBook && selectedShipment.pstNo 
                      ? `${selectedShipment.pstBook}-${selectedShipment.pstNo}` 
                      : selectedShipment.pstNo.toString()
                    }
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="text-gray-500">PO:</span>
                <span className="font-medium text-gray-900">{selectedShipment.poNumber}</span>
              </div>
            </div>
          </SheetHeader>
        </div>
        
        <div className="px-6 pb-6 space-y-6">
          
          {/* Action Section */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-900">Workflow Action</div>
            
            <div className="flex gap-3">
              <Button
                disabled={!actionConfig.enabled}
                className={`${actionConfig.color} flex items-center gap-2 flex-1`}
                onClick={handleActionClick}
                title={actionConfig.tooltip}
                aria-label={`${actionConfig.text} for shipment ${selectedShipment.poNumber}`}
              >
                {actionConfig.icon}
                {actionConfig.text}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={onViewDocs} 
                className="flex items-center gap-2"
                aria-label={`View documents for shipment ${selectedShipment.poNumber}`}
              >
                <Eye className="w-4 h-4" />
                View Docs
              </Button>
            </div>

            {/* Simple Progress Indicator */}

<div>
  <label style={{color: 'red'}}>*****For Test *****</label>
  <br></br>
  pstStatus :{selectedShipment.pstStatus} <br></br>
  pstJagotaStatus :{selectedShipment.pstJagotaStatus}<br></br>
  pswStatus :{selectedShipment.pswStatus}<br></br>
  pswJagotaStatus :{selectedShipment.pswJagotaStatus}<br></br>
  <label style={{color: 'red'}}>*****For Test *****</label>
</div>

            <div className="flex items-center justify-center gap-2 pt-2" role="progressbar" aria-label="Shipment workflow progress">
              <div className="flex items-center gap-1 text-xs">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  selectedShipment.pstStatus === 'Y' ? 'bg-green-500' : 
                  selectedShipment.pstStatus === 'N' ? 'bg-orange-500' : 
                  selectedShipment.pstStatus === 'Z' ? 'bg-red-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-gray-600 text-xs">PST</span>
              </div>
              <div className="w-6 h-0.5 bg-gray-200"></div>
              <div className="flex items-center gap-1 text-xs">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  selectedShipment.pstStatus === 'Y' && selectedShipment.pswStatus === 'Y' && selectedShipment.pstJagotaStatus === 'Y' ? 'bg-green-500' : 
                  selectedShipment.pstStatus === 'Y' && selectedShipment.pswStatus === 'N' && selectedShipment.pstJagotaStatus === 'Y' ? 'bg-orange-500' : 
                  selectedShipment.pstStatus === 'Y' && selectedShipment.pswStatus === 'Z' ? 'bg-red-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-gray-600 text-xs">PSW</span>
              </div>
              <div className="w-6 h-0.5 bg-gray-200"></div>
              <div className="flex items-center gap-1 text-xs">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  (selectedShipment.pstStatus === 'Y' && selectedShipment.pstJagotaStatus === 'Y' &&
                   selectedShipment.pswStatus === 'Y' && selectedShipment.pswJagotaStatus === 'Y') ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-gray-600 text-xs">Complete</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timeline Section - Added ETD date */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-900">Timeline</div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-left">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true"></div>
                  <span className="text-gray-600 text-xs font-medium">ETD</span>
                </div>
                <span className="font-semibold text-gray-900">{formatDate(selectedShipment.etd)}</span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" aria-hidden="true"></div>
                  <span className="text-gray-600 text-xs font-medium">ETA</span>
                </div>
                <span className="font-semibold text-gray-900">{formatDate(selectedShipment.eta)}</span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true"></div>
                  <span className="text-gray-600 text-xs font-medium">Clear</span>
                </div>
                <span className="font-semibold text-gray-900">{formatDate(selectedShipment.dateClear)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Document Information - consolidated and simplified */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-900">Shipment Details</div>
            
            <div className="space-y-3">
              {/* Documents - Clean format */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Invoice:</span>
                  <span className="font-medium text-gray-900">{selectedShipment.invoiceNumber} ({formatDate(selectedShipment.invoiceDate)})</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">AWB:</span>
                  <span className="font-medium text-gray-900">{selectedShipment.blAwbNumber}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Import Entry:</span>
                  <span className="font-medium text-gray-900">{selectedShipment.importEntryNo}</span>
                </div>
              </div>

              {/* Route - Simple format */}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Route:</span>
                  <span className="font-medium text-gray-900">{selectedShipment.originPort} → {selectedShipment.destinationPort}</span>
                </div>
                {/* <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-medium text-gray-900">{selectedShipment.weight}</span>
                </div> */}
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Terms:</span>
                  <span className="font-medium text-gray-900">{selectedShipment.term}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Insurance:</span>
                  <span className={`font-medium ${selectedShipment.insurance ? 'text-green-700' : 'text-red-700'}`}>
                    {selectedShipment.insurance ? 'Covered' : 'Not Covered'}
                  </span>
                </div>
              </div>

              {/* Document Numbers if available */}
              {(selectedShipment.pstNumber || selectedShipment.pswNumber) && (
                <div className="pt-2 border-t">
                  {selectedShipment.pstNumber && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">PST Number:</span>
                      <span className="font-medium text-gray-800">{selectedShipment.pstNumber}</span>
                    </div>
                  )}
                  {selectedShipment.pswNumber && (
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-gray-500">PSW Number:</span>
                      <span className="font-medium text-gray-800">{selectedShipment.pswNumber}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Co-load Suppliers Section - Only if applicable */}
          {selectedShipment.poType === 'Co-load' && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="text-sm font-medium text-gray-900">
                  {selectedShipment.poType} Container
                </div>
                
                {suppliersLoading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="ml-2 text-sm text-slate-600">Loading suppliers...</span>
                  </div>
                )}

                {suppliersError && (
                  <div className="text-center py-4">
                    <div className="text-red-600 text-sm mb-2">❌ Error loading data</div>
                    <div className="text-xs text-slate-600 mb-2">{suppliersError}</div>
                    <button
                      onClick={refetchSuppliers}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!suppliersLoading && !suppliersError && suppliers.length === 0 && (
                  <div className="text-center py-4 text-slate-500 text-sm">
                    No suppliers found
                  </div>
                )}

                {!suppliersLoading && !suppliersError && suppliers.length > 0 && (
                  <div className="space-y-3">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-blue-600" />
                        <div>
                          <div className="text-xs font-medium text-slate-700">Suppliers</div>
                          <div className="text-sm font-bold text-slate-900">{suppliers.length}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3 text-green-600" />
                        <div>
                          <div className="text-xs font-medium text-slate-700">Total POs</div>
                          <div className="text-sm font-bold text-slate-900">
                            {suppliers.reduce((total: number, supplier: ConsolidatedSupplier) => 
                              total + (supplier.pos?.length || 0), 0
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Current Supplier */}
                    {(() => {
                      const currentSupplier = suppliers.find(supplier => isCurrentSupplier(supplier));
                      
                      if (currentSupplier) {
                        return (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold text-sm text-blue-900">
                                {currentSupplier.supName}
                              </div>
                              <span className="text-xs px-2 py-1 rounded border bg-white text-blue-900 border-blue-200">
                                Current
                              </span>
                            </div>
                            <div className="text-xs text-blue-600 mb-1">Code: {currentSupplier.supCode}</div>
                            
                            {/* Show POs from current supplier */}
                            {currentSupplier.pos && currentSupplier.pos.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {currentSupplier.pos.map((po: any, poIndex: number) => (
                                  <div
                                    key={`current-${po.poBook}-${po.poNo}-${poIndex}`}
                                    className="flex items-center gap-2 text-xs p-2 rounded bg-blue-50"
                                  >
                                    <Package className="h-2 w-2 text-blue-500" />
                                    <span className="font-mono font-medium">{po.poBook}-{po.poNo}</span>
                                    {/* Mark the matching PO */}
                                    {po.poBook === selectedShipment.originalPOData?.poBook && 
                                     po.poNo === selectedShipment.originalPOData?.poNo && (
                                      <span className="text-xs bg-green-100 text-green-600 px-1 rounded">Active</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      } else {
                        // Fallback to original shipment data if not found in API
                        return (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold text-sm text-blue-900">
                                {selectedShipment.supplierName}
                              </div>
                              <span className="text-xs px-2 py-1 rounded border bg-white text-blue-900 border-blue-200">
                                Current
                              </span>
                            </div>
                            {selectedShipment.pstNo && (
                              <div className="text-xs text-blue-600 mb-1">
                                {selectedShipment.pstBook && selectedShipment.pstNo 
                                  ? `${selectedShipment.pstBook}-${selectedShipment.pstNo}` 
                                  : selectedShipment.pstNo.toString()
                                }
                              </div>
                            )}
                            <div className="text-sm font-medium text-blue-800">{selectedShipment.poNumber}</div>
                          </div>
                        );
                      }
                    })()}
                    
                    {/* Other Suppliers from API */}
                    {suppliers.filter(supplier => !isCurrentSupplier(supplier)).map((supplier: ConsolidatedSupplier, index: number) => (
                      <div key={`other-${supplier.supCode}-${index}`} className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-800 text-sm">{supplier.supName}</div>
                          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">
                            {supplier.pos?.length || 0} PO{(supplier.pos?.length || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mb-1">Code: {supplier.supCode}</div>
                        
                        {/* Show POs */}
                        {supplier.pos && supplier.pos.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {supplier.pos.map((po: any, poIndex: number) => (
                              <div
                                key={`${supplier.supCode}-${po.poBook}-${po.poNo}-${poIndex}`}
                                className="flex items-center gap-2 text-xs text-slate-700"
                              >
                                <Package className="h-2 w-2 text-slate-500" />
                                <span className="font-mono">{po.poBook}-{po.poNo}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Summary Footer */}
                <div className="pt-2 border-t text-xs text-gray-500 text-center">
                  {!suppliersLoading && !suppliersError && suppliers.length > 0 ? (
                    <>
                      Total: {suppliers.reduce((total: number, supplier: ConsolidatedSupplier) => 
                        total + (supplier.pos?.length || 0), 0
                      )} purchase orders in this co-load container
                    </>
                  ) : selectedShipment.relatedSuppliers && selectedShipment.relatedSuppliers.length > 0 ? (
                    <>Expected: {selectedShipment.relatedSuppliers.length + 1} purchase orders in this {selectedShipment.poType.toLowerCase()} container</>
                  ) : (
                    <>Co-load container data</>
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      </SheetContent>
    </Sheet>

    {/* PSW Confirmation Dialog */}
    {selectedPswShipment && (
      <CreatePSTConfirmation
        isOpen={pswConfirmationOpen}
        onClose={() => setPswConfirmationOpen(false)}
        onConfirm={handleConfirmCreatePSW}
        isLoading={isPswCreating}
        type="PSW"
        poNo={selectedPswShipment.poNumber || ""}
        poBook={selectedPswShipment.originalPOData?.poBook || ""}
        shipmentNo={
          selectedPswShipment.blAwbNumber || selectedPswShipment.id || ""
        }
        portOfDestination={selectedPswShipment.destinationPort || ""}
      />
    )}
    </>
  );
}