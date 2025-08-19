import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { StepProgress } from './StepProgress';
import { CommunicationPanel, CommunicationMessage } from './CommunicationPanel';
import { X, ArrowLeft, Plus, Trash2, Upload, FileText, Calculator, DollarSign } from 'lucide-react';
import { Badge } from './ui/badge';
import { PSWApiResponse } from '../types/shipment';

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
    const modeParam = url.searchParams.get("mode");

    if (pswWebSeqIdParam && modeParam === 'update') {
      console.log('PSW Update mode detected:', { pswWebSeqId: pswWebSeqIdParam });
      // TODO: Load PSW data from API using pswWebSeqId
      // This will be implemented when we have the PSW update API
    } else if (pswWebSeqId) {
      console.log('PSW Update mode via prop:', { pswWebSeqId });
      // TODO: Load PSW data from API using pswWebSeqId prop
    }
  }, [pswWebSeqId]);

  // Communication Message Actions
  const handleSendMessage = (content: string, type: 'general' | 'urgent') => {
    const newMessage: CommunicationMessage = {
      id: Date.now().toString(),
      content,
      sender: 'shipping',
      senderName: user?.name || 'Shipping Team',
      timestamp: new Date(),
      read: true,
      type
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleMarkMessageAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    ));
  };

  const calculateExpenseTotal = (expense: ExpenseItem) => {
    const subTotal = expense.qty * expense.rate;
    const vatAmount = (expense.vatBaseAmount * expense.vatPercent) / 100;
    const total = subTotal + vatAmount + expense.exciseVatAmount + expense.interiorVat;
    
    return {
      subTotal,
      vatAmount,
      total
    };
  };

  const updateExpense = (id: string, field: keyof ExpenseItem, value: any) => {
    setExpenses(prev => prev.map(expense => {
      if (expense.id === id) {
        const updated = { ...expense, [field]: value };
        
        // Auto-calculate totals when qty, rate, or vat fields change
        if (['qty', 'rate', 'vatBaseAmount', 'vatPercent', 'exciseVatAmount', 'interiorVat'].includes(field)) {
          const calculated = calculateExpenseTotal(updated);
          updated.subTotal = calculated.subTotal;
          updated.vatAmount = calculated.vatAmount;
          updated.total = calculated.total;
          
          // Set vatBaseAmount to subTotal if not manually set
          if (field === 'qty' || field === 'rate') {
            updated.vatBaseAmount = calculated.subTotal;
          }
        }
        
        return updated;
      }
      return expense;
    }));
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
    if (expenses.length > 1) {
      setExpenses(prev => prev.filter(expense => expense.id !== id));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getTotalSummary = () => {
    return expenses.reduce((acc, expense) => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = {
        pstReference: pstReferenceData,
        expenses,
        uploadedFiles: uploadedFiles.map(f => f.name),
        summary: getTotalSummary(),
        messages
      };
      
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting PSW form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = async (action: 'save' | 'cancel' | 'submit') => {
    if (action === 'cancel') {
      // Show cancel bill confirmation
      if (confirm('Are you sure you want to cancel this bill?')) {
        onClose();
      }
    } else if (action === 'save') {
      // Save as draft
      console.log('Saving draft...');
      // Add system message about saving
      const saveMessage: CommunicationMessage = {
        id: Date.now().toString(),
        content: 'PSW draft has been saved successfully. You can continue editing later.',
        sender: 'jagota',
        senderName: 'JAGOTA System',
        timestamp: new Date(),
        read: true,
        type: 'general'
      };
      setMessages(prev => [...prev, saveMessage]);
    } else if (action === 'submit') {
      // Submit the form
      await handleSubmit(new Event('submit') as any);
    }
  };

  const totalSummary = getTotalSummary();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-10 bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Create PSW (Payment Shipping Worksheet)</h1>
                <p className="text-sm text-gray-600">Expense Management & Billing</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Step Progress */}
        <StepProgress currentStep="psw" pstCompleted={true} />

        {/* PST Reference Bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
            {/* Reference Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">PST:</span>
                <span className="font-semibold text-gray-900">{pstReferenceData.pstNumber}</span>
              </div>
              <div className="w-px h-4 bg-gray-300" />
              {/* PSW Info (if available) */}
              {(pstReferenceData.pswBook || pstReferenceData.pswNo) && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">PSW:</span>
                    <span className="font-semibold text-green-900">
                      {pstReferenceData.pswBook && pstReferenceData.pswNo 
                        ? `${pstReferenceData.pswBook}-${pstReferenceData.pswNo}`
                        : pstReferenceData.pswBook || pstReferenceData.pswNo
                      }
                    </span>
                  </div>
                  <div className="w-px h-4 bg-gray-300" />
                </>
              )}
              <div className="flex items-center gap-2">
                <span className="text-gray-600">PO:</span>
                <span className="font-semibold text-gray-900">{pstReferenceData.poNumber}</span>
              </div>
              <div className="w-px h-4 bg-gray-300" />
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Supplier:</span>
                <span className="text-gray-900">{pstReferenceData.supplierName}</span>
              </div>
            </div>

            {/* Tax Amount */}
            <div className="flex items-center gap-3">
              <span className="text-gray-600">JAGOTA Tax Liability:</span>
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-md font-semibold">
                {(pstReferenceData.totalTaxDuty || 0).toLocaleString()} {pstReferenceData.currency || 'THB'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
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
  );
}