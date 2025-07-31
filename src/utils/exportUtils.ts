import type { Shipment } from '../types/shipment';

export interface ExportConfig {
  format: 'csv' | 'excel' | 'json';
  includeHeaders: boolean;
  filename: string;
}

export async function exportShipmentHistory(shipments: Shipment[], config: ExportConfig): Promise<void> {
  try {
    let content: string;
    let mimeType: string;
    let filename: string;

    switch (config.format) {
      case 'csv':
        content = convertToCSV(shipments, config.includeHeaders);
        mimeType = 'text/csv';
        filename = config.filename.endsWith('.csv') ? config.filename : `${config.filename}.csv`;
        break;
      
      case 'excel':
        content = convertToCSV(shipments, config.includeHeaders); // For now, use CSV format
        mimeType = 'text/csv';
        filename = config.filename.endsWith('.csv') ? config.filename : `${config.filename}.csv`;
        break;
      
      case 'json':
        content = JSON.stringify(shipments, null, 2);
        mimeType = 'application/json';
        filename = config.filename.endsWith('.json') ? config.filename : `${config.filename}.json`;
        break;
      
      default:
        throw new Error(`Unsupported export format: ${config.format}`);
    }

    // Create and download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

export function exportSummaryReport(shipments: Shipment[]): void {
  const summary = generateSummaryReport(shipments);
  const content = JSON.stringify(summary, null, 2);
  
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `jagota_summary_report_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function convertToCSV(shipments: Shipment[], includeHeaders: boolean): string {
  const headers = [
    'PO Number',
    'Supplier Name',
    'Reference Key',
    'Invoice Number',
    'Type',
    'PST Number',
    'PSW Number',
    'Status',
    'Total Value',
    'ETD',
    'ETA',
    'Date Clear',
    'Origin Port',
    'Destination Port',
    'BL/AWB Number',
    'Import Entry No',
    'Assigned Agent'
  ];

  const rows = shipments.map(shipment => [
    shipment.poNumber,
    shipment.supplierName,
    shipment.referenceKey,
    shipment.invoiceNumber,
    shipment.type,
    shipment.pstNumber || '',
    shipment.pswNumber || '',
    shipment.status,
    shipment.totalValue.toString(),
    shipment.etd,
    shipment.eta,
    shipment.dateClear,
    shipment.originPort,
    shipment.destinationPort,
    shipment.blAwbNumber,
    shipment.importEntryNo,
    shipment.assignedAgent
  ]);

  const csvContent = [];
  
  if (includeHeaders) {
    csvContent.push(headers.map(escapeCSVField).join(','));
  }
  
  rows.forEach(row => {
    csvContent.push(row.map(escapeCSVField).join(','));
  });

  return csvContent.join('\n');
}

function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function generateSummaryReport(shipments: Shipment[]) {
  const total = shipments.length;
  const pstCompleted = shipments.filter(s => s.pstNumber).length;
  const pswCompleted = shipments.filter(s => s.pswNumber).length;
  const totalValue = shipments.reduce((sum, s) => sum + s.totalValue, 0);

  const byType = {
    Sea: shipments.filter(s => s.type === 'Sea').length,
    Air: shipments.filter(s => s.type === 'Air').length,
    Land: shipments.filter(s => s.type === 'Land').length
  };

  const byStatus = {
    pending: shipments.filter(s => s.status === 'pending').length,
    completed: shipments.filter(s => s.status === 'completed').length,
    'pst-created': shipments.filter(s => s.status === 'pst-created').length,
    'pst-approved': shipments.filter(s => s.status === 'pst-approved').length,
    'psw-waiting-approval': shipments.filter(s => s.status === 'psw-waiting-approval').length
  };

  return {
    generatedAt: new Date().toISOString(),
    period: 'All Time',
    summary: {
      totalShipments: total,
      pstCompleted,
      pswCompleted,
      totalValue,
      completionRate: total > 0 ? Math.round((pswCompleted / total) * 100) : 0
    },
    breakdown: {
      byType,
      byStatus
    },
    topSuppliers: getTopSuppliers(shipments, 5),
    recentActivity: shipments
      .sort((a, b) => new Date(b.dateClear).getTime() - new Date(a.dateClear).getTime())
      .slice(0, 10)
      .map(s => ({
        poNumber: s.poNumber,
        supplier: s.supplierName,
        type: s.type,
        status: s.status,
        dateClear: s.dateClear,
        totalValue: s.totalValue
      }))
  };
}

function getTopSuppliers(shipments: Shipment[], limit: number) {
  const supplierStats = shipments.reduce((acc, shipment) => {
    const supplier = shipment.supplierName;
    if (!acc[supplier]) {
      acc[supplier] = {
        name: supplier,
        shipmentCount: 0,
        totalValue: 0,
        completedShipments: 0
      };
    }
    acc[supplier].shipmentCount++;
    acc[supplier].totalValue += shipment.totalValue;
    if (shipment.pswNumber) {
      acc[supplier].completedShipments++;
    }
    return acc;
  }, {} as Record<string, any>);

  return Object.values(supplierStats)
    .sort((a: any, b: any) => b.totalValue - a.totalValue)
    .slice(0, limit);
}
