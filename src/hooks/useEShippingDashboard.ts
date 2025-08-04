import { useState, useEffect } from 'react';
import { DashboardService } from '../api/services/dashboardService';
import type { EShippingDashboardResponse } from '../api/types';

interface UseEShippingDashboardReturn {
  data: EShippingDashboardResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEShippingDashboard(): UseEShippingDashboardReturn {
  const [data, setData] = useState<EShippingDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ตั้งค่า token ใน localStorage ถ้ายังไม่มี
      if (!localStorage.getItem('auth_token')) {
        localStorage.setItem('auth_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21wYW55IjoiSkIiLCJ1c2VybmFtZSI6Imt1c3VtYUBzYW5ndGhvbmdzdWtzaGlwcGluZ3NvbHV0aW9uLmNvLnRoIiwic3VwcGxpZXJDb2RlIjoiNjIzMiIsImlhdCI6MTc1NDI4MDIxMywiZXhwIjoxNzg1ODE2MjEzfQ.1bys3p_-9kQ-DlgWfz7g3m2ap3_0jypyQDF8FUuQIR0');
      }
      
      const result = await DashboardService.getEShippingDashboard();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching E-Shipping dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}
