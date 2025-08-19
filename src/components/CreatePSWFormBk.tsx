import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import { CommunicationPanel, CommunicationMessage } from "./CommunicationPanel";
import {
  X,
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  Calculator,
  DollarSign,
  Building,
  Package2,
  FileDigit,
  Key,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { Badge } from "./ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import { PSWApiResponse } from "../types/shipment";
import { pstService } from "../api/services/pstService";

interface ExpenseItem {
  id: string;
  expenseCode: string;
  expenseName?: string;
  serviceProvider: string;
  qty: number;
  rate: number;
  documentNo?: string;
  documentDate?: string;
  subTotal: number;
  vatBaseAmount?: number;
  remarks?: string;
  vatPercent?: number;
  vatAmount: number;
  exciseVatAmount?: number;
  interiorVat?: number;
  total: number;
  isFromAPI?: boolean;
  rowId?: number;
}

interface ExpenseListItem {
  expenseCode: string;
  expenseName: string;
  taxRate: string;
}

interface ServiceProviderItem {
  name: string;
}

interface User {
  email: string;
  name: string;
}

// Interface for header data from dashboard
interface HeaderData {
  supplierName: string;
  poBook: string;
  poNo: string;
  poDate: string;
  etd: string;
  eta: string;
  wrDate: string;
  invoiceNo: string;
  invoiceDate: string;
  awbNo: string;
  importEntryNo: string;
  portOfOrigin: string;
  portOfDestination: string;
  status: string;
  pstBook: string;
  pstNo: string;
  vesselName?: string;
  referenceCode?: string;
  taxIdNo?: string;
  paymentTerm?: string;
}

interface CreatePSWFormProps {
  poNumber?: string;
  pstNumber?: string;
  pswWebSeqId?: number; // Add this for Update PSW functionality
  pswData?: PSWApiResponse; // PSW data from API
  dashboardHeaderData?: HeaderData; // Optional header data from dashboard
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  user?: User | null;
}

export function CreatePSWForm({
  poNumber,
  pstNumber,
  pswWebSeqId,
  pswData,
  dashboardHeaderData,
  onClose,
  onSubmit,
  user,
}: CreatePSWFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);

  const [uploadedFiles] = useState<File[]>([]);

  // PST Details specific state
  const [expenseList, setExpenseList] = useState<ExpenseListItem[]>([]);
  const [serviceProviders, setServiceProviders] = useState<
    ServiceProviderItem[]
  >([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpenseIndex, setEditingExpenseIndex] = useState<number | null>(
    null
  );
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());

  // Expense Item Form State for adding/editing
  const [expenseItemForm, setExpenseItemForm] = useState({
    expenseCode: "",
    expenseName: "",
    serviceProvider: "",
    qty: "",
    rate: "",
    subTotal: 0,
    vatBase: 0,
    vatPercent: 0,
    vatAmount: 0,
    exciseVat: "",
    interiorVat: "",
    total: 0,
    documentNo: "",
    documentDate: "",
    remarks: "",
  });

  // Communication Messages State
  const [messages, setMessages] = useState<CommunicationMessage[]>([
    {
      id: "1",
      content:
        "PSW creation initiated for PST-2025-101. Payment worksheet is ready for expense details input.",
      sender: "jagota",
      senderName: "JAGOTA Payment Team",
      timestamp: new Date("2025-01-30T11:15:00"),
      read: true,
      type: "general",
    },
  ]);

  // Header data from API for display - initialize with dashboard data if provided
  const [headerData, setHeaderData] = useState({
    supplierName: dashboardHeaderData?.supplierName || "",
    poBook: dashboardHeaderData?.poBook || "",
    poNo: dashboardHeaderData?.poNo || "",
    poDate: dashboardHeaderData?.poDate || "",
    etd: dashboardHeaderData?.etd || "",
    eta: dashboardHeaderData?.eta || "",
    wrDate: dashboardHeaderData?.wrDate || "",
    invoiceNo: dashboardHeaderData?.invoiceNo || "",
    awbNo: dashboardHeaderData?.awbNo || "",
    pstBook: dashboardHeaderData?.pstBook || "",
    pstNo: dashboardHeaderData?.pstNo || "",
    status: dashboardHeaderData?.status || "",
    pswBook: "",
    pswNo: "",
  });

  // Additional missing state variables
  const [submitProgress, setSubmitProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    refKey: "",
  });
  const [invoiceItems] = useState<any[]>([]);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [changedItems, setChangedItems] = useState<Set<string>>(new Set());

  // PST Reference Data (ข้อมูลย่อจาก PST หรือ API)
  const pstReferenceData = {
    pstNumber: pstNumber || "PST-2025-001",
    poNumber: poNumber || "PO-2025-001",
    supplierName: pswData?.supplierName || "Global Foods Ltd.",
    transportMode: pswData?.transportMode || "SEA",
    invoiceNo: pswData?.invoiceNo || "INV-2025-001",
    currency: pswData?.currency || "THB",
    importEntryNo: pswData?.importEntryNo || "IE-2025-7890",
    // PSW specific data from API
    pswBook: pswData?.pswBook || null,
    pswNo: pswData?.pswNo || null,
    // Import Tax Information
    importTaxRate: pswData?.importTaxRate || 12.5, // %
    importTaxAmount: pswData?.importTaxAmount || 15780.5, // THB
    vatRate: pswData?.vatRate || 7, // %
    vatAmount: pswData?.vatAmount || 3245.2, // THB
    dutyRate: pswData?.dutyRate || 8.5, // %
    dutyAmount: pswData?.dutyAmount || 8920.75, // THB
    totalTaxDuty: pswData?.totalTaxDuty || 27946.45, // THB
    invoiceValue: pswData?.invoiceValue || 125000.0, // THB
  };

  // Load expense list and service providers from API
  const loadExpenseList = async () => {
    try {
      const response = await pstService.getExpenseList();
      if (response && response.data) {
        setExpenseList(response.data);
      }
    } catch (error) {
      console.error("Error loading expense list:", error);
      // Fallback to hardcoded data if API fails
      setExpenseList([
        {
          expenseCode: "THC",
          expenseName: "Terminal Handling Charge",
          taxRate: "7",
        },
        { expenseCode: "DOC", expenseName: "Documentation Fee", taxRate: "7" },
        { expenseCode: "INS", expenseName: "Inspection Fee", taxRate: "7" },
        { expenseCode: "WAR", expenseName: "Warehouse Fee", taxRate: "7" },
        { expenseCode: "TRA", expenseName: "Transportation Fee", taxRate: "7" },
        { expenseCode: "CUS", expenseName: "Customs Fee", taxRate: "7" },
        { expenseCode: "OTH", expenseName: "Other Charges", taxRate: "7" },
      ]);
    }
  };

  const loadServiceProviders = async () => {
    try {
      const response = await pstService.getServiceProviders();
      if (response && response.data) {
        setServiceProviders(response.data);
      }
    } catch (error) {
      console.error("Error loading service providers:", error);
      // Fallback to hardcoded data if API fails
      setServiceProviders([
        { name: "Port Authority" },
        { name: "Customs Broker Co." },
        { name: "Transportation Services Ltd." },
        { name: "Warehouse Solutions" },
        { name: "Inspection Services" },
        { name: "Documentation Services" },
      ]);
    }
  };

  // Toggle collapse state for an expense item
  const toggleItemCollapse = (itemId: string) => {
    setCollapsedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Load expense list and service providers on component mount
  useEffect(() => {
    loadExpenseList();
    loadServiceProviders();
  }, []);

  // Read URL parameters and handle pswWebSeqId
  useEffect(() => {
    const url = new URL(window.location.href);
    const pswWebSeqIdParam = url.searchParams.get("pswWebSeqId");

    const loadPSWData = async (webSeqId: number) => {
      try {
        console.log("Loading PSW data for webSeqId:", webSeqId);
        const response = await pstService.getPSTDetails(webSeqId);

        if (response && !response.error && response.data) {
          const data = response.data;
          console.log("PSW data loaded:", data);

          // Get supplier name from first invoice in list
          const apiSupplierName =
            data.invoiceList && data.invoiceList.length > 0
              ? data.invoiceList[0].supplierName
              : "";

          // Update header data with API response, but prefer dashboard data when available
          setHeaderData((prevData) => ({
            // Prefer dashboard data, fallback to API data, then existing data
            supplierName:
              dashboardHeaderData?.supplierName ||
              apiSupplierName ||
              prevData.supplierName,
            poBook:
              dashboardHeaderData?.poBook || data.poBook || prevData.poBook,
            poNo:
              dashboardHeaderData?.poNo ||
              data.poNo?.toString() ||
              prevData.poNo,
            poDate:
              dashboardHeaderData?.poDate || data.poDate || prevData.poDate,
            etd: dashboardHeaderData?.etd || prevData.etd, // ETD from dashboard only
            eta: dashboardHeaderData?.eta || prevData.eta, // ETA from dashboard only
            wrDate: dashboardHeaderData?.wrDate || prevData.wrDate, // WR Date from dashboard only
            invoiceNo:
              dashboardHeaderData?.invoiceNo ||
              data.invoiceList?.[0]?.invoiceNo ||
              prevData.invoiceNo,
            awbNo: dashboardHeaderData?.awbNo || data.awbNo || prevData.awbNo,
            pstBook: dashboardHeaderData?.pstBook || prevData.pstBook,
            pstNo: dashboardHeaderData?.pstNo || prevData.pstNo,
            status: dashboardHeaderData?.status || prevData.status,
            pswBook: prevData.pswBook, // PSW data from form state
            pswNo: prevData.pswNo, // PSW data from form state
          }));
        }
      } catch (error) {
        console.error("Error loading PSW data:", error);
      }
    };

    if (pswWebSeqIdParam && !isNaN(Number(pswWebSeqIdParam))) {
      const webSeqId = Number(pswWebSeqIdParam);
      loadPSWData(webSeqId);
    } else if (pswWebSeqId) {
      loadPSWData(pswWebSeqId);
    }
  }, [pswWebSeqId, dashboardHeaderData]);

  // Calculate totals
  const totalSummary = expenses.reduce(
    (acc, expense) => {
      acc.subTotal += expense.subTotal;
      acc.vatAmount += expense.vatAmount;
      acc.exciseVatAmount += expense.exciseVatAmount || 0;
      acc.interiorVat += expense.interiorVat || 0;
      acc.total += expense.total;
      return acc;
    },
    {
      subTotal: 0,
      vatAmount: 0,
      exciseVatAmount: 0,
      interiorVat: 0,
      total: 0,
    }
  );

  // Additional calculated values
  const totalSubTotal = expenseItems.reduce((sum, item) => sum + (item.subTotal || 0), 0);
  const totalVATAmount = expenseItems.reduce((sum, item) => sum + (item.vatAmount || 0), 0);
  const grandTotal = expenseItems.reduce((sum, item) => sum + (item.total || 0), 0);

  // Missing function definitions
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeleteClick = async (itemId: string) => {
    try {
      setExpenses(prev => prev.filter(item => item.id !== itemId));
      setExpenseItems(prev => prev.filter(item => item.id !== itemId));
      setChangedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleSaveExpenseDisplay = async (item: ExpenseItem) => {
    try {
      // Update the item in the list
      setExpenses(prev => 
        prev.map(existing => existing.id === item.id ? item : existing)
      );
      setExpenseItems(prev => 
        prev.map(existing => existing.id === item.id ? item : existing)
      );
      
      // Remove from changed items
      setChangedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    } catch (error) {
      console.error("Error saving expense item:", error);
    }
  };

  const isFormValid = () => {
    return formData.refKey.trim() !== "" && expenses.length > 0;
  };

  // LoadingSpinner component
  const LoadingSpinner = ({ size = "sm", className = "" }: { size?: "sm" | "lg"; className?: string }) => (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 ${
      size === "lg" ? "h-6 w-6" : "h-4 w-4"
    } ${className}`} />
  );

  // ProgressBar component
  const ProgressBar = ({ 
    progress, 
    showPercentage = false, 
    animated = true, 
    color = "bg-blue-600" 
  }: { 
    progress: number; 
    showPercentage?: boolean; 
    animated?: boolean; 
    color?: string; 
  }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`h-2 rounded-full ${animated ? 'transition-all duration-300' : ''} ${color}`}
        style={{ width: `${progress}%` }}
      />
      {showPercentage && (
        <div className="text-sm text-center mt-1">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );

  // PST Details expense form handlers
  const handleExpenseFormChange = (field: string, value: string | number) => {
    setExpenseItemForm((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate when qty or rate changes
      if (field === "qty" || field === "rate") {
        const qty =
          parseFloat(field === "qty" ? value.toString() : updated.qty) || 0;
        const rate =
          parseFloat(field === "rate" ? value.toString() : updated.rate) || 0;
        const subTotal = qty * rate;

        updated.subTotal = subTotal;
        updated.vatBase = subTotal;
        updated.vatAmount = subTotal * (updated.vatPercent / 100);

        const exciseVat = parseFloat(updated.exciseVat) || 0;
        const interiorVat = parseFloat(updated.interiorVat) || 0;
        updated.total = subTotal + updated.vatAmount + exciseVat + interiorVat;
      }

      // Auto-calculate when excise or interior VAT changes
      if (field === "exciseVat" || field === "interiorVat") {
        const exciseVat =
          parseFloat(
            field === "exciseVat" ? value.toString() : updated.exciseVat
          ) || 0;
        const interiorVat =
          parseFloat(
            field === "interiorVat" ? value.toString() : updated.interiorVat
          ) || 0;
        updated.total =
          updated.subTotal + updated.vatAmount + exciseVat + interiorVat;
      }

      return updated;
    });
  };

  const handleExpenseCodeSelect = (expenseCode: string) => {
    const expense = expenseList.find((e) => e.expenseCode === expenseCode);
    if (expense) {
      const vatPercent = parseFloat(expense.taxRate) || 0;
      const qty = parseFloat(expenseItemForm.qty) || 0;
      const rate = parseFloat(expenseItemForm.rate) || 0;
      const subTotal = qty * rate;
      const vatBase = subTotal;
      const vatAmount = vatBase * (vatPercent / 100);
      const exciseVat = parseFloat(expenseItemForm.exciseVat) || 0;
      const interiorVat = parseFloat(expenseItemForm.interiorVat) || 0;
      const total = subTotal + vatAmount + exciseVat + interiorVat;

      setExpenseItemForm((prev) => ({
        ...prev,
        expenseCode,
        expenseName: expense.expenseName,
        vatPercent,
        subTotal,
        vatBase,
        vatAmount,
        total,
      }));
    }
  };

  const handleServiceProviderSelect = (providerName: string) => {
    setExpenseItemForm((prev) => ({
      ...prev,
      serviceProvider: providerName,
    }));
  };

  const resetExpenseForm = () => {
    setExpenseItemForm({
      expenseCode: "",
      expenseName: "",
      serviceProvider: "",
      qty: "",
      rate: "",
      subTotal: 0,
      vatBase: 0,
      vatPercent: 0,
      vatAmount: 0,
      exciseVat: "",
      interiorVat: "",
      total: 0,
      documentNo: "",
      documentDate: "",
      remarks: "",
    });
    setEditingExpenseIndex(null);
  };

  const handleSaveExpenseItem = () => {
    // Validate required fields
    if (
      !expenseItemForm.expenseCode ||
      !expenseItemForm.serviceProvider ||
      !expenseItemForm.qty ||
      !expenseItemForm.rate
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const newExpenseItem: ExpenseItem = {
      id:
        editingExpenseIndex !== null
          ? expenses[editingExpenseIndex].id
          : Date.now().toString(),
      expenseCode: expenseItemForm.expenseCode,
      expenseName: expenseItemForm.expenseName,
      serviceProvider: expenseItemForm.serviceProvider,
      qty: parseFloat(expenseItemForm.qty),
      rate: parseFloat(expenseItemForm.rate),
      documentNo: expenseItemForm.documentNo,
      documentDate: expenseItemForm.documentDate,
      subTotal: expenseItemForm.subTotal,
      vatBaseAmount: expenseItemForm.vatBase,
      remarks: expenseItemForm.remarks,
      vatPercent: expenseItemForm.vatPercent,
      vatAmount: expenseItemForm.vatAmount,
      exciseVatAmount: parseFloat(expenseItemForm.exciseVat) || 0,
      interiorVat: parseFloat(expenseItemForm.interiorVat) || 0,
      total: expenseItemForm.total,
      isFromAPI: false,
    };

    if (editingExpenseIndex !== null) {
      // Update existing item
      const updatedItems = [...expenses];
      updatedItems[editingExpenseIndex] = newExpenseItem;
      setExpenses(updatedItems);
      setExpenseItems(updatedItems);
    } else {
      // Add new item
      const newItems = [...expenses, newExpenseItem];
      setExpenses(newItems);
      setExpenseItems(newItems);
    }

    setShowExpenseForm(false);
    resetExpenseForm();
  };

  const handleCancelExpenseForm = () => {
    setShowExpenseForm(false);
    resetExpenseForm();
  };

  const addExpenseItem = () => {
    resetExpenseForm();
    setShowExpenseForm(true);
  };

  // Handle expense field changes for display items
  const handleExpenseFieldChange = (
    itemId: string,
    field: string,
    value: string
  ) => {
    const updateFunction = (prev: ExpenseItem[]) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        const updatedItem = {
          ...item,
          [field]:
            field === "qty" || field === "rate"
              ? parseFloat(value) || 0
              : value,
        };

        // Recalculate when qty or rate changes
        if (field === "qty" || field === "rate") {
          const subTotal = updatedItem.qty * updatedItem.rate;
          updatedItem.subTotal = subTotal;
          updatedItem.vatBaseAmount = updatedItem.vatBaseAmount || subTotal;
          updatedItem.vatAmount =
            (updatedItem.vatBaseAmount * (updatedItem.vatPercent || 0)) / 100;
          updatedItem.total =
            subTotal +
            updatedItem.vatAmount +
            (updatedItem.exciseVatAmount || 0) +
            (updatedItem.interiorVat || 0);
        }

        // Recalculate when VAT base changes
        if (field === "vatBaseAmount") {
          updatedItem.vatBaseAmount = parseFloat(value) || 0;
          updatedItem.vatAmount =
            (updatedItem.vatBaseAmount * (updatedItem.vatPercent || 0)) / 100;
          updatedItem.total =
            updatedItem.subTotal +
            updatedItem.vatAmount +
            (updatedItem.exciseVatAmount || 0) +
            (updatedItem.interiorVat || 0);
        }

        // Recalculate when VAT amount changes
        if (field === "vatAmount") {
          updatedItem.vatAmount = parseFloat(value) || 0;
          updatedItem.total =
            updatedItem.subTotal +
            updatedItem.vatAmount +
            (updatedItem.exciseVatAmount || 0) +
            (updatedItem.interiorVat || 0);
        }

        // Recalculate when excise or interior VAT changes
        if (field === "exciseVatAmount" || field === "interiorVat") {
          updatedItem[field] = parseFloat(value) || 0;
          updatedItem.total =
            updatedItem.subTotal +
            updatedItem.vatAmount +
            (updatedItem.exciseVatAmount || 0) +
            (updatedItem.interiorVat || 0);
        }

        return updatedItem;
      });
    
    setExpenses(updateFunction);
    setExpenseItems(updateFunction);
  };

  // Handle expense code change for display items
  const handleExpenseCodeChange = (itemId: string, newExpenseCode: string) => {
    const expense = expenseList.find((e) => e.expenseCode === newExpenseCode);
    if (expense) {
      const updateFunction = (prev: ExpenseItem[]) =>
        prev.map((item) => {
          if (item.id !== itemId) return item;

          const vatPercent = parseFloat(expense.taxRate) || 0;
          const subTotal = item.qty * item.rate;
          const vatBase = subTotal;
          const vatAmount = vatBase * (vatPercent / 100);
          const total =
            subTotal +
            vatAmount +
            (item.exciseVatAmount || 0) +
            (item.interiorVat || 0);

          return {
            ...item,
            expenseCode: newExpenseCode,
            expenseName: expense.expenseName,
            vatPercent,
            subTotal,
            vatBaseAmount: vatBase,
            vatAmount,
            total,
          };
        });
      
      setExpenses(updateFunction);
      setExpenseItems(updateFunction);
    }
  };

  // Handle service provider change for display items
  const handleServiceProviderChange = (
    itemId: string,
    newServiceProvider: string
  ) => {
    const updateFunction = (prev: ExpenseItem[]) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, serviceProvider: newServiceProvider }
          : item
      );
    
    setExpenses(updateFunction);
    setExpenseItems(updateFunction);
  };

  // Handle final submission
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitProgress(0);

    try {
      // Simulate progress steps
      const progressSteps = [
        { progress: 20, message: "Preparing PST data..." },
        { progress: 40, message: "Calculating totals..." },
        { progress: 60, message: "Validating documents..." },
        { progress: 80, message: "Submitting to system..." },
        { progress: 100, message: "PST completed successfully!" },
      ];

      for (const step of progressSteps) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        setSubmitProgress(step.progress);
      }

      // Calculate totals
      const totalAmount = expenseItems.reduce(
        (sum, item) => sum + item.total,
        0
      );
      const totalVAT = expenseItems.reduce(
        (sum, item) => sum + item.vatAmount,
        0
      );

      const submissionData = {
        ...headerData,
        ...formData,
        expenseItems,
        totalAmount,
        totalVAT,
        submittedAt: new Date().toISOString(),
      };

      await onSubmit(submissionData);
      setShowSuccess(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitProgress(0);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting PST:", error);
      setIsSubmitting(false);
      setSubmitProgress(0);
    }
  };

  const handleAction = async (action: "save" | "submit") => {
    try {
      setIsSubmitting(true);

      const pswData = {
        action,
        pstReference: pstReferenceData,
        expenses,
        files: uploadedFiles,
        totalSummary,
        submittedAt: new Date().toISOString(),
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
      sender: "shipping",
      senderName: user?.name || "Sangthongsuk Shipping",
      timestamp: new Date(),
      read: true,
      type: "general",
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  const handleMarkMessageAsRead = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg))
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
                              {headerData.etd || "-"}
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
                              {headerData.eta || "-"}
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
                              {headerData.wrDate || "-"}
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
                {/* chaipat */}
                <form onSubmit={handleFinalSubmit} className="space-y-8">
                  {/* Step 2 Information */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-0">
                      <CardTitle className="flex items-center gap-2">
                        <Key className="w-5 h-5 text-amber-600" />
                        PST Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {/* Enhanced Ref Key and Payment Date Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                        <div className="space-y-2" style={{ display: "none" }}>
                          <Label
                            htmlFor="refKey"
                            className="text-sm font-medium text-gray-700"
                          >
                            Ref Key <span className="text-red-500">*</span>
                            {pswWebSeqId && (
                              <span className="text-xs text-gray-500 ml-2">
                                (From API webSeqID)
                              </span>
                            )}
                          </Label>
                          <Input
                            id="refKey"
                            placeholder={
                              pswWebSeqId
                                ? "Auto-filled from API"
                                : "Enter reference key"
                            }
                            value={formData.refKey}
                            onChange={(e) =>
                              handleInputChange("refKey", e.target.value)
                            }
                            required
                            className={`border-amber-200 focus:border-amber-500 transition-colors duration-200 ${
                              pswWebSeqId ? "bg-gray-50 text-gray-700" : ""
                            }`}
                            disabled={pswWebSeqId ? true : isSubmitting}
                            readOnly={pswWebSeqId ? true : false}
                          />
                          {pswWebSeqId && formData.refKey && (
                            <p className="text-xs text-gray-500 mt-1">
                              This value is automatically set from API webSeqID:{" "}
                              {formData.refKey}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Invoice Items Section */}
                      {invoiceItems.length > 0 && (
                        <div className="space-y-4 mt-5">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Invoice Information
                            </h4>
                          </div>

                          {/* Invoice Items Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full border border-gray-200 rounded-lg">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Supplier Code
                                  </th>
                                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Supplier Name
                                  </th>
                                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Invoice No
                                  </th>
                                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reference No
                                  </th>
                                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Transport By
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {invoiceItems.map((item) => (
                                  <tr key={item.id}>
                                    <td className="p-3">
                                      <span className="text-sm font-medium">
                                        {item.supplierCode}
                                      </span>
                                    </td>
                                    <td className="p-3">
                                      <span className="text-sm">
                                        {item.supplierName}
                                      </span>
                                    </td>
                                    <td className="p-3">
                                      <span className="text-sm font-medium">
                                        {item.invoiceNo}
                                      </span>
                                    </td>
                                    <td className="p-3">
                                      <span className="text-sm">
                                        {item.referenceNo}
                                      </span>
                                    </td>
                                    <td className="p-3">
                                      <span className="text-sm">
                                        {item.transportBy}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {invoiceItems.length > 0 && (
                        <Separator className="my-5" />
                      )}

                      {/* Expense Items Section */}
                      <div className="space-y-6 mt-5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            <Calculator className="w-4 h-4" />
                            Expense Items
                          </h4>
                        </div>

                        {/* Add/Edit Expense Item Form */}
                        {showExpenseForm && (
                          <Card className="border-green-200 bg-green-50">
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-600 text-white text-xs">
                                  Expense Item
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-auto h-5 w-5 p-0 text-gray-500 hover:text-gray-700"
                                  onClick={handleCancelExpenseForm}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                              <h3 className="text-base font-medium text-gray-900">
                                {editingExpenseIndex !== null
                                  ? "Edit Expense Item"
                                  : "Add Expense Item"}
                              </h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {/* Row 1: Expense Code and Service Provider */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-gray-700">
                                    Expense Code{" "}
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Select
                                    value={expenseItemForm.expenseCode}
                                    onValueChange={handleExpenseCodeSelect}
                                    disabled={isSubmitting}
                                  >
                                    <SelectTrigger className="h-8 w-full bg-white border-gray-300 text-sm">
                                      <SelectValue placeholder="Select expense code" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {expenseList.map((expense) => (
                                        <SelectItem
                                          key={expense.expenseCode}
                                          value={expense.expenseCode}
                                        >
                                          {expense.expenseName}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-gray-700">
                                    Service Provider{" "}
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        role="combobox"
                                        className="h-8 w-full justify-between bg-white border-gray-300 text-sm"
                                        disabled={isSubmitting}
                                      >
                                        {expenseItemForm.serviceProvider ||
                                          "Select service provider"}
                                        <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                      <Command>
                                        <CommandInput
                                          placeholder="Search..."
                                          className="h-8 border-0 focus:ring-0 text-sm"
                                        />
                                        <CommandEmpty>
                                          No provider found.
                                        </CommandEmpty>
                                        <CommandGroup className="max-h-40 overflow-y-auto">
                                          {serviceProviders.map(
                                            (provider, index) => (
                                              <CommandItem
                                                key={index}
                                                value={provider.name}
                                                className="cursor-pointer text-sm"
                                                onSelect={() =>
                                                  handleServiceProviderSelect(
                                                    provider.name
                                                  )
                                                }
                                              >
                                                <Check
                                                  className={`mr-2 h-3 w-3 ${
                                                    expenseItemForm.serviceProvider ===
                                                    provider.name
                                                      ? "opacity-100"
                                                      : "opacity-0"
                                                  }`}
                                                />
                                                {provider.name}
                                              </CommandItem>
                                            )
                                          )}
                                        </CommandGroup>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>

                              {/* Row 2: Qty, Rate, and Calculated Fields */}
                              <div className="grid grid-cols-2 lg:grid-cols-8 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-gray-700">
                                    Qty <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    type="number"
                                    value={expenseItemForm.qty}
                                    onChange={(e) =>
                                      handleExpenseFormChange(
                                        "qty",
                                        e.target.value
                                      )
                                    }
                                    className="h-8 text-sm"
                                    disabled={isSubmitting}
                                  />
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-gray-700">
                                    Rate <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    type="number"
                                    value={expenseItemForm.rate}
                                    onChange={(e) =>
                                      handleExpenseFormChange(
                                        "rate",
                                        e.target.value
                                      )
                                    }
                                    className="h-8 text-sm"
                                    disabled={isSubmitting}
                                  />
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-gray-700">
                                    Sub Total
                                  </Label>
                                  <Input
                                    value={expenseItemForm.subTotal.toFixed(2)}
                                    readOnly
                                    className="h-8 text-sm bg-gray-100 border-gray-300"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-gray-700">
                                    VAT Base
                                  </Label>
                                  <Input
                                    value={expenseItemForm.vatBase.toFixed(2)}
                                    readOnly
                                    className="h-8 text-sm bg-gray-100 border-gray-300"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-gray-700">
                                    VAT %
                                  </Label>
                                  <Input
                                    value={expenseItemForm.vatPercent.toFixed(
                                      2
                                    )}
                                    readOnly
                                    className="h-8 text-sm bg-gray-100 border-gray-300"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-gray-700">
                                    VAT Amt
                                  </Label>
                                  <Input
                                    value={expenseItemForm.vatAmount.toFixed(2)}
                                    readOnly
                                    className="h-8 text-sm bg-gray-100 border-gray-300"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-gray-700">
                                    Excise VAT
                                  </Label>
                                  <Input
                                    value={expenseItemForm.exciseVat}
                                    onChange={(e) =>
                                      handleExpenseFormChange(
                                        "exciseVat",
                                        e.target.value
                                      )
                                    }
                                    className="h-8 text-sm"
                                    disabled={isSubmitting}
                                  />
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-gray-700">
                                    Interior VAT
                                  </Label>
                                  <Input
                                    value={expenseItemForm.interiorVat}
                                    onChange={(e) =>
                                      handleExpenseFormChange(
                                        "interiorVat",
                                        e.target.value
                                      )
                                    }
                                    className="h-8 text-sm"
                                    disabled={isSubmitting}
                                  />
                                </div>
                              </div>

                              {/* Row 3: Total and Document Info */}
                              <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-gray-700">
                                    Total
                                  </Label>
                                  <Input
                                    value={expenseItemForm.total.toFixed(2)}
                                    readOnly
                                    className="h-8 text-sm bg-gray-100 border-gray-300 font-medium"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-gray-700">
                                    Document No.
                                  </Label>
                                  <Input
                                    value={expenseItemForm.documentNo}
                                    onChange={(e) =>
                                      handleExpenseFormChange(
                                        "documentNo",
                                        e.target.value
                                      )
                                    }
                                    className="h-8 text-sm"
                                    disabled={isSubmitting}
                                  />
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-gray-700">
                                    Document Date
                                  </Label>
                                  <Input
                                    type="date"
                                    value={expenseItemForm.documentDate}
                                    onChange={(e) =>
                                      handleExpenseFormChange(
                                        "documentDate",
                                        e.target.value
                                      )
                                    }
                                    className="h-8 text-sm"
                                    disabled={isSubmitting}
                                  />
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-gray-700">
                                    Remarks
                                  </Label>
                                  <Input
                                    value={expenseItemForm.remarks}
                                    onChange={(e) =>
                                      handleExpenseFormChange(
                                        "remarks",
                                        e.target.value
                                      )
                                    }
                                    className="h-8 text-sm"
                                    disabled={isSubmitting}
                                  />
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={isSubmitting}
                                  className="h-8 px-3 text-sm"
                                  onClick={handleCancelExpenseForm}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="h-8 px-3 bg-gray-800 hover:bg-gray-900 text-white text-sm"
                                  disabled={isSubmitting}
                                  onClick={handleSaveExpenseItem}
                                >
                                  {editingExpenseIndex !== null
                                    ? "Update"
                                    : "Add"}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Add Expense Item Button */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addExpenseItem}
                          disabled={isSubmitting}
                          className="w-full h-10 border-dashed border-gray-300 text-gray-600 hover:text-gray-800 hover:border-gray-400"
                        >
                          <Plus className="w-4 h-4" />
                          Add Item
                        </Button>

                        {/* Expense Items Display as Full Forms */}
                        <div className="space-y-4">
                          {expenseItems.map((item, index) => {
                            const isCollapsed = collapsedItems.has(item.id);
                            return (
                              <Collapsible key={item.id} open={!isCollapsed}>
                                <Card
                                  className={`border ${
                                    item.isFromAPI
                                      ? changedItems.has(item.id)
                                        ? "border-blue-300 bg-blue-50"
                                        : "border-gray-200 bg-white"
                                      : "border-green-200 bg-green-50"
                                  }`}
                                >
                                  <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                      <CollapsibleTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            toggleItemCollapse(item.id)
                                          }
                                          className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                                        >
                                          {isCollapsed ? (
                                            <ChevronRight className="w-4 h-4" />
                                          ) : (
                                            <ChevronDown className="w-4 h-4" />
                                          )}
                                        </Button>
                                      </CollapsibleTrigger>
                                      <h3 className="text-base font-medium text-gray-900 flex-1">
                                        Expense Item #{index + 1}
                                        {item.isFromAPI &&
                                          changedItems.has(item.id) && (
                                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                              Modified
                                            </span>
                                          )}
                                        {isCollapsed && (
                                          <span className="ml-2 text-sm text-gray-500">
                                            (
                                            {item.expenseName ||
                                              item.expenseCode}{" "}
                                            - ฿{item.total.toFixed(2)})
                                          </span>
                                        )}
                                      </h3>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleDeleteClick(item.id)
                                        }
                                        disabled={isSubmitting}
                                        className="h-5 w-5 p-0 text-gray-500 hover:text-gray-700"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </CardHeader>
                                  <CollapsibleContent>
                                    <CardContent className="space-y-4">
                                      {/* Row 1: Expense Code and Service Provider */}
                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                          <Label className="text-xs font-medium text-gray-700">
                                            Expense Code{" "}
                                            <span className="text-red-500">
                                              *
                                            </span>
                                          </Label>
                                          <Select
                                            value={item.expenseCode}
                                            onValueChange={(value) =>
                                              handleExpenseCodeChange(
                                                item.id,
                                                value
                                              )
                                            }
                                            disabled={isSubmitting}
                                          >
                                            <SelectTrigger className="h-8 w-full text-sm bg-white border-gray-300">
                                              <SelectValue placeholder="Select expense code">
                                                {item.expenseName ||
                                                  item.expenseCode}
                                              </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                              {expenseList.map((expense) => (
                                                <SelectItem
                                                  key={expense.expenseCode}
                                                  value={expense.expenseCode}
                                                >
                                                  {expense.expenseName}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        <div className="space-y-1">
                                          <Label className="text-xs font-medium text-gray-700">
                                            Service Provider{" "}
                                            <span className="text-red-500">
                                              *
                                            </span>
                                          </Label>
                                          <Popover>
                                            <PopoverTrigger asChild>
                                              <Button
                                                variant="outline"
                                                role="combobox"
                                                className="h-8 w-full justify-between text-sm bg-white border-gray-300"
                                                disabled={isSubmitting}
                                              >
                                                {item.serviceProvider ||
                                                  "Select service provider"}
                                                <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                                              </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                              <Command>
                                                <CommandInput
                                                  placeholder="Search..."
                                                  className="h-8 border-0 focus:ring-0 text-sm"
                                                />
                                                <CommandEmpty>
                                                  No provider found.
                                                </CommandEmpty>
                                                <CommandGroup className="max-h-40 overflow-y-auto">
                                                  {serviceProviders.map(
                                                    (provider, index) => (
                                                      <CommandItem
                                                        key={index}
                                                        value={provider.name}
                                                        className="cursor-pointer text-sm"
                                                        onSelect={() =>
                                                          handleServiceProviderChange(
                                                            item.id,
                                                            provider.name
                                                          )
                                                        }
                                                      >
                                                        <Check
                                                          className={`mr-2 h-3 w-3 ${
                                                            item.serviceProvider ===
                                                            provider.name
                                                              ? "opacity-100"
                                                              : "opacity-0"
                                                          }`}
                                                        />
                                                        {provider.name}
                                                      </CommandItem>
                                                    )
                                                  )}
                                                </CommandGroup>
                                              </Command>
                                            </PopoverContent>
                                          </Popover>
                                        </div>
                                      </div>

                                      {/* Row 2: Qty, Rate, and Calculated Fields */}
                                      <div className="grid grid-cols-2 lg:grid-cols-8 gap-3">
                                        <div className="space-y-1">
                                          <Label className="text-xs font-medium text-gray-700">
                                            Qty{" "}
                                            <span className="text-red-500">
                                              *
                                            </span>
                                          </Label>
                                          <Input
                                            type="number"
                                            value={item.qty}
                                            onChange={(e) =>
                                              handleExpenseFieldChange(
                                                item.id,
                                                "qty",
                                                e.target.value
                                              )
                                            }
                                            disabled={isSubmitting}
                                            className="h-8 text-sm bg-white border-gray-300"
                                          />
                                        </div>

                                        <div className="space-y-1">
                                          <Label className="text-xs font-medium text-gray-700">
                                            Rate{" "}
                                            <span className="text-red-500">
                                              *
                                            </span>
                                          </Label>
                                          <Input
                                            type="number"
                                            step="0.01"
                                            value={item.rate}
                                            onChange={(e) =>
                                              handleExpenseFieldChange(
                                                item.id,
                                                "rate",
                                                e.target.value
                                              )
                                            }
                                            disabled={isSubmitting}
                                            className="h-8 text-sm bg-white border-gray-300"
                                          />
                                        </div>

                                        <div className="space-y-1">
                                          <Label className="text-xs font-medium text-gray-700">
                                            Sub Total
                                          </Label>
                                          <Input
                                            value={item.subTotal.toFixed(2)}
                                            readOnly
                                            className="h-8 text-sm bg-gray-100 border-gray-300"
                                          />
                                        </div>

                                        <div className="space-y-1">
                                          <Label className="text-xs font-medium text-gray-700">
                                            VAT Base
                                          </Label>
                                          <Input
                                            type="number"
                                            step="0.01"
                                            value={
                                              item.vatBaseAmount?.toFixed(2) ||
                                              "0.00"
                                            }
                                            onChange={(e) =>
                                              handleExpenseFieldChange(
                                                item.id,
                                                "vatBaseAmount",
                                                e.target.value
                                              )
                                            }
                                            disabled={isSubmitting}
                                            className="h-8 text-sm bg-white border-gray-300"
                                          />
                                        </div>

                                        <div className="space-y-1">
                                          <Label className="text-xs font-medium text-gray-700">
                                            VAT %
                                          </Label>
                                          <Input
                                            value={
                                              item.vatPercent?.toFixed(2) ||
                                              "0.00"
                                            }
                                            readOnly
                                            className="h-8 text-sm bg-gray-100 border-gray-300"
                                          />
                                        </div>

                                        <div className="space-y-1">
                                          <Label className="text-xs font-medium text-gray-700">
                                            VAT Amt
                                          </Label>
                                          <Input
                                            type="number"
                                            step="0.01"
                                            value={
                                              item.vatAmount?.toFixed(2) ||
                                              "0.00"
                                            }
                                            onChange={(e) =>
                                              handleExpenseFieldChange(
                                                item.id,
                                                "vatAmount",
                                                e.target.value
                                              )
                                            }
                                            disabled={isSubmitting}
                                            className="h-8 text-sm bg-white border-gray-300"
                                          />
                                        </div>

                                        <div className="space-y-1">
                                          <Label className="text-xs font-medium text-gray-700">
                                            Excise VAT
                                          </Label>
                                          <Input
                                            type="number"
                                            step="0.01"
                                            value={
                                              item.exciseVatAmount?.toFixed(
                                                2
                                              ) || "0.00"
                                            }
                                            onChange={(e) =>
                                              handleExpenseFieldChange(
                                                item.id,
                                                "exciseVatAmount",
                                                e.target.value
                                              )
                                            }
                                            disabled={isSubmitting}
                                            className="h-8 text-sm bg-white border-gray-300"
                                          />
                                        </div>

                                        <div className="space-y-1">
                                          <Label className="text-xs font-medium text-gray-700">
                                            Interior VAT
                                          </Label>
                                          <Input
                                            type="number"
                                            step="0.01"
                                            value={
                                              item.interiorVat?.toFixed(2) ||
                                              "0.00"
                                            }
                                            onChange={(e) =>
                                              handleExpenseFieldChange(
                                                item.id,
                                                "interiorVat",
                                                e.target.value
                                              )
                                            }
                                            disabled={isSubmitting}
                                            className="h-8 text-sm bg-white border-gray-300"
                                          />
                                        </div>
                                      </div>

                                      {/* Row 3: Total and Document Info */}
                                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                                        <div className="space-y-1">
                                          <Label className="text-xs font-medium text-gray-700">
                                            Total
                                          </Label>
                                          <Input
                                            value={item.total.toFixed(2)}
                                            readOnly
                                            className="h-8 text-sm bg-gray-100 border-gray-300 font-medium"
                                          />
                                        </div>

                                        <div className="space-y-1">
                                          <Label className="text-xs font-medium text-gray-700">
                                            Document No.
                                          </Label>
                                          <Input
                                            value={item.documentNo || ""}
                                            onChange={(e) =>
                                              handleExpenseFieldChange(
                                                item.id,
                                                "documentNo",
                                                e.target.value
                                              )
                                            }
                                            disabled={isSubmitting}
                                            className="h-8 text-sm bg-white border-gray-300"
                                          />
                                        </div>

                                        <div className="space-y-1">
                                          <Label className="text-xs font-medium text-gray-700">
                                            Document Date
                                          </Label>
                                          <Input
                                            type="date"
                                            value={
                                              item.documentDate
                                                ? item.documentDate.split(
                                                    "T"
                                                  )[0]
                                                : ""
                                            }
                                            onChange={(e) =>
                                              handleExpenseFieldChange(
                                                item.id,
                                                "documentDate",
                                                e.target.value
                                              )
                                            }
                                            disabled={isSubmitting}
                                            className="h-8 text-sm bg-white border-gray-300"
                                          />
                                        </div>

                                        <div className="space-y-1">
                                          <Label className="text-xs font-medium text-gray-700">
                                            Remarks
                                          </Label>
                                          <Input
                                            value={item.remarks || ""}
                                            onChange={(e) =>
                                              handleExpenseFieldChange(
                                                item.id,
                                                "remarks",
                                                e.target.value
                                              )
                                            }
                                            disabled={isSubmitting}
                                            className="h-8 text-sm bg-white border-gray-300"
                                          />
                                        </div>
                                      </div>

                                      {/* Save Expense Button for editable items or changed API items */}
                                      {(!item.isFromAPI ||
                                        changedItems.has(item.id)) && (
                                        <div className="flex justify-end pt-4 border-t border-gray-200">
                                          <Button
                                            type="button"
                                            size="sm"
                                            onClick={() =>
                                              handleSaveExpenseDisplay(item)
                                            }
                                            disabled={
                                              isSubmitting ||
                                              !item.expenseCode ||
                                              !item.serviceProvider ||
                                              item.qty <= 0 ||
                                              item.rate <= 0
                                            }
                                            className={`text-white text-sm px-4 py-2 ${
                                              item.isFromAPI &&
                                              changedItems.has(item.id)
                                                ? "bg-blue-600 hover:bg-blue-700"
                                                : "bg-green-600 hover:bg-green-700"
                                            }`}
                                          >
                                            {item.isFromAPI &&
                                            changedItems.has(item.id)
                                              ? "Update Expense"
                                              : "Save Expense"}
                                          </Button>
                                        </div>
                                      )}
                                    </CardContent>
                                  </CollapsibleContent>
                                </Card>
                              </Collapsible>
                            );
                          })}
                        </div>

                        {/* Totals Summary */}
                        <div className="flex justify-end">
                          <div className="bg-gray-50 rounded-lg p-4 min-w-64">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Subtotal:</span>
                                <span>฿{totalSubTotal.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>VAT (7%):</span>
                                <span>฿{totalVATAmount.toLocaleString()}</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between font-medium">
                                <span>Total:</span>
                                <span>฿{grandTotal.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Add Expense Item Button at Bottom */}
                        <div className="pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addExpenseItem}
                            disabled={isSubmitting}
                            className="w-full h-10 border-dashed border-gray-300 text-gray-600 hover:text-gray-800 hover:border-gray-400"
                          >
                            <Plus className="w-4 h-4" />
                            Add Item
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Form Actions */}
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
                      disabled={!isFormValid() || isSubmitting}
                      className="min-w-40 relative overflow-hidden"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <LoadingSpinner
                            size="sm"
                            className="border-white border-t-white/50"
                          />
                          <span>Submitting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>Submit PST Request</span>
                          <FileText className="w-4 h-4" />
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
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {showSuccess
                              ? "PST Created Successfully!"
                              : "Creating PST Request"}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            {showSuccess
                              ? "Your PST request has been submitted successfully."
                              : "Please wait while we process your request..."}
                          </p>
                          <ProgressBar
                            progress={submitProgress}
                            showPercentage={true}
                            animated={true}
                            color={showSuccess ? "bg-green-600" : "bg-blue-600"}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </form>
                {/* chaipat */}

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
                        <Label className="text-xs font-medium text-gray-700">
                          Items ({expenses.length})
                        </Label>
                        <div className="max-h-24 overflow-y-auto space-y-1">
                          {expenses.map((expense, index) => (
                            <div
                              key={expense.id}
                              className="flex items-center justify-between text-xs p-1.5 bg-gray-50 rounded"
                            >
                              <span className="text-gray-600">
                                Item #{index + 1}
                              </span>
                              <span className="font-medium">
                                {expense.total.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Summary Totals */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Sub Total</span>
                          <span className="font-medium">
                            {totalSummary.subTotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">VAT Amount</span>
                          <span className="font-medium">
                            {totalSummary.vatAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Excise VAT</span>
                          <span className="font-medium">
                            {totalSummary.exciseVatAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Interior VAT</span>
                          <span className="font-medium">
                            {totalSummary.interiorVat.toFixed(2)}
                          </span>
                        </div>

                        <Separator />

                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-900 text-sm">
                            Grand Total
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            {(totalSummary.total || 0).toFixed(2)}{" "}
                            {pstReferenceData.currency || "THB"}
                          </span>
                        </div>
                      </div>

                      {/* Quick Actions in Summary */}
                      <div className="pt-3 border-t border-gray-200 space-y-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => handleAction("save")}
                          disabled={isSubmitting}
                        >
                          Save Draft
                        </Button>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleAction("submit")}
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
