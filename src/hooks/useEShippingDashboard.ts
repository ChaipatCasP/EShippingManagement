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
