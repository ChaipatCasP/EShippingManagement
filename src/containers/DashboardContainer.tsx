import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidePanel } from '../components/SidePanel';
import { MainContent } from '../components/MainContent';
import { KPISection } from '../components/KPISection';
import { FilterBar } from '../components/FilterBar';
import { Badge } from '../components/ui/badge';
import { mockShipments } from '../data/mockData';
import { 
  statusPriority,
  getDateRange,
  calculateKPIs
} from '../lib/shipmentUtils';
import { CheckCircle, FileText, Calendar } from 'lucide-react';
import type { Shipment, SortOption, DateFilterMode } from '../types/shipment';

interface DashboardContainerProps {
  createdPSTNumber?: string | null;
  createdPSWNumber?: string | null;
  pstCompleted?: boolean;
  pswCompleted?: boolean;
}

export function DashboardContainer({ 
  createdPSTNumber, 
  createdPSWNumber, 
  pstCompleted = false, 
  pswCompleted = false 
}: DashboardContainerProps) {
  const navigate = useNavigate();

  // Filter state
  const [selectedFreightStatus, setSelectedFreightStatus] = useState<string>('all');
  const [selectedPSTStatus, setSelectedPSTStatus] = useState<string>('all');
  const [selectedPSWStatus, setSelectedPSWStatus] = useState<string>('all');
  
  // Date filter state
  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>('today');
  const [customDateStart, setCustomDateStart] = useState<string>('');
  const [customDateEnd, setCustomDateEnd] = useState<string>('');
  
  const [activePOTypeTab, setActivePOTypeTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('none');
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Calculate KPIs
  const kpis = useMemo(() => calculateKPIs(mockShipments), []);

  // Helper function to handle date filter mode change
  const handleDateFilterChange = (mode: DateFilterMode) => {
    setIsDataLoading(true);
    setDateFilterMode(mode);
    if (mode !== 'custom') {
      setCustomDateStart('');
      setCustomDateEnd('');
    }
    setTimeout(() => setIsDataLoading(false), 300);
  };

  // Filter and sort shipments
  const filteredShipments = useMemo(() => {
    let filtered = mockShipments.filter(shipment => {
      const matchesFreightStatus = selectedFreightStatus === 'all' || shipment.type === selectedFreightStatus;
      const matchesTabPOType = activePOTypeTab === 'all' || shipment.poType === activePOTypeTab;
      
      let matchesPSTStatus = true;
      if (selectedPSTStatus !== 'all') {
        switch (selectedPSTStatus) {
          case 'new-entry':
            matchesPSTStatus = shipment.pstStatus === 'new-entry';
            break;
          case 'pending':
            matchesPSTStatus = shipment.pstStatus === 'not-started' || shipment.pstStatus === 'in-progress';
            break;
          case 'done':
            matchesPSTStatus = shipment.pstStatus === 'completed';
            break;
        }
      }
      
      let matchesPSWStatus = true;
      if (selectedPSWStatus !== 'all') {
        switch (selectedPSWStatus) {
          case 'pending':
            matchesPSWStatus = shipment.pstNumber !== null && !shipment.pswNumber;
            break;
          case 'done':
            matchesPSWStatus = shipment.pswNumber !== null;
            break;
        }
      }
      
      const matchesSearch = searchTerm === '' || 
        shipment.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.referenceKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.importEntryNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (shipment.pstNumber && shipment.pstNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (shipment.pswNumber && shipment.pswNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        shipment.blAwbNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.originCountry.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesDateRange = true;
      const { start, end } = getDateRange(dateFilterMode, customDateStart, customDateEnd);
      
      if (start && end) {
        matchesDateRange = shipment.etd >= start && shipment.etd <= end;
      } else if (start) {
        matchesDateRange = shipment.etd >= start;
      } else if (end) {
        matchesDateRange = shipment.etd <= end;
      }
      
      return matchesFreightStatus && matchesTabPOType && matchesPSTStatus && 
             matchesPSWStatus && matchesSearch && matchesDateRange;
    });

    // Apply sorting
    if (sortOption !== 'none') {
      filtered.sort((a, b) => {
        if (sortOption === 'clearDate-asc' || sortOption === 'clearDate-desc') {
          const aDate = new Date(a.dateClear).getTime();
          const bDate = new Date(b.dateClear).getTime();
          return sortOption === 'clearDate-asc' ? aDate - bDate : bDate - aDate;
        }
        
        if (sortOption === 'status-asc' || sortOption === 'status-desc') {
          const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 999;
          const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 999;
          return sortOption === 'status-asc' ? aPriority - bPriority : bPriority - aPriority;
        }
        
        return 0;
      });
    }

    return filtered;
  }, [selectedFreightStatus, selectedPSTStatus, selectedPSWStatus, 
      dateFilterMode, customDateStart, customDateEnd, 
      activePOTypeTab, searchTerm, sortOption]);

  const handleShipmentClick = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsPanelOpen(true);
  };

  const handleCreatePST = (poNumber?: string) => {
    if (poNumber) {
      navigate(`/create-pst/${poNumber}`);
    } else {
      navigate('/create-pst');
    }
  };

  const handleCreatePSW = (poNumber?: string) => {
    if (poNumber) {
      navigate(`/create-psw/${poNumber}`);
    } else {
      navigate('/create-psw');
    }
  };

  const handleViewDocs = () => {
    alert('View Documents functionality would be implemented here');
  };

  return (
    <div className="flex-1 relative">
      {/* Top Section - Status Badges and KPIs */}
      <div className="px-6 pt-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Completion Badges */}
          {(createdPSTNumber && pstCompleted) || (createdPSWNumber && pswCompleted) ? (
            <div className="flex justify-center gap-4">
              {createdPSTNumber && pstCompleted && (
                <Badge className="bg-green-50 text-green-700 border-green-200 px-4 py-2 text-sm font-medium">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  PST Completed: {createdPSTNumber}
                  <FileText className="w-4 h-4 ml-2" />
                </Badge>
              )}
              {createdPSWNumber && pswCompleted && (
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2 text-sm font-medium">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  PSW Completed: {createdPSWNumber}
                  <Calendar className="w-4 h-4 ml-2" />
                </Badge>
              )}
            </div>
          ) : null}

          {/* KPI Section */}
          <KPISection kpis={kpis} />
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-40">
        <FilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedFreightStatus={selectedFreightStatus}
          setSelectedFreightStatus={setSelectedFreightStatus}
          selectedPSTStatus={selectedPSTStatus}
          setSelectedPSTStatus={setSelectedPSTStatus}
          selectedPSWStatus={selectedPSWStatus}
          setSelectedPSWStatus={setSelectedPSWStatus}
          dateFilterMode={dateFilterMode}
          handleDateFilterChange={handleDateFilterChange}
          customDateStart={customDateStart}
          setCustomDateStart={setCustomDateStart}
          customDateEnd={customDateEnd}
          setCustomDateEnd={setCustomDateEnd}
          filteredShipments={filteredShipments}
          activePOTypeTab={activePOTypeTab}
          setActivePOTypeTab={setActivePOTypeTab}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>

      {/* Main Content */}
      <div className="px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <MainContent
            activePOTypeTab={activePOTypeTab}
            viewMode={viewMode}
            filteredShipments={filteredShipments}
            selectedShipment={selectedShipment}
            sortOption={sortOption}
            onShipmentClick={handleShipmentClick}
            onCreatePST={handleCreatePST}
            onCreatePSW={handleCreatePSW}
            onSortOptionChange={setSortOption}
            isLoading={isDataLoading}
          />
        </div>
      </div>

      {/* Side Panel */}
      <SidePanel
        isOpen={isPanelOpen}
        onOpenChange={setIsPanelOpen}
        selectedShipment={selectedShipment}
        onCreatePST={handleCreatePST}
        onCreatePSW={handleCreatePSW}
        onViewDocs={handleViewDocs}
      />
    </div>
  );
}
