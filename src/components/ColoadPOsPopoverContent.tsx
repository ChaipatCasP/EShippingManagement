/**
 * Co-load Purchase Orders Popover Component
 * แสดงรายการ POs จริงจาก consolidated-suppliers API
 * ใช้ใน ShipmentTimeline popover
 */

import React from 'react';
import { Loader2, Package, Users, FileText } from 'lucide-react';
import { useConsolidatedSuppliers } from '../hooks/useConsolidatedSuppliers';
import type { ConsolidatedSupplier } from '../api/types';

interface ColoadPOsPopoverContentProps {
  shipment: {
    poDate: string;
    dateClear: string;
    supplierName: string;
    referenceKey: string;
    poNumber: string;
    pstStatus: string;
    originalPOData?: {
      supCode: string;
      poBook: string;
      poNo: number;
      transType: string;
      coLoadPOCount: number;
    };
    poType: string;
    // Add supplier code for matching
    supplierCode?: string;
  };
  poTypeStyle: {
    icon: React.ReactNode;
    textColor: string;
    bgColor: string;
    borderColor: string;
  };
  totalSuppliers: number;
}

const ColoadPOsPopoverContent: React.FC<ColoadPOsPopoverContentProps> = ({
  shipment,
  poTypeStyle,
  totalSuppliers
}) => {
  const {
    suppliers,
    loading,
    error,
    totalCount,
    refetch
  } = useConsolidatedSuppliers({
    startDate: shipment.poDate,
    endDate: shipment.dateClear,
    poBook: shipment.originalPOData?.poBook,
    transType: shipment.originalPOData?.transType,
    poNo: shipment.originalPOData?.poNo,
    enabled: true
  });

  const totalPOsCount = suppliers.reduce((total: number, supplier: ConsolidatedSupplier) => 
    total + (supplier.pos?.length || 0), 0
  );

  // Helper function to check if supplier is current
  const isCurrentSupplier = (supplier: ConsolidatedSupplier) => {
    // Use supCode from originalPOData first, then fallback to supplierCode
    const currentSupCode = shipment.originalPOData?.supCode || shipment.supplierCode;
    
    // Check if supplier code matches
    if (currentSupCode && supplier.supCode === currentSupCode) {
      // Also check if any PO matches the current shipment's PO
      if (shipment.originalPOData && supplier.pos) {
        return supplier.pos.some(po => 
          po.poBook === shipment.originalPOData?.poBook && 
          po.poNo === shipment.originalPOData?.poNo
        );
      }
      return true;
    }
    return false;
  };

  // Separate current and other suppliers
  const currentSupplier = suppliers.find(supplier => isCurrentSupplier(supplier));
  const otherSuppliers = suppliers.filter(supplier => !isCurrentSupplier(supplier));

  const handleRetry = () => {
    refetch();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b">
        {poTypeStyle.icon}
        <span className="font-semibold text-gray-900">
          {shipment.poType} Container - All Purchase Orders
        </span>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-slate-600">Loading purchase orders...</span>
        </div>
      )}

      {error && (
        <div className="text-center py-4">
          <div className="text-red-600 text-sm mb-2">❌ Error loading data</div>
          <div className="text-xs text-slate-600 mb-2">{error}</div>
          <button
            onClick={handleRetry}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && suppliers.length === 0 && (
        <div className="text-center py-4 text-slate-500 text-sm">
          No purchase orders found
        </div>
      )}

      {!loading && !error && suppliers.length > 0 && (
        <div className="space-y-3">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 text-blue-600" />
              <div>
                <div className="text-xs font-medium text-slate-700">Suppliers</div>
                <div className="text-sm font-bold text-slate-900">{totalCount}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-3 w-3 text-green-600" />
              <div>
                <div className="text-xs font-medium text-slate-700">Total POs</div>
                <div className="text-sm font-bold text-slate-900">{totalPOsCount}</div>
              </div>
            </div>
          </div>

          {/* Current Shipment - Use from API if available, otherwise fallback to shipment data */}
          {currentSupplier ? (
            <div className={`p-3 rounded-lg border ${poTypeStyle.bgColor} ${poTypeStyle.borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`font-semibold text-sm ${poTypeStyle.textColor}`}>
                  {currentSupplier.supName}
                </div>
                <span className={`text-xs px-2 py-1 rounded border bg-white ${poTypeStyle.textColor} ${poTypeStyle.borderColor}`}>
                  Current
                </span>
              </div>
              <div className="text-xs text-gray-600 mb-1">Code: {currentSupplier.supCode}</div>
              
              {/* Show POs from current supplier */}
              {currentSupplier.pos && currentSupplier.pos.length > 0 && (
                <div className="mt-2 space-y-1">
                  {currentSupplier.pos.map((po: any, poIndex: number) => (
                    <div
                      key={`current-${po.poBook}-${po.poNo}-${poIndex}`}
                      className={`flex items-center gap-2 text-xs p-2 rounded ${poTypeStyle.bgColor}`}
                    >
                      <Package className="h-2 w-2 text-slate-500" />
                      <span className="font-mono font-medium">{po.poBook}-{po.poNo}</span>
                      {/* Mark the matching PO */}
                      {po.poBook === shipment.originalPOData?.poBook && 
                       po.poNo === shipment.originalPOData?.poNo && (
                        <span className="text-xs bg-green-100 text-green-600 px-1 rounded">Active</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Fallback to original shipment data if not found in API */
            <div className={`p-3 rounded-lg border ${poTypeStyle.bgColor} ${poTypeStyle.borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`font-semibold text-sm ${poTypeStyle.textColor}`}>
                  {shipment.supplierName}
                </div>
                <span className={`text-xs px-2 py-1 rounded border bg-white ${poTypeStyle.textColor} ${poTypeStyle.borderColor}`}>
                  Current
                </span>
              </div>
              {shipment.pstStatus !== 'new-entry' && (
                <div className="text-xs text-gray-600 mb-1">{shipment.referenceKey}</div>
              )}
              <div className="text-sm font-medium text-gray-800">{shipment.poNumber}</div>
            </div>
          )}

          {/* Other Suppliers from API */}
          {otherSuppliers.map((supplier: ConsolidatedSupplier, index: number) => (
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

      <div className="pt-2 border-t text-xs text-gray-500 text-center">
        {!loading && !error && suppliers.length > 0 ? (
          <>Total: {totalPOsCount} purchase orders from {totalCount} suppliers</>
        ) : (
          <>Expected: {totalSuppliers} purchase orders in this {shipment.poType.toLowerCase()} container</>
        )}
      </div>
    </div>
  );
};

export default ColoadPOsPopoverContent;
