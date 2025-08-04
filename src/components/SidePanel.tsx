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
  Calendar
} from 'lucide-react';
import type { Shipment } from '../types/shipment';

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
  onCreatePSW: (poNumber: string) => void;
  onViewDocs: () => void;
}

export function SidePanel({ 
  isOpen, 
  onOpenChange, 
  selectedShipment, 
  onCreatePST, 
  onCreatePSW, 
  onViewDocs 
}: SidePanelProps) {
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
    
    // ถ้า pstStatus เป็น Y และ pswStatus เป็น N or null ให้แสดงปุ่ม CreatePsw
    if (pstStatus === 'Y' && (!pswStatus || pswStatus === 'N' || pswStatus === '' || pswStatus === null)) {
      return {
        text: 'Create PSW',
        action: 'create-psw',
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
  const totalSuppliers = 1 + (selectedShipment.relatedSuppliers?.length || 0);

  const handleActionClick = () => {
    if (!actionConfig.enabled) return;
    
    switch (actionConfig.action) {
      case 'create-pst':
      case 'edit-pst':
        onCreatePST(selectedShipment.poNumber);
        break;
      case 'create-psw':
        onCreatePSW(selectedShipment.poNumber);
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
              {/* Only show Ref Key if PST status is not "N" (New Entry) */}
              {selectedShipment.pstStatus !== 'N' && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Ref:</span>
                  <span className="font-medium text-gray-900">{selectedShipment.referenceKey}</span>
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
            <div className="flex items-center justify-center gap-2 pt-2" role="progressbar" aria-label="Shipment workflow progress">
              <div className="flex items-center gap-1 text-xs">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  selectedShipment.pstStatus === 'Y' && selectedShipment.pstJagotaStatus === 'Y' ? 'bg-green-500' : 
                  selectedShipment.pstStatus === 'Y' || selectedShipment.pstStatus === 'N' ? 'bg-gray-400' : 'bg-gray-300'
                }`}></div>
                <span className="text-gray-600 text-xs">PST</span>
              </div>
              <div className="w-6 h-0.5 bg-gray-200"></div>
              <div className="flex items-center gap-1 text-xs">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  selectedShipment.pswStatus === 'Y' && selectedShipment.pswJagotaStatus === 'Y' ? 'bg-green-500' : 
                  selectedShipment.pswStatus === 'Y' || selectedShipment.pswStatus === 'N' ? 'bg-gray-400' : 'bg-gray-300'
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
          {selectedShipment.poType === 'Co-load' && selectedShipment.relatedSuppliers && selectedShipment.relatedSuppliers.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="text-sm font-medium text-gray-900">
                  {selectedShipment.poType} Container ({totalSuppliers} suppliers)
                </div>
                
                <div className="space-y-3">
                  {/* Current supplier - simplified */}
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-blue-900">{selectedShipment.supplierName}</div>
                      <span className="text-xs px-2 py-1 rounded bg-blue-200 text-blue-800">Current</span>
                    </div>
                    <div className="text-sm text-blue-700">{selectedShipment.referenceKey} • {selectedShipment.poNumber}</div>
                  </div>
                  
                  {/* Related suppliers - simplified */}
                  {selectedShipment.relatedSuppliers.map((supplier, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="font-medium text-gray-800 mb-1">{supplier.name}</div>
                      <div className="text-sm text-gray-600">{supplier.referenceKey} • {supplier.poNumber}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>
      </SheetContent>
    </Sheet>
  );
}