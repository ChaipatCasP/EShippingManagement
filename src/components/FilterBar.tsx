
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Search, Filter, CalendarDays, Package, Package2, Layers, LayoutGrid, List } from 'lucide-react';
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
  dateFilterMode: DateFilterMode;
  handleDateFilterChange: (mode: DateFilterMode) => void;
  customDateStart: string;
  setCustomDateStart: (date: string) => void;
  customDateEnd: string;
  setCustomDateEnd: (date: string) => void;
  filteredShipments: Shipment[];
  // New props for segment and view controls
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
  return (
    <div className="sticky top-0 z-30 bg-gray-50 border-b border-gray-200">
      <div className="px-6 py-4 space-y-3">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Main Filter Section */}
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4">
              {/* Flex Layout - Fixed width search + flexible filters */}
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                {/* Search - Fixed width 360px */}
                <div className="w-full lg:w-[360px] flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <Input
                      placeholder="Search by supplier, PO number, reference key, invoice number, PE number, PST number, PSW number, import entry, AWB number, or country..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors duration-200"
                    />
                  </div>
                </div>

                {/* Filters - Flexible layout */}
                <div className="flex-1 w-full lg:w-auto">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    {/* Status Filters Row */}
                    <div className="flex flex-wrap gap-2">
                      {/* Freight Status Filter */}
                      <Select value={selectedFreightStatus} onValueChange={setSelectedFreightStatus}>
                        <SelectTrigger className="w-32 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors duration-200 z-50">
                          <SelectValue placeholder="Freight" />
                        </SelectTrigger>
                        <SelectContent className="z-50">
                          <SelectItem value="all">All Freight</SelectItem>
                          <SelectItem value="Sea">Sea</SelectItem>
                          <SelectItem value="Air">Air</SelectItem>
                          <SelectItem value="Land">Land</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* PST Status Filter */}
                      <Select value={selectedPSTStatus} onValueChange={setSelectedPSTStatus}>
                        <SelectTrigger className="w-28 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors duration-200 z-50">
                          <SelectValue placeholder="PST" />
                        </SelectTrigger>
                        <SelectContent className="z-50">
                          <SelectItem value="all">All PST</SelectItem>
                          <SelectItem value="new-entry">New Entry</SelectItem>
                          <SelectItem value="pending">PST Pending</SelectItem>
                          <SelectItem value="done">PST Done</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* PSW Status Filter */}
                      <Select value={selectedPSWStatus} onValueChange={setSelectedPSWStatus}>
                        <SelectTrigger className="w-28 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors duration-200 z-50">
                          <SelectValue placeholder="PSW" />
                        </SelectTrigger>
                        <SelectContent className="z-50">
                          <SelectItem value="all">All PSW</SelectItem>
                          <SelectItem value="pending">PSW Pending</SelectItem>
                          <SelectItem value="done">PSW Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Filter Chips */}
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <div className="flex gap-1">
                        <Button
                          variant={dateFilterMode === 'today' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleDateFilterChange('today')}
                          className="text-sm px-3 py-1 h-8 transition-all duration-200"
                        >
                          Today
                        </Button>
                        <Button
                          variant={dateFilterMode === 'last7days' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleDateFilterChange('last7days')}
                          className="text-sm px-3 py-1 h-8 transition-all duration-200"
                        >
                          7 days
                        </Button>
                        <Button
                          variant={dateFilterMode === 'custom' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleDateFilterChange('custom')}
                          className="text-sm px-3 py-1 h-8 transition-all duration-200"
                        >
                          Custom
                        </Button>
                      </div>
                    </div>

                    {/* Results Count */}
                    <div className="flex items-center ml-auto">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-sm">
                        <Filter className="w-3 h-3 mr-1 text-gray-500" />
                        {filteredShipments.length} result{filteredShipments.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>

                  {/* Custom Date Range Inputs - Show only when custom is selected */}
                  {dateFilterMode === 'custom' && (
                    <div className="flex justify-center mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <Input
                          type="date"
                          value={customDateStart}
                          onChange={(e) => setCustomDateStart(e.target.value)}
                          className="w-36 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors duration-200"
                          placeholder="Start date"
                        />
                        <span className="text-gray-400 text-sm">to</span>
                        <Input
                          type="date"
                          value={customDateEnd}
                          onChange={(e) => setCustomDateEnd(e.target.value)}
                          className="w-36 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors duration-200"
                          placeholder="End date"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Segment and View Controls Section */}
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-3">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                {/* PO Type Segment Control */}
                <div className="flex-1">
                  <Tabs value={activePOTypeTab} onValueChange={setActivePOTypeTab}>
                    <TabsList className="grid w-full grid-cols-4 max-w-md bg-gray-50 p-1">
                      <TabsTrigger 
                        value="all" 
                        className="flex items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                      >
                        <Package className="w-3 h-3 text-gray-500" />
                        <span className="text-sm">All</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="Single" 
                        className="flex items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                      >
                        <Package className="w-3 h-3 text-gray-500" />
                        <span className="text-sm">Single</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="Multiple" 
                        className="flex items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                      >
                        <Package2 className="w-3 h-3 text-gray-500" />
                        <span className="text-sm">Multiple</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="Co-load" 
                        className="flex items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                      >
                        <Layers className="w-3 h-3 text-gray-500" />
                        <span className="text-sm">Co-load</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg">
                  <Button
                    variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('timeline')}
                    className={`flex items-center gap-1 h-8 px-3 transition-all duration-200 ${
                      viewMode === 'timeline' 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <LayoutGrid className="w-3 h-3 text-gray-500" />
                    <span className="text-sm">Timeline</span>
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-1 h-8 px-3 transition-all duration-200 ${
                      viewMode === 'table' 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <List className="w-3 h-3 text-gray-500" />
                    <span className="text-sm">Table</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}