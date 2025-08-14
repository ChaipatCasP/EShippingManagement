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
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { LoadingSpinner, ProgressBar } from "./ui/loading";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
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
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  X,
  ArrowLeft,
  Building,
  FileText,
  CheckCircle,
  Plus,
  Trash2,
  Calculator,
  MessageSquare,
  Key,
  Check,
  ChevronsUpDown,
  ChevronDown,
  ChevronRight,
  Package2,
  MapPin,
  ArrowRight,
  FileDigit,
} from "lucide-react";
import {
  pstService,
  type ExpenseListItem,
  type ServiceProviderItem,
  type SaveExpenseRequest,
} from "../api/services/pstService";

interface ExpenseItem {
  id: string;
  rowId?: string; // API rowId for expense from API
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
  isFromAPI?: boolean; // Flag to indicate if this item came from API
}

interface InvoiceItem {
  id: string;
  supplierCode: string;
  supplierName: string;
  invoiceNo: string;
  referenceNo: string;
  transportBy: string;
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
}

interface CreatePSTFormProps {
  createdPSTNumber?: string | null;
  pstWebSeqId?: number; // Add this for Update PST functionality
  dashboardHeaderData?: HeaderData; // Optional header data from dashboard
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export function CreatePSTForm({
  createdPSTNumber,
  pstWebSeqId,
  dashboardHeaderData,
  onClose,
  onSubmit,
}: CreatePSTFormProps) {
  console.log("🚀 CreatePSTForm initialized with props:", {
    createdPSTNumber,
    pstWebSeqId,
    dashboardHeaderData,
  });

  // No step management - single form only
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state for PST Details
  const [formData, setFormData] = useState({
    refKey: "",
    requestPaymentDate: "",
    message: "",
    messageSaved: false,
    messageEditMode: false,
  });

  // Step 1 data from parent component (pre-filled) - use dashboard data when available
  const [step1Data, setStep1Data] = useState({
    invoiceNo: dashboardHeaderData?.invoiceNo || "INV-TH-2024-1205-0001",
    contactPerson: "วรัญญา มิติปัญญา",
    supplierName: dashboardHeaderData?.supplierName || "Global Foods Ltd.",
    transportMode: "Sea Freight",
    importEntryNo: dashboardHeaderData?.importEntryNo || "IET-24-001205-0001",
    currency: "THB",
    dueDate: "2024-12-20",
    creditTerm: "30",
  });

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
    status: (dashboardHeaderData?.status || "Single") as "Single" | "Multiple",
    pstBook: dashboardHeaderData?.pstBook || "",
    pstNo: dashboardHeaderData?.pstNo || "",
  });

  // Expense items state - Start empty, will be populated based on API data or default
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);

  // Invoice items state
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

  // Expense list from API
  const [expenseList, setExpenseList] = useState<ExpenseListItem[]>([]);

  // Service provider list from API
  const [serviceProviders, setServiceProviders] = useState<
    ServiceProviderItem[]
  >([]);

  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    itemId: string | null;
  }>({
    open: false,
    itemId: null,
  });

  // Expense Item Form State
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
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpenseIndex, setEditingExpenseIndex] = useState<number | null>(
    null
  );

  // State for controlling collapse/expand of each expense item
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());

  // State for tracking changes in expense items (to show Save button)
  const [changedItems, setChangedItems] = useState<Set<string>>(new Set());

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

  // Load expense list on component mount
  useEffect(() => {
    loadExpenseList();
    loadServiceProviders();
  }, []);

  // Initialize expense items based on whether we have API data or not
  useEffect(() => {
    // Only initialize if we don't have pstWebSeqId (no API data expected)
    if (!pstWebSeqId && expenseItems.length === 0) {
      console.log("🔧 No API data expected, showing one empty expense form");
      setShowExpenseForm(true);

      // Only set default header data if no dashboard data was provided
      if (!dashboardHeaderData) {
        setHeaderData({
          supplierName: "Sample Company Co., Ltd.",
          poBook: "PO24",
          poNo: "12345",
          poDate: "2024-07-07",
          etd: "2024-07-07",
          eta: "2024-07-17",
          wrDate: "2024-07-19",
          invoiceNo: "BMJ824-13",
          invoiceDate: "2024-06-27",
          awbNo: "AMQ0231038",
          importEntryNo: "",
          portOfOrigin: "QINGDAO",
          portOfDestination: "LEAM CHABANG PORT",
          status: "Single",
          pstBook: "",
          pstNo: "",
        });
      }
    }
  }, [pstWebSeqId, expenseItems.length, dashboardHeaderData]);

  const loadExpenseList = async () => {
    console.log("🔄 Loading expense list from API...");
    try {
      const response = await pstService.getExpenseList("Y");
      console.log("📥 Expense list API response:", response);
      if (!response.error && response.data) {
        setExpenseList(response.data);
        console.log(
          "✅ Expense list loaded successfully:",
          response.data.length,
          "items"
        );
      } else {
        console.error("❌ Expense list API returned error:", response);
      }
    } catch (error) {
      console.error("❌ Error loading expense list:", error);
    }
  };

  const loadServiceProviders = async () => {
    console.log("🔄 Loading service providers from API...");
    try {
      const response = await pstService.getServiceProviders();
      console.log("📥 Service providers API response:", response);
      if (!response.error && response.data) {
        setServiceProviders(response.data);
        console.log(
          "✅ Service providers loaded successfully:",
          response.data.length,
          "items"
        );
      } else {
        console.error("❌ Service providers API returned error:", response);
      }
    } catch (error) {
      console.error("❌ Error loading service providers:", error);
    }
  };

  // Load PST details if pstWebSeqId is provided (Update mode)
  useEffect(() => {
    console.log(
      "🎯 CreatePSTForm useEffect triggered with pstWebSeqId:",
      pstWebSeqId
    );
    if (pstWebSeqId) {
      loadPSTDetails();
    }
  }, [pstWebSeqId]);

  const loadPSTDetails = async () => {
    if (!pstWebSeqId) {
      console.log("❌ No pstWebSeqId provided");
      return;
    }

    console.log("🔄 Loading PST details for webSeqId:", pstWebSeqId);
    setIsSubmitting(true);
    try {
      console.log("📞 Calling pstService.getPSTDetails...");
      const response = await pstService.getPSTDetails(pstWebSeqId);
      console.log("📥 API Response received:", response);

      if (!response.error && response.data) {
        const data = response.data;
        console.log("📋 Processing data - webSeqID:", data.webSeqID);

        // Update step1Data with API response
        setStep1Data({
          invoiceNo: data.invoiceNo || "No Invoice",
          contactPerson: data.contactPerson,
          supplierName: data.invoiceList[0]?.supplierName || "",
          transportMode: data.awbType,
          importEntryNo: data.importEntryNo || "",
          currency: data.currency,
          dueDate: data.poDate.split("T")[0],
          creditTerm: data.creditDays?.toString() || "",
        });

        // Update header data with API response, but prefer dashboard data for supplier info
        console.log("🔍 API Data - invoiceList:", data.invoiceList);
        console.log(
          "🔍 API Data - supplierName from API:",
          data.invoiceList[0]?.supplierName
        );
        console.log(
          "🔍 Dashboard - supplierName from dashboard:",
          dashboardHeaderData?.supplierName
        );

        setHeaderData({
          // Prefer dashboard supplier name, fallback to API if not available
          supplierName:
            dashboardHeaderData?.supplierName ||
            data.invoiceList[0]?.supplierName ||
            "",
          poBook: dashboardHeaderData?.poBook || data.poBook || "",
          poNo: dashboardHeaderData?.poNo || data.poNo?.toString() || "",
          poDate: data.poDate
            ? data.poDate.split("T")[0]
            : dashboardHeaderData?.poDate || "",
          etd: data.awbDate
            ? data.awbDate.split("T")[0]
            : dashboardHeaderData?.etd || "",
          eta: data.eta
            ? data.eta.split("T")[0]
            : dashboardHeaderData?.eta || "",
          wrDate: data.requestPaymentDateTime
            ? data.requestPaymentDateTime.split("T")[0]
            : dashboardHeaderData?.wrDate || "",
          invoiceNo: data.invoiceNo || dashboardHeaderData?.invoiceNo || "",
          invoiceDate: data.invoiceDate
            ? data.invoiceDate.split("T")[0]
            : dashboardHeaderData?.invoiceDate || "",
          awbNo: data.awbNo || dashboardHeaderData?.awbNo || "",
          importEntryNo:
            data.importEntryNo || dashboardHeaderData?.importEntryNo || "",
          portOfOrigin:
            data.countryOfOrigin || dashboardHeaderData?.portOfOrigin || "",
          portOfDestination: dashboardHeaderData?.portOfDestination || "",
          status:
            data.invoiceList?.length > 1
              ? ("Multiple" as const)
              : ("Single" as const),
          pstBook: dashboardHeaderData?.pstBook || "",
          pstNo: dashboardHeaderData?.pstNo || "",
        });

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

  // Form handlers
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Expense Item Form handlers
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
          ? expenseItems[editingExpenseIndex].id
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
      const updatedItems = [...expenseItems];
      updatedItems[editingExpenseIndex] = newExpenseItem;
      setExpenseItems(updatedItems);
    } else {
      // Add new item
      setExpenseItems([...expenseItems, newExpenseItem]);
    }

    setShowExpenseForm(false);
    resetExpenseForm();
  };

  const handleCancelExpenseForm = () => {
    setShowExpenseForm(false);
    resetExpenseForm();
  };

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

    if (itemToRemove?.isFromAPI && itemToRemove.rowId && pstWebSeqId) {
      // If item is from API, call DELETE API
      try {
        console.log("🗑️ Deleting expense via API:", {
          webSeqId: pstWebSeqId,
          rowId: itemToRemove.rowId,
        });
        const response = await pstService.deleteExpense(
          pstWebSeqId,
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

  const handleDeleteConfirm = async () => {
    if (deleteConfirmation.itemId) {
      await removeExpenseItem(deleteConfirmation.itemId);
    }
    setDeleteConfirmation({ open: false, itemId: null });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({ open: false, itemId: null });
  };

  const handleDeleteClick = (itemId: string) => {
    setDeleteConfirmation({ open: true, itemId });
  };

  // Handle expense code change for display items
  const handleExpenseCodeChange = (itemId: string, newExpenseCode: string) => {
    const expense = expenseList.find((e) => e.expenseCode === newExpenseCode);
    if (expense) {
      setExpenseItems((prev) =>
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
        })
      );

      // Mark item as changed if it's from API
      const item = expenseItems.find((item) => item.id === itemId);
      if (item?.isFromAPI) {
        setChangedItems((prev) => new Set([...prev, itemId]));
      }
    }
  };

  // Handle service provider change for display items
  const handleServiceProviderChange = (
    itemId: string,
    newServiceProvider: string
  ) => {
    setExpenseItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              serviceProvider: newServiceProvider,
            }
          : item
      )
    );

    // Mark item as changed if it's from API
    const item = expenseItems.find((item) => item.id === itemId);
    if (item?.isFromAPI) {
      setChangedItems((prev) => new Set([...prev, itemId]));
    }
  };

  // Handle field changes for display items with calculations
  const handleExpenseFieldChange = (
    itemId: string,
    field: string,
    value: string | number
  ) => {
    setExpenseItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        const updatedItem = { ...item, [field]: value };

        // Recalculate if qty or rate changes
        if (field === "qty" || field === "rate") {
          const qty =
            parseFloat(
              field === "qty" ? value.toString() : item.qty.toString()
            ) || 0;
          const rate =
            parseFloat(
              field === "rate" ? value.toString() : item.rate.toString()
            ) || 0;

          updatedItem.subTotal = qty * rate;
          updatedItem.vatBaseAmount = updatedItem.subTotal;
          updatedItem.vatAmount =
            updatedItem.vatBaseAmount * (updatedItem.vatPercent / 100);
          updatedItem.total =
            updatedItem.subTotal +
            updatedItem.vatAmount +
            (updatedItem.exciseVatAmount || 0) +
            (updatedItem.interiorVat || 0);
        }

        // Recalculate if VAT Base changes
        if (field === "vatBaseAmount") {
          const vatBase = parseFloat(value.toString()) || 0;
          updatedItem.vatAmount = vatBase * (updatedItem.vatPercent / 100);
          updatedItem.total =
            updatedItem.subTotal +
            updatedItem.vatAmount +
            (updatedItem.exciseVatAmount || 0) +
            (updatedItem.interiorVat || 0);
        }

        // Recalculate if VAT Amount changes
        if (field === "vatAmount") {
          updatedItem.total =
            updatedItem.subTotal +
            parseFloat(value.toString()) +
            (updatedItem.exciseVatAmount || 0) +
            (updatedItem.interiorVat || 0);
        }

        // Recalculate if Excise VAT or Interior VAT changes
        if (field === "exciseVatAmount" || field === "interiorVat") {
          const exciseVat =
            parseFloat(
              field === "exciseVatAmount"
                ? value.toString()
                : (updatedItem.exciseVatAmount || 0).toString()
            ) || 0;
          const interiorVat =
            parseFloat(
              field === "interiorVat"
                ? value.toString()
                : (updatedItem.interiorVat || 0).toString()
            ) || 0;
          updatedItem.total =
            updatedItem.subTotal +
            updatedItem.vatAmount +
            exciseVat +
            interiorVat;
        }

        return updatedItem;
      })
    );

    // Mark item as changed if it's from API
    const item = expenseItems.find((item) => item.id === itemId);
    if (item?.isFromAPI) {
      setChangedItems((prev) => new Set([...prev, itemId]));
    }
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
        webSeqId: pstWebSeqId || 152039978, // Use provided webSeqId or fallback
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
        if (pstWebSeqId) {
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
        ...step1Data,
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

  // Calculate totals
  const totalSubTotal = expenseItems.reduce(
    (sum, item) => sum + item.subTotal,
    0
  );
  const totalVATAmount = expenseItems.reduce(
    (sum, item) => sum + item.vatAmount,
    0
  );
  const grandTotal = expenseItems.reduce((sum, item) => sum + item.total, 0);

  // Debug logs for render
  if (pstWebSeqId) {
    console.log("🔍 CreatePSTForm render - pstWebSeqId:", pstWebSeqId);
    console.log("🔍 CreatePSTForm render - formData.refKey:", formData.refKey);
  }

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
                Create PST Request
              </h1>
              <p className="text-sm text-gray-600">Complete PST Details</p>
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
                {createdPSTNumber ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      PST: {createdPSTNumber}
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
          {/* PST Details Form */}
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
                              {/* {headerData.importEntryNo && (
                                <div className="flex items-center gap-1">
                                  <Key className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">Ref:</span>
                                  <span className="font-medium text-gray-800">
                                    {headerData.importEntryNo}
                                  </span>
                                </div>
                              )} */}
                              
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
                              {headerData.etd || "N/A"}
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
                              {headerData.eta || "N/A"}
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
                              {headerData.wrDate || "N/A"}
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
                              <span className="text-gray-500">
                                ({headerData.invoiceDate})
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">AWB:</span>
                            <span className="font-medium text-gray-800">
                              {headerData.awbNo}
                            </span>
                          </div>
                        </div>

                        {/* Route row */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-700">
                            {headerData.portOfOrigin || "QINGDAO"}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-700">
                            {headerData.portOfDestination ||
                              "LEAM CHABANG PORT"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                        <Badge className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
                          Complete Form
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-2">
                        Fill in the Ref Key, request payment date, and expense
                        items to complete your PST request.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      {/* Enhanced Ref Key and Payment Date Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                        <div className="space-y-2">
                          <Label
                            htmlFor="refKey"
                            className="text-sm font-medium text-gray-700"
                          >
                            Ref Key <span className="text-red-500">*</span>
                            {pstWebSeqId && (
                              <span className="text-xs text-gray-500 ml-2">
                                (From API webSeqID)
                              </span>
                            )}
                          </Label>
                          <Input
                            id="refKey"
                            placeholder={
                              pstWebSeqId
                                ? "Auto-filled from API"
                                : "Enter reference key"
                            }
                            value={formData.refKey}
                            onChange={(e) =>
                              handleInputChange("refKey", e.target.value)
                            }
                            required
                            className={`border-amber-200 focus:border-amber-500 transition-colors duration-200 ${
                              pstWebSeqId ? "bg-gray-50 text-gray-700" : ""
                            }`}
                            disabled={pstWebSeqId ? true : isSubmitting}
                            readOnly={pstWebSeqId ? true : false}
                          />
                          {pstWebSeqId && formData.refKey && (
                            <p className="text-xs text-gray-500 mt-1">
                              This value is automatically set from API webSeqID:{" "}
                              {formData.refKey}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="requestPaymentDate"
                            className="text-sm font-medium text-gray-700"
                          >
                            Request Payment Date{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="requestPaymentDate"
                            type="date"
                            value={formData.requestPaymentDate}
                            onChange={(e) =>
                              handleInputChange(
                                "requestPaymentDate",
                                e.target.value
                              )
                            }
                            required
                            className="border-amber-200 focus:border-amber-500 transition-colors duration-200"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Invoice Items Section */}
                      {invoiceItems.length > 0 && (
                        <div className="space-y-6">
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

                      {invoiceItems.length > 0 && <Separator />}

                      {/* Expense Items Section */}
                      <div className="space-y-6">
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
                                    placeholder="3.00"
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
                                    placeholder="250.00"
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
                                    placeholder="Narendra"
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
                                    placeholder="Test"
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
              </div>

              {/* Enhanced Sidebar - Optimized for better information display */}
              <div className="xl:col-span-1 space-y-6">
                {/* Bill Information Card */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building className="w-5 h-5 text-blue-600" />
                      Bill Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Invoice No.
                      </p>
                      <p className="text-sm text-gray-900">
                        {step1Data.invoiceNo}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Supplier
                      </p>
                      <p className="text-sm text-gray-900">
                        {headerData.supplierName || step1Data.supplierName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Transport
                      </p>
                      <p className="text-sm text-gray-900">
                        {step1Data.transportMode}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Due Date
                      </p>
                      <p className="text-sm text-gray-900">
                        {step1Data.dueDate}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Message/Notes Card */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Add notes or comments..."
                      value={formData.message}
                      onChange={(e) =>
                        handleInputChange("message", e.target.value)
                      }
                      disabled={isSubmitting}
                      className="min-h-24 resize-none"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirmation.open}
        onOpenChange={(open) => setDeleteConfirmation({ open, itemId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Delete Expense Item
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense item? This action
              cannot be undone.
              {deleteConfirmation.itemId &&
                expenseItems.find(
                  (item) => item.id === deleteConfirmation.itemId
                )?.isFromAPI &&
                " This will also remove the item from the server."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
