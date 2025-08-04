# Consolidated Suppliers API Integration

### 🎯 Smart PO Click Detection
- PO numbers จะเป็น **clickable** เฉพาะเมื่อ:
  - `poType === 'Co-load'`
  - `coLoadPOCount > 1`
- แสดง badge จำนวน POs ถ้าเป็น Co-load
- Hover effects และ visual feedback

### 📊 Real-time API Data Integration
- **ShipmentTimeline Popover**: ใช้ข้อมูลจริงจาก consolidated-suppliers API
- **Dynamic Loading**: แสดง loading states และ error handling
- **Multiple Parameters**: รองรับ transType, poBook, poNo สำหรับ precise queries
- **Live Data**: แสดงรายการ suppliers และ POs จริงจาก API

### 📊 Data Flow
1. **PO List API** → `POListItem` with `coLoadPOCount`, `poBook`, `transType`, `poNo`
2. **Converter** → เก็บ original data ใน `shipment.originalPOData`
3. **UI Detection** → ตรวจสอบ conditions และแสดง clickable PO
4. **Click Handler** → เรียก Consolidated Suppliers API พร้อมพารามิเตอร์ที่เหมาะสม
5. **Real-time Display** → แสดงข้อมูล suppliers และ POs จริงจาก APIได้ทำการเพิ่มการ integrate Consolidated Suppliers API สำหรับแสดง Co-load Container popup เมื่อ user คลิกที่ **PO number** ในรายการ Co-load shipment ที่มี `coLoadPOCount > 1`

## API Endpoint
```
GET https://jnodeapi-staging.jagota.com/v1/es/eshipping/consolidated-suppliers
```

### Parameters
- `startDate`: วันที่เริ่มต้น (format: DD-MMM-YYYY)
- `endDate`: วันที่สิ้นสุด (format: DD-MMM-YYYY) 
- `cntrNo`: หมายเลข Container (optional)
- `poBook`: PO Book จาก PO List data (optional)
- `transType`: Transport Type จาก PO List data (optional)
- `poNo`: PO Number จาก PO List data (optional)

### Response Format
```json
{
  "error": false,
  "message": "Success",
  "data": [
    {
      "supCode": "6232",
      "supName": "ABC Company Ltd.",
      "pos": [
        {
          "poBook": "PO",
          "poNo": 12345
        }
      ]
    }
  ],
  "rowsAffected": 1,
  "query": "SELECT query..."
}
```

## Key Features

### 🎯 Smart PO Number Click Detection
- PO numbers จะเป็น **clickable** เฉพาะเมื่อ:
  - `poType === 'Co-load'`
  - `coLoadPOCount > 1`
- แสดง badge จำนวน POs ถ้าเป็น Co-load
- Hover effects และ visual feedback

### 📊 Data Flow
1. **PO List API** → `POListItem` with `coLoadPOCount`, `poBook`
2. **Converter** → เก็บ original data ใน `shipment.originalPOData`
3. **UI Detection** → ตรวจสอบ conditions และแสดง clickable PO
4. **Click Handler** → เรียก Consolidated Suppliers API พร้อม `poBook`

## Files Added/Modified

### 1. Type Definitions (`src/api/types.ts`)
```typescript
export interface ConsolidatedSupplierPO {
  poBook: string;
  poNo: number;
}

export interface ConsolidatedSupplier {
  supCode: string;
  supName: string;
  pos: ConsolidatedSupplierPO[];
}

export interface ConsolidatedSuppliersResponse {
  error: boolean;
  message: string;
  data: ConsolidatedSupplier[];
  rowsAffected: number;
  query: string;
}
```

### 2. Shipment Type Enhancement (`src/types/shipment.ts`)
เพิ่ม `originalPOData` ใน Shipment interface:
```typescript
interface Shipment {
  // ... existing fields
  originalPOData?: {
    poBook: string;
    poNo: number;
    transType: string;
    coLoadPOCount: number;
    coLoadSupplierCount: number;
  };
}
```

### 3. PO List Converter (`src/utils/poListConverter.ts`)
เก็บ original PO data สำหรับ API calls:
```typescript
// Store original PO data for API calls
originalPOData: {
  poBook: item.poBook || 'PO',
  poNo: item.poNo || 0,
  transType: item.transType || '',
  coLoadPOCount: item.coLoadPOCount || 0,
  coLoadSupplierCount: item.coLoadSupplierCount || 0
}
```

### 4. API Service (`src/api/services/dashboardService.ts`)
เพิ่ม method `getConsolidatedSuppliers()` รองรับพารามิเตอร์เพิ่มเติม:
- รับ parameters: startDate, endDate, cntrNo, poBook, transType, poNo (ทุกตัวเป็น optional)
- Format วันที่เป็น DD-MMM-YYYY
- Error handling และ logging
- ใช้ Bearer token authentication

### 5. React Hook (`src/hooks/useConsolidatedSuppliers.ts`)
อัปเดต hook รองรับพารามิเตอร์เพิ่มเติม:
- **Flexible Parameters**: รองรับ cntrNo, poBook, transType, poNo
- **Optimization**: useCallback, useRef เพื่อป้องกัน infinite loops
- **Error Handling**: Error states และ retry mechanism
- **Loading States**: Loading indicator
- **Parameter Validation**: ต้องมีอย่างน้อย cntrNo, poBook, หรือ transType+poNo

### 6. Popover Content Component (`src/components/ColoadPOsPopoverContent.tsx`)
สร้าง specialized component สำหรับ ShipmentTimeline:
- **Real-time API Integration**: เรียก consolidated-suppliers API
- **Dynamic Loading**: Loading states และ error handling พร้อม retry
- **Live Data Display**: แสดง suppliers และ POs จริงจาก API
- **Compact Design**: เหมาะสำหรับ popover ใน timeline

### 7. UI Component (`src/components/ColoadPopup.tsx`)
อัปเดต popup รองรับพารามิเตอร์เพิ่มเติม:
- **Enhanced Parameters**: รองรับ transType และ poNo
- **Flexible Display**: แสดง Container, PO Book, Transport Type, PO Number
- **Data Display**: แสดง suppliers และ POs ในรูปแบบ cards
- **Loading & Error States**: UI สำหรับ loading และ error

### 8. ShipmentTimeline Integration (`src/components/ShipmentTimeline.tsx`)
อัปเดต timeline popover ให้ใช้ข้อมูลจริง:
- **API-Driven Content**: แทนที่ static mock data ด้วย real API data
- **ColoadPOsPopoverContent**: ใช้ specialized component
- **Real-time Loading**: แสดง loading และ error states
- **Enhanced UX**: ข้อมูลที่แม่นยำและ up-to-date

## Features Implemented

### ✅ Smart PO Click Integration
- ✅ Clickable PO numbers เฉพาะ Co-load + coLoadPOCount > 1
- ✅ Visual badges แสดงจำนวน POs
- ✅ Hover effects และ transition animations
- ✅ poBook parameter ส่งไปยัง API

### ✅ API Integration
- ✅ Consolidated Suppliers endpoint connection
- ✅ Flexible parameters (cntrNo OR poBook)
- ✅ Date formatting (DD-MMM-YYYY) 
- ✅ Bearer token authentication
- ✅ Error handling และ retry mechanism

### ✅ Performance Optimization
- ✅ Parameter caching เพื่อป้องกัน duplicate calls
- ✅ useCallback และ useRef optimization
- ✅ Conditional API calls (enabled/disabled)
- ✅ Loading states management

### ✅ UI/UX Features
- ✅ Responsive popup design
- ✅ Loading indicators
- ✅ Error states พร้อม retry button
- ✅ Summary statistics
- ✅ Supplier cards with PO lists
- ✅ Smooth animations

### ✅ Type Safety
- ✅ TypeScript interfaces สำหรับทุก data structure
- ✅ Proper typing สำหรับ API responses
- ✅ Type-safe component props

## Usage Example

```tsx
// ใน PO List conversion (automatically handled)
originalPOData: {
  poBook: item.poBook || 'PO',
  coLoadPOCount: item.coLoadPOCount || 0,
  coLoadSupplierCount: item.coLoadSupplierCount || 0
}

// ใน ShipmentTable - Smart PO Number Detection
{shipment.poType === 'Co-load' && 
 shipment.originalPOData && 
 shipment.originalPOData.coLoadPOCount > 1 ? (
  <button onClick={(e) => handlePONumberClick(shipment, e)}>
    {shipment.poNumber}
    <span className="badge">
      {shipment.originalPOData.coLoadPOCount} POs
    </span>
  </button>
) : (
  <span>{shipment.poNumber}</span>
)}

// Co-load popup with poBook
<ColoadPopup
  isOpen={coloadPopupOpen}
  onClose={() => setColoadPopupOpen(false)}
  cntrNo={selectedShipment.qualityContainer}
  poBook={selectedShipment.originalPOData?.poBook}
  startDate={selectedShipment.poDate}
  endDate={selectedShipment.dateClear}
  count={selectedShipment.originalPOData?.coLoadPOCount}
/>
```

## User Flow

1. **PO List Display**: แสดงรายการ POs โดย Co-load shipments จะมี badge แสดงจำนวน
2. **Click Detection**: เมื่อ user คลิกที่ PO number ที่เป็น Co-load + มี coLoadPOCount > 1
3. **API Call**: เรียก consolidated-suppliers API พร้อม poBook จาก original data
4. **Popup Display**: แสดง popup พร้อมรายการ suppliers และ POs ทั้งหมดใน Co-load

## Testing
- ✅ Build successful (`npm run build`)
- ✅ TypeScript compilation passed (`npx tsc --noEmit`)
- ✅ No lint errors
- 🧪 Ready for API testing

## Next Steps
1. Test กับ real API data
2. ปรับแต่ง UI/UX ตามความต้องการ
3. เพิ่ม unit tests
4. เพิ่ม error boundary ถ้าจำเป็น
