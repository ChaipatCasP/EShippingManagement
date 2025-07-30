import React from 'react';
import { Badge } from '../components/ui/badge';
import { 
  Plane, 
  Ship, 
  Truck, 
  Package, 
  Package2, 
  Layers, 
  Clock, 
  Edit, 
  FileX, 
  CheckSquare, 
  FileCheck, 
  AlertCircle, 
  CircleCheck, 
  FileText, 
  Zap,
  CreditCard,
  Flag,
  CalendarDays,
  Eye
} from 'lucide-react';
import type { Shipment } from '../types/shipment';

// Transportation type utilities
export const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Air': return <Plane className="w-4 h-4 text-blue-600" />;
    case 'Sea': return <Ship className="w-4 h-4 text-blue-600" />;
    case 'Land': return <Truck className="w-4 h-4 text-blue-600" />;
    // Legacy support for old type names
    case 'Oversea': return <Ship className="w-4 h-4 text-blue-600" />;
    case 'Truck': return <Truck className="w-4 h-4 text-blue-600" />;
    default: return null;
  }
};

export const getTypeLabel = (type: string) => {
  switch (type) {
    case 'Air': return 'Air';
    case 'Sea': return 'Sea';
    case 'Land': return 'Land';
    // Legacy support for old type names
    case 'Oversea': return 'Sea';
    case 'Truck': return 'Land';
    default: return type;
  }
};

// PO Type utilities
export const getPOTypeIcon = (poType: string) => {
  switch (poType) {
    case 'Single': return <Package className="w-4 h-4" />;
    case 'Multiple': return <Package2 className="w-4 h-4" />;
    case 'Co-load': return <Layers className="w-4 h-4" />;
    default: return null;
  }
};

export const getPOTypeColor = (poType: string) => {
  switch (poType) {
    case 'Single': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Multiple': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Co-load': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Updated Status utilities สำหรับ workflow ใหม่
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-gray-50 text-gray-700 border-gray-200';
    case 'pst-created': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'pst-approved': return 'bg-green-50 text-green-700 border-green-200';
    case 'psw-waiting-approval': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusDisplayText = (status: string) => {
  switch (status) {
    case 'pending': return 'Pending';
    case 'pst-created': return 'PST Created';
    case 'pst-approved': return 'PST Approved';
    case 'psw-waiting-approval': return 'PSW Waiting';
    case 'completed': return 'Completed';
    default: return status;
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return <Clock className="w-4 h-4" />;
    case 'pst-created': return <Edit className="w-4 h-4" />;
    case 'pst-approved': return <CheckSquare className="w-4 h-4" />;
    case 'psw-waiting-approval': return <CalendarDays className="w-4 h-4" />;
    case 'completed': return <CircleCheck className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

// Bill Status utilities
export const getBillStatusColor = (status: string) => {
  switch (status) {
    case 'New Entry': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'In Progress': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'Completed': return 'bg-green-50 text-green-700 border-green-200';
    case 'On Hold': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Jagota Status utilities - Updated for new status values
export const getJagotaStatusColor = (status: string) => {
  switch (status) {
    case 'Under Review': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Approved': return 'bg-green-50 text-green-700 border-green-200';
    case 'On Hold': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    // Legacy support
    case 'New Entry': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Processing': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Bill Type utilities
export const getBillTypeColor = (billType: string) => {
  switch (billType) {
    case 'Urgent': return 'bg-red-100 text-red-800 border-red-200';
    case 'Regular': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getBillTypeIcon = (billType: string) => {
  switch (billType) {
    case 'Urgent': return <Zap className="w-3 h-3" />;
    case 'Regular': return <FileText className="w-3 h-3" />;
    default: return <FileText className="w-3 h-3" />;
  }
};

// Priority utilities
export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High': return 'bg-red-100 text-red-800';
    case 'Medium': return 'bg-yellow-100 text-yellow-800';
    case 'Low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// PST utilities - เก็บไว้เพื่อ backward compatibility
export const isPSTCompleted = (shipment: Shipment) => {
  return shipment.pstStatus === 'completed';
};

export const isPSWEnabled = (shipment: Shipment) => {
  return shipment.status === 'pst-approved';
};

export const getPSTStatusBadge = (shipment: Shipment) => {
  return null;
};

// NEW: Unified Action Button Logic
export interface ActionButtonConfig {
  text: string;
  icon: React.ReactNode;
  action: 'create-pst' | 'edit-pst' | 'create-psw' | 'view-psw' | 'completed';
  enabled: boolean;
  variant: 'default' | 'outline' | 'secondary';
  color: string;
  tooltip: string;
}

export const getActionButtonConfig = (shipment: Shipment): ActionButtonConfig => {
  switch (shipment.status) {
    case 'pending':
      return {
        text: 'Create PST',
        icon: <FileCheck className="w-4 h-4" />,
        action: 'create-pst',
        enabled: true,
        variant: 'default',
        color: 'bg-gray-900 hover:bg-gray-800 text-white',
        tooltip: 'Create PST - Prepare Shipping Tax document'
      };
      
    case 'pst-created':
      return {
        text: 'Edit PST',
        icon: <Edit className="w-4 h-4" />,
        action: 'edit-pst',
        enabled: true,
        variant: 'default',
        color: 'bg-gray-900 hover:bg-gray-800 text-white',
        tooltip: 'Edit PST - Modify before business approval'
      };
      
    case 'pst-approved':
      return {
        text: 'Create PSW',
        icon: <CalendarDays className="w-4 h-4" />,
        action: 'create-psw',
        enabled: true,
        variant: 'default',
        color: 'bg-gray-900 hover:bg-gray-800 text-white',
        tooltip: 'Create PSW - Prepare Shipping Weekly schedule'
      };
      
    case 'psw-waiting-approval':
      return {
        text: 'View PSW',
        icon: <Eye className="w-4 h-4" />,
        action: 'view-psw',
        enabled: false,
        variant: 'outline',
        color: 'bg-amber-50 text-amber-700 border-amber-200 cursor-not-allowed',
        tooltip: 'PSW submitted and waiting for business approval'
      };
      
    case 'completed':
      return {
        text: 'Completed',
        icon: <CircleCheck className="w-4 h-4" />,
        action: 'completed',
        enabled: false,
        variant: 'outline',
        color: 'bg-green-50 text-green-700 border-green-200 cursor-not-allowed',
        tooltip: 'Process completed - Both PST and PSW approved'
      };
      
    default:
      return {
        text: 'Unknown',
        icon: <AlertCircle className="w-4 h-4" />,
        action: 'create-pst',
        enabled: false,
        variant: 'outline',
        color: 'bg-gray-100 text-gray-400 cursor-not-allowed',
        tooltip: 'Unknown status'
      };
  }
};

// Business logic utilities
export const isEditingAllowed = (status: string) => {
  return status === 'pending' || status === 'pst-created';
};

// Updated Status priority for sorting
export const statusPriority = {
  'pending': 1,
  'pst-created': 2,
  'pst-approved': 3,
  'psw-waiting-approval': 4,
  'completed': 5
};

// Date utilities
export const getDateRange = (dateFilterMode: 'today' | 'last7days' | 'custom', customDateStart?: string, customDateEnd?: string) => {
  const today = new Date().toISOString().split('T')[0];
  
  switch (dateFilterMode) {
    case 'today':
      return { start: today, end: today };
    case 'last7days':
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      return { 
        start: sevenDaysAgo.toISOString().split('T')[0], 
        end: today 
      };
    case 'custom':
      return { 
        start: customDateStart || '', 
        end: customDateEnd || '' 
      };
    default:
      return { start: today, end: today };
  }
};

// Updated KPI calculations
export const calculateKPIs = (shipments: Shipment[]) => {
  const today = new Date().toISOString().split('T')[0];
  const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const currentDate = new Date();
  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() - (currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1));
  const weekStart = monday.toISOString().split('T')[0];
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const weekEnd = sunday.toISOString().split('T')[0];
  
  // PO counts
  const poToday = shipments.filter(s => s.etd === today).length;
  const poNext7Days = shipments.filter(s => 
    s.etd > today && s.etd <= weekFromNow
  ).length;
  
  // PST tracking - รองรับ status ใหม่
  const pstTotal = shipments.filter(s => 
    s.status === 'pending' || s.status === 'pst-created'
  ).length;
  const pstCompleted = shipments.filter(s => 
    s.status === 'pst-approved' || s.status === 'psw-waiting-approval' || s.status === 'completed'
  ).length;
  const pstRemaining = pstTotal;
  const pstToday = shipments.filter(s => 
    (s.status === 'pending' || s.status === 'pst-created') && s.etd === today
  ).length;
  
  // PSW tracking - รองรับ status ใหม่
  const pswThisWeek = shipments.filter(s => 
    (s.status === 'pst-approved' || s.status === 'psw-waiting-approval' || s.status === 'completed') && 
    s.etd >= weekStart && s.etd <= weekEnd
  ).length;
  const pswCompleted = shipments.filter(s => 
    s.status === 'completed' && s.etd >= weekStart && s.etd <= weekEnd
  ).length;
  const pswRemaining = pswThisWeek - pswCompleted;
  
  return { 
    poToday, 
    poNext7Days, 
    pstTotal,
    pstCompleted, 
    pstRemaining,
    pstToday,
    pswThisWeek,
    pswCompleted,
    pswRemaining
  };
};