import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ArrowRight, Key, FileDigit, MapPin, Package2, Layers, Flag, Users, FileText, Calendar } from 'lucide-react';
import ColoadPOsPopoverContent from './ColoadPOsPopoverContent';
import { CreatePSTConfirmation } from './CreatePSTConfirmationModal';
import {
  getTypeIcon
} from '../lib/shipmentUtils';
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

interface ShipmentTimelineProps {
  shipments: Shipment[];
  selectedShipment: Shipment | null;
  onShipmentClick: (shipment: Shipment) => void;
  onCreatePST: (poNumber: string) => void;
  onUpdatePST: (pstWebSeqId: number) => void;
  onCreatePSW: (poNumber: string) => void;
  onCreatePSTWithConfirmation?: (poNumber: string, shipment: Shipment) => void;
  isLoading?: boolean;
}

export function ShipmentTimeline({ 
  shipments, 
  selectedShipment, 
  onShipmentClick, 
  onCreatePST, 
  onUpdatePST,
  onCreatePSW,
  onCreatePSTWithConfirmation
}: ShipmentTimelineProps) {
  console.log('ShipmentTimeline component rendered with', shipments.length, 'shipments');
  console.log('onUpdatePST function available:', !!onUpdatePST);
  console.log('onCreatePSTWithConfirmation function available:', !!onCreatePSTWithConfirmation);
  
  // State for PST confirmation
  const [pstConfirmationOpen, setPstConfirmationOpen] = useState(false);
  const [selectedPstShipment, setSelectedPstShipment] = useState<Shipment | null>(null);
  const [isPstCreating, setIsPstCreating] = useState(false);

  // Handler for PST creation with confirmation
  const handleCreatePSTWithConfirmation = (shipment: Shipment) => {
    console.log('🚀 Timeline - handleCreatePSTWithConfirmation called with:', shipment.poNumber);
    setSelectedPstShipment(shipment);
    setPstConfirmationOpen(true);
    console.log('📝 Timeline - Popup state set to true');
  };

  // Handler for PST confirmation
  const handleConfirmCreatePST = async () => {
    console.log('✅ Timeline - handleConfirmCreatePST called with:', selectedPstShipment?.poNumber);
    
    if (!selectedPstShipment) {
      console.log('❌ No selectedPstShipment found');
      return;
    }
    
    try {
      console.log('🔄 Setting isPstCreating to true');
      setIsPstCreating(true);
      
      if (onCreatePSTWithConfirmation) {
        console.log('🚀 Calling onCreatePSTWithConfirmation from Timeline');
        await onCreatePSTWithConfirmation(selectedPstShipment.poNumber, selectedPstShipment);
      } else {
        console.log('⚠️ Fallback to regular PST creation');
        onCreatePST(selectedPstShipment.poNumber);
      }
      
      // Close the confirmation dialog
      console.log('🔄 Closing confirmation dialog');
      setPstConfirmationOpen(false);
      setSelectedPstShipment(null);
    } catch (error) {
      console.error('❌ Error creating PST:', error);
    } finally {
      setIsPstCreating(false);
    }
  };
  
  if (shipments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No shipments found for the selected filters
      </div>
    );
  }

  const handleActionClick = (shipment: Shipment, action: string) => {
    console.log('ShipmentTimeline - handleActionClick:', { action, shipment: shipment.poNumber, pstWebSeqId: shipment.pstWebSeqId });
    
    switch (action) {
      case 'create-pst':
        console.log('✅ Timeline - Using confirmation dialog for PST creation');
        handleCreatePSTWithConfirmation(shipment);
        break;
      case 'edit-pst':
        console.log('Calling onUpdatePST with pstWebSeqId:', shipment.pstWebSeqId);
        if (shipment.pstWebSeqId) {
          onUpdatePST(shipment.pstWebSeqId);
        } else {
          console.error('No pstWebSeqId found for shipment:', shipment);
        }
        break;
      case 'create-psw':
        onCreatePSW(shipment.poNumber);
        break;
      case 'view-psw':
        alert(`View PSW ${shipment.pswNumber} - This feature will be implemented`);
        break;
      case 'completed':
        break;
    }
  };

  // Helper function to get border color based on bill type
  const getBorderColor = (billType: string) => {
    switch (billType) {
      case 'Urgent': return 'border-l-red-500';
      case 'Regular': return 'border-l-blue-500';
      default: return 'border-l-blue-500';
    }
  };

  // Helper function to get PO type label style
  const getPOTypeStyle = (poType: string) => {
    switch (poType) {
      case 'Single': 
        return {
          label: 'Single',
          textColor: 'text-green-700',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          icon: <Package2 className="w-2.5 h-2.5" />
        };
      case 'Co-load': 
        return {
          label: 'Co-load',
          textColor: 'text-orange-700',
          bgColor: 'bg-orange-100',
          borderColor: 'border-orange-200',
          icon: <Layers className="w-2.5 h-2.5" />
        };
      default: 
        return {
          label: poType,
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          icon: <Package2 className="w-2.5 h-2.5" />
        };
    }
  };

  // Helper function to get PST status display text
  const getPSTStatusText = (pstStatus: string) => {
    switch (pstStatus) {
      case 'N': return 'New Entry';
      case 'Y': return 'Submitted';
      case 'Z': return 'Cancelled';
      case '': return 'No Status';
      default: return pstStatus || 'No Status'; // แสดงค่าเดิมหรือ 'No Status' ถ้าเป็นค่าว่าง
    }
  };

  // Helper function to get PST status color based on status
  const getPSTStatusColor = (pstStatus: string) => {
    switch (pstStatus) {
      case 'N': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Y': return 'bg-green-50 text-green-700 border-green-200';
      case 'Z': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Helper function to get PSW status display text
  const getPSWStatusText = (pswStatus: string) => {
    switch (pswStatus) {
      case 'N': return 'New Entry';
      case 'Y': return 'Submitted';
      case 'Z': return 'Cancelled';
      case '': return 'No Status';
      default: return pswStatus || 'No Status';
    }
  };

  // Helper function to get PSW status color based on status
  const getPSWStatusColor = (pswStatus: string) => {
    switch (pswStatus) {
      case 'N': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Y': return 'bg-green-50 text-green-700 border-green-200';
      case 'Z': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Helper function to get action button configuration based on PST/PSW status
  const getCustomActionConfig = (shipment: Shipment) => {
    const { pstStatus, pswStatus } = shipment;
    console.log('getCustomActionConfig for shipment:', shipment.poNumber, { pstStatus, pswStatus, pstWebSeqId: shipment.pstWebSeqId });
    
    // ถ้า pstStatus เป็นว่าง หรือ null ให้แสดงปุ่ม CreatePst
    if (!pstStatus || pstStatus === '' || pstStatus === null) {
      return {
        text: 'Create PST',
        action: 'create-pst',
        color: 'bg-blue-600 hover:bg-blue-700 text-white',
        enabled: true,
        tooltip: 'Create PST document',
        icon: <Flag className="w-3 h-3" />
      };
    }
    
    // ถ้า pstStatus เป็น N ให้แสดงปุ่ม UpdatePst
    if (pstStatus === 'N') {
      console.log('Should show Update PST button for:', shipment.poNumber);
      return {
        text: 'Update PST',
        action: 'edit-pst',
        color: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        enabled: true,
        tooltip: 'Update PST document',
        icon: <Flag className="w-3 h-3" />
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
        icon: <Calendar className="w-3 h-3" />
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
        icon: <Flag className="w-3 h-3" />
      };
    }
    
    // Default fallback
    return {
      text: 'No Action',
      action: 'none',
      color: 'bg-gray-400 text-white cursor-not-allowed',
      enabled: false,
      tooltip: 'No action available',
      icon: <Flag className="w-3 h-3" />
    };
  };

  return (
    <div className="space-y-3">
      {shipments.map((shipment) => {
        const customActionConfig = getCustomActionConfig(shipment);
        console.log('Rendering shipment:', shipment.poNumber, 'with action config:', customActionConfig);
        const borderColor = getBorderColor(shipment.billType);
        const totalSuppliers = 1 + (shipment.relatedSuppliers?.length || 0);
        const poTypeStyle = getPOTypeStyle(shipment.poType);
        
        return (
          <Card 
            key={shipment.id} 
            className={`border-l-4 ${borderColor} cursor-pointer hover:shadow-md transition-all relative ${ 
              selectedShipment?.id === shipment.id ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''
            }`}
            onClick={() => onShipmentClick(shipment)}
          >
            <CardContent className="p-4">
              {/* Status badges positioned at top-right corner */}
              <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                {/* PST Status Badge - Show only if pstStatus has value */}
                {(shipment.pstStatus && shipment.pstStatus !== '' && shipment.pstStatus !== null) && (
                  <Badge className={`text-xs ${getPSTStatusColor(shipment.pstStatus)}`}>
                    <div className="flex items-center gap-1">
                      <Flag className="w-2 h-2" />
                      <span className="text-xs opacity-75">PST:</span>
                      <span>{getPSTStatusText(shipment.pstStatus)}</span>
                      {shipment.pstNumber && (
                        <>
                          <span className="text-xs opacity-50">-</span>
                          <span className="text-xs font-medium">{shipment.pstNumber}</span>
                        </>
                      )}
                    </div>
                  </Badge>
                )}

                {/* PSW Status Badge - Show only if pswStatus has value */}
                {(shipment.pswStatus && shipment.pswStatus !== '' && shipment.pswStatus !== null) && (
                  <Badge className={`text-xs ${getPSWStatusColor(shipment.pswStatus)}`}>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-2 h-2" />
                      <span className="text-xs opacity-75">PSW:</span>
                      <span>{getPSWStatusText(shipment.pswStatus)}</span>
                      {shipment.pswNumber && (
                        <>
                          <span className="text-xs opacity-50">-</span>
                          <span className="text-xs font-medium">{shipment.pswNumber}</span>
                        </>
                      )}
                    </div>
                  </Badge>
                )}
              </div>

              {/* Content area with space for right-aligned action button */}
              <div className="flex">
                {/* Left content area */}
                <div className="flex-1 pr-4">
                  {/* Section 1: Primary Information - Supplier Name & PO Type */}
                  <div className="mb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-7 h-7 bg-blue-50 rounded border border-blue-200 flex items-center justify-center">
                        {getTypeIcon(shipment.type)}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{shipment.supplierName}</h3>
                      
                      {/* Co-load Suppliers Display */}
                      {shipment.poType === 'Co-load' && totalSuppliers > 1 && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button 
                              className={`text-xs px-2 py-1 rounded transition-colors cursor-pointer hover:opacity-80 ${poTypeStyle.textColor}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>+{totalSuppliers - 1} more</span>
                              </div>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-4" align="start">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 pb-2 border-b">
                                {poTypeStyle.icon}
                                <span className="font-semibold text-gray-900">
                                  {shipment.poType} Container - All Suppliers
                                </span>
                              </div>
                              
                              <div className="space-y-3">
                                <div className={`p-3 rounded-lg border ${poTypeStyle.bgColor} ${poTypeStyle.borderColor}`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className={`font-semibold ${poTypeStyle.textColor}`}>
                                      {shipment.supplierName}
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded border bg-white ${poTypeStyle.textColor} ${poTypeStyle.borderColor}`}>
                                      Current
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-600 mb-1">
                                    {shipment.pstNo 
                                      ? (shipment.pstBook && shipment.pstNo 
                                          ? `${shipment.pstBook}-${shipment.pstNo}` 
                                          : shipment.pstNo.toString())
                                      : shipment.referenceKey
                                    }
                                  </div>
                                  <div className="text-sm font-medium text-gray-800">{shipment.poNumber}</div>
                                </div>
                                
                                {shipment.relatedSuppliers && shipment.relatedSuppliers.map((supplier, index) => (
                                  <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                                    <div className="font-medium text-gray-800 mb-1">{supplier.name}</div>
                                    <div className="text-sm text-gray-600 mb-1">{supplier.referenceKey}</div>
                                    <div className="text-sm font-medium text-gray-800">{supplier.poNumber}</div>
                                  </div>
                                ))}
                              </div>
                              
                              <div className="pt-2 border-t text-sm text-gray-500 text-center">
                                Total: {totalSuppliers} suppliers in this {shipment.poType.toLowerCase()} container
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                      
                      {/* PO Type Label */}
                      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-xs ${poTypeStyle.bgColor} ${poTypeStyle.borderColor} ${poTypeStyle.textColor}`}>
                        {poTypeStyle.icon}
                        <span className="font-medium">{poTypeStyle.label}</span>
                      </div>
                    </div>
                    
                    {/* Consolidated Reference & PO Info */}
                    <div className="flex items-center gap-6 text-sm">
                   
                      
                      <div className="flex items-center gap-2">
                        <Package2 className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">PO:</span>
                        {shipment.poType === 'Single' ? (
                          <span className="font-medium text-gray-900">{shipment.poNumber}</span>
                        ) : (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button 
                                className={`flex items-center gap-2 px-2 py-1 rounded transition-colors cursor-pointer hover:opacity-80 ${poTypeStyle.textColor}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="font-medium">{shipment.poNumber}</span>
                                <span className="text-xs px-1 py-0.5 rounded border border-current">
                                  {shipment.originalPOData?.coLoadPOCount || totalSuppliers}
                                </span>
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4" align="start">
                              <ColoadPOsPopoverContent
                                shipment={shipment}
                                poTypeStyle={poTypeStyle}
                                totalSuppliers={totalSuppliers}
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>

                         {shipment.pstNo && (
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Ref :</span>
                          <span className="font-medium text-gray-900">
                            {shipment.pstBook && shipment.pstNo 
                              ? `${shipment.pstBook}-${shipment.pstNo}` 
                              : shipment.referenceKey
                            }
                          </span>
                          <span>( chaipat test ){shipment.pstStatus}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 2: Left-Aligned Timeline */}
                  <div className="mb-3">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-left">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-600 text-xs font-medium">ETD</span>
                        </div>
                        <span className="font-semibold text-gray-900">{formatDate(shipment.etd)}</span>
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-gray-600 text-xs font-medium">ETA</span>
                        </div>
                        <span className="font-semibold text-gray-900">{formatDate(shipment.eta)}</span>
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-600 text-xs font-medium">WR Date</span>
                        </div>
                        <span className="font-semibold text-gray-900">{formatDate(shipment.dateClear)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Consolidated Document & Route Info */}
                  <div className="space-y-2">
                    {/* Documents row */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1">
                        <FileDigit className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">Invoice:</span>
                        <span className="font-medium text-gray-800">{shipment.invoiceNumber}</span>
                        <span className="text-gray-500">({formatDate(shipment.invoiceDate)})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">AWB:</span>
                        <span className="font-medium text-gray-800">{shipment.blAwbNumber}</span>
                      </div>
                    </div>

                    {/* Route row */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-700">{shipment.originPort}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-700">{shipment.destinationPort}</span>
                    </div>
                  </div>
                </div>

                {/* Right-aligned Action Button */}
                <div className="flex items-center">
                  <Button
                    size="sm"
                    disabled={!customActionConfig.enabled}
                    className={`${customActionConfig.color} font-medium px-3 py-1 text-xs shadow-sm transition-all duration-200`}
                    onClick={(e) => {
                      console.log('Button clicked!', { 
                        action: customActionConfig.action, 
                        enabled: customActionConfig.enabled,
                        shipment: shipment.poNumber,
                        pstWebSeqId: shipment.pstWebSeqId 
                      });
                      e.stopPropagation();
                      if (customActionConfig.enabled) {
                        handleActionClick(shipment, customActionConfig.action);
                      } else {
                        console.log('Button is disabled!');
                      }
                    }}
                    title={customActionConfig.tooltip}
                  >
                    {customActionConfig.icon}
                    <span className="ml-1">{customActionConfig.text}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {/* PST Confirmation Dialog */}
      {selectedPstShipment && (
        <CreatePSTConfirmation
          isOpen={pstConfirmationOpen}
          onClose={() => setPstConfirmationOpen(false)}
          onConfirm={handleConfirmCreatePST}
          isLoading={isPstCreating}
          poNo={selectedPstShipment.poNumber || ''}
          poBook={selectedPstShipment.originalPOData?.poBook || ''}
          shipmentNo={selectedPstShipment.blAwbNumber || selectedPstShipment.id || ''}
          portOfDestination={selectedPstShipment.destinationPort || ''}
        />
      )}
    </div>
  );
}