import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Search, CalendarDays, Package, Layers, LayoutGrid, List, Filter, X } from 'lucide-react';
import type { Shipment, DateFilterMode } from '../types/shipment';

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedFreightStatus: string;
  setSelectedFreightStatus: (status: string) => void;
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
  selectedFreightStatus,
  setSelectedFreightStatus,
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
  
  // Helper function to check if any filters are active
  const hasActiveFilters = () => {
    return selectedFreightStatus !== 'all' || 
           selectedPSTStatus !== 'all' || 
           selectedPSWStatus !== 'all' || 
           selectedPriority !== 'all' ||
           (dateFilterMode === 'custom' && (customDateStart || customDateEnd)) ||
           dateFilterMode === 'today' ||
           dateFilterMode === 'last7days' ||
           searchTerm.length > 0;
  };

  // Helper function to clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedFreightStatus('all');
    setSelectedPSTStatus('all');
    setSelectedPSWStatus('all');
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
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center mb-4">
                
                {/* Search - Primary importance */}
                <div className="flex-1 min-w-0">
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

                {/* PO Type Tabs - Secondary importance */}
                <div className="flex-shrink-0">
                  <Tabs value={activePOTypeTab} onValueChange={setActivePOTypeTab}>
                    <TabsList className="grid grid-cols-3 bg-gray-100 p-1 h-10">
                      <TabsTrigger 
                        value="all" 
                        className="flex items-center gap-1.5 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                      >
                        <Package className="w-3.5 h-3.5" />
                        All
                      </TabsTrigger>
                      <TabsTrigger 
                        value="Single" 
                        className="flex items-center gap-1.5 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                      >
                        <Package className="w-3.5 h-3.5" />
                        Single
                      </TabsTrigger>
                      <TabsTrigger 
                        value="Co-load" 
                        className="flex items-center gap-1.5 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        Co-load
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* View Mode Toggle - Secondary importance */}
                <div className="flex items-center bg-gray-100 p-1 rounded-lg h-10">
                  <Button
                    variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('timeline')}
                    className={`flex items-center gap-1.5 h-8 px-3 text-sm transition-all duration-200 ${
                      viewMode === 'timeline' 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    Timeline
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-1.5 h-8 px-3 text-sm transition-all duration-200 ${
                      viewMode === 'table' 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    Table
                  </Button>
                </div>
              </div>

              <Separator className="bg-gray-200" />

              {/* Secondary Section: Status Filters + Date Filters + Results */}
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center mt-4">
                
                {/* Status Filters Group */}
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1 text-xs text-gray-500 mr-2">
                    <Filter className="w-3 h-3" />
                    Filters:
                  </div>
                  
                  <Select value={selectedFreightStatus} onValueChange={setSelectedFreightStatus}>
                    <SelectTrigger className="w-28 h-8 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Freight</SelectItem>
                      <SelectItem value="Sea">Sea</SelectItem>
                      <SelectItem value="Air">Air</SelectItem>
                      <SelectItem value="Land">Land</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedPSTStatus} onValueChange={setSelectedPSTStatus}>
                    <SelectTrigger className="w-24 h-8 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All PST</SelectItem>
                      <SelectItem value="new-entry">New Entry</SelectItem>
                      <SelectItem value="pending">PST Pending</SelectItem>
                      <SelectItem value="done">PST Done</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedPSWStatus} onValueChange={setSelectedPSWStatus}>
                    <SelectTrigger className="w-24 h-8 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All PSW</SelectItem>
                      <SelectItem value="pending">PSW Pending</SelectItem>
                      <SelectItem value="done">PSW Done</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger className="w-24 h-8 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Filters Group */}
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  <div className="flex gap-1">
                    <Button
                      variant={dateFilterMode === 'today' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleDateFilterChange('today')}
                      className={`text-xs px-2 py-1 h-8 transition-all duration-200 ${
                        dateFilterMode === 'today' 
                          ? 'bg-black text-white hover:bg-gray-800' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Today
                    </Button>
                    <Button
                      variant={dateFilterMode === 'last7days' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleDateFilterChange('last7days')}
                      className={`text-xs px-2 py-1 h-8 transition-all duration-200 ${
                        dateFilterMode === 'last7days' 
                          ? 'bg-black text-white hover:bg-gray-800' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      7 days
                    </Button>
                    <Button
                      variant={dateFilterMode === 'custom' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleDateFilterChange('custom')}
                      className={`text-xs px-2 py-1 h-8 transition-all duration-200 ${
                        dateFilterMode === 'custom' 
                          ? 'bg-black text-white hover:bg-gray-800' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Custom
                    </Button>
                  </div>
                </div>

                {/* Results and Clear Filters */}
                <div className="flex items-center gap-3 ml-auto">
                  {hasActiveFilters() && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-xs px-2 py-1 h-8 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear all
                    </Button>
                  )}
                  
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-sm px-3 py-1">
                    {filteredShipments.length} result{filteredShipments.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>

              {/* Custom Date Range - Conditional Display */}
              {dateFilterMode === 'custom' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-center">
                    <div className="flex items-center gap-3">
                      <Input
                        type="date"
                        value={customDateStart}
                        onChange={(e) => setCustomDateStart(e.target.value)}
                        className="w-36 h-8 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors duration-200"
                        placeholder="Start date"
                      />
                      <span className="text-gray-400 text-sm font-medium">to</span>
                      <Input
                        type="date"
                        value={customDateEnd}
                        onChange={(e) => setCustomDateEnd(e.target.value)}
                        className="w-36 h-8 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors duration-200"
                        placeholder="End date"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}