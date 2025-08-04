/**
 * Type definitions สำหรับ API responses และ requests
 */

// === Authentication Types ===
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// === Consolidated Suppliers Types ===
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

// === Shipment Types ===
export interface ShipmentRequest {
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  items: ShipmentItem[];
  serviceType: ShippingServiceType;
  packageType: PackageType;
  weight: number;
  dimensions: Dimensions;
  value: number;
  currency: string;
  notes?: string;
  isInsured?: boolean;
  insuranceValue?: number;
  requiresSignature?: boolean;
  deliveryInstructions?: string;
}

export interface ShipmentResponse {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  items: ShipmentItem[];
  serviceType: ShippingServiceType;
  packageType: PackageType;
  weight: number;
  dimensions: Dimensions;
  value: number;
  currency: string;
  notes?: string;
  isInsured: boolean;
  insuranceValue?: number;
  requiresSignature: boolean;
  deliveryInstructions?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  shippingCost: number;
  insuranceCost: number;
  totalCost: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  timeline: ShipmentTimeline[];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ShipmentItem {
  name: string;
  description?: string;
  quantity: number;
  weight: number;
  value: number;
  sku?: string;
  category?: string;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'inch';
}

export type ShippingServiceType = 'standard' | 'express' | 'overnight' | 'economy';
export type PackageType = 'envelope' | 'box' | 'tube' | 'pallet' | 'custom';
export type ShipmentStatus = 
  | 'draft' 
  | 'pending' 
  | 'confirmed' 
  | 'picked_up' 
  | 'in_transit' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'failed_delivery' 
  | 'returned' 
  | 'cancelled';

export interface ShipmentTimeline {
  id: string;
  status: ShipmentStatus;
  description: string;
  location?: string;
  timestamp: string;
  updatedBy?: string;
}

// === Tracking Types ===
export interface TrackingRequest {
  trackingNumber: string;
}

export interface TrackingResponse {
  trackingNumber: string;
  status: ShipmentStatus;
  statusDescription: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  currentLocation?: string;
  timeline: ShipmentTimeline[];
  recipient: {
    name: string;
    address: Address;
  };
  lastUpdate: string;
}

// === Dashboard & Analytics Types ===
export interface DashboardStats {
  totalShipments: number;
  pendingShipments: number;
  inTransitShipments: number;
  deliveredShipments: number;
  failedDeliveries: number;
  totalRevenue: number;
  averageDeliveryTime: number;
  customerSatisfaction: number;
}

// === E-Shipping Dashboard API Response ===
export interface EShippingDashboardResponse {
  error: boolean;
  message: string;
  data: {
    poToday: number;
    poNext7Days: number;
    pstDone: number;
    pstLeft: number;
    pswDone: number;
    pswLeft: number;
  };
  rowsAffected: number;
  query: string;
}

// === E-Shipping PO List API Response ===
export interface POListItem {
  supCode: string;
  supName: string;
  transType: string;
  poBook: string;
  poNo: number;
  poDate: string;
  eta: string;
  etd: string;
  transportBy: string;
  invoiceNo: string;
  invoiceDate: string;
  portOfOrigin: string;
  portOfDestination: string;
  blNo: string;
  warehouseReceivedDate: string;
  coLoadPOCount: number;
  coLoadSupplierCount: number;
}

export interface EShippingPOListResponse {
  error: boolean;
  message: string;
  data: POListItem[];
  rowsAffected: number;
  query: string;
}

export interface ShipmentAnalytics {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  data: {
    date: string;
    totalShipments: number;
    delivered: number;
    pending: number;
    failed: number;
    revenue: number;
  }[];
}

// === Search & Filter Types ===
export interface ShipmentFilters {
  status?: ShipmentStatus[];
  serviceType?: ShippingServiceType[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  recipientName?: string;
  trackingNumber?: string;
  createdBy?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// === Notification Types ===
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  deliveryUpdates: boolean;
  shipmentAlerts: boolean;
  systemAlerts: boolean;
}

// === Settings Types ===
export interface CompanySettings {
  companyName: string;
  companyAddress: Address;
  companyPhone: string;
  companyEmail: string;
  website?: string;
  logo?: string;
  timezone: string;
  currency: string;
  taxRate: number;
}

export interface ShippingRates {
  id: string;
  serviceType: ShippingServiceType;
  packageType: PackageType;
  weightFrom: number;
  weightTo: number;
  baseRate: number;
  perKgRate: number;
  isActive: boolean;
}

// === Error Types ===
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ValidationError[];
  code?: string;
}
