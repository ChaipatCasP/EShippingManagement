import React, { useState, useEffect } from "react";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";

// Icons
import {
  X,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  FileText,
  Calculator,
  DollarSign,
  Building,
  Package2,
  FileDigit,
  Key,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Check,
  MapPin,
} from "lucide-react";

// Custom Components & Types
import { CommunicationPanel, CommunicationMessage } from "./CommunicationPanel";
import { SaveExpenseRequest } from "../api/types";
import {
  pstService,
  type ExpenseListItem,
  type ServiceProviderItem,
} from "../api/services/pstService";

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface ExpenseItem {
  id: string;
  rowId?: string;
  expenseCode: string;
  expenseName?: string;
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
  isFromAPI?: boolean;
}

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

interface InvoiceItem {
  id: string;
  supplierCode: string;
  supplierName: string;
  invoiceNo: string;
  referenceNo: string;
  transportBy: string;
}

interface CreatePSWFormProps {
  pswWebSeqId?: number; // Add this for Update PST functionality
  dashboardHeaderData?: HeaderData; // Optional header data from dashboard
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export function CreatePSWForm({
  pswWebSeqId,
  dashboardHeaderData,
  onClose,
  onSubmit,
}: CreatePSWFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirmDialog, setShowSubmitConfirmDialog] = useState(false);

  const [uploadedFiles] = useState<File[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  // PST Details specific state
  const [expenseList, setExpenseList] = useState<ExpenseListItem[]>([]);
  const [serviceProviders, setServiceProviders] = useState<
    ServiceProviderItem[]
  >([]);
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());

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
    invoiceDate: dashboardHeaderData?.invoiceDate || "",
    awbNo: dashboardHeaderData?.awbNo || "",
    importEntryNo: dashboardHeaderData?.importEntryNo || "",
    portOfOrigin: dashboardHeaderData?.portOfOrigin || "",
    portOfDestination: dashboardHeaderData?.portOfDestination || "",
    status: (dashboardHeaderData?.status || "") as "Single" | "Multiple" | "",
    pstBook: dashboardHeaderData?.pstBook || "",
    pstNo: dashboardHeaderData?.pstNo || "",
    vesselName: dashboardHeaderData?.vesselName || "",
    referenceCode: dashboardHeaderData?.referenceCode || "",
    taxIdNo: "",
    paymentTerm: "",
  });

  // Additional missing state variables
  const [submitProgress, setSubmitProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state for PSW Details
  const [formData, setFormData] = useState({
    refKey: "",
    requestPaymentDate: "",
    message: "",
    messageSaved: false,
    messageEditMode: false,
    remarks: "",
  });
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [changedItems, setChangedItems] = useState<Set<string>>(new Set());

  // Load expense list and service providers from API
  const loadExpenseList = async () => {
    try {
      const response = await pstService.getExpenseList("Y");
      console.log("📥 Expense list API response:", response);
      if (!response.error && response.data) {
        setExpenseList(response.data);
      } else {
        console.error("❌ Expense list API returned error:", response);
      }
    } catch (error) {
      console.error("❌ Error loading expense list:", error);
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

  useEffect(() => {
    // Check URL parameters first
    const url = new URL(window.location.href);
    const pswWebSeqIdFromUrl = url.searchParams.get("pswWebSeqId");

    if (pswWebSeqIdFromUrl) {
      const id = parseInt(pswWebSeqIdFromUrl);
      if (!isNaN(id)) {
        loadPSTDetails(id);
      }
    } else if (pswWebSeqId) {
      loadPSTDetails(pswWebSeqId);
    }
  }, [pswWebSeqId]);

  useEffect(() => {
    console.log("dashboardHeaderData : chaipat ", dashboardHeaderData);

    // Only initialize if we don't have pstWebSeqId (no API data expected)
    if (!pswWebSeqId && expenseItems.length === 0) {
      // Only set default header data if no dashboard data was provided
      if (!dashboardHeaderData) {
        setHeaderData({
          supplierName: "",
          poBook: "",
          poNo: "",
          poDate: "",
          etd: "",
          eta: "",
          wrDate: "",
          invoiceNo: "",
          invoiceDate: "",
          awbNo: "",
          importEntryNo: "",
          portOfOrigin: "",
          portOfDestination: "",
          status: "",
          pstBook: "",
          pstNo: "",
          vesselName: "",
          referenceCode: "",
          taxIdNo: "",
          paymentTerm: "",
        });
      }
    }
  }, [pswWebSeqId, expenseItems.length, dashboardHeaderData]);

  // Update headerData when dashboardHeaderData changes
  useEffect(() => {
    if (dashboardHeaderData) {
      setHeaderData((prev) => ({
        ...prev,
        supplierName: dashboardHeaderData.supplierName || prev.supplierName,
        poBook: dashboardHeaderData.poBook || prev.poBook,
        poNo: dashboardHeaderData.poNo || prev.poNo,
        poDate: dashboardHeaderData.poDate || prev.poDate,
        etd: dashboardHeaderData.etd || prev.etd,
        eta: dashboardHeaderData.eta || prev.eta,
        wrDate: dashboardHeaderData.wrDate || prev.wrDate,
        invoiceNo: dashboardHeaderData.invoiceNo || prev.invoiceNo,
        invoiceDate: dashboardHeaderData.invoiceDate || prev.invoiceDate,
        awbNo: dashboardHeaderData.awbNo || prev.awbNo,
        importEntryNo: dashboardHeaderData.importEntryNo || prev.importEntryNo,
        portOfOrigin: dashboardHeaderData.portOfOrigin || prev.portOfOrigin,
        portOfDestination:
          dashboardHeaderData.portOfDestination || prev.portOfDestination,
        status: (dashboardHeaderData.status || prev.status) as
          | "Single"
          | "Multiple"
          | "",
        pstBook: dashboardHeaderData.pstBook || prev.pstBook,
        pstNo: dashboardHeaderData.pstNo || prev.pstNo,
        vesselName: dashboardHeaderData.vesselName || prev.vesselName,
        referenceCode: dashboardHeaderData.referenceCode || prev.referenceCode,
      }));
    }
  }, [dashboardHeaderData]);

  const loadPSTDetails = async (webSeqId?: number) => {
    const idToUse = webSeqId || pswWebSeqId;
    if (!idToUse) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await pstService.getPSTDetails(idToUse);

      if (!response.error && response.data) {
        const data = response.data;
        console.log("API Response Data:", {
          invoiceDate: data.invoiceDate,
          contactPerson: data.contactPerson,
          awbNo: data.awbNo,
          currency: data.currency,
          eta: data.eta,
          webSeqID: data.webSeqID,
          requestPaymentDateTime: data.requestPaymentDateTime,
        });

        // Update header data with API response, but prefer dashboard data for supplier info
        setHeaderData({
          // Prefer dashboard supplier name, fallback to API if not available
          supplierName: dashboardHeaderData?.supplierName || "",
          poBook: dashboardHeaderData?.poBook || "",
          poNo: dashboardHeaderData?.poNo || "",
          poDate: dashboardHeaderData?.poDate || "",
          etd: dashboardHeaderData?.etd || "",
          eta: dashboardHeaderData?.eta || "",
          wrDate: dashboardHeaderData?.wrDate || "",
          invoiceNo: dashboardHeaderData?.invoiceNo || "",
          invoiceDate: dashboardHeaderData?.invoiceDate || "",
          awbNo: dashboardHeaderData?.awbNo || "",
          importEntryNo: dashboardHeaderData?.importEntryNo || "",
          portOfOrigin: dashboardHeaderData?.portOfOrigin || "",
          portOfDestination: dashboardHeaderData?.portOfDestination || "",
          status: dashboardHeaderData?.status
            ? ("Multiple" as const)
            : ("Single" as const),
          pstBook: dashboardHeaderData?.pstBook || data.poBook || "",
          pstNo:
            dashboardHeaderData?.pstNo ||
            (data.poNo !== undefined && data.poNo !== null
              ? String(data.poNo)
              : "") ||
            "",
          vesselName: data.vesselName || "",
          referenceCode: "",
          taxIdNo: "",
          paymentTerm: data.paymentTerm || "",
        });

        // Update form data with API response
        setFormData((prev) => ({
          ...prev,
          requestPaymentDate: data.requestPaymentDateTime
            ? data.requestPaymentDateTime.split("T")[0]
            : prev.requestPaymentDate || "",
        }));

        // Set original data for comparison

        // Convert expenseList to ExpenseItem format
        const convertedExpenses: ExpenseItem[] = data.expenseList.map(
          (expense, index) => ({
            id: expense.rowId || (index + 1).toString(),
            rowId: expense.rowId, // Store API rowId for delete operation
            expenseCode: expense.expenseCode,
            expenseName: expense.expenseName,
            serviceProvider: expense.serviceProvider,
            qty: expense.qty,
            rate: expense.rate,
            documentNo: expense.documentNo || "",
            documentDate: expense.documentDate || "",
            subTotal: expense.subTotal,
            vatBaseAmount: expense.vatBase,
            remarks: expense.remarks || "",
            vatPercent: expense.vatPercent,
            vatAmount: expense.vatAmount,
            exciseVatAmount: expense.exciseVat,
            interiorVat: expense.interiorVat,
            total: expense.totalAmount,
            isFromAPI: true, // Mark as coming from API
          })
        );

        // Convert invoiceList to InvoiceItem format
        const convertedInvoices: InvoiceItem[] = data.invoiceList.map(
          (invoice, index) => ({
            id: (index + 1).toString(),
            supplierCode: invoice.supplierCode,
            supplierName: invoice.supplierName,
            invoiceNo: invoice.invoiceNo,
            referenceNo: invoice.referenceNo,
            transportBy: invoice.transportBy,
          })
        );

        setExpenseItems(convertedExpenses);
        setInvoiceItems(convertedInvoices);

        // Collapse all expense items from API data
        if (convertedExpenses.length > 0) {
          console.log("📁 Collapsing all expense items from API");
          const allItemIds = new Set(convertedExpenses.map((item) => item.id));
          setCollapsedItems(allItemIds);
        }

        // Clear any existing changed items when loading fresh data
        setChangedItems(new Set());

        // Set form data with webSeqID as Ref Key
        console.log("🔑 About to set Ref Key to:", data.webSeqID);
        setFormData((prev) => {
          const newFormData = {
            ...prev,
            refKey: data.webSeqID.toString(), // Set Ref Key from webSeqID
            requestPaymentDate:
              data.requestPaymentDateTime?.split("T")[0] || "",
          };
          console.log("📝 New form data:", newFormData);
          return newFormData;
        });

        console.log("✅ PST Details loaded successfully");
        console.log("🔑 Ref Key set to webSeqID:", data.webSeqID);
      } else {
        console.error("❌ API returned error or no data:", response);
      }
    } catch (error) {
      console.error("❌ Error loading PST details:", error);
      console.error("❌ Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
      });
    } finally {
      setIsSubmitting(false);
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

  // Additional calculated values from expenseItems
  const totalSubTotal = expenseItems.reduce(
    (sum, item) => sum + (item.subTotal || 0),
    0
  );
  const totalVATAmount = expenseItems.reduce(
    (sum, item) => sum + (item.vatAmount || 0),
    0
  );
  const grandTotal = expenseItems.reduce(
    (sum, item) => sum + (item.total || 0),
    0
  );

  // Missing function definitions
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle save expense for display items
  const handleSaveExpenseDisplay = async (item: ExpenseItem) => {
    // Validate required fields
    if (
      !item.expenseCode ||
      !item.serviceProvider ||
      item.qty <= 0 ||
      item.rate <= 0
    ) {
      alert(
        "Please fill in all required fields (Expense Code, Service Provider, Qty, Rate)"
      );
      return;
    }

    // Confirm before saving
    const confirmed = window.confirm("Do you want to save this expense item?");
    if (!confirmed) {
      return;
    }

    try {
      // Prepare API request data
      const expenseData: SaveExpenseRequest = {
        webSeqId: pswWebSeqId || 152039978, // Use provided webSeqId or fallback
        podRowId: item.rowId || "",
        productCode: item.expenseCode,
        serviceProvider: item.serviceProvider,
        qty: item.qty,
        rate: item.rate,
        vatBaseAmount: item.vatBaseAmount || 0,
        vatPercent: item.vatPercent || 0,
        vatAmount: item.vatAmount || 0,
        exciseVatAmount: item.exciseVatAmount || 0,
        interiorVatAmount: item.interiorVat || 0,
        total: item.total,
        documentNo: item.documentNo || "",
        documentDate: item.documentDate ? item.documentDate.split("T")[0] : "",
        remarks: item.remarks || "",
      };

      console.log("💾 Saving expense item:", expenseData);

      // Call API
      const response = await pstService.saveExpenseItem(expenseData);

      if (
        !response.error &&
        response.data &&
        response.data[0]?.STATUS === "Saved Succssfully"
      ) {
        alert("Expense item saved successfully!");
        console.log("✅ Save response:", response);

        // Remove item from changed items set
        setChangedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(item.id);
          return newSet;
        });

        // Optionally reload the PST details to get updated data
        if (pswWebSeqId) {
          loadPSTDetails();
        }
      } else {
        alert("Failed to save expense item. Please try again.");
        console.error("❌ Save failed:", response);
      }
    } catch (error) {
      console.error("❌ Error saving expense item:", error);
      alert("An error occurred while saving. Please try again.");
    }
  };

  // Validation
  const isFormValid = () => {
    return (
      formData.refKey.trim() !== "" &&
      formData.requestPaymentDate !== "" &&
      expenseItems.length > 0 &&
      expenseItems.every(
        (item) =>
          item.expenseCode !== "" &&
          item.serviceProvider !== "" &&
          item.qty > 0 &&
          item.rate > 0
      )
    );
  };

  // LoadingSpinner component
  const LoadingSpinner = ({
    size = "sm",
    className = "",
  }: {
    size?: "sm" | "lg";
    className?: string;
  }) => (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 ${
        size === "lg" ? "h-6 w-6" : "h-4 w-4"
      } ${className}`}
    />
  );

  // ProgressBar component
  const ProgressBar = ({
    progress,
    showPercentage = false,
    animated = true,
    color = "bg-blue-600",
  }: {
    progress: number;
    showPercentage?: boolean;
    animated?: boolean;
    color?: string;
  }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full ${
          animated ? "transition-all duration-300" : ""
        } ${color}`}
        style={{ width: `${progress}%` }}
      />
      {showPercentage && (
        <div className="text-sm text-center mt-1">{Math.round(progress)}%</div>
      )}
    </div>
  );

  // PST Details expense form handlers

  const addExpenseItem = () => {
    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      expenseCode: "",
      serviceProvider: "",
      qty: 1,
      rate: 0,
      documentNo: "",
      documentDate: "",
      subTotal: 0,
      vatBaseAmount: 0,
      remarks: "",
      vatPercent: 0, // เริ่มต้นที่ 0
      vatAmount: 0,
      exciseVatAmount: 0,
      interiorVat: 0,
      total: 0,
    };
    setExpenseItems([...expenseItems, newItem]);
  };

  const removeExpenseItem = async (id: string) => {
    const itemToRemove = expenseItems.find((item) => item.id === id);
    console.log("itemToRemove XXX", itemToRemove);
    if (itemToRemove?.isFromAPI && itemToRemove.rowId && pswWebSeqId) {
      // If item is from API, call DELETE API
      try {
        console.log("🗑️ Deleting expense via API:", {
          webSeqId: pswWebSeqId,
          rowId: itemToRemove.rowId,
        });
        const response = await pstService.deleteExpense(
          pswWebSeqId,
          itemToRemove.rowId
        );

        if (!response.error) {
          console.log("✅ Expense deleted successfully from API");
          // Remove from local state after successful API call
          setExpenseItems(expenseItems.filter((item) => item.id !== id));
        } else {
          console.error(
            "❌ Failed to delete expense from API:",
            response.message
          );
          alert("Failed to delete expense: " + response.message);
        }
      } catch (error) {
        console.error("❌ Error deleting expense:", error);
        alert("Error deleting expense. Please try again.");
      }
    } else {
      // If item is local (newly added), just remove from state
      console.log("🗑️ Removing local expense item:", id);
      setExpenseItems(expenseItems.filter((item) => item.id !== id));
    }
  };

  const handleDeleteClick = async (itemId: string) => {
    const confirmed = window.confirm("คุณต้องการลบรายการนี้หรือไม่?");
    if (!confirmed) return;

    await removeExpenseItem(itemId);
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
    // Show confirmation dialog for submit action
    if (action === "submit") {
      setShowSubmitConfirmDialog(true);
      return;
    }

    // Handle save action directly
    await executeAction(action);
  };

  const executeAction = async (action: "save" | "submit") => {
    try {
      setIsSubmitting(true);

      if (action === "submit") {
        // Call submitBill API when Submit Bill is clicked
        if (!pswWebSeqId) {
          throw new Error("PSW Web Sequence ID is required for submission");
        }

        console.log("🚀 Submitting bill with pswWebSeqId:", pswWebSeqId);
        const result = await pstService.submitBill(pswWebSeqId.toString());
        
        if (result.error) {
          throw new Error(result.message || "Failed to submit bill");
        }

        console.log("✅ Bill submitted successfully:", result);
        
        // Show success message or redirect
        alert("บิลถูกส่งเรียบร้อยแล้ว");
        
        // Call the original onSubmit to handle any additional logic (like closing the form)
        const pswData = {
          action,
          expenses: expenseItems,
          files: uploadedFiles,
          totalSummary: {
            subTotal: totalSubTotal,
            vatAmount: totalVATAmount,
            exciseVatAmount: expenseItems.reduce(
              (sum, item) => sum + (item.exciseVatAmount || 0),
              0
            ),
            interiorVat: expenseItems.reduce(
              (sum, item) => sum + (item.interiorVat || 0),
              0
            ),
            total: grandTotal,
          },
          submittedAt: new Date().toISOString(),
          submitBillResult: result,
        };

        await onSubmit(pswData);
      } else {
        // Handle save action
        const pswData = {
          action,
          expenses: expenseItems, // Use expenseItems instead of expenses
          files: uploadedFiles,
          totalSummary: {
            subTotal: totalSubTotal,
            vatAmount: totalVATAmount,
            exciseVatAmount: expenseItems.reduce(
              (sum, item) => sum + (item.exciseVatAmount || 0),
              0
            ),
            interiorVat: expenseItems.reduce(
              (sum, item) => sum + (item.interiorVat || 0),
              0
            ),
            total: grandTotal,
          },
          submittedAt: new Date().toISOString(),
        };

        await onSubmit(pswData);
      }
    } catch (error) {
      console.error(`Error ${action}ing PSW:`, error);
      
      // Show user-friendly error message
      if (error instanceof Error) {
        alert(`เกิดข้อผิดพลาด: ${error.message}`);
      } else {
        alert(`ไม่สามารถ${action === "submit" ? "ส่งบิล" : "บันทึก"}ได้ กรุณาลองใหม่อีกครั้ง`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    const newMessage: CommunicationMessage = {
      id: Date.now().toString(),
      content: message,
      sender: "shipping",
      senderName: "TEST : Sangthongsuk Shipping",
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
                                Warehouse Receive Date
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
                        {/* First row - Invoice & AWB */}
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
                              <span className="text-gray-600">B/L:</span>
                              <span className="font-medium text-gray-900">
                                {headerData.awbNo}
                              </span>
                            </div>
                          )}
                          {headerData.importEntryNo && (
                            <div className="flex items-center gap-2">
                              <FileDigit className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                Import Entry:
                              </span>
                              <span className="font-medium text-gray-900">
                                {headerData.importEntryNo}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Second row - Vessel & Route */}
                        {(headerData.vesselName ||
                          headerData.portOfOrigin ||
                          headerData.portOfDestination) && (
                          <div className="flex items-center gap-6 text-sm">
                            {headerData.vesselName && (
                              <div className="flex items-center gap-2">
                                <Package2 className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">Vessel:</span>
                                <span className="font-medium text-gray-900">
                                  {headerData.vesselName}
                                </span>
                              </div>
                            )}
                            {(headerData.portOfOrigin ||
                              headerData.portOfDestination) && (
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-600">From:</span>
                                  <span className="font-medium text-gray-800">
                                    {headerData.portOfOrigin || "?"}
                                  </span>
                                </div>
                                <ArrowRight className="w-3 h-3 text-gray-400" />
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-600">To:</span>
                                  <span className="font-medium text-gray-800">
                                    {headerData.portOfDestination || "?"}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
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
                    <Separator className="my-0" />

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
                  user={{ email: "test@example.com", name: "Test User" }}
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
                          Items ({expenseItems.length})
                        </Label>
                        {/* <div className="max-h-24 overflow-y-auto space-y-1">
                          {expenseItems.map((expense, index) => (
                            <div
                              key={expense.id}
                              className="flex items-center justify-between text-xs p-1.5 bg-gray-50 rounded"
                            >
                              <span className="text-gray-600">
                                {expense.expenseName || expense.expenseCode || `Item #${index + 1}`}
                              </span>
                              <span className="font-medium">
                                ฿{expense.total.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div> */}
                      </div>

                      <Separator />

                      {/* Summary Totals */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Sub Total</span>
                          <span className="font-medium">
                            ฿{totalSubTotal.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">VAT Amount</span>
                          <span className="font-medium">
                            ฿{totalVATAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Excise VAT</span>
                          <span className="font-medium">
                            ฿
                            {expenseItems
                              .reduce(
                                (sum, item) =>
                                  sum + (item.exciseVatAmount || 0),
                                0
                              )
                              .toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Interior VAT</span>
                          <span className="font-medium">
                            ฿
                            {expenseItems
                              .reduce(
                                (sum, item) => sum + (item.interiorVat || 0),
                                0
                              )
                              .toLocaleString()}
                          </span>
                        </div>

                        <Separator />

                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-900 text-sm">
                            Grand Total
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            ฿{grandTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Quick Actions in Summary */}
                      <div className="pt-3 border-t border-gray-200 space-y-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => handleAction("submit")}
                          disabled={isSubmitting}
                        >
                          Submit Bill
                        </Button>
                        {/* <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleAction("save")}
                          disabled={isSubmitting}
                        >
                          save
                        </Button> */}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Bill Confirmation Dialog */}
      <AlertDialog open={showSubmitConfirmDialog} onOpenChange={setShowSubmitConfirmDialog}>
        <AlertDialogContent className="max-w-lg bg-white">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-gray-900">ยืนยันการส่งบิล</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 text-base leading-relaxed">
              คุณต้องการส่งบิลหรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {/* Bill Summary */}
          <div className="my-6">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
              <h4 className="font-medium text-gray-900 text-sm mb-3">รายละเอียดการส่งบิล</h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">จำนวนรายการ:</span>
                  <span className="font-medium text-gray-900">{expenseItems.length} รายการ</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">ยอดรวมทั้งสิ้น:</span>
                  <span className="font-bold text-lg text-green-600">
                    ฿{grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                {pswWebSeqId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">PSW ID:</span>
                    <span className="font-medium text-gray-900">{pswWebSeqId}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 text-amber-600 mt-0.5">⚠️</div>
                <p className="text-sm text-amber-800">
                  หลังจากส่งบิลแล้ว จะไม่สามารถแก้ไขหรือยกเลิกได้
                </p>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel 
              onClick={() => setShowSubmitConfirmDialog(false)}
              className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowSubmitConfirmDialog(false);
                executeAction("submit");
              }}
              className="flex-1 bg-orange-600 text-white hover:bg-orange-700 font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>กำลังส่ง...</span>
                </div>
              ) : (
                "ยืนยันส่งบิล"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
