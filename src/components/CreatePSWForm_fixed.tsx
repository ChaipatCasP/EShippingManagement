import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { CommunicationPanel, CommunicationMessage } from './CommunicationPanel';
import { 
  X, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Upload, 
  FileText, 
  Calculator, 
  DollarSign,
  Building,
  Package2,
  FileDigit,
  Key,
  CheckCircle
} from 'lucide-react';
import { Badge } from './ui/badge';
import { PSWApiResponse } from '../types/shipment';
import { pstService } from '../api/services/pstService';

interface ExpenseItem {
  id: string;
  expenseCode: string;
  serviceProvider: string;
  qty: number;
  rate: number;
  documentNo: string;
  documentDate: string;
  subTotal: number;
  vatBaseAmount: number;
  remarks: string;
  vatPercent: number;
  vatAmount: number;
  exciseVatAmount: number;
  interiorVat: number;
  total: number;
}

interface User {
  email: string;
  name: string;
}

interface CreatePSWFormProps {
  poNumber?: string;
  pstNumber?: string;
  pswWebSeqId?: number; // Add this for Update PSW functionality
  pswData?: PSWApiResponse; // PSW data from API
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  user?: User | null;
}

export function CreatePSWForm({ poNumber, pstNumber, pswWebSeqId, pswData, onClose, onSubmit, user }: CreatePSWFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    {
      id: '1',
      expenseCode: '',
      serviceProvider: '',
      qty: 1,
      rate: 0,
      documentNo: '',
      documentDate: '',
      subTotal: 0,
      vatBaseAmount: 0,
      remarks: '',
      vatPercent: 7,
      vatAmount: 0,
      exciseVatAmount: 0,
      interiorVat: 0,
      total: 0
    }
  ]);

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Communication Messages State
  const [messages, setMessages] = useState<CommunicationMessage[]>([
    {
      id: '1',
      content: 'PSW creation initiated for PST-2025-101. Payment worksheet is ready for expense details input.',
      sender: 'jagota',
      senderName: 'JAGOTA Payment Team',
      timestamp: new Date('2025-01-30T11:15:00'),
      read: true,
      type: 'general'
    },
    {
      id: '2',
      content: 'We have completed all import tax calculations verification. Ready to proceed with expense items and final billing submission.',
      sender: 'shipping',
      senderName: 'Sangthongsuk Shipping',
      timestamp: new Date('2025-01-30T11:30:00'),
      read: true,
      type: 'general'
    },
    {
      id: '3',
      content: 'Please confirm the additional service charges before final submission. There are some new port handling fees that need your approval.',
      sender: 'jagota',
      senderName: 'JAGOTA Finance',
      timestamp: new Date('2025-01-30T12:00:00'),
      read: false,
      type: 'urgent'
    }
  ]);

  // Header data from API for display
  const [headerData, setHeaderData] = useState({
    supplierName: '',
    poBook: '',
    poNo: '',
    poDate: '',
    etd: '',
    eta: '',
    wrDate: '',
    invoiceNo: '',
    awbNo: '',
    pstBook: '',
    pstNo: '',
    status: '',
    pswBook: '',
    pswNo: ''
  });

  // PST Reference Data (ข้อมูลย่อจาก PST หรือ API)
  const pstReferenceData = {
    pstNumber: pstNumber || 'PST-2025-001',
    poNumber: poNumber || 'PO-2025-001',
    supplierName: pswData?.supplierName || 'Global Foods Ltd.',
    transportMode: pswData?.transportMode || 'SEA',
    invoiceNo: pswData?.invoiceNo || 'INV-2025-001',
    currency: pswData?.currency || 'THB',
    importEntryNo: pswData?.importEntryNo || 'IE-2025-7890',
    // PSW specific data from API
    pswBook: pswData?.pswBook || null,
    pswNo: pswData?.pswNo || null,
    // Import Tax Information
    importTaxRate: pswData?.importTaxRate || 12.5, // %
    importTaxAmount: pswData?.importTaxAmount || 15780.50, // THB
    vatRate: pswData?.vatRate || 7, // %
    vatAmount: pswData?.vatAmount || 3245.20, // THB
    dutyRate: pswData?.dutyRate || 8.5, // %
    dutyAmount: pswData?.dutyAmount || 8920.75, // THB
    totalTaxDuty: pswData?.totalTaxDuty || 27946.45, // THB
    invoiceValue: pswData?.invoiceValue || 125000.00 // THB
  };

  const serviceProviders = [
    'Port Authority',
    'Customs Broker Co.',
    'Transportation Services Ltd.',
    'Warehouse Solutions',
    'Inspection Services',
    'Documentation Services'
  ];

  const expenseCodes = [
    'THC - Terminal Handling Charge',
    'DOC - Documentation Fee',
    'INS - Inspection Fee',
    'WAR - Warehouse Fee',
    'TRA - Transportation Fee',
    'CUS - Customs Fee',
    'OTH - Other Charges'
  ];

  // Read URL parameters and handle pswWebSeqId
  useEffect(() => {
    const url = new URL(window.location.href);
    const pswWebSeqIdParam = url.searchParams.get("pswWebSeqId");

    const loadPSWData = async (webSeqId: number) => {
      try {
        console.log('Loading PSW data for webSeqId:', webSeqId);
        const response = await pstService.getPSTDetails(webSeqId);
        
        if (response && !response.error && response.data) {
          const data = response.data;
          console.log('PSW data loaded:', data);
          
          // Get supplier name from first invoice in list
          const supplierName = data.invoiceList && data.invoiceList.length > 0 
            ? data.invoiceList[0].supplierName 
            : '';
          
          // Update header data with correct field mapping
          setHeaderData({
            supplierName: supplierName,
            poBook: data.poBook || '',
            poNo: data.poNo?.toString() || '',
            poDate: data.poDate || '',
            etd: '', // Not in API response
            eta: '', // Not in API response
            wrDate: '', // Not in API response
            invoiceNo: data.invoiceList?.[0]?.invoiceNo || '',
            awbNo: data.awbNo || '',
            pstBook: '', // Not in API response
            pstNo: '', // Not in API response
            status: '', // Not in API response  
            pswBook: '', // Not in API response
            pswNo: '' // Not in API response
          });
        }
      } catch (error) {
        console.error('Error loading PSW data:', error);
      }
    };

    if (pswWebSeqIdParam && !isNaN(Number(pswWebSeqIdParam))) {
      const webSeqId = Number(pswWebSeqIdParam);
      loadPSWData(webSeqId);
    } else if (pswWebSeqId) {
      loadPSWData(pswWebSeqId);
    }
  }, [pswWebSeqId]);

  // Calculate totals
  const totalSummary = expenses.reduce((acc, expense) => {
    acc.subTotal += expense.subTotal;
    acc.vatAmount += expense.vatAmount;
    acc.exciseVatAmount += expense.exciseVatAmount;
    acc.interiorVat += expense.interiorVat;
    acc.total += expense.total;
    return acc;
  }, {
    subTotal: 0,
    vatAmount: 0,
    exciseVatAmount: 0,
    interiorVat: 0,
    total: 0
  });

  const updateExpense = (id: string, field: keyof ExpenseItem, value: any) => {
    setExpenses(prevExpenses => 
      prevExpenses.map(expense => {
        if (expense.id === id) {
          const updatedExpense = { ...expense, [field]: value };
          
          // Recalculate derived fields
          updatedExpense.subTotal = updatedExpense.qty * updatedExpense.rate;
          updatedExpense.vatAmount = (updatedExpense.vatBaseAmount * updatedExpense.vatPercent) / 100;
          updatedExpense.total = updatedExpense.subTotal + updatedExpense.vatAmount + updatedExpense.exciseVatAmount + updatedExpense.interiorVat;
          
          return updatedExpense;
        }
        return expense;
      })
    );
  };

  const addExpense = () => {
    const newExpense: ExpenseItem = {
      id: Date.now().toString(),
      expenseCode: '',
      serviceProvider: '',
      qty: 1,
      rate: 0,
      documentNo: '',
      documentDate: '',
      subTotal: 0,
      vatBaseAmount: 0,
      remarks: '',
      vatPercent: 7,
      vatAmount: 0,
      exciseVatAmount: 0,
      interiorVat: 0,
      total: 0
    };
    setExpenses(prev => [...prev, newExpense]);
  };

  const removeExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const pswData = {
        pstReference: pstReferenceData,
        expenses,
        files: uploadedFiles,
        totalSummary,
        submittedAt: new Date().toISOString()
      };
      
      await onSubmit(pswData);
    } catch (error) {
      console.error('Error submitting PSW:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = async (action: 'save' | 'submit') => {
    try {
      setIsSubmitting(true);
      
      const pswData = {
        action,
        pstReference: pstReferenceData,
        expenses,
        files: uploadedFiles,
        totalSummary,
        submittedAt: new Date().toISOString()
      };
      
      await onSubmit(pswData);
    } catch (error) {
      console.error(`Error ${action}ing PSW:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    const newMessage: CommunicationMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'shipping',
      senderName: user?.name || 'Sangthongsuk Shipping',
      timestamp: new Date(),
      read: true,
      type: 'general'
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const handleMarkMessageAsRead = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeInUp">
      <div className="bg-white border-b border-gray-200">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="font-semibold text-gray-900">
                Create PSW Request
              </h1>
              <p className="text-sm text-gray-600">Complete PSW Details</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Simple indicator */}
            <div className="flex items-center gap-2">
              <Badge variant="default">Complete Details</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress section */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Status Display */}
              <div className="flex items-center gap-4">
                {pstReferenceData.pswNo ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      PSW: {pstReferenceData.pswNo}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                    <Key className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                      Ready to Submit
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 space-y-8">
        <div className="max-w-7xl mx-auto">
          {/* PSW Details Form */}
          <div className="space-y-8">
            {/* Header Information Section - Dashboard Style */}
            {(headerData.supplierName || headerData.poNo) && (
              <Card className="border-l-4 border-l-blue-500 shadow-sm relative">
                <CardContent className="p-4">
                  {/* Content area with space for right-aligned action button */}
                  <div className="flex">
                    {/* Left content area */}
                    <div className="flex-1 pr-4">
                      {/* Section 1: Primary Information - Supplier Name & PO Type */}
                      <div className="mb-3">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-7 h-7 bg-blue-50 rounded border border-blue-200 flex items-center justify-center">
                            <Building className="w-4 h-4 text-blue-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {headerData.supplierName}
                          </h3>

                          {/* PO Type Label */}
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-xs bg-green-100 border-green-200 text-green-700">
                            <Building className="w-2.5 h-2.5" />
                            <span className="font-medium">
                              {headerData.status}
                            </span>
                          </div>
                        </div>

                        {/* Consolidated Reference & PO Info */}
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Package2 className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">PO:</span>
                            <span className="font-medium text-gray-900">
                              {headerData.poBook}-{headerData.poNo}
                            </span>
                          </div>

                          {/* Documents row */}
                          {headerData.awbNo && (
                            <div className="flex items-center gap-6 text-sm">
                              {/* PST Information */}
                              {(headerData.pstBook || headerData.pstNo) && (
                                <div className="flex items-center gap-1">
                                  <FileDigit className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">PST:</span>
                                  <span className="font-medium text-gray-800">
                                    {headerData.pstBook}-{headerData.pstNo}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Section 2: Left-Aligned Timeline */}
                      <div className="mb-3">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-left">
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-gray-600 text-xs font-medium">
                                ETD
                              </span>
                            </div>
                            <span className="font-semibold text-gray-900">
                              {headerData.etd || '-'}
                            </span>
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <span className="text-gray-600 text-xs font-medium">
                                ETA
                              </span>
                            </div>
                            <span className="font-semibold text-gray-900">
                              {headerData.eta || '-'}
                            </span>
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-gray-600 text-xs font-medium">
                                WR Date
                              </span>
                            </div>
                            <span className="font-semibold text-gray-900">
                              {headerData.wrDate || '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Consolidated Document & Route Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-6 text-sm">
                          {headerData.invoiceNo && (
                            <div className="flex items-center gap-2">
                              <Key className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Invoice:</span>
                              <span className="font-medium text-gray-900">
                                {headerData.invoiceNo}
                              </span>
                            </div>
                          )}
                          {headerData.awbNo && (
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">AWB:</span>
                              <span className="font-medium text-gray-900">
                                {headerData.awbNo}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Content - 2 Column Layout */}
            <div className="flex gap-4">
              
              {/* Left Column - Main Content */}
              <div className="flex-1 space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Expense Items */}
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Calculator className="w-5 h-5 text-gray-500" />
                          Expense Items
                        </CardTitle>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={addExpense}
                          className="flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Expense
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {expenses.map((expense, index) => (
                        <div key={expense.id} className="border border-gray-200 rounded-lg p-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                              Expense Item #{index + 1}
                            </Badge>
                            {expenses.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExpense(expense.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* Row 1 */}
                            <div className="space-y-2">
                              <Label>Expense Code <span className="text-red-500">*</span></Label>
                              <Select 
                                value={expense.expenseCode} 
                                onValueChange={(value) => updateExpense(expense.id, 'expenseCode', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select expense code" />
                                </SelectTrigger>
                                <SelectContent>
                                  {expenseCodes.map(code => (
                                    <SelectItem key={code} value={code}>{code}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Service Provider <span className="text-red-500">*</span></Label>
                              <Select 
                                value={expense.serviceProvider} 
                                onValueChange={(value) => updateExpense(expense.id, 'serviceProvider', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select or type provider" />
                                </SelectTrigger>
                                <SelectContent>
                                  {serviceProviders.map(provider => (
                                    <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>QTY <span className="text-red-500">*</span></Label>
                              <Input
                                type="number"
                                min="1"
                                value={expense.qty}
                                onChange={(e) => updateExpense(expense.id, 'qty', parseInt(e.target.value) || 1)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Rate <span className="text-red-500">*</span></Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={expense.rate}
                                onChange={(e) => updateExpense(expense.id, 'rate', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            
                            {/* Row 2 */}
                            <div className="space-y-2">
                              <Label>Document No.</Label>
                              <Input
                                value={expense.documentNo}
                                onChange={(e) => updateExpense(expense.id, 'documentNo', e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Document Date</Label>
                              <Input
                                type="date"
                                value={expense.documentDate}
                                onChange={(e) => updateExpense(expense.id, 'documentDate', e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Sub Total</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={expense.subTotal.toFixed(2)}
                                readOnly
                                className="bg-gray-50"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>VAT Base Amount</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={expense.vatBaseAmount}
                                onChange={(e) => updateExpense(expense.id, 'vatBaseAmount', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            
                            {/* Row 3 */}
                            <div className="lg:col-span-2 space-y-2">
                              <Label>Remarks</Label>
                              <Textarea
                                rows={2}
                                value={expense.remarks}
                                onChange={(e) => updateExpense(expense.id, 'remarks', e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>VAT %</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={expense.vatPercent}
                                onChange={(e) => updateExpense(expense.id, 'vatPercent', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>VAT Amount</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={expense.vatAmount.toFixed(2)}
                                readOnly
                                className="bg-gray-50"
                              />
                            </div>
                            
                            {/* Row 4 */}
                            <div className="space-y-2">
                              <Label>Excise VAT Amount</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={expense.exciseVatAmount}
                                onChange={(e) => updateExpense(expense.id, 'exciseVatAmount', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Interior VAT</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={expense.interiorVat}
                                onChange={(e) => updateExpense(expense.id, 'interiorVat', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Total</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={expense.total.toFixed(2)}
                                readOnly
                                className="bg-gray-50 font-semibold"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* File Upload */}
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Upload className="w-5 h-5 text-gray-500" />
                        File Upload
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Upload supporting documents</p>
                          <input
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                          />
                          <label
                            htmlFor="file-upload"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                          >
                            Choose Files
                          </label>
                        </div>
                      </div>
                      
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          <Label>Uploaded Files:</Label>
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                              <span className="text-sm">{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="text-red-600"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </form>

                {/* Communication Panel */}
                <CommunicationPanel
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onMarkAsRead={handleMarkMessageAsRead}
                  disabled={isSubmitting}
                  title="Communication Messages - PSW Creation"
                  placeholder="Send a message to JAGOTA about expenses, charges, or billing details..."
                  user={user}
                />
              </div>

              {/* Right Column - Sticky Expense Summary */}
              <div className="w-72">
                <div className="sticky top-4">
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <DollarSign className="w-5 h-5 text-gray-500" />
                        Expense Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Individual Expense Items */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700">Items ({expenses.length})</Label>
                        <div className="max-h-24 overflow-y-auto space-y-1">
                          {expenses.map((expense, index) => (
                            <div key={expense.id} className="flex items-center justify-between text-xs p-1.5 bg-gray-50 rounded">
                              <span className="text-gray-600">Item #{index + 1}</span>
                              <span className="font-medium">{expense.total.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Summary Totals */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Sub Total</span>
                          <span className="font-medium">{totalSummary.subTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">VAT Amount</span>
                          <span className="font-medium">{totalSummary.vatAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Excise VAT</span>
                          <span className="font-medium">{totalSummary.exciseVatAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Interior VAT</span>
                          <span className="font-medium">{totalSummary.interiorVat.toFixed(2)}</span>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-900 text-sm">Grand Total</span>
                          <span className="text-lg font-bold text-green-600">{(totalSummary.total || 0).toFixed(2)} {pstReferenceData.currency || 'THB'}</span>
                        </div>
                      </div>
                      
                      {/* Quick Actions in Summary */}
                      <div className="pt-3 border-t border-gray-200 space-y-2">
                        <Button 
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => handleAction('save')}
                          disabled={isSubmitting}
                        >
                          Save Draft
                        </Button>
                        <Button 
                          size="sm"
                          className="w-full"
                          onClick={() => handleAction('submit')}
                          disabled={isSubmitting}
                        >
                          Submit Bill
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
