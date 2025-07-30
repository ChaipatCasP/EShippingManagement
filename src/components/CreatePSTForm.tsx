import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { StepProgress } from './StepProgress';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { LoadingSpinner, LoadingDots, ProgressBar, LoadingOverlay } from './ui/loading';
import { X, ArrowLeft, Building, Package, FileText, Calendar, DollarSign, Truck, Globe, CheckCircle, Plus, Trash2, Upload, Calculator, MessageSquare, Key, ArrowRight } from 'lucide-react';

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

interface CreatePSTFormProps {
  poNumber?: string;
  importDeclarationRef?: string;
  createdPSTNumber?: string | null;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export function CreatePSTForm({ 
  poNumber, 
  importDeclarationRef, 
  createdPSTNumber,
  onClose, 
  onSubmit 
}: CreatePSTFormProps) {
  // Step management
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step1Completed, setStep1Completed] = useState(false);
  
  // Communication Message Smart Button Logic
  const [messageEditMode, setMessageEditMode] = useState(false);
  const [messageSaved, setMessageSaved] = useState(false);
  const [originalMessage, setOriginalMessage] = useState('');
  
  // Step 1: Basic PST data (excluding Ref Key, Request payment date, Add expense)
  const [step1Data, setStep1Data] = useState({
    // Automated fields (pre-filled)
    poBook: 'PO-BOOK-2025',
    billingBy: 'JAGOTA Import Division',
    pswNumber: 'PSW - 25975',
    shippingCompany: 'Sangthongsuk Shipping Solution Co., Ltd.',
    shippingCompanyThai: 'บริษัท แสงทองศุข ชิปปิ้ง โซลูชั่น จำกัด',
    shippingAddress: 'เลขที่ 219 ถนนนนทรี แขวงช่องนนทรี เขตยานนาวา กรุงเทพมหานคร 10120',
    shippingPhone: '02-2119037',
    poDate: '24-Jul-2025',
    invoiceNo: 'INV-2025-001',
    contactPerson: 'John Smith',
    supplierName: 'Global Foods Ltd.',
    transportMode: 'SEA',
    awbBlTruckDate: '2025-01-15',
    importEntryNo: 'IE-2025-7890',
    vesselName: 'MV Ocean Trader',
    countryOfOrigin: 'Thailand',
    invoiceDate: '2025-01-12',
    currency: 'THB',
    paymentTerm: 'NET 30',
    // User input fields for step 1
    dueDate: '',
    creditTerm: ''
  });

  // Step 2: Extended PST data (includes Ref Key, Request payment date, Add expense, Message box)
  const [step2Data, setStep2Data] = useState({
    referenceKey: '189772243',
    requestPaymentDateTime: '',
    message: ''
  });

  // Expense management state (only for step 2) - Using PSW structure
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

  // File upload state (only for step 2)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Reference data
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
    'TAX - Import Tax',
    'DUT - Duty Fee',
    'OTH - Other Charges'
  ];

  // Show success message when PST is created
  useEffect(() => {
    if (createdPSTNumber) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [createdPSTNumber]);

  const handleStep1InputChange = (field: string, value: string) => {
    setStep1Data(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStep2InputChange = (field: string, value: string) => {
    setStep2Data(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Handle message field specifically for smart button logic
    if (field === 'message') {
      // Show Save/Cancel buttons when user starts typing
      if (value !== originalMessage && !messageEditMode) {
        setMessageEditMode(true);
        setMessageSaved(false);
      }
    }
  };
  
  // Communication Message Actions
  const handleMessageSave = () => {
    setOriginalMessage(step2Data.message);
    setMessageSaved(true);
    setMessageEditMode(false);
  };
  
  const handleMessageCancel = () => {
    setStep2Data(prev => ({ ...prev, message: originalMessage }));
    setMessageEditMode(false);
    setMessageSaved(false);
  };
  
  const handleMessageEdit = () => {
    setMessageEditMode(true);
    setMessageSaved(false);
  };

  // Handle step 1 completion
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitProgress(0);
    
    try {
      // Simulate progress steps
      const progressSteps = [
        { progress: 25, message: 'Validating form data...' },
        { progress: 50, message: 'Creating PST bill...' },
        { progress: 75, message: 'Saving to system...' },
        { progress: 100, message: 'Step 1 completed!' }
      ];

      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setSubmitProgress(step.progress);
      }

      setStep1Completed(true);
      setCurrentStep(2);
      setIsSubmitting(false);
      setSubmitProgress(0);
    } catch (error) {
      console.error('Error in Step 1:', error);
      setIsSubmitting(false);
      setSubmitProgress(0);
    }
  };

  // Handle final submission (Step 2)
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitProgress(0);
    
    try {
      // Simulate progress steps
      const progressSteps = [
        { progress: 20, message: 'Validating final data...' },
        { progress: 40, message: 'Processing expense calculations...' },
        { progress: 60, message: 'Uploading documents...' },
        { progress: 80, message: 'Generating final PST request...' },
        { progress: 100, message: 'Finalizing submission...' }
      ];

      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setSubmitProgress(step.progress);
      }

      const submitData = {
        ...step1Data,
        ...step2Data,
        expenses,
        uploadedFiles: uploadedFiles.map(f => f.name),
        expenseSummary: getTotalSummary()
      };
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting final PST form:', error);
      setIsSubmitting(false);
      setSubmitProgress(0);
    }
  };

  // Expense calculation logic (using PSW structure)
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

  // File upload handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Get expense summary
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

  // Calculate form completion percentage
  const getFormCompletionPercentage = () => {
    if (currentStep === 1) {
      let completed = 0;
      const fields = ['dueDate', 'creditTerm'];
      completed = fields.filter(field => step1Data[field as keyof typeof step1Data]).length;
      return Math.round((completed / fields.length) * 100);
    } else {
      let completed = 0;
      let total = 0;
      
      // Step 2 fields
      if (step2Data.referenceKey) completed++;
      if (step2Data.requestPaymentDateTime) completed++;
      if (step2Data.message.trim()) completed++;
      total += 3;
      
      // Expense items completion
      const validExpenses = expenses.filter(exp => exp.expenseCode && exp.serviceProvider && exp.qty > 0 && exp.rate > 0);
      completed += validExpenses.length;
      total += expenses.length;
      
      // File upload (optional but counts towards completion)
      if (uploadedFiles.length > 0) completed++;
      total += 1;
      
      return Math.round((completed / total) * 100);
    }
  };

  // Get current status text
  const getStatusText = () => {
    if (currentStep === 1 && !step1Completed) {
      return "PST New Entry";
    } else if (currentStep === 2 || step1Completed) {
      return "PST In Progress";
    }
    return "PST New Entry";
  };

  const getStatusColor = () => {
    if (currentStep === 1 && !step1Completed) {
      return "bg-blue-50 border-blue-200 text-blue-700";
    } else if (currentStep === 2 || step1Completed) {
      return "bg-amber-50 border-amber-200 text-amber-700";
    }
    return "bg-blue-50 border-blue-200 text-blue-700";
  };

  const totalSummary = getTotalSummary();
  const completionPercentage = getFormCompletionPercentage();

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeInUp">
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
              <h1 className="font-semibold text-gray-900">Create PST Request - Step {currentStep} of 2</h1>
              <p className="text-sm text-gray-600">
                {currentStep === 1 ? 'Create PST Bill (New Entry)' : 'Complete PST Details (In Progress)'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Step indicator */}
            <div className="flex items-center gap-2">
              <Badge variant={currentStep === 1 ? "default" : "secondary"}>
                Step 1: Create Bill
              </Badge>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <Badge variant={currentStep === 2 ? "default" : "secondary"}>
                Step 2: Complete Details
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {showSuccess && createdPSTNumber && (
        <div className="px-6 py-4 bg-green-50 border-b border-green-200">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              <strong>PST Request Created Successfully!</strong> Your PST number is <strong>{createdPSTNumber}</strong>. 
              You will now be redirected to create the PSW (Payment Shipping Worksheet).
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Step Progress */}
      <StepProgress currentStep="pst" pstCompleted={!!createdPSTNumber} />

      {/* PST Information Header - Compact Sticky Section */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 transition-all duration-200">
        <div className="px-6 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-4 text-sm">
              {/* Left side - Key reference info */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">PO Book:</span>
                  <span className="font-medium text-gray-900">{step1Data.poBook}</span>
                </div>
                {currentStep === 2 && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Ref #:</span>
                    <span className="font-medium text-gray-900">{step2Data.referenceKey}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-900">{step1Data.poDate}</span>
                </div>
              </div>

              {/* Right side - PST Status */}
              <div className="flex items-center gap-3">
                {createdPSTNumber ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">PST: {createdPSTNumber}</span>
                  </div>
                ) : (
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${getStatusColor()}`}>
                    {currentStep === 1 ? (
                      <Building className="w-4 h-4" />
                    ) : (
                      <Key className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">{getStatusText()}</span>
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
          {/* STEP 1: Create PST Bill */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-8">
              {/* Step 1 Information */}
              <Card className="shadow-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    Step 1: Create PST Bill
                    <Badge className="ml-2 bg-blue-50 text-blue-700 border-blue-200">New Entry</Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    Create the initial PST bill with basic shipment information. Ref Key, Request payment date, and expense items will be added in Step 2.
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Basic PST Information Grid - Enhanced for Full Width */}
                  <div className="grid grid-cols-12 gap-4 lg:gap-6 xl:gap-8">
                    {/* Row 1 - Optimized for wider layout */}
                    <div className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-4 space-y-2">
                      <Label htmlFor="invoiceNo" className="text-sm font-medium text-gray-700">Invoice No.</Label>
                      <Input
                        id="invoiceNo"
                        value={step1Data.invoiceNo}
                        readOnly
                        className="bg-gray-50 border-gray-200"
                      />
                    </div>
                    
                    <div className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-4 space-y-2">
                      <Label htmlFor="contactPerson" className="text-sm font-medium text-gray-700">Contact Person</Label>
                      <Input
                        id="contactPerson"
                        value={step1Data.contactPerson}
                        readOnly
                        className="bg-gray-50 border-gray-200"
                      />
                    </div>
                    
                    <div className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-4 space-y-2">
                      <Label htmlFor="supplierName" className="text-sm font-medium text-gray-700">Supplier Name</Label>
                      <Select value={step1Data.supplierName} onValueChange={(value) => handleStep1InputChange('supplierName', value)}>
                        <SelectTrigger className="bg-gray-50 border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Global Foods Ltd.">Global Foods Ltd.</SelectItem>
                          <SelectItem value="Asia Pacific Trading">Asia Pacific Trading</SelectItem>
                          <SelectItem value="International Supplies Co.">International Supplies Co.</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Row 2 */}
                    <div className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-4 space-y-2">
                      <Label htmlFor="transportMode" className="text-sm font-medium text-gray-700">Transport Mode</Label>
                      <div className="relative">
                        <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          id="transportMode"
                          value={step1Data.transportMode}
                          readOnly
                          className="bg-gray-50 border-gray-200 pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-4 space-y-2">
                      <Label htmlFor="importEntryNo" className="text-sm font-medium text-gray-700">Import Entry No.</Label>
                      <Input
                        id="importEntryNo"
                        value={step1Data.importEntryNo}
                        readOnly
                        className="bg-gray-50 border-gray-200"
                      />
                    </div>
                    
                    <div className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-4 space-y-2">
                      <Label htmlFor="currency" className="text-sm font-medium text-gray-700">Currency</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          id="currency"
                          value={step1Data.currency}
                          readOnly
                          className="bg-gray-50 border-gray-200 pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* User Input Fields for Step 1 - Grid System */}
                  <div className="space-y-6">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Required Information
                    </h4>
                    <div className="grid grid-cols-12 gap-4 lg:gap-6 xl:gap-8">
                      <div className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-6 space-y-2">
                        <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
                          Due Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={step1Data.dueDate}
                          onChange={(e) => handleStep1InputChange('dueDate', e.target.value)}
                          required
                          className="border-blue-200 focus:border-blue-500 transition-colors duration-200"
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-6 space-y-2">
                        <Label htmlFor="creditTerm" className="text-sm font-medium text-gray-700">
                          Credit Term (Days) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="creditTerm"
                          type="number"
                          placeholder="30"
                          value={step1Data.creditTerm}
                          onChange={(e) => handleStep1InputChange('creditTerm', e.target.value)}
                          required
                          className="border-blue-200 focus:border-blue-500 transition-colors duration-200"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 1 Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="min-w-40 relative overflow-hidden"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" className="border-white border-t-white/50" />
                      <span>Creating Bill...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Create PST Bill</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                  {isSubmitting && (
                    <div 
                      className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-300 ease-out"
                      style={{ width: `${submitProgress}%` }}
                    />
                  )}
                </Button>
              </div>

              {/* Submit Progress Overlay */}
              {isSubmitting && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-6 shadow-xl border max-w-sm w-full mx-4 animate-fadeInScale">
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        <LoadingSpinner size="lg" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Creating PST Bill</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Step 1 of 2 - Creating initial PST bill...
                      </p>
                      <ProgressBar
                        progress={submitProgress}
                        showPercentage={true}
                        animated={true}
                        color="bg-blue-600"
                      />
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* STEP 2: Complete PST Details */}
          {currentStep === 2 && (
            <div className="space-y-8">
              {/* Back to Step 1 Button - Top Position */}
              <div className="flex items-center justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCurrentStep(1)}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Step 1
                </Button>
                
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-600" />
                  <span className="font-medium text-gray-900">Step 2: Complete PST Details</span>
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200">In Progress</Badge>
                </div>
              </div>

              {/* Main Layout: Content + Sidebar - Enhanced for Full Width */}
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 lg:gap-8">
                
                {/* Main Content Area - Wider for better content distribution */}
                <div className="xl:col-span-4 space-y-8">
                  <form onSubmit={handleFinalSubmit} className="space-y-8">
                    {/* Step 2 Information */}
                    <Card className="shadow-sm">
                      <CardHeader className="pb-6">
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-amber-600" />
                          PST Details
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-2">
                          Complete your PST request with reference key and payment details.
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Reference and Payment Information - Enhanced Grid System */}
                        <div className="grid grid-cols-12 gap-4 lg:gap-6">
                          <div className="col-span-12 md:col-span-6 space-y-2">
                            <Label htmlFor="referenceKey" className="text-sm font-medium text-gray-700">
                              Reference Key <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="referenceKey"
                              value={step2Data.referenceKey}
                              onChange={(e) => handleStep2InputChange('referenceKey', e.target.value)}
                              className="border-amber-200 focus:border-amber-500 transition-colors duration-200"
                              disabled={isSubmitting}
                              required
                            />
                          </div>
                          
                          <div className="col-span-12 md:col-span-6 space-y-2">
                            <Label htmlFor="requestPaymentDateTime" className="text-sm font-medium text-gray-700">
                              Request Payment Date & Time <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="requestPaymentDateTime"
                              type="datetime-local"
                              value={step2Data.requestPaymentDateTime}
                              onChange={(e) => handleStep2InputChange('requestPaymentDateTime', e.target.value)}
                              className="border-amber-200 focus:border-amber-500 transition-colors duration-200"
                              disabled={isSubmitting}
                              required
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tax & Expense Items Section - Following PSW Structure */}
                    <Card className="shadow-sm">
                      <CardHeader className="pb-6">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-gray-500" />
                            Tax & Expense Items
                          </CardTitle>
                          {/* Duplicate Add Expense Button */}
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={addExpense}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 transition-all duration-200 hover:animate-microBounce"
                          >
                            <Plus className="w-4 h-4" />
                            Add Expense Item
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {expenses.map((expense, index) => (
                          <div key={expense.id} className="border border-gray-200 rounded-lg p-6 space-y-6 bg-white">
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
                                  disabled={isSubmitting}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                            
                            {/* Enhanced Grid System for Expense Items - Full Width Optimized */}
                            <div className="grid grid-cols-12 gap-4 lg:gap-6">
                              {/* Row 1 - Main Fields */}
                              <div className="col-span-12 sm:col-span-6 lg:col-span-4 space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Expense Code <span className="text-red-500">*</span>
                                </Label>
                                <Select 
                                  value={expense.expenseCode} 
                                  onValueChange={(value) => updateExpense(expense.id, 'expenseCode', value)}
                                  disabled={isSubmitting}
                                >
                                  <SelectTrigger className="transition-colors duration-200">
                                    <SelectValue placeholder="Select expense code" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {expenseCodes.map(code => (
                                      <SelectItem key={code} value={code}>{code}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="col-span-12 sm:col-span-6 lg:col-span-4 space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Service Provider <span className="text-red-500">*</span>
                                </Label>
                                <Select 
                                  value={expense.serviceProvider} 
                                  onValueChange={(value) => updateExpense(expense.id, 'serviceProvider', value)}
                                  disabled={isSubmitting}
                                >
                                  <SelectTrigger className="transition-colors duration-200">
                                    <SelectValue placeholder="Select provider" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {serviceProviders.map(provider => (
                                      <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="col-span-6 sm:col-span-4 lg:col-span-2 space-y-2">
                                <Label className="text-sm font-medium text-gray-700">QTY <span className="text-red-500">*</span></Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={expense.qty}
                                  onChange={(e) => updateExpense(expense.id, 'qty', parseInt(e.target.value) || 1)}
                                  disabled={isSubmitting}
                                  className="transition-colors duration-200"
                                />
                              </div>
                              
                              <div className="col-span-6 sm:col-span-4 lg:col-span-2 space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Rate <span className="text-red-500">*</span></Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={expense.rate}
                                  onChange={(e) => updateExpense(expense.id, 'rate', parseFloat(e.target.value) || 0)}
                                  disabled={isSubmitting}
                                  className="transition-colors duration-200"
                                />
                              </div>
                              
                              {/* Row 2 */}
                              <div className="col-span-12 sm:col-span-6 lg:col-span-3 space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Document No.</Label>
                                <Input
                                  value={expense.documentNo}
                                  onChange={(e) => updateExpense(expense.id, 'documentNo', e.target.value)}
                                  disabled={isSubmitting}
                                  className="transition-colors duration-200"
                                />
                              </div>
                              
                              <div className="col-span-12 sm:col-span-6 lg:col-span-3 space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Document Date</Label>
                                <Input
                                  type="date"
                                  value={expense.documentDate}
                                  onChange={(e) => updateExpense(expense.id, 'documentDate', e.target.value)}
                                  disabled={isSubmitting}
                                  className="transition-colors duration-200"
                                />
                              </div>
                              
                              <div className="col-span-6 sm:col-span-4 lg:col-span-3 space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Sub Total</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={expense.subTotal.toFixed(2)}
                                  readOnly
                                  className="bg-gray-50 border-gray-200 font-medium"
                                />
                              </div>
                              
                              <div className="col-span-6 sm:col-span-4 lg:col-span-3 space-y-2">
                                <Label className="text-sm font-medium text-gray-700">VAT Base Amount</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={expense.vatBaseAmount}
                                  onChange={(e) => updateExpense(expense.id, 'vatBaseAmount', parseFloat(e.target.value) || 0)}
                                  disabled={isSubmitting}
                                  className="transition-colors duration-200"
                                />
                              </div>
                              
                              {/* Row 3 */}
                              <div className="col-span-12 lg:col-span-6 space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Remarks</Label>
                                <Textarea
                                  rows={2}
                                  value={expense.remarks}
                                  onChange={(e) => updateExpense(expense.id, 'remarks', e.target.value)}
                                  disabled={isSubmitting}
                                  className="transition-colors duration-200"
                                />
                              </div>
                              
                              <div className="col-span-6 sm:col-span-4 lg:col-span-2 space-y-2">
                                <Label className="text-sm font-medium text-gray-700">VAT %</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={expense.vatPercent}
                                  onChange={(e) => updateExpense(expense.id, 'vatPercent', parseFloat(e.target.value) || 0)}
                                  disabled={isSubmitting}
                                  className="transition-colors duration-200"
                                />
                              </div>
                              
                              <div className="col-span-6 sm:col-span-4 lg:col-span-2 space-y-2">
                                <Label className="text-sm font-medium text-gray-700">VAT Amount</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={expense.vatAmount.toFixed(2)}
                                  readOnly
                                  className="bg-gray-50 border-gray-200 font-medium"
                                />
                              </div>
                              
                              <div className="col-span-6 sm:col-span-4 lg:col-span-2 space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Total</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={expense.total.toFixed(2)}
                                  readOnly
                                  className="bg-gray-50 border-gray-200 font-semibold text-green-600"
                                />
                              </div>
                              
                              {/* Row 4 */}
                              <div className="col-span-6 sm:col-span-4 lg:col-span-3 space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Excise VAT Amount</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={expense.exciseVatAmount}
                                  onChange={(e) => updateExpense(expense.id, 'exciseVatAmount', parseFloat(e.target.value) || 0)}
                                  disabled={isSubmitting}
                                  className="transition-colors duration-200"
                                />
                              </div>
                              
                              <div className="col-span-6 sm:col-span-4 lg:col-span-3 space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Interior VAT</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={expense.interiorVat}
                                  onChange={(e) => updateExpense(expense.id, 'interiorVat', parseFloat(e.target.value) || 0)}
                                  disabled={isSubmitting}
                                  className="transition-colors duration-200"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* File Upload Section */}
                    <Card className="shadow-sm">
                      <CardHeader className="pb-6">
                        <CardTitle className="flex items-center gap-2">
                          <Upload className="w-5 h-5 text-gray-500" />
                          Supporting Documents
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
                              id="file-upload-step2"
                              disabled={isSubmitting}
                            />
                            <label
                              htmlFor="file-upload-step2"
                              className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
                                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
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
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm">{file.name}</span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="text-red-600"
                                  disabled={isSubmitting}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Submit Progress Overlay */}
                    {isSubmitting && (
                      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-white rounded-lg p-6 shadow-xl border max-w-sm w-full mx-4 animate-fadeInScale">
                          <div className="text-center">
                            <div className="flex justify-center mb-4">
                              <LoadingSpinner size="lg" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Completing PST Request</h3>
                            <p className="text-sm text-gray-600 mb-4">
                              Step 2 of 2 - Finalizing your PST request...
                            </p>
                            <ProgressBar
                              progress={submitProgress}
                              showPercentage={true}
                              animated={true}
                              color="bg-amber-600"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                </div>

                {/* Right Sidebar - Enhanced Total Summary + Quick Actions */}
                <div className="xl:col-span-1">
                  <div className="sticky top-6 space-y-6">
                    {/* Compact Total Summary */}
                    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-purple-800 text-base">
                            <Calculator className="w-4 h-4" />
                            Total Summary
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                            {expenses.length} {expenses.length === 1 ? 'Item' : 'Items'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Currency & Status - Compact */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-purple-600">Currency:</span>
                            <span className="font-semibold text-purple-900">{step1Data.currency}</span>
                          </div>
                          <span className="font-medium text-purple-700">In Progress</span>
                        </div>
                        
                        <Separator className="bg-purple-200" />
                        
                        {/* Compact Expense Breakdown - Vertical Layout */}
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-purple-700 mb-2">BREAKDOWN</div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-purple-600">Sub Total</span>
                              <span className="font-medium text-purple-900">{totalSummary.subTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-purple-600">VAT</span>
                              <span className="font-medium text-purple-900">{totalSummary.vatAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-purple-600">Excise VAT</span>
                              <span className="font-medium text-purple-900">{totalSummary.exciseVatAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-purple-600">Interior VAT</span>
                              <span className="font-medium text-purple-900">{totalSummary.interiorVat.toFixed(2)}</span>
                            </div>
                          </div>
                          
                          <Separator className="bg-purple-200 my-2" />
                          
                          {/* Compact Grand Total */}
                          <div className="bg-white rounded-lg p-2 border border-purple-200">
                            <div className="text-center">
                              <div className="text-xs text-purple-600 mb-1">GRAND TOTAL</div>
                              <div className="font-bold text-lg text-purple-900">{totalSummary.total.toFixed(2)}</div>
                              <div className="text-xs text-purple-600">{step1Data.currency}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Separate Form Completion Progress */}
                    <Card className="border border-gray-200 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-gray-900 text-base">
                          <CheckCircle className="w-4 h-4" />
                          Form Progress
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Completion</span>
                          <span className="font-medium text-gray-900">{completionPercentage}%</span>
                        </div>
                        <Progress 
                          value={completionPercentage} 
                          className="h-2"
                        />
                        <div className="text-xs text-gray-500 text-center">
                          {completionPercentage < 50 ? 'Keep going!' : 
                           completionPercentage < 80 ? 'Almost there!' : 
                           'Ready to submit!'}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Add Expense */}
                    <Card className="border border-gray-200 shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                          <Plus className="w-5 h-5" />
                          Quick Add Expense
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="w-full justify-start transition-all duration-200 hover:animate-microBounce" 
                          onClick={addExpense}
                          disabled={isSubmitting}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Expense Item
                        </Button>
                        
                        <div className="text-xs text-gray-500 leading-relaxed">
                          <strong>Tip:</strong> All expense items with import taxes and duties will be automatically calculated for VAT and totals.
                        </div>
                      </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <Card className="border border-gray-200 shadow-sm">
                      <CardContent className="p-4 space-y-3">
                        <div className="text-sm font-medium text-gray-900 mb-3">Complete PST Request</div>
                        
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={onClose}
                          disabled={isSubmitting}
                          className="w-full"
                        >
                          Cancel
                        </Button>
                        
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="w-full relative overflow-hidden"
                          onClick={handleFinalSubmit}
                        >
                          {isSubmitting ? (
                            <div className="flex items-center gap-2">
                              <LoadingSpinner size="sm" className="border-white border-t-white/50" />
                              <span>Finalizing...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              <span>Complete PST Request</span>
                            </div>
                          )}
                          {isSubmitting && (
                            <div 
                              className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-300 ease-out"
                              style={{ width: `${submitProgress}%` }}
                            />
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
              
              {/* Communication Message Section - Separate under main container */}
              <Card className="shadow-sm mt-8">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-gray-500" />
                      <CardTitle>Communication Message</CardTitle>
                    </div>
                    {/* Smart Button Logic */}
                    <div className="flex items-center gap-2">
                      {/* Show Save/Cancel when user is editing and has text */}
                      {messageEditMode && step2Data.message.trim() && (
                        <>
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={handleMessageSave}
                            disabled={isSubmitting}
                            className="text-xs px-3 py-1 bg-green-600 hover:bg-green-700"
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleMessageCancel}
                            disabled={isSubmitting}
                            className="text-xs px-3 py-1"
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      {/* Show Edit button when message is saved */}
                      {messageSaved && !messageEditMode && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleMessageEdit}
                          disabled={isSubmitting}
                          className="text-xs px-3 py-1"
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Add notes or special instructions for this PST request
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    id="message"
                    placeholder="Enter any special instructions, notes, or communications for this PST request..."
                    value={step2Data.message}
                    onChange={(e) => handleStep2InputChange('message', e.target.value)}
                    rows={4}
                    className={`border-amber-200 focus:border-amber-500 transition-colors duration-200 ${
                      messageSaved && !messageEditMode ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isSubmitting || (messageSaved && !messageEditMode)}
                  />
                  {/* Status indicator */}
                  {messageSaved && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      <span>Message saved</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}