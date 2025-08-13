import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ShipmentTimeline } from './ShipmentTimeline';
import { ShipmentTable } from './ShipmentTable';
import { LoadingSpinner } from './ui/loading';
import type { Shipment, SortOption } from '../types/shipment';

interface MainContentProps {
  activePOTypeTab: string;
  viewMode: 'timeline' | 'table';
  filteredShipments: Shipment[];
  selectedShipment: Shipment | null;
  sortOption: SortOption;
  onShipmentClick: (shipment: Shipment) => void;
  onCreatePST: (poNumber: string) => void;
  onCreatePSW: (poNumber: string) => void;
  onCreatePSTWithConfirmation?: (poNumber: string, shipment: Shipment) => void;
  onUpdatePST?: (pstWebSeqId: number, shipment: Shipment) => void;
  onSortOptionChange: (option: SortOption) => void;
  isLoading?: boolean;
}

export function MainContent({
  activePOTypeTab,
  viewMode,
  filteredShipments,
  selectedShipment,
  sortOption,
  onShipmentClick,
  onCreatePST,
  onCreatePSW,
  onCreatePSTWithConfirmation,
  onUpdatePST,
  onSortOptionChange,
  isLoading = false
}: MainContentProps) {
  console.log('MainContent rendered with viewMode:', viewMode, 'shipments count:', filteredShipments.length);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle view mode transitions with micro animations
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 200);
    return () => clearTimeout(timer);
  }, [viewMode, activePOTypeTab]);
  return (
    <div className={`space-y-6 transition-all duration-300 ${isTransitioning ? 'opacity-75' : 'opacity-100'}`}>
      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="animate-fadeInUp">
          <ShipmentTimeline
            shipments={filteredShipments}
            selectedShipment={selectedShipment}
            onShipmentClick={onShipmentClick}
            onCreatePST={onCreatePST}
            onUpdatePST={(pstWebSeqId) => {
              console.log('MainContent - onUpdatePST called with:', pstWebSeqId);
              const shipment = filteredShipments.find(s => s.pstWebSeqId === pstWebSeqId);
              console.log('Found shipment:', shipment);
              if (shipment && onUpdatePST) {
                console.log('Calling parent onUpdatePST');
                onUpdatePST(pstWebSeqId, shipment);
              } else {
                console.log('No shipment found or onUpdatePST not available', { shipment, onUpdatePST: !!onUpdatePST });
              }
            }}
            onCreatePSW={onCreatePSW}
            isLoading={isLoading}
          />
        </div>
      )}
      
      {/* Table View */}
      {viewMode === 'table' && (
        <Card className="shadow-sm border border-gray-200/70 animate-fadeInUp">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-3">
                <span>Shipment Details</span>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm text-gray-500">Loading...</span>
                  </div>
                ) : (
                  activePOTypeTab !== 'all' && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-sm animate-bounceIn">
                      {activePOTypeTab} PO ({filteredShipments.length})
                    </Badge>
                  )
                )}
              </div>
              {!isLoading && sortOption !== 'none' && (
                <div className="flex items-center gap-2 text-sm text-gray-600 animate-slideInRight">
                  <span>Sorted by:</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <div className="flex items-center gap-1">
                      {sortOption === 'clearDate-asc' && <>Clear Date (Nearest First)</>}
                      {sortOption === 'clearDate-desc' && <>Clear Date (Furthest First)</>}
                      {sortOption === 'status-asc' && <>Status (Pending → Completed)</>}
                      {sortOption === 'status-desc' && <>Status (Completed → Pending)</>}
                    </div>
                  </Badge>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ShipmentTable
              shipments={filteredShipments}
              selectedShipment={selectedShipment}
              poType={activePOTypeTab}
              sortOption={sortOption}
              onShipmentClick={onShipmentClick}
              onCreatePST={onCreatePST}
              onCreatePSW={onCreatePSW}
              onCreatePSTWithConfirmation={onCreatePSTWithConfirmation}
              onUpdatePST={onUpdatePST}
              onSortOptionChange={onSortOptionChange}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}