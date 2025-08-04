/**
 * Simple test script for date formatting utilities
 */

import { formatDateForAPI, formatDateRangeForAPI, getDefaultDateRange } from '../src/utils/dateUtils.js';

// Test cases
console.log('=== Date Formatting Tests ===');

// Test formatDateForAPI
console.log('\n1. formatDateForAPI tests:');
console.log('2024-01-15 ->', formatDateForAPI('2024-01-15'));
console.log('2024-12-31 ->', formatDateForAPI('2024-12-31'));
console.log('2025-08-04 ->', formatDateForAPI('2025-08-04'));

// Test formatDateRangeForAPI
console.log('\n2. formatDateRangeForAPI tests:');
const testRange = { start: '2024-01-01', end: '2024-12-31' };
console.log('Input range:', testRange);
console.log('Formatted range:', formatDateRangeForAPI(testRange));

// Test getDefaultDateRange
console.log('\n3. getDefaultDateRange test:');
console.log('Default range:', getDefaultDateRange());

console.log('\n=== Tests Complete ===');
