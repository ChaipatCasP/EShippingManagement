# Date Formatting Implementation for PO List API

## Overview
This document describes the implementation of date formatting for the PO List API integration, which uses the "01-Jan-2021" format as specified.

## Date Format Specification
- **API Format**: `DD-MMM-YYYY` (e.g., `01-Jan-2021`, `31-Dec-2024`)
- **Internal Format**: Standard ISO format `YYYY-MM-DD` for calculations
- **Display Format**: Consistent `DD-MMM-YYYY` throughout the UI

## Implementation Details

### 1. Date Utils (`src/utils/dateUtils.ts`)
- `formatDateForAPI(dateString)`: Converts ISO dates to DD-MMM-YYYY format
- `parseDateFromAPI(dateString)`: Converts DD-MMM-YYYY back to Date object
- `formatDateRangeForAPI(dateRange)`: Formats date ranges for API calls
- `getDefaultDateRange()`: Provides sensible default date range

### 2. PO List Converter (`src/utils/poListConverter.ts`)
- `formatDateForDisplay(dateString)`: Ensures consistent date display
- Automatically formats all date fields in Shipment objects
- Handles both ISO and DD-MMM-YYYY input formats

### 3. App Integration (`src/App.tsx`)
- Uses `formatDateRangeForAPI()` to convert filter dates before API calls
- Maintains backward compatibility with existing date filter logic
- Automatic API refresh when date filters change

## API Integration

### Request Parameters
```javascript
// Date parameters sent to API
{
  fromDate: "01-Jan-2024",  // DD-MMM-YYYY format
  toDate: "31-Dec-2024",    // DD-MMM-YYYY format
  transportBy: "Sea",
  keyword: ""
}
```

### Response Processing
- API returns dates in DD-MMM-YYYY format
- Converter ensures all Shipment dates use consistent formatting
- Display components render dates uniformly

## Date Fields in Shipment Objects
All date fields are formatted consistently:
- `poDate`: Purchase Order date
- `invoiceDate`: Invoice date  
- `etd`: Estimated Time of Departure
- `eta`: Estimated Time of Arrival
- `dateClear`: Clearance date

## Testing
- Build verification: ✅ Successful
- Format conversion: ✅ Working
- API integration: ✅ Functional
- Date filtering: ✅ Responsive

## Examples

### Input/Output Examples
```javascript
// Input: ISO format
"2024-01-15" → "15-Jan-2024"

// Input: Already formatted
"15-Jan-2024" → "15-Jan-2024" (unchanged)

// Date range conversion
{
  start: "2024-01-01",
  end: "2024-12-31"
} → {
  start: "01-Jan-2024",
  end: "31-Dec-2024"
}
```

### API Call Example
```javascript
// Before formatting
useEShippingPOList({
  fromDate: "2024-01-01",      // ISO format
  toDate: "2024-12-31",        // ISO format
  transportBy: "Sea"
});

// After formatting (sent to API)
GET /v1/es/eshipping/po-list?fromDate=01-Jan-2024&toDate=31-Dec-2024&transportBy=Sea
```

## Benefits
1. **Consistency**: All dates display in the same format throughout the app
2. **API Compatibility**: Matches JAGOTA API date format requirements
3. **Flexibility**: Handles multiple input formats gracefully
4. **Maintainability**: Centralized date formatting logic
5. **Type Safety**: Full TypeScript support with proper type checking
