/**
 * Demo การใช้งาน Consolidated Suppliers API Integration
 * แสดงตัวอย่างการเรียกใช้งาน Co-load Container popup
 */

import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import ColoadPopup from '../components/ColoadPopup';

const ConsolidatedSuppliersDemo: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);

  // ข้อมูลทดสอบ
  const demoData = {
    cntrNo: 'TCLU1234567',
    poBook: 'PO', // เพิ่ม poBook
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    count: 3
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">
        Consolidated Suppliers API Demo
      </h1>
      
      <div className="space-y-4">
        <div className="bg-slate-50 p-4 rounded-lg">
          <h2 className="text-lg font-medium text-slate-800 mb-2">Test Scenario</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-slate-600">Container No:</span>
              <span className="ml-2 font-mono bg-white px-2 py-1 rounded">
                {demoData.cntrNo}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-600">PO Book:</span>
              <span className="ml-2 font-mono bg-white px-2 py-1 rounded">
                {demoData.poBook}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-600">Suppliers Count:</span>
              <span className="ml-2 text-slate-900">{demoData.count}</span>
            </div>
            <div>
              <span className="font-medium text-slate-600">Date Range:</span>
              <span className="ml-2 text-slate-900">
                {demoData.startDate} to {demoData.endDate}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-md font-medium text-blue-800 mb-2">API Integration Features</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✅ Consolidated Suppliers API endpoint integration</li>
            <li>✅ PO Book parameter support for Co-load shipments</li>
            <li>✅ Clickable PO numbers when coLoadPOCount &gt; 1</li>
            <li>✅ Date formatting (DD-MMM-YYYY) for JAGOTA API</li>
            <li>✅ Error handling และ loading states</li>
            <li>✅ Responsive popup design</li>
            <li>✅ TypeScript type safety</li>
            <li>✅ React hooks optimization</li>
          </ul>
        </div>

        <Button 
          onClick={() => setShowPopup(true)}
          className="w-full"
        >
          🚛 Open Co-load Container Popup (Test API Call)
        </Button>

        <div className="text-xs text-slate-500 mt-4">
          <p>
            <strong>Note:</strong> This demo will call the actual JAGOTA API endpoint:<br />
            <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">
              https://jnodeapi-staging.jagota.com/v1/es/eshipping/consolidated-suppliers
            </code>
          </p>
        </div>
      </div>

      {/* Co-load Popup Component */}
      <ColoadPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        cntrNo={demoData.cntrNo}
        poBook={demoData.poBook}
        startDate={demoData.startDate}
        endDate={demoData.endDate}
        count={demoData.count}
      />
    </div>
  );
};

export default ConsolidatedSuppliersDemo;
