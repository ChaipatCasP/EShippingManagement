import { useState, useEffect } from 'react';
import { ShipmentService } from '../api/services/shipmentService';
import type { TransportType } from '../api/types';

interface UseTransportTypesReturn {
  transportTypes: TransportType[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTransportTypes(): UseTransportTypesReturn {
  const [transportTypes, setTransportTypes] = useState<TransportType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransportTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await ShipmentService.getTransportTypes();
      
      if (response && !response.error) {
        setTransportTypes(response.data || []);
      } else {
        setError(response?.message || 'Failed to fetch transport types');
      }
    } catch (err) {
      console.error('Error fetching transport types:', err);
      setError('Failed to fetch transport types');
      
      // Fallback data based on the API response structure
      setTransportTypes([
        { TRANSPORT_BY: 'Sea Freight' },
        { TRANSPORT_BY: 'Air Freight' },
        { TRANSPORT_BY: 'Land Freight' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransportTypes();
  }, []);

  return {
    transportTypes,
    isLoading,
    error,
    refetch: fetchTransportTypes
  };
}
