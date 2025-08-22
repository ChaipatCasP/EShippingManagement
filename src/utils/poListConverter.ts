import type { POListItem } from '../api/types';
import type { Shipment } from '../types/shipment';
import { formatDateForAPI } from './dateUtils';

/**
 * แปลงวันที่จาก API format เป็น display format ถ้าจำเป็น
 */
function formatDateForDisplay(dateString: string): string {
  if (!dateString) return '';

  // ถ้าวันที่มาในรูปแบบ ISO (YYYY-MM-DD) ให้แปลงเป็น DD-MMM-YYYY
  if (dateString.includes('-') && dateString.length === 10) {
    return formatDateForAPI(dateString);
  }

  // ถ้าเป็นรูปแบบ DD-MMM-YYYY อยู่แล้ว ให้ return ตรงๆ
  return dateString;
}

/**
 * แปลงข้อมูล POListItem จาก API เป็น Shipment format สำหรับใช้ใน UI
 */
export function convertPOListToShipments(poList: POListItem[]): Shipment[] {
  if (!poList || !Array.isArray(poList)) {
    console.warn('Invalid poList data:', poList);
    return [];
  }

  return poList.map((item) => {
    // Validate required item data
    if (!item || typeof item !== 'object') {
      console.warn('Invalid item in poList:', item);
      return null;
    }

    // Debug: ตรวจสอบ pstWebSeqId จาก API
    console.log('🔍 API Item:', {
      supCode: item.supCode,
      poNo: item.poNo,
      pstWebSeqId: item.pstWebSeqId,
      pstStatus: item.pstStatus,
      pstNo: item.pstNo
    });

    // กำหนด PO Type ตาม coLoadPOCount
    const poType = (item.coLoadPOCount || 0) > 0 ? 'Co-load' : 'Single';

    // แปลง transportBy เป็น type
    const getTransportType = (transportBy: string): 'Air' | 'Sea' | 'Land' => {
      if (!transportBy) return 'Land';
      if (transportBy.toLowerCase().includes('sea')) return 'Sea';
      if (transportBy.toLowerCase().includes('air')) return 'Air';
      return 'Land';
    };

    // สร้าง status แบบสุ่มตาม ETA/ETD
    const getStatus = (): Shipment['status'] => {
      const currentDate = new Date();
      const etaDate = new Date(item.eta || '');
      const etdDate = new Date(item.etd || '');

      if (currentDate < etdDate) return 'pending';
      if (currentDate >= etdDate && currentDate < etaDate) return 'pst-created';
      if (item.warehouseReceivedDate) return 'completed';
      return 'pst-approved';
    };

    const shipment: Shipment = {
      id: `${item.supCode || 'SUP'}-${item.poNo || '000'}-${Date.now()}`,
      supplierName: item.supName || 'Unknown Supplier',
      supplierCode: item.supCode || 'UNKNOWN',
      referenceKey: `${item.supCode || 'SUP'}-${item.poNo || '000'}`,
      poNumber: `${item.poBook || 'PO'}-${item.poNo || '000'}`,
      poDate: formatDateForDisplay(item.poDate || ''),
      invoiceNumber: item.invoiceNo || 'N/A',
      invoiceDate: formatDateForDisplay(item.invoiceDate || ''),
      importEntryNo: `IE-${item.supCode || 'SUP'}-${item.poNo || '000'}`,
      originCountry: getCountryFromPort(item.portOfOrigin || ''),
      originPort: item.portOfOrigin || 'Unknown Port',
      destinationPort: item.portOfDestination || 'Unknown Port',
      dateClear: formatDateForDisplay(item.warehouseReceivedDate || item.eta || ''),
      type: getTransportType(item.transportBy || ''),
      poType: poType,
      term: 'FOB', // Default term, can be enhanced with actual data
      permitStatus: true,
      blAwbNumber: item.blNo || 'N/A',
      qualityContainer: `QC-${item.supCode || 'SUP'}`,
      // Map PST web seq id from API for Update PST
      pstWebSeqId: item.pstWebSeqId,
      pswWebSeqId: item.pswWebSeqId,
      taxStatus: true,
      etd: formatDateForDisplay(item.etd || ''),
      eta: formatDateForDisplay(item.eta || ''),
      status: getStatus(),
      billStatus: 'In Progress',
      jagotaStatus: 'Under Review',
      billType: 'Regular',
      pstStatus: item.pstStatus || '', // ใช้ pstStatus จาก API
      pstNumber: item.pstNumber || null, // ใช้ pstNumber จาก API โดยตรง
      pstBook: item.pstBook || null, // ใช้ pstBook จาก API
      pstNo: item.pstNo || null, // ใช้ pstNo จาก API
      pswStatus: item.pswStatus || '', // ใช้ pswStatus จาก API  
      pswNumber: item.pswNumber || null, // ใช้ pswNumber จาก API โดยตรง
      pswBook: item.pswBook || null, // ใช้ pswBook จาก API
      pswNo: item.pswNo || null, // ใช้ pswNo จาก API
      pstJagotaStatus: item.pstJagotaStatus || '', // ใช้ pstJagotaStatus จาก API
      pswJagotaStatus: item.pswJagotaStatus || '', // ใช้ pswJagotaStatus จาก API
      // Required fields with default values
      supplierContact: `${item.supCode || 'SUP'}-contact`,
      supplierEmail: `${(item.supCode || 'supplier').toLowerCase()}@supplier.com`,
      supplierAddress: `${item.supName || 'Unknown'} Address`,
      totalValue: 0, // Would need additional API data
      weight: '0kg', // Would need additional API data
      dimensions: '0x0x0', // Would need additional API data
      assignedAgent: 'Auto Assigned',
      // agentContact: '+66-xxx-xxxx',
      // trackingNumber: item.blNo || 'N/A',
      // customsDeclaration: `CD-${item.poNo || '000'}`,
      // insurance: true,
      // priority: 'Medium',
      // remarks: '',
      // specialInstructions: '',
      // documents: [],
      relatedSuppliers: (item.coLoadSupplierCount || 0) > 0 ? [
        {
          name: item.supName || 'Unknown',
          referenceKey: item.supCode || 'SUP',
          poNumber: `${item.poBook || 'PO'}-${item.poNo || '000'}`
        }
      ] : [],

      // Store original PO data for API calls
      originalPOData: {
        supCode: item.supCode || 'UNKNOWN',
        poBook: item.poBook || 'PO',
        poNo: item.poNo || 0,
        transType: item.transType || '',
        coLoadPOCount: item.coLoadPOCount || 0,
        coLoadSupplierCount: item.coLoadSupplierCount || 0
      }
    };

    return shipment;
  }).filter((shipment): shipment is Shipment => shipment !== null);
}

/**
 * แปลงชื่อ port เป็นชื่อประเทศ (ตัวอย่าง)
 */
function getCountryFromPort(port: string): string {
  // Handle null/undefined port
  if (!port || typeof port !== 'string') {
    return 'Unknown';
  }

  const portToCountry: Record<string, string> = {
    'QINGDAO': 'China',
    'DALIAN': 'China',
    'SHANGHAI': 'China',
    'LEAM CHABANG PORT': 'Thailand',
    'BANGKOK': 'Thailand',
    'LAEM CHABANG': 'Thailand',
    'SINGAPORE': 'Singapore',
    'HONG KONG': 'Hong Kong',
    'BUSAN': 'South Korea',
    'YOKOHAMA': 'Japan',
    'KOBE': 'Japan'
  };

  const upperPort = port.toUpperCase();
  for (const [portName, country] of Object.entries(portToCountry)) {
    if (upperPort.includes(portName)) {
      return country;
    }
  }

  return 'Unknown';
}
