import React from 'react';
import { Activity } from 'lucide-react';

export function DashboardHeader() {
  return (
    <div className="space-y-1">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
        Shipping Management Dashboard
      </h1>
      <div className="flex items-center gap-4">
        <p className="text-gray-600">Track and manage your logistics operations</p>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700">All Systems Operational</span>
        </div>
      </div>
    </div>
  );
}