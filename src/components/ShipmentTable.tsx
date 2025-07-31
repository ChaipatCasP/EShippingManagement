import React, { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ArrowUpDown, ArrowUp, ArrowDown, Package2, Layers, Users, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { ColoadAccordion } from './ColoadAccordion';
import { TableSkeleton } from './ui/loading';
import {
  getTypeIcon,
  getActionButtonConfig
} from '../lib/shipmentUtils';
import type { Shipment, SortOption } from '../types/shipment';

interface ShipmentTableProps {
  shipments: Shipment[];
  selectedShipment: Shipment | null;
  poType: string;
  sortOption: SortOption;
  onShipmentClick: (shipment: Shipment) => void;
  onCreatePST: (poNumber: string) => void;
  onCreatePSW: (poNumber: string) => void;
  onSortOptionChange: (option: SortOption) => void;
  isLoading?: boolean;
}

export function ShipmentTable({ 
  shipments, 
  selectedShipment, 
  poType, 
  sortOption, 
  onShipmentClick, 
  onCreatePST, 
  onCreatePSW, 
  onSortOptionChange,
  isLoading = false
}: ShipmentTableProps) {
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [selectedSupplierShipment, setSelectedSupplierShipment] = useState<Shipment | null>(null);

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="animate-fadeInUp">
        <TableSkeleton rows={8} columns={9} />
      </div>
    );
  }

  if (shipments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 animate-fadeInUp">
        <div className="flex flex-col items-center gap-3">
          <Package2 className="w-12 h-12 text-gray-300" />
          <p>No shipments found for {poType === 'all' ? 'the selected filters' : `${poType} PO type`}</p>
        </div>
      </div>
    );
  }

  // Show Co-load Accordion for Co-load PO type
  if (poType === 'Co-load') {
    return (
      <ColoadAccordion
        shipments={shipments}
        onShipmentClick={onShipmentClick}
        getStatusColor={() => ''}
        getPOTypeColor={() => ''}
        getPOTypeIcon={() => null}
      />
    );
  }

  // Helper function to handle action clicks
  const handleActionClick = (shipment: Shipment, action: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  // Helper function to get PO type style and count - simplified and subtle
  const getPOTypeStyle = (shipment: Shipment) => {
    const totalPOs = shipment.relatedSuppliers ? shipment.relatedSuppliers.length + 1 : 1;
    
    switch (shipment.poType) {
      case 'Single': 
        return {
          label: 'Single',
          textColor: 'text-green-600',
          bgColor: 'bg-green-50',
          icon: <Package2 className="w-2.5 h-2.5" />,
          count: null,
          clickable: false
        };
      case 'Multiple': 
        return {
          label: 'Multiple',
          textColor: 'text-purple-600',
          bgColor: 'bg-purple-50',
          icon: <Package2 className="w-2.5 h-2.5" />,
          count: totalPOs,
          clickable: true
        };
      case 'Co-load': 
        return {
          label: 'Co-load',
          textColor: 'text-orange-600',
          bgColor: 'bg-orange-50',
          icon: <Layers className="w-2.5 h-2.5" />,
          count: totalPOs,
          clickable: true
        };
      default: 
        return {
          label: shipment.poType,
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          icon: <Package2 className="w-2.5 h-2.5" />,
          count: null,
          clickable: false
        };
    }
  };

  // Helper function to get PST/PSW status
  const getPSTStatus = (shipment: Shipment) => {
    if (shipment.pstNumber) {
      return { text: 'PST Done', color: 'bg-green-100 text-green-700 border-green-200' };
    }
    return { text: 'PST Pending', color: 'bg-amber-100 text-amber-700 border-amber-200' };
  };

  const getPSWStatus = (shipment: Shipment) => {
    if (shipment.pswNumber) {
      return { text: 'PSW Done', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    }
    if (shipment.pstNumber) {
      return { text: 'PSW Pending', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    }
    return { text: 'N/A', color: 'bg-gray-100 text-gray-500 border-gray-200' };
  };

  // Handle supplier dialog
  const handleSupplierClick = (shipment: Shipment, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSupplierShipment(shipment);
    setSupplierDialogOpen(true);
  };

  // Clean table design with subtle PO Type badges
  return (
    <div className="animate-fadeInUp">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200">
            <TableHead className="text-left text-gray-600 px-3 py-2 text-sm">
              PO Number
            </TableHead>
            <TableHead className="text-left text-gray-600 px-3 py-2 text-sm">
              Supplier Name
            </TableHead>
            <TableHead className="text-left text-gray-600 px-3 py-2 text-sm">
              PO Type
            </TableHead>
            <TableHead className="text-left text-gray-600 px-3 py-2 text-sm">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-auto p-0 hover:bg-transparent text-gray-600 text-sm">
                    <div className="flex items-center gap-1">
                      <span>Clear Date</span>
                      {sortOption.startsWith('clearDate') ? (
                        sortOption === 'clearDate-asc' ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => onSortOptionChange('clearDate-asc')}>
                    <ArrowUp className="w-4 h-4 mr-2" />
                    Nearest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSortOptionChange('clearDate-desc')}>
                    <ArrowDown className="w-4 h-4 mr-2" />
                    Furthest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSortOptionChange('none')}>
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    No Sort
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableHead>
            <TableHead className="text-left text-gray-600 px-3 py-2 text-sm">
              Origin
            </TableHead>
            <TableHead className="text-left text-gray-600 px-3 py-2 text-sm">
              Destination
            </TableHead>
            <TableHead className="text-left text-gray-600 px-3 py-2 text-sm">
              PST Status
            </TableHead>
            <TableHead className="text-left text-gray-600 px-3 py-2 text-sm">
              PSW Status
            </TableHead>
            <TableHead className="text-left text-gray-600 px-3 py-2 text-sm">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shipments.map((shipment) => {
            const actionConfig = getActionButtonConfig(shipment);
            const poTypeStyle = getPOTypeStyle(shipment);
            const pstStatus = getPSTStatus(shipment);
            const pswStatus = getPSWStatus(shipment);
            
            return (
              <TableRow 
                key={shipment.id}
                className={`cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-all duration-200 hover:shadow-sm ${
                  selectedShipment?.id === shipment.id ? 'bg-blue-50' : 'bg-white'
                } animate-staggerFadeIn`}
                style={{ animationDelay: `${shipments.indexOf(shipment) * 50}ms` }}
                onClick={() => onShipmentClick(shipment)}
              >
                {/* PO Number */}
                <TableCell className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-50 rounded border border-blue-200 flex items-center justify-center flex-shrink-0">
                      {getTypeIcon(shipment.type)}
                    </div>
                    <span className="font-medium text-blue-600 text-sm">{shipment.poNumber}</span>
                  </div>
                </TableCell>

                {/* Supplier Name */}
                <TableCell className="px-3 py-2">
                  <span className="text-gray-900 text-sm">{shipment.supplierName}</span>
                </TableCell>

                {/* PO Type - Subtle and clickable for Multiple/Co-load */}
                <TableCell className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    {poTypeStyle.clickable ? (
                      <button
                        onClick={(e) => handleSupplierClick(shipment, e)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors hover:opacity-80 ${poTypeStyle.bgColor} ${poTypeStyle.textColor}`}
                      >
                        {poTypeStyle.icon}
                        <span className="font-medium">{poTypeStyle.label}</span>
                        {poTypeStyle.count && (
                          <span className="ml-0.5 px-1 py-0.5 rounded-full bg-white bg-opacity-60 text-xs font-medium">
                            {poTypeStyle.count}
                          </span>
                        )}
                        <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
                      </button>
                    ) : (
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${poTypeStyle.bgColor} ${poTypeStyle.textColor}`}>
                        {poTypeStyle.icon}
                        <span className="font-medium">{poTypeStyle.label}</span>
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Delivery Date */}
                <TableCell className="px-3 py-2">
                  <span className="text-gray-900 text-sm">{shipment.dateClear}</span>
                </TableCell>

                {/* Origin */}
                <TableCell className="px-3 py-2">
                  <span className="text-gray-700 text-sm">{shipment.originPort}</span>
                </TableCell>

                {/* Destination */}
                <TableCell className="px-3 py-2">
                  <span className="text-gray-700 text-sm">{shipment.destinationPort}</span>
                </TableCell>

                {/* PST Status */}
                <TableCell className="px-3 py-2">
                  <Badge className={`text-xs border ${pstStatus.color}`}>
                    {pstStatus.text}
                  </Badge>
                </TableCell>

                {/* PSW Status */}
                <TableCell className="px-3 py-2">
                  <Badge className={`text-xs border ${pswStatus.color}`}>
                    {pswStatus.text}
                  </Badge>
                </TableCell>

                {/* Action */}
                <TableCell className="px-3 py-2">
                  <Button
                    size="sm"
                    disabled={!actionConfig.enabled}
                    className={`${actionConfig.color} text-xs px-2 py-1 transition-all duration-200 hover:animate-microBounce`}
                    onClick={(e) => {
                      if (actionConfig.enabled) {
                        handleActionClick(shipment, actionConfig.action, e);
                      }
                    }}
                    title={actionConfig.tooltip}
                  >
                    {actionConfig.icon}
                    <span className="ml-1">{actionConfig.text}</span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Supplier Details Dialog - Fixed with proper DialogDescription */}
      <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              {selectedSupplierShipment?.poType} PO Details
            </DialogTitle>
            <DialogDescription>
              View detailed information about this {selectedSupplierShipment?.poType.toLowerCase()} PO and its associated suppliers.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSupplierShipment && (
            <div className="space-y-4">
              {/* Main Supplier */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Main Supplier</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Supplier Name:</span>
                    <span className="font-medium text-gray-900">{selectedSupplierShipment.supplierName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">PO Number:</span>
                    <span className="font-medium text-blue-600">{selectedSupplierShipment.poNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reference Key:</span>
                    <span className="font-medium text-gray-900">{selectedSupplierShipment.referenceKey}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Invoice Number:</span>
                    <span className="font-medium text-gray-900">{selectedSupplierShipment.invoiceNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Value:</span>
                    <span className="font-medium text-green-600">${selectedSupplierShipment.totalValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Related Suppliers */}
              {selectedSupplierShipment.relatedSuppliers && selectedSupplierShipment.relatedSuppliers.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Package2 className="w-4 h-4" />
                    Related Suppliers ({selectedSupplierShipment.relatedSuppliers.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedSupplierShipment.relatedSuppliers.map((supplier, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Supplier Name:</span>
                            <span className="font-medium text-gray-900">{supplier.name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">PO Number:</span>
                            <span className="font-medium text-blue-600">{supplier.poNumber}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Reference Key:</span>
                            <span className="font-medium text-gray-900">{supplier.referenceKey}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total POs:</span>
                  <span className="font-medium text-gray-900">
                    {1 + (selectedSupplierShipment.relatedSuppliers?.length || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Suppliers:</span>
                  <span className="font-medium text-gray-900">
                    {1 + (selectedSupplierShipment.relatedSuppliers?.length || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className={`font-medium ${getPOTypeStyle(selectedSupplierShipment).textColor}`}>
                    {selectedSupplierShipment.poType}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}