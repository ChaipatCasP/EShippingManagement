/**
 * React Hook สำหรับดึงข้อมูล Consolidated Suppliers
 * ใช้สำหรับ Co-load Container popup เมื่อมี count > 1
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardService } from '../api/services/dashboardService';
import { formatDateForAPI } from '../utils/dateUtils';
import type { ConsolidatedSupplier, ConsolidatedSuppliersResponse } from '../api/types';

interface UseConsolidatedSuppliersProps {
  startDate: string;
  endDate: string;
  cntrNo?: string;
  poBook?: string;
  transType?: string;
  poNo?: number;
  enabled?: boolean; // เปิด/ปิดการเรียก API
}

interface UseConsolidatedSuppliersReturn {
  suppliers: ConsolidatedSupplier[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => Promise<void>;
}

export const useConsolidatedSuppliers = ({
  startDate,
  endDate,
  cntrNo,
  poBook,
  transType,
  poNo,
  enabled = true
}: UseConsolidatedSuppliersProps): UseConsolidatedSuppliersReturn => {
  const [suppliers, setSuppliers] = useState<ConsolidatedSupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // ใช้ useRef เพื่อติดตาม parameters และป้องกันการ call ซ้ำ
  const lastParams = useRef<string>('');
  const isInitialMount = useRef(true);

  const fetchConsolidatedSuppliers = useCallback(async () => {
    // ตรวจสอบ parameters ที่จำเป็น
    if (!enabled || !startDate || !endDate) {
      console.warn('⚠️ useConsolidatedSuppliers: Missing required parameters or disabled', {
        enabled,
        startDate,
        endDate,
        cntrNo: cntrNo?.trim() || 'not provided',
        poBook: poBook?.trim() || 'not provided',
        transType: transType?.trim() || 'not provided',
        poNo: poNo || 'not provided'
      });
      return;
    }

    // ต้องมีอย่างน้อย cntrNo หรือ poBook หรือ transType+poNo
    if (!cntrNo?.trim() && !poBook?.trim() && !(transType?.trim() && poNo)) {
      console.warn('⚠️ useConsolidatedSuppliers: Need at least cntrNo, poBook, or transType+poNo');
      return;
    }

    try {
      // สร้าง parameter string เพื่อเปรียบเทียบ
      const currentParams = `${startDate}-${endDate}-${cntrNo?.trim() || ''}-${poBook?.trim() || ''}-${transType?.trim() || ''}-${poNo || ''}`;
      
      // หาก parameters เหมือนเดิม ให้ skip
      if (lastParams.current === currentParams && !isInitialMount.current) {
        console.log('📝 useConsolidatedSuppliers: Parameters unchanged, skipping API call');
        return;
      }

      lastParams.current = currentParams;
      isInitialMount.current = false;

      console.log('🔄 useConsolidatedSuppliers: Fetching data', {
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
        cntrNo: cntrNo?.trim() || 'not provided',
        poBook: poBook?.trim() || 'not provided',
        transType: transType?.trim() || 'not provided',
        poNo: poNo || 'not provided'
      });

      setLoading(true);
      setError(null);

      // เรียก API
      const response: ConsolidatedSuppliersResponse = await DashboardService.getConsolidatedSuppliers(
        formatDateForAPI(startDate),
        formatDateForAPI(endDate),
        cntrNo,
        poBook,
        transType,
        poNo
      );

      if (response.error) {
        throw new Error(response.message || 'Failed to fetch consolidated suppliers');
      }

      // ตรวจสอบและ set ข้อมูล
      const validSuppliers = response.data || [];
      setSuppliers(validSuppliers);
      setTotalCount(validSuppliers.length);

      console.log('✅ useConsolidatedSuppliers: Data fetched successfully', {
        suppliersCount: validSuppliers.length,
        totalPOsCount: validSuppliers.reduce((total, supplier) => total + (supplier.pos?.length || 0), 0)
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ useConsolidatedSuppliers: Error fetching data:', err);
      setError(errorMessage);
      setSuppliers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, cntrNo, poBook, transType, poNo, enabled]);

  // Manual refetch function
  const refetch = useCallback(async () => {
    lastParams.current = ''; // Reset เพื่อ force fetch
    await fetchConsolidatedSuppliers();
  }, [fetchConsolidatedSuppliers]);

  // Effect สำหรับ auto-fetch เมื่อ parameters เปลี่ยน
  useEffect(() => {
    if (enabled) {
      fetchConsolidatedSuppliers();
    }
  }, [fetchConsolidatedSuppliers, enabled]);

  return {
    suppliers,
    loading,
    error,
    totalCount,
    refetch
  };
};

export default useConsolidatedSuppliers;
