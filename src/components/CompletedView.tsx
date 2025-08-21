import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { LoadingSpinner } from "./ui/loading";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  Calculator,
  Eye,
  ChevronDown,
  ChevronRight,
  Package,
  Truck,
  Ship,
  Plane,
  Calendar,
  User,
  DollarSign,
  MessageCircle,
} from "lucide-react";
import { useParams } from "react-router-dom";

// Types (copied from CreatePSTForm)
interface HeaderData {
  poNo: string;
  supplier: string;
  supplierAddress: string;
  transportType: string;
  status: string;
  pstBook: string;
  pstNo: string;
  vesselName?: string;
  referenceCode?: string;
  taxIdNo?: string;
  paymentTerm?: string;
}

interface CompletedViewProps {
  onClose: () => void;
}

interface POListItem {
  id: string;
  poNo: string;
  supplier: string;
  supplierAddress: string;
  transportType: string;
  eta: string;
  etd: string;
  volume: number;
  weight: number;
  quantity: number;
  value: number;
  currency: string;
  status: string;
  pstBook: string;
  pstNo: string;
  containerNumber?: string;
  vesselName?: string;
  referenceCode?: string;
  taxIdNo?: string;
  paymentTerm?: string;
}

interface ExpenseListItem {
  id: string;
  description: string;
  vendor: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  baseCurrency: string;
  baseAmount: number;
  category: string;
  paymentDate?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  notes?: string;
}

interface ServiceProviderItem {
  id: string;
  serviceType: string;
  providerName: string;
  contactPerson: string;
  email: string;
  phone: string;
  serviceDescription: string;
  cost: number;
  currency: string;
  paymentTerms: string;
  status: string;
}

interface CommunicationMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  message: string;
  timestamp: string;
  attachments?: string[];
  priority: "low" | "medium" | "high";
  status: "read" | "unread";
  messageType: "internal" | "external" | "system";
}

// Utility function to format date to DD-MMM-YYYY (read-only)
const formatDateToDDMMYYYY = (dateString: string): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const day = date.getDate().toString().padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  } catch {
    return dateString;
  }
};

export function CompletedView({ onClose }: CompletedViewProps) {
  const { pstNumber } = useParams<{ pstNumber: string }>();
  const [isLoading, setIsLoading] = useState(true);
  
  // State for all data (read-only)
  const [headerData, setHeaderData] = useState<HeaderData | null>(null);
  const [poList, setPOList] = useState<POListItem[]>([]);
  const [expenseList, setExpenseList] = useState<ExpenseListItem[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProviderItem[]>([]);
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  
  // Collapsed states for read-only view
  const [collapsedPOs, setCollapsedPOs] = useState<Set<string>>(new Set());
  const [collapsedExpenses, setCollapsedExpenses] = useState<Set<string>>(new Set());
  const [collapsedServices, setCollapsedServices] = useState<Set<string>>(new Set());

  // Get URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pstWebSeqId = urlParams.get('pstWebSeqId');
    const pswWebSeqId = urlParams.get('pswWebSeqId');
    const mode = urlParams.get('mode');
    
    console.log('Completed View Parameters:', {
      pstNumber,
      pstWebSeqId,
      pswWebSeqId,
      mode
    });
    
    // Load data based on parameters
    loadCompletedData(pstWebSeqId, pswWebSeqId);
  }, [pstNumber]);

  const loadCompletedData = async (pstWebSeqId: string | null, pswWebSeqId: string | null) => {
    try {
      setIsLoading(true);
      
      // Mock data loading - replace with actual API calls
      // TODO: Use pstWebSeqId and pswWebSeqId to fetch real data
      console.log('Loading data for:', { pstWebSeqId, pswWebSeqId });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set mock header data
      setHeaderData({
        poNo: pstNumber || "PE67-968",
        supplier: "ABC Manufacturing Co., Ltd.",
        supplierAddress: "123 Industrial Road, Bangkok 10110, Thailand",
        transportType: "Sea Freight",
        status: "Completed",
        pstBook: "PST-2025",
        pstNo: pstNumber || "PE67-968",
        vesselName: "MV Pacific Star",
        referenceCode: "REF-001",
        taxIdNo: "1234567890123",
        paymentTerm: "Net 30 Days"
      });
      
      // Set mock PO data
      setPOList([
        {
          id: "po-1",
          poNo: "PO-2025-001",
          supplier: "ABC Manufacturing Co., Ltd.",
          supplierAddress: "123 Industrial Road, Bangkok 10110, Thailand",
          transportType: "Sea Freight",
          eta: "2025-09-15",
          etd: "2025-08-30",
          volume: 45.5,
          weight: 12500,
          quantity: 100,
          value: 250000,
          currency: "USD",
          status: "Completed",
          pstBook: "PST-2025",
          pstNo: pstNumber || "PE67-968",
          containerNumber: "MSKU1234567",
          vesselName: "MV Pacific Star"
        }
      ]);
      
      // Set mock expense data
      setExpenseList([
        {
          id: "exp-1",
          description: "Container Handling Charges",
          vendor: "Port Authority",
          amount: 850,
          currency: "USD",
          exchangeRate: 35.5,
          baseCurrency: "THB",
          baseAmount: 30175,
          category: "Port Charges",
          paymentDate: "2025-08-25",
          paymentMethod: "Bank Transfer",
          referenceNumber: "PAY-001",
          notes: "Container handling and terminal charges"
        }
      ]);
      
      // Set mock service provider data
      setServiceProviders([
        {
          id: "svc-1",
          serviceType: "Customs Clearance",
          providerName: "Swift Logistics",
          contactPerson: "John Smith",
          email: "john@swiftlogistics.com",
          phone: "+66-2-123-4567",
          serviceDescription: "Import customs clearance and documentation",
          cost: 5000,
          currency: "THB",
          paymentTerms: "Net 15 Days",
          status: "Completed"
        }
      ]);
      
      // Set mock messages
      setMessages([
        {
          id: "msg-1",
          from: "customs@swiftlogistics.com",
          to: "operations@company.com",
          subject: "Customs Clearance Completed",
          message: "All customs procedures have been completed successfully. Documents are ready for collection.",
          timestamp: "2025-08-25T10:30:00Z",
          priority: "medium",
          status: "read",
          messageType: "external"
        }
      ]);
      
    } catch (error) {
      console.error('Error loading completed data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCollapsedPO = (id: string) => {
    setCollapsedPOs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleCollapsedExpense = (id: string) => {
    setCollapsedExpenses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleCollapsedService = (id: string) => {
    setCollapsedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Completed PST View: {pstNumber}
              </h1>
              <p className="text-sm text-gray-500">
                Read-only view of completed PST documentation
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content - 80% */}
          <div className="col-span-9 space-y-6">
            
            {/* Header Information */}
            {headerData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>PST Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">PO Number</Label>
                      <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">{headerData.poNo}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">PST Number</Label>
                      <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">{headerData.pstNo}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Transport Type</Label>
                      <div className="mt-1 p-2 bg-gray-50 rounded border text-sm flex items-center space-x-2">
                        {headerData.transportType === "Sea Freight" && <Ship className="h-4 w-4" />}
                        {headerData.transportType === "Air Freight" && <Plane className="h-4 w-4" />}
                        {headerData.transportType === "Land Freight" && <Truck className="h-4 w-4" />}
                        <span>{headerData.transportType}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Status</Label>
                      <div className="mt-1">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {headerData.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Supplier</Label>
                      <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">{headerData.supplier}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Vessel Name</Label>
                      <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">{headerData.vesselName || "N/A"}</div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Supplier Address</Label>
                    <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">{headerData.supplierAddress}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* PO List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Purchase Orders ({poList.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {poList.map((po) => (
                    <Collapsible key={po.id}>
                      <CollapsibleTrigger 
                        className="w-full"
                        onClick={() => toggleCollapsedPO(po.id)}
                      >
                        <Card className="cursor-pointer hover:bg-gray-50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {collapsedPOs.has(po.id) ? (
                                  <ChevronRight className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                                <div className="text-left">
                                  <div className="font-medium">{po.poNo}</div>
                                  <div className="text-sm text-gray-500">{po.supplier}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  {po.value.toLocaleString()} {po.currency}
                                </div>
                                <Badge variant="secondary" className="mt-1">
                                  {po.status}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <Card className="mt-2 ml-6">
                          <CardContent className="p-4">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <Label className="text-xs font-medium text-gray-700">ETA</Label>
                                <div className="mt-1 flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDateToDDMMYYYY(po.eta)}</span>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-gray-700">ETD</Label>
                                <div className="mt-1 flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDateToDDMMYYYY(po.etd)}</span>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-gray-700">Container</Label>
                                <div className="mt-1">{po.containerNumber || "N/A"}</div>
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-gray-700">Volume</Label>
                                <div className="mt-1">{po.volume} CBM</div>
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-gray-700">Weight</Label>
                                <div className="mt-1">{po.weight.toLocaleString()} KG</div>
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-gray-700">Quantity</Label>
                                <div className="mt-1">{po.quantity.toLocaleString()} PCS</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expense List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Expenses ({expenseList.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenseList.map((expense) => (
                    <Collapsible key={expense.id}>
                      <CollapsibleTrigger 
                        className="w-full"
                        onClick={() => toggleCollapsedExpense(expense.id)}
                      >
                        <Card className="cursor-pointer hover:bg-gray-50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {collapsedExpenses.has(expense.id) ? (
                                  <ChevronRight className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                                <div className="text-left">
                                  <div className="font-medium">{expense.description}</div>
                                  <div className="text-sm text-gray-500">{expense.vendor}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  {expense.amount.toLocaleString()} {expense.currency}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {expense.baseAmount.toLocaleString()} {expense.baseCurrency}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <Card className="mt-2 ml-6">
                          <CardContent className="p-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <Label className="text-xs font-medium text-gray-700">Category</Label>
                                <div className="mt-1">{expense.category}</div>
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-gray-700">Payment Date</Label>
                                <div className="mt-1">{expense.paymentDate ? formatDateToDDMMYYYY(expense.paymentDate) : "N/A"}</div>
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-gray-700">Payment Method</Label>
                                <div className="mt-1">{expense.paymentMethod || "N/A"}</div>
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-gray-700">Reference Number</Label>
                                <div className="mt-1">{expense.referenceNumber || "N/A"}</div>
                              </div>
                              {expense.notes && (
                                <div className="col-span-2">
                                  <Label className="text-xs font-medium text-gray-700">Notes</Label>
                                  <div className="mt-1 p-2 bg-gray-50 rounded border text-xs">{expense.notes}</div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Service Providers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Service Providers ({serviceProviders.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {serviceProviders.map((service) => (
                    <Collapsible key={service.id}>
                      <CollapsibleTrigger 
                        className="w-full"
                        onClick={() => toggleCollapsedService(service.id)}
                      >
                        <Card className="cursor-pointer hover:bg-gray-50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {collapsedServices.has(service.id) ? (
                                  <ChevronRight className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                                <div className="text-left">
                                  <div className="font-medium">{service.serviceType}</div>
                                  <div className="text-sm text-gray-500">{service.providerName}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  {service.cost.toLocaleString()} {service.currency}
                                </div>
                                <Badge variant="secondary" className="mt-1">
                                  {service.status}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <Card className="mt-2 ml-6">
                          <CardContent className="p-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <Label className="text-xs font-medium text-gray-700">Contact Person</Label>
                                <div className="mt-1">{service.contactPerson}</div>
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-gray-700">Email</Label>
                                <div className="mt-1">{service.email}</div>
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-gray-700">Phone</Label>
                                <div className="mt-1">{service.phone}</div>
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-gray-700">Payment Terms</Label>
                                <div className="mt-1">{service.paymentTerms}</div>
                              </div>
                              <div className="col-span-2">
                                <Label className="text-xs font-medium text-gray-700">Service Description</Label>
                                <div className="mt-1 p-2 bg-gray-50 rounded border text-xs">{service.serviceDescription}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Communication Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>Communication History ({messages.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {messages.map((message) => (
                    <Card key={message.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-sm">{message.subject}</span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  message.priority === 'high' ? 'border-red-500 text-red-700' :
                                  message.priority === 'medium' ? 'border-yellow-500 text-yellow-700' :
                                  'border-gray-500 text-gray-700'
                                }`}
                              >
                                {message.priority}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {message.messageType}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              From: {message.from} → To: {message.to}
                            </div>
                            <div className="text-sm bg-gray-50 p-3 rounded border">
                              {message.message}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 ml-4">
                            {new Date(message.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 20% */}
          <div className="col-span-3">
            <div className="sticky top-6 space-y-4">
              
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-sm">
                    <Calculator className="h-4 w-4" />
                    <span>Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Total POs:</span>
                    <span className="font-medium">{poList.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Total Value:</span>
                    <span className="font-medium">
                      {poList.reduce((sum, po) => sum + po.value, 0).toLocaleString()} USD
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Total Expenses:</span>
                    <span className="font-medium">
                      {expenseList.reduce((sum, exp) => sum + exp.baseAmount, 0).toLocaleString()} THB
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Service Providers:</span>
                    <span className="font-medium">{serviceProviders.length}</span>
                  </div>
                </CardContent>
              </Card>

              {/* View Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-sm">
                    <Eye className="h-4 w-4" />
                    <span>View Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Mode:</span>
                    <div className="font-medium">Read-Only</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Updated:</span>
                    <div className="font-medium">Aug 25, 2025</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 ml-2">
                      Completed
                    </Badge>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
