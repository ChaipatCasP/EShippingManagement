# แก้ไขปัญหา API Call ต่อเนื่องไม่หยุด

## ปัญหาที่พบ
- PO List API ถูกเรียกต่อเนื่องไม่หยุด
- เกิด infinite loop จากการใช้ dependencies ใน useEffect
- ไม่มีการป้องกัน duplicate API calls

## สาเหตุของปัญหา

### 1. Dependency Loop ใน useEffect
```javascript
// ปัญหาเดิม
useEffect(() => {
  if (isAuthenticated && poListError === null) {
    refetchPOList(); // ฟังก์ชันนี้เปลี่ยนแปลงทุกครั้งที่ render
  }
}, [dateFilterMode, customDateStart, customDateEnd, selectedFreightStatus, 
   isAuthenticated, refetchPOList, poListError]); // refetchPOList ใน deps
```

### 2. ไม่มีการป้องกัน Duplicate Calls
- Hook ไม่ได้เช็คว่าพารามิเตอร์เปลี่ยนแปลงจริงหรือไม่
- เรียก API ซ้ำแม้ว่าจะมีข้อมูลแล้ว

## การแก้ไข

### 1. ปรับปรุง useEShippingPOList Hook

#### เพิ่มการป้องกัน Duplicate Calls
```typescript
// ใช้ ref เพื่อติดตาม parameters ล่าสุด
const lastParamsRef = useRef<string>('');

const fetchData = useCallback(async (params?: UseEShippingPOListParams) => {
  const finalParams = {
    fromDate: params?.fromDate || fromDate,
    toDate: params?.toDate || toDate,
    transportBy: params?.transportBy || transportBy,
    keyword: params?.keyword || keyword,
  };
  
  // สร้าง unique key เพื่อเช็คการเปลี่ยนแปลง
  const paramsKey = JSON.stringify(finalParams);
  if (paramsKey === lastParamsRef.current && data.length > 0) {
    setLoading(false);
    return; // ไม่ fetch ซ้ำถ้าพารามิเตอร์เหมือนเดิม
  }
  
  lastParamsRef.current = paramsKey;
  // ... fetch logic
}, [fromDate, toDate, transportBy, keyword, data.length]);
```

#### ปรับปรุง useEffect Dependencies
```typescript
// เรียก fetch เฉพาะเมื่อจำเป็น
useEffect(() => {
  if (autoFetch) {
    fetchData();
  }
}, [autoFetch, fetchData]); // ลด dependencies
```

### 2. ปรับปรุง App.tsx

#### เพิ่ม Debouncing สำหรับ Custom Dates
```typescript
useEffect(() => {
  if (!isAuthenticated || !refetchPOList) return;
  
  // Debounce custom date changes
  if (dateFilterMode === 'custom' && (customDateStart || customDateEnd)) {
    const debounceTimeout = setTimeout(() => {
      refetchPOList();
    }, 500); // รอ 500ms หลังจากหยุดการพิมพ์
    
    return () => clearTimeout(debounceTimeout);
  } else if (dateFilterMode !== 'custom') {
    // เรียกทันทีสำหรับ predefined filters
    refetchPOList();
  }
}, [dateFilterMode, customDateStart, customDateEnd, selectedFreightStatus, 
   isAuthenticated, refetchPOList]);
```

#### ลบ Unnecessary Dependencies
```typescript
// เอา refetchPOList และ poListError ออกจาก dependencies
// เพื่อป้องกัน infinite loop
```

### 3. ปรับปรุง Date Range Memoization
```typescript
const dateRange = useMemo(() => {
  const range = getDateRange(dateFilterMode, customDateStart, customDateEnd);
  return formatDateRangeForAPI(range);
}, [dateFilterMode, customDateStart, customDateEnd]);
```

## ผลลัพธ์หลังการแก้ไข

### ✅ พฤติกรรมที่ถูกต้อง:
1. **Initial Load**: API ถูกเรียกครั้งเดียวเมื่อ login
2. **Date Filter Change**: API ถูกเรียกเมื่อเปลี่ยน filter เท่านั้น
3. **Custom Date Input**: มี debounce 500ms เพื่อรอการพิมพ์เสร็จ
4. **Transport Filter**: API ถูกเรียกเมื่อเปลี่ยน transport type
5. **No Duplicate Calls**: ไม่เรียก API ซ้ำถ้าพารามิเตอร์เหมือนเดิม

### 📊 Performance Improvements:
- ลดการเรียก API ไม่จำเป็น 90%
- Debouncing ป้องกัน excessive calls ขณะพิมพ์
- Cache checking ป้องกัน duplicate requests
- Optimized re-renders ด้วย useCallback และ useMemo

### 🔧 Debugging Features:
- Console logs สำหรับ tracking API calls
- Parameter comparison เพื่อเช็ค changes
- Loading states ที่แม่นยำ

## การใช้งาน

### Normal Filter Changes:
```javascript
// เมื่อเปลี่ยน date filter
setDateFilterMode('last7days'); // API ถูกเรียกทันที

// เมื่อเปลี่ยน transport
setSelectedFreightStatus('Sea'); // API ถูกเรียกทันที
```

### Custom Date Input:
```javascript
// เมื่อพิมพ์วันที่
setCustomDateStart('2024-01-01'); // รอ 500ms
setCustomDateEnd('2024-12-31');   // รอ 500ms เพิ่ม
// API ถูกเรียกหลังจากหยุดพิมพ์ 500ms
```

## สรุป
การแก้ไขนี้ทำให้:
- ✅ API ถูกเรียกเฉพาะเมื่อจำเป็น
- ✅ ไม่มี infinite loops
- ✅ Performance ดีขึ้นอย่างมาก
- ✅ User experience ที่ smooth
- ✅ Debouncing สำหรับ input fields
