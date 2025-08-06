import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Search, CalendarDays, Package, Layers, LayoutGrid, List, Filter, X, Eye } from 'lucide-react';
import { useTransportTypes } from '../hooks/useTransportTypes';
import type { Shipment, DateFilterMode } from '../types/shipment';

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTransportType: string;
  setSelectedTransportType: (type: string) => void;
  selectedPSTStatus: string;
  setSelectedPSTStatus: (status: string) => void;
  selectedPSWStatus: string;
  setSelectedPSWStatus: (status: string) => void;
  selectedPriority: string;
  setSelectedPriority: (priority: string) => void;
  dateFilterMode: DateFilterMode;
  handleDateFilterChange: (mode: DateFilterMode) => void;
  customDateStart: string;
  setCustomDateStart: (date: string) => void;
  customDateEnd: string;
  setCustomDateEnd: (date: string) => void;
  filteredShipments: Shipment[];
  activePOTypeTab: string;
  setActivePOTypeTab: (tab: string) => void;
  viewMode: 'timeline' | 'table';
  setViewMode: (mode: 'timeline' | 'table') => void;
}

export function FilterBar({
  searchTerm,
  setSearchTerm,
  selectedTransportType,
  setSelectedTransportType,
  selectedPSTStatus,
  setSelectedPSTStatus,
  selectedPSWStatus,
  setSelectedPSWStatus,
  selectedPriority,
  setSelectedPriority,
  dateFilterMode,
  handleDateFilterChange,
  customDateStart,
  setCustomDateStart,
  customDateEnd,
  setCustomDateEnd,
  filteredShipments,
  activePOTypeTab,
  setActivePOTypeTab,
  viewMode,
  setViewMode
}: FilterBarProps) {
  
  // Fetch transport types from API
  const { transportTypes, isLoading: isLoadingTransportTypes } = useTransportTypes();
  
  // Refs for date inputs
  const startDateRef = React.useRef<HTMLInputElement>(null);
  const endDateRef = React.useRef<HTMLInputElement>(null);
  
  // Helper function to check if any filters are active
  const hasActiveFilters = () => {
    return selectedTransportType !== 'all' ||
           selectedPSTStatus !== '' || 
           selectedPSWStatus !== '' || 
           selectedPriority !== 'all' ||
           (dateFilterMode === 'custom' && (customDateStart || customDateEnd)) ||
           dateFilterMode === 'today' ||
           dateFilterMode === 'last7days' ||
           searchTerm.length > 0;
  };

  // Helper function to clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedTransportType('all');
    setSelectedPSTStatus('');
    setSelectedPSWStatus('');
    setSelectedPriority('all');
    handleDateFilterChange('today'); // Reset to default 'today' instead of 'all'
    setCustomDateStart('');
    setCustomDateEnd('');
  };

  return (
    <div className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              
              {/* Primary Section: Search + PO Type + View Mode */}
              <div className="flex flex-col md:flex-row gap-3 items-start md:items-center mb-3">
                
                {/* Search - Primary importance */}
                <div className="flex-1 min-w-0 w-full md:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search supplier, PO, reference, invoice, PST, PSW, AWB, or country..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-10 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* PO Type Tabs + View Mode - Combined on mobile */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                  <div className="flex-shrink-0">
                    <Tabs value={activePOTypeTab} onValueChange={setActivePOTypeTab}>
                      <TabsList className="grid grid-cols-3 bg-gray-100 p-1 h-9">
                        <TabsTrigger 
                          value="all" 
                          className="flex items-center gap-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                        >
                          <Package className="w-3 h-3" />
                          All
                        </TabsTrigger>
                        <TabsTrigger 
                          value="Single" 
                          className="flex items-center gap-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                        >
                          <Package className="w-3 h-3" />
                          Single
                        </TabsTrigger>
                        <TabsTrigger 
                          value="Co-load" 
                          className="flex items-center gap-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                        >
                          <Layers className="w-3 h-3" />
                          Co-load
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 p-1 rounded-lg h-9">
                    <Button
                      variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('timeline')}
                      className={`flex items-center gap-1 h-7 px-2 text-xs transition-all duration-200 ${
                        viewMode === 'timeline' 
                          ? 'bg-white shadow-sm text-blue-600' 
                          : 'hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      <LayoutGrid className="w-3 h-3" />
                      Timeline
                    </Button>
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                      className={`flex items-center gap-1 h-7 px-2 text-xs transition-all duration-200 ${
                        viewMode === 'table' 
                          ? 'bg-white shadow-sm text-blue-600' 
                          : 'hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      <List className="w-3 h-3" />
                      Table
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-200" />

              {/* Secondary Section: All Filters in One Row - Responsive */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                
                {/* Filter Label */}
                <div className="flex items-center gap-1 text-xs text-gray-500 mr-1">
                  <Filter className="w-3 h-3" />
                  Filters:
                </div>
                
                {/* Status Filters - Compact */}
                <Select value={selectedTransportType} onValueChange={setSelectedTransportType}>
                  <SelectTrigger className="w-32 h-8 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Transport</SelectItem>
                    {isLoadingTransportTypes ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : (
                      transportTypes.map((type) => (
                        <SelectItem key={type.TRANSPORT_BY} value={type.TRANSPORT_BY}>
                          {type.TRANSPORT_BY}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                <Select value={selectedPSTStatus} onValueChange={setSelectedPSTStatus}>
                  <SelectTrigger className="w-24 h-8 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors duration-200">
                    <SelectValue placeholder="PST" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="">All PST</SelectItem>
                    <SelectItem value="N">New Entry</SelectItem>
                    <SelectItem value="Y">Submitted</SelectItem>
                    <SelectItem value="Z">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPSWStatus} onValueChange={setSelectedPSWStatus}>
                  <SelectTrigger className="w-24 h-8 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors duration-200">
                    <SelectValue placeholder="PSW" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="">All PSW</SelectItem>
                    <SelectItem value="N">New Entry</SelectItem>
                    <SelectItem value="Y">Submitted</SelectItem>
                    <SelectItem value="Z">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                {/* Date Filters - Inline */}
                <div className="flex items-center gap-1 ml-2">
                  <CalendarDays className="w-3 h-3 text-gray-400" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDateFilterChange('today');
                    }}
                    className={`text-xs px-3 py-1 h-7 rounded-md border transition-all duration-200 cursor-pointer ${
                      dateFilterMode === 'today' 
                        ? 'bg-black text-white border-black hover:bg-gray-800' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDateFilterChange('last7days');
                    }}
                    className={`text-xs px-3 py-1 h-7 rounded-md border transition-all duration-200 cursor-pointer ${
                      dateFilterMode === 'last7days' 
                        ? 'bg-black text-white border-black hover:bg-gray-800' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    7 days
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDateFilterChange('custom');
                    }}
                    className={`text-xs px-3 py-1 h-7 rounded-md border transition-all duration-200 cursor-pointer ${
                      dateFilterMode === 'custom' 
                        ? 'bg-black text-white border-black hover:bg-gray-800' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {/* Custom Date Range - Inline with Calendar Buttons */}
                {dateFilterMode === 'custom' && (
                  <div className="flex items-center gap-1">
                    <div className="w-px h-4 bg-gray-300"></div>
                    
                    {/* Start Date Input with Calendar Button */}
                    <div className="flex items-center gap-1">
                      <Input
                        style={{ textAlign: 'center' }}
                        ref={startDateRef}
                        type="date"
                        value={customDateStart}
                        onChange={(e) => setCustomDateStart(e.target.value)}
                        className="w-32 h-7 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors duration-200 cursor-pointer"
                        placeholder="Start date"
                        title="Select start date"
                        onClick={() => startDateRef.current?.showPicker()}

                      />
                      {/* <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 border-gray-200 hover:border-blue-500 transition-colors duration-200"
                        title="Open date picker"
                        onClick={() => startDateRef.current?.showPicker()}
                      >
                        <Eye className="h-3 w-3" />
                      </Button> */}
                    </div>

                    <span className="text-gray-400 text-xs">to</span>

                    {/* End Date Input with Calendar Button */}
                    <div className="flex items-center gap-1">
                      <Input
                        style={{ textAlign: 'center' }}
                        ref={endDateRef}
                        type="date"
                        value={customDateEnd}
                        onChange={(e) => setCustomDateEnd(e.target.value)}
                        className="w-32 h-7 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors duration-200 cursor-pointer"
                        placeholder="End date"
                        title="Select end date"
                        onClick={() => endDateRef.current?.showPicker()}

                      />
                      {/* <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 border-gray-200 hover:border-blue-500 transition-colors duration-200"
                        title="Open date picker"
                        onClick={() => endDateRef.current?.showPicker()}
                      >
                        <Eye className="h-3 w-3" />
                      </Button> */}
                    </div>
                  </div>
                )}

                {/* Results and Clear Filters - Right Side */}
                <div className="flex items-center gap-2 ml-auto">
                  {hasActiveFilters() && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-xs px-2 py-1 h-7 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                  )}
                  
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-1">
                    {filteredShipments.length} result{filteredShipments.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}