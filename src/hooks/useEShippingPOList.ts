import { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardService } from '../api/services/dashboardService';
import type { POListItem } from '../api/types';

interface UseEShippingPOListParams {
  fromDate?: string;
  toDate?: string;
  transportBy?: string;
  keyword?: string;
  pstStatus?: string;
  pswStatus?: string;
  autoFetch?: boolean;
}

interface UseEShippingPOListReturn {
  data: POListItem[];
  loading: boolean;
  error: string | null;
  refetch: (params?: UseEShippingPOListParams) => Promise<void>;
  total: number;
}

export function useEShippingPOList({
  fromDate = '01-Jan-2021',
  toDate = '01-Jan-2026',
  transportBy = '',
  keyword = '',
  pstStatus = '',
  pswStatus = '',
  autoFetch = true
}: UseEShippingPOListParams = {}): UseEShippingPOListReturn {
  const [data, setData] = useState<POListItem[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  
  // ใช้ ref เพื่อติดตาม parameters ล่าสุดและป้องกัน unnecessary calls
  const lastParamsRef = useRef<string>('');

  const fetchData = useCallback(async (params?: UseEShippingPOListParams) => {
    try {
      setLoading(true);
      setError(null);
      
      // ตั้งค่า token ใน localStorage ถ้ายังไม่มี
      if (!localStorage.getItem('auth_token')) {
        localStorage.setItem('auth_token', '1234567890');
      }
      
      const finalParams = {
        fromDate: params?.fromDate || fromDate,
        toDate: params?.toDate || toDate,
        transportBy: params?.transportBy || transportBy,
        keyword: params?.keyword || keyword,
        pstStatus: params?.pstStatus || pstStatus,
        pswStatus: params?.pswStatus || pswStatus,
      };
      
      // สร้าง unique key เพื่อเช็คว่าพารามิเตอร์เปลี่ยนแปลงหรือไม่
      const paramsKey = JSON.stringify(finalParams);
      if (paramsKey === lastParamsRef.current && data.length > 0) {
        setLoading(false);
        return; // ไม่ fetch ซ้ำถ้าพารามิเตอร์เหมือนเดิมและมีข้อมูลแล้ว
      }
      
      lastParamsRef.current = paramsKey;
      
      const result = await DashboardService.getEShippingPOList(
        finalParams.fromDate,
        finalParams.toDate,
        finalParams.transportBy,
        finalParams.keyword,
        finalParams.pstStatus,
        finalParams.pswStatus
      );
      
      setData(result.data || []);
      setTotal(result.rowsAffected || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching E-Shipping PO list:', err);
      
      // Set empty data on error to prevent crashes
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, transportBy, keyword, pstStatus, pswStatus, data.length]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    total
  };
}
