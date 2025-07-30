import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ArrowRight, Key, FileDigit, MapPin, Package2, Layers, Flag, Users, FileText, Calendar } from 'lucide-react';
import {
  getTypeIcon,
  getJagotaStatusColor,
  getActionButtonConfig
} from '../lib/shipmentUtils';
import type { Shipment } from '../types/shipment';

interface ShipmentTimelineProps {
  shipments: Shipment[];
  selectedShipment: Shipment | null;
  onShipmentClick: (shipment: Shipment) => void;
  onCreatePST: (poNumber: string) => void;
  onCreatePSW: (poNumber: string) => void;
  isLoading?: boolean;
}

export function ShipmentTimeline({ 
  shipments, 
  selectedShipment, 
  onShipmentClick, 
  onCreatePST, 
  onCreatePSW 
}: ShipmentTimelineProps) {
  if (shipments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No shipments found for the selected filters
      </div>
    );
  }

  const handleActionClick = (shipment: Shipment, action: string) => {
    switch (action) {
      case 'create-pst':
      case 'edit-pst':
        onCreatePST(shipment.poNumber);
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
      case 'Multiple': 
        return {
          label: 'Multiple',
          textColor: 'text-purple-700',
          bgColor: 'bg-purple-100',
          borderColor: 'border-purple-200',
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

  // Helper function to get PSW status color
  const getPSWStatusColor = (shipment: Shipment) => {
    if (shipment.pswNumber) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div className="space-y-3">
      {shipments.map((shipment) => {
        const actionConfig = getActionButtonConfig(shipment);
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
                {/* PST Status Badge */}
                <Badge className={`text-xs ${getJagotaStatusColor(shipment.jagotaStatus)}`}>
                  <div className="flex items-center gap-1">
                    <Flag className="w-2 h-2" />
                    <span className="text-xs opacity-75">PST:</span>
                    <span>{shipment.jagotaStatus}</span>
                    {shipment.pstNumber && (
                      <>
                        <span className="text-xs opacity-50">-</span>
                        <span className="text-xs font-medium">{shipment.pstNumber}</span>
                      </>
                    )}
                  </div>
                </Badge>

                {/* PSW Status Badge - Show if PST is completed */}
                {shipment.pstNumber && (
                  <Badge className={`text-xs ${getPSWStatusColor(shipment)}`}>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-2 h-2" />
                      <span className="text-xs opacity-75">PSW:</span>
                      {shipment.pswNumber ? (
                        <>
                          <span>Completed</span>
                          <span className="text-xs opacity-50">-</span>
                          <span className="text-xs font-medium">{shipment.pswNumber}</span>
                        </>
                      ) : (
                        <span>Pending</span>
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
                      
                      {/* Multiple Suppliers Display */}
                      {(shipment.poType === 'Multiple' || shipment.poType === 'Co-load') && totalSuppliers > 1 && (
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
                                  <div className="text-sm text-gray-600 mb-1">{shipment.referenceKey}</div>
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
                      {/* Only show Ref Key if PST status is not "new-entry" */}
                      {shipment.pstStatus !== 'new-entry' && (
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Ref:</span>
                          <span className="font-medium text-gray-900">{shipment.referenceKey}</span>
                        </div>
                      )}
                      
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
                                  {totalSuppliers}
                                </span>
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4" align="start">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 pb-2 border-b">
                                  {poTypeStyle.icon}
                                  <span className="font-semibold text-gray-900">
                                    {shipment.poType} Container - All Purchase Orders
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
                                    {/* Only show reference key if PST status is not "new-entry" */}
                                    {shipment.pstStatus !== 'new-entry' && (
                                      <div className="text-sm text-gray-600 mb-1">{shipment.referenceKey}</div>
                                    )}
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
                                  Total: {totalSuppliers} purchase orders in this {shipment.poType.toLowerCase()} container
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
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
                        <span className="font-semibold text-gray-900">{shipment.etd}</span>
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-gray-600 text-xs font-medium">ETA</span>
                        </div>
                        <span className="font-semibold text-gray-900">{shipment.eta}</span>
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-600 text-xs font-medium">Clear</span>
                        </div>
                        <span className="font-semibold text-gray-900">{shipment.dateClear}</span>
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
                        <span className="text-gray-500">({shipment.invoiceDate})</span>
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
                    disabled={!actionConfig.enabled}
                    className={`${actionConfig.color} font-medium px-3 py-1 text-xs shadow-sm transition-all duration-200`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (actionConfig.enabled) {
                        handleActionClick(shipment, actionConfig.action);
                      }
                    }}
                    title={actionConfig.tooltip}
                  >
                    {actionConfig.icon}
                    <span className="ml-1">{actionConfig.text}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}