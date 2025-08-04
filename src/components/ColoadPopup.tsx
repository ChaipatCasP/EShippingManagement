/**
 * Co-load Container Popup Component
 * แสดงรายการ Suppliers และ POs เมื่อมี Container มากกว่า 1 supplier
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Loader2, Package, Users, FileText } from 'lucide-react';
import { useConsolidatedSuppliers } from '../hooks/useConsolidatedSuppliers';
import type { ConsolidatedSupplier } from '../api/types';

interface ColoadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  cntrNo?: string;
  poBook?: string;
  transType?: string;
  poNo?: number;
  startDate: string;
  endDate: string;
  count?: number;
}

const ColoadPopup: React.FC<ColoadPopupProps> = ({
  isOpen,
  onClose,
  cntrNo,
  poBook,
  transType,
  poNo,
  startDate,
  endDate,
  count = 0
}) => {
  const {
    suppliers,
    loading,
    error,
    totalCount,
    refetch
  } = useConsolidatedSuppliers({
    startDate,
    endDate,
    cntrNo,
    poBook,
    transType,
    poNo,
    enabled: isOpen // เรียก API เฉพาะเมื่อ popup เปิด
  });

  const totalPOsCount = suppliers.reduce((total: number, supplier: ConsolidatedSupplier) => total + (supplier.pos?.length || 0), 0);

  const handleRetry = () => {
    refetch();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Co-load Container Details
          </DialogTitle>
          <DialogDescription>
            {cntrNo && (
              <>
                Container: <span className="font-semibold text-slate-700">{cntrNo}</span>
              </>
            )}
            {poBook && (
              <>
                {cntrNo && ' | '}
                PO Book: <span className="font-semibold text-slate-700">{poBook}</span>
              </>
            )}
            {transType && (
              <>
                {(cntrNo || poBook) && ' | '}
                Transport: <span className="font-semibold text-slate-700">{transType}</span>
              </>
            )}
            {poNo && (
              <>
                {(cntrNo || poBook || transType) && ' | '}
                PO#: <span className="font-semibold text-slate-700">{poNo}</span>
              </>
            )}
            {count > 0 && (
              <span className="ml-2 text-sm text-slate-500">
                ({count} suppliers detected)
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-slate-700">Suppliers</div>
                <div className="text-lg font-bold text-slate-900">{totalCount}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-sm font-medium text-slate-700">Total POs</div>
                <div className="text-lg font-bold text-slate-900">{totalPOsCount}</div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <ScrollArea className="h-[400px] w-full border rounded-md">
            <div className="p-4">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-slate-600">Loading suppliers...</span>
                </div>
              )}

              {error && (
                <div className="text-center py-8">
                  <div className="text-red-600 mb-2">❌ Error loading data</div>
                  <div className="text-sm text-slate-600 mb-4">{error}</div>
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loading && !error && suppliers.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No suppliers found for this container
                </div>
              )}

              {!loading && !error && suppliers.length > 0 && (
                <div className="space-y-4">
                  {suppliers.map((supplier: ConsolidatedSupplier, index: number) => (
                    <SupplierCard key={`${supplier.supCode}-${index}`} supplier={supplier} />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface SupplierCardProps {
  supplier: ConsolidatedSupplier;
}

const SupplierCard: React.FC<SupplierCardProps> = ({ supplier }) => {
  const posCount = supplier.pos?.length || 0;

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 text-lg">
            {supplier.supName || 'Unknown Supplier'}
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Code: <span className="font-mono bg-slate-100 px-2 py-1 rounded">{supplier.supCode}</span>
          </p>
        </div>
        <Badge variant="secondary" className="ml-2">
          {posCount} PO{posCount !== 1 ? 's' : ''}
        </Badge>
      </div>

      {posCount > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-700 mb-2">Purchase Orders:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {supplier.pos.map((po: any, poIndex: number) => (
                <div
                  key={`${po.poBook}-${po.poNo}-${poIndex}`}
                  className="flex items-center gap-2 p-2 bg-slate-50 rounded border"
                >
                  <FileText className="h-3 w-3 text-slate-500" />
                  <span className="text-sm font-mono">
                    {po.poBook}-{po.poNo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ColoadPopup;
