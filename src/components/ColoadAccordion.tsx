import React from 'react';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { CheckCircle, XCircle, Layers, Package, Plane, Ship, Truck } from 'lucide-react';

interface ColoadAccordionProps {
  shipments: any[];
  onShipmentClick: (shipment: any) => void;
  getStatusColor: (status: string) => string;
  getPOTypeColor: (poType: string) => string;
  getPOTypeIcon: (poType: string) => React.ReactNode;
}

interface ColoadGroup {
  groupKey: string;
  shipments: any[];
  containerInfo: {
    sharedContainer: string;
    totalValue: number;
    totalWeight: string;
    ports: string[];
  };
}

export function ColoadAccordion({ 
  shipments, 
  onShipmentClick, 
  getStatusColor, 
  getPOTypeColor, 
  getPOTypeIcon 
}: ColoadAccordionProps) {
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Air': return <Plane className="w-4 h-4" />;
      case 'Oversea': return <Ship className="w-4 h-4" />;
      case 'Truck': return <Truck className="w-4 h-4" />;
      default: return null;
    }
  };

  // Group Co-load shipments by container/related POs
  const groupColoadShipments = (): { coloadGroups: ColoadGroup[], standAloneShipments: any[] } => {
    const coloadGroups: Record<string, any[]> = {};
    const standAloneShipments: any[] = [];
    const processedPOs = new Set<string>();

    shipments.forEach(shipment => {
      if (shipment.poType === 'Co-load' && shipment.relatedPOs && shipment.relatedPOs.length > 0 && !processedPOs.has(shipment.poNumber)) {
        // Create a consistent group key based on all related POs
        const allPOs = [shipment.poNumber, ...shipment.relatedPOs].sort();
        const groupKey = allPOs.join('|');
        
        if (!coloadGroups[groupKey]) {
          coloadGroups[groupKey] = [];
        }
        
        // Add the main shipment
        coloadGroups[groupKey].push(shipment);
        processedPOs.add(shipment.poNumber);
        
        // Add related shipments if they exist in the filtered data
        shipment.relatedPOs.forEach((relatedPO: string) => {
          const relatedShipment = shipments.find(s => s.poNumber === relatedPO);
          if (relatedShipment && !processedPOs.has(relatedPO)) {
            coloadGroups[groupKey].push(relatedShipment);
            processedPOs.add(relatedPO);
          }
        });
      } else if (shipment.poType === 'Co-load' && (!shipment.relatedPOs || shipment.relatedPOs.length === 0) && !processedPOs.has(shipment.poNumber)) {
        // Co-load without related POs
        standAloneShipments.push(shipment);
        processedPOs.add(shipment.poNumber);
      }
    });

    // Convert to ColoadGroup format with additional container info
    const formattedGroups: ColoadGroup[] = Object.entries(coloadGroups).map(([groupKey, groupShipments]) => {
      const totalValue = groupShipments.reduce((sum, ship) => sum + (ship.totalValue || 0), 0);
      const uniquePorts = [...new Set(groupShipments.map(ship => ship.port))];
      const sharedContainer = groupShipments[0]?.qualityContainer || 'N/A';
      
      // Calculate total weight (assuming all weights are in kg)
      const totalWeightKg = groupShipments.reduce((sum, ship) => {
        const weightStr = ship.weight || '0 kg';
        const weightNum = parseFloat(weightStr.replace(/[^\d.]/g, '')) || 0;
        return sum + weightNum;
      }, 0);

      return {
        groupKey,
        shipments: groupShipments,
        containerInfo: {
          sharedContainer,
          totalValue,
          totalWeight: `${totalWeightKg.toLocaleString()} kg`,
          ports: uniquePorts
        }
      };
    });

    return { coloadGroups: formattedGroups, standAloneShipments };
  };

  const { coloadGroups, standAloneShipments } = groupColoadShipments();

  const getGroupStatusSummary = (shipments: any[]) => {
    const statusCounts = shipments.reduce((acc, ship) => {
      acc[ship.status] = (acc[ship.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityOrder = ['preparing', 'in-transit', 'clearance', 'delayed', 'completed'];
    const mostCriticalStatus = priorityOrder.find(status => statusCounts[status] > 0) || 'completed';
    
    return { statusCounts, mostCriticalStatus };
  };

  const getSuppliersSummary = (shipments: any[]) => {
    const uniqueSuppliers = [...new Set(shipments.map(ship => ship.supplierName))];
    return uniqueSuppliers;
  };

  return (
    <div className="space-y-6">
      {/* Co-load Groups */}
      {coloadGroups.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Container Groups</h3>
            <Badge variant="outline" className="text-gray-700 border-gray-200">
              {coloadGroups.length} groups
            </Badge>
          </div>
          
          <Accordion type="multiple" className="space-y-3">
            {coloadGroups.map((group) => {
              const { statusCounts, mostCriticalStatus } = getGroupStatusSummary(group.shipments);
              const suppliers = getSuppliersSummary(group.shipments);
              
              return (
                <AccordionItem 
                  key={group.groupKey} 
                  value={group.groupKey} 
                  className="border border-gray-200 rounded-lg bg-white"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full mr-4">
                      <div className="flex items-center gap-4">
                        {/* Container Icon and Basic Info */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-full">
                            <Layers className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800">
                                Container {group.containerInfo.sharedContainer}
                              </span>
                              <Badge className={getStatusColor(mostCriticalStatus)}>
                                {mostCriticalStatus}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {group.shipments.length} POs • {suppliers.length} suppliers
                            </div>
                          </div>
                        </div>
                        
                        {/* PO Numbers Preview */}
                        <div className="flex flex-wrap gap-1">
                          {group.shipments.slice(0, 3).map((ship, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className="text-xs text-gray-700 border-gray-300"
                            >
                              {ship.poNumber}
                            </Badge>
                          ))}
                          {group.shipments.length > 3 && (
                            <Badge 
                              variant="outline" 
                              className="text-xs text-gray-700 border-gray-300"
                            >
                              +{group.shipments.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Summary Stats */}
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="text-right">
                          <div className="font-medium text-green-600">
                            ${group.containerInfo.totalValue.toLocaleString()}
                          </div>
                          <div className="text-xs">Total Value</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{group.containerInfo.totalWeight}</div>
                          <div className="text-xs">Total Weight</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{group.containerInfo.ports.length} ports</div>
                          <div className="text-xs">Locations</div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-6 pb-4">
                    {/* Container Summary */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Suppliers:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {suppliers.map((supplier, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {supplier}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Ports:</span>
                          <div className="mt-1">{group.containerInfo.ports.join(', ')}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Status Distribution:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {Object.entries(statusCounts).map(([status, count]) => (
                              <Badge key={status} className={getStatusColor(status)}>
                                {count}x {status}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Detailed Table */}
                    <div className="overflow-x-auto border rounded-lg bg-white">
                      <Table className="relative">
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="sticky left-0 z-20 bg-gray-50 border-r min-w-[200px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                              Supplier
                            </TableHead>
                            <TableHead className="sticky left-[200px] z-20 bg-gray-50 border-r min-w-[150px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                              PO Number
                            </TableHead>
                            <TableHead className="min-w-[140px]">Transport Type</TableHead>
                            <TableHead className="min-w-[160px]">Port</TableHead>
                            <TableHead className="min-w-[100px]">ETD</TableHead>
                            <TableHead className="min-w-[100px]">ETA</TableHead>
                            <TableHead className="min-w-[120px]">Clear Date</TableHead>
                            <TableHead className="min-w-[100px]">Status</TableHead>
                            <TableHead className="min-w-[120px]">Value</TableHead>
                            <TableHead className="min-w-[100px]">Weight</TableHead>
                            <TableHead className="min-w-[80px]">Permit</TableHead>
                            <TableHead className="min-w-[80px]">Tax</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.shipments.map((shipment, idx) => (
                            <TableRow 
                              key={shipment.id}
                              className={`cursor-pointer hover:bg-gray-50 ${idx === 0 ? 'bg-blue-25 border-l-4 border-l-blue-400' : ''}`}
                              onClick={() => onShipmentClick(shipment)}
                            >
                              <TableCell className="sticky left-0 z-10 bg-white border-r min-w-[200px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                <div className="flex items-center gap-2 truncate pr-2" title={shipment.supplierName}>
                                  {idx === 0 && <span className="text-blue-600 font-bold">●</span>}
                                  <span className={idx === 0 ? 'font-medium' : ''}>{shipment.supplierName}</span>
                                </div>
                              </TableCell>
                              <TableCell className="sticky left-[200px] z-10 bg-white border-r min-w-[150px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                <div className="truncate pr-2 text-blue-600 font-medium" title={shipment.poNumber}>
                                  {shipment.poNumber}
                                </div>
                              </TableCell>
                              <TableCell className="min-w-[140px]">
                                <div className="flex items-center gap-1">
                                  {getTypeIcon(shipment.type)}
                                  {shipment.type}
                                </div>
                              </TableCell>
                              <TableCell className="min-w-[160px]">
                                <div className="truncate" title={shipment.port}>
                                  {shipment.port}
                                </div>
                              </TableCell>
                              <TableCell className="min-w-[100px]">{shipment.etd}</TableCell>
                              <TableCell className="min-w-[100px]">{shipment.eta}</TableCell>
                              <TableCell className="min-w-[120px]">{shipment.dateClear}</TableCell>
                              <TableCell className="min-w-[100px]">
                                <Badge className={getStatusColor(shipment.status)}>
                                  {shipment.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="min-w-[120px]">
                                <span className="text-green-600 font-medium">
                                  ${shipment.totalValue?.toLocaleString() || '0'}
                                </span>
                              </TableCell>
                              <TableCell className="min-w-[100px]">{shipment.weight}</TableCell>
                              <TableCell className="min-w-[80px] text-center">
                                {shipment.permitStatus ? (
                                  <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-600 mx-auto" />
                                )}
                              </TableCell>
                              <TableCell className="min-w-[80px] text-center">
                                {shipment.taxStatus ? (
                                  <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-600 mx-auto" />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      )}
      
      {/* Standalone Co-load Shipments */}
      {standAloneShipments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Standalone Co-load Shipments</h3>
            <Badge variant="outline" className="text-gray-700 border-gray-200">
              {standAloneShipments.length} shipments
            </Badge>
          </div>
          
          <div className="overflow-x-auto border rounded-lg">
            <Table className="relative">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-20 bg-white border-r min-w-[200px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    Supplier
                  </TableHead>
                  <TableHead className="sticky left-[200px] z-20 bg-white border-r min-w-[150px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    PO Number
                  </TableHead>
                  <TableHead className="min-w-[140px]">Transport Type</TableHead>
                  <TableHead className="min-w-[120px]">PO Type</TableHead>
                  <TableHead className="min-w-[160px]">Port</TableHead>
                  <TableHead className="min-w-[100px]">ETD</TableHead>
                  <TableHead className="min-w-[100px]">ETA</TableHead>
                  <TableHead className="min-w-[120px]">Clear Date</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[80px]">Permit</TableHead>
                  <TableHead className="min-w-[80px]">Tax</TableHead>
                  <TableHead className="min-w-[140px]">BL/AWB</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {standAloneShipments.map((shipment) => (
                  <TableRow 
                    key={shipment.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => onShipmentClick(shipment)}
                  >
                    <TableCell className="sticky left-0 z-10 bg-white border-r min-w-[200px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      <div className="truncate pr-2" title={shipment.supplierName}>
                        {shipment.supplierName}
                      </div>
                    </TableCell>
                    <TableCell className="sticky left-[200px] z-10 bg-white border-r min-w-[150px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      <div className="truncate pr-2 text-blue-600" title={shipment.poNumber}>
                        {shipment.poNumber}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[140px]">
                      <div className="flex items-center gap-1">
                        {getTypeIcon(shipment.type)}
                        {shipment.type}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <Badge className={getPOTypeColor(shipment.poType)}>
                        <div className="flex items-center gap-1">
                          {getPOTypeIcon(shipment.poType)}
                          {shipment.poType}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-[160px]">
                      <div className="truncate" title={shipment.port}>
                        {shipment.port}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[100px]">{shipment.etd}</TableCell>
                    <TableCell className="min-w-[100px]">{shipment.eta}</TableCell>
                    <TableCell className="min-w-[120px]">{shipment.dateClear}</TableCell>
                    <TableCell className="min-w-[100px]">
                      <Badge className={getStatusColor(shipment.status)}>
                        {shipment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-[80px] text-center">
                      {shipment.permitStatus ? (
                        <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="min-w-[80px] text-center">
                      {shipment.taxStatus ? (
                        <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="min-w-[140px]">
                      <div className="truncate" title={shipment.blAwbNumber}>
                        {shipment.blAwbNumber}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {coloadGroups.length === 0 && standAloneShipments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Layers className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <div className="text-lg font-medium mb-2">No Co-load Shipments Found</div>
          <div className="text-sm">No shipments matching the current filters were found.</div>
        </div>
      )}
    </div>
  );
}