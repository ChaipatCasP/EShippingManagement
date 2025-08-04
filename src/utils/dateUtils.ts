/**
 * Date utilities for formatting dates in different formats
 */

/**
 * แปลงวันที่เป็นรูปแบบ "01-Jan-2021" ที่ใช้ใน JAGOTA API
 */
export function formatDateForAPI(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
}

/**
 * แปลงวันที่จากรูปแบบ "01-Jan-2021" เป็น Date object
 */
export function parseDateFromAPI(dateString: string): Date | null {
  if (!dateString) return null;
  
  const months: Record<string, number> = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  
  const parts = dateString.split('-');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = months[parts[1]];
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || month === undefined || isNaN(year)) return null;
  
  return new Date(year, month, day);
}

/**
 * สร้าง default date range สำหรับ API โดยใช้รูปแบบ "01-Jan-2021"
 */
export function getDefaultDateRange(): { start: string; end: string } {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  
  return {
    start: formatDateForAPI(oneYearAgo.toISOString().split('T')[0]),
    end: formatDateForAPI(today.toISOString().split('T')[0])
  };
}

/**
 * แปลง date range จาก getDateRange ให้เป็นรูปแบบที่ API ต้องการ
 */
export function formatDateRangeForAPI(dateRange: { start: string; end: string }): { start: string; end: string } {
  return {
    start: formatDateForAPI(dateRange.start),
    end: formatDateForAPI(dateRange.end)
  };
}
