import { env } from '../../config/env';
import { AuthUtils } from '../../utils/authUtils';

// Function to get token with error handling
const getToken = () => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return token;
};

export interface CreatePSTRequest {
  transType: string;
  poBook: string;
  poNo: number;
}

export interface CreatePSTResponse {
  error: boolean;
  message: string;
  data: Array<{
    webSeqID: number;
  }>;
  rowsAffected: number;
  query: string;
}

export interface SaveBillEntryRequest {
  poBook: string;
  poDate: string;
  invoiceNo: string;
  invoiceDate: string;
  awbNo: string;
  dueDate: string;
  paymentTerm: string;
  eta: string;
  webSeqID: number | undefined;
  contactPerson: string;
  remarks: string;
  countryOfOrigin: string;
  vesselName: string;
  requestPaymentDate: string;
  requestPaymentTime: string;
  awbDate: string;
  awbType: string;
  importEntryNo: string;
}

export interface PSTDetailResponse {
  error: boolean;
  message: string;
  data: {
    webSeqID: number;
    poBook: string;
    poNo: number;
    poDate: string;
    invoiceNo: string;
    invoiceDate: string;
    contactPerson: string;
    creditDays: number;
    creditTerm: string;
    awbType: string;
    awbNo: string;
    awbDate: string;
    importEntryNo: string | null;
    eta: string;
    paymentTerm: string | null;
    vesselName: string;
    countryOfOrigin: string;
    requestPaymentDateTime: string | null;
    currency: string;
    remarks: string | null;
    billStatus: string;
    jagotaStatus: string;
    masterSequenceId: number | null;
    childSequenceId: number;
    dueDate: string | null;
    expenseList: Array<{
      rowId: string;
      seq: number;
      expenseCode: string;
      expenseName: string;
      serviceProvider: string;
      documentNo: string | null;
      documentDate: string | null;
      remarks: string | null;
      qty: number;
      rate: number;
      subTotal: number;
      vatBase: number;
      vatPercent: number;
      vatAmount: number;
      exciseVat: number;
      interiorVat: number;
      totalAmount: number;
    }>;
    invoiceList: Array<{
      supplierCode: string;
      supplierName: string;
      invoiceNo: string;
      referenceNo: string;
      transportBy: string;
    }>;
  };
  rowsAffected: number;
  query: string;
}

export interface ExpenseListItem {
  expenseName: string;
  expenseCode: string;
  taxCode: string;
  taxRate: string;
}

export interface ExpenseListResponse {
  error: boolean;
  message: string;
  data: ExpenseListItem[];
  rowsAffected: number;
  query: string;
}

export interface DeleteExpenseResponse {
  error: boolean;
  message: string;
  data?: any;
  rowsAffected: number;
  query: string;
}

export interface SaveExpenseRequest {
  webSeqId: number;
  podRowId: string;
  productCode: string;
  serviceProvider: string;
  qty: number;
  rate: number;
  vatBaseAmount: number;
  vatPercent: number;
  vatAmount: number;
  exciseVatAmount: number;
  interiorVatAmount: number;
  total: number;
  documentNo: string;
  documentDate: string;
  remarks: string;
}

export interface SaveExpenseResponse {
  error: boolean;
  message: string;
  data: Array<{
    STATUS: string;
  }>;
  rowsAffected: number;
  query: string;
}

export interface ServiceProviderItem {
  name: string;
}

export interface ServiceProviderResponse {
  error: boolean;
  message: string;
  data: ServiceProviderItem[];
  rowsAffected: number;
  query: string;
}

export const pstService = {
  /**
   * Create a new PST
   */
  async createPST(request: CreatePSTRequest): Promise<CreatePSTResponse> {
    console.log('🚀 pstService.createPST called with:', request);
    
    // Get auth token
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) {
      throw new Error('No authentication token found');
    }
    
    // Use JAGOTA API directly
    const url = `${env.jagotaApi.baseUrl}/v1/es/eshipping/pst`;
    console.log('📡 Calling API:', url);
    
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${authToken}`);

    const raw = JSON.stringify({
      "transType": request.transType,
      "poBook": request.poBook,
      "poNo": request.poNo
    });

    console.log('📦 Request body:', raw);

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    try {
      const response = await fetch(url, requestOptions);
      console.log('📬 Response status:', response.status);
      console.log('📬 Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📬 Response data:', result);
      
      return result as CreatePSTResponse;
    } catch (error) {
      console.error('❌ API call failed:', error);
      throw error;
    }
  },

  /**
   * Get expense list
   */
  async getExpenseList(urgent: string = 'Y'): Promise<ExpenseListResponse> {
    const url = `${env.jagotaApi.baseUrl}/v1/es/eshipping/expense-list?urgent=${urgent}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': AuthUtils.getAuthToken(),
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data: ExpenseListResponse = await res.json();
    return data;
  },

  /**
   * Get PST details by webSeqID
   */
  async getPSTDetails(webSeqId: number): Promise<PSTDetailResponse> {
    // Call JAGOTA API directly (same auth scheme as dashboardService)
    const url = `${env.jagotaApi.baseUrl}/v1/es/eshipping/web-seq-id?webSeqId=${webSeqId}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': AuthUtils.getAuthToken(),
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data: PSTDetailResponse = await res.json();
    return data;
  },

  /**
   * Delete expense item by webSeqId and rowId
   */
  async deleteExpense(webSeqId: number, rowId: string): Promise<DeleteExpenseResponse> {
    const url = `${env.jagotaApi.baseUrl}/v1/es/eshipping/expense?webSeqId=${webSeqId}&podRowId=${rowId}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': AuthUtils.getAuthToken(),
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data: DeleteExpenseResponse = await res.json();
    return data;
  },

  /**
   * Get service provider list
   */
  async getServiceProviders(): Promise<ServiceProviderResponse> {
    const url = `${env.jagotaApi.baseUrl}/v1/es/eshipping/service-provider`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': AuthUtils.getAuthToken(),
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data: ServiceProviderResponse = await res.json();
    return data;
  },

  // Save expense item
  async saveExpenseItem(expenseData: SaveExpenseRequest): Promise<SaveExpenseResponse> {
    const token = getToken();
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${token}`);

    const requestBody = JSON.stringify({
      webSeqId: expenseData.webSeqId,
      podRowId: expenseData.podRowId,
      productCode: expenseData.productCode,
      serviceProvider: expenseData.serviceProvider,
      qty: expenseData.qty,
      rate: expenseData.rate,
      vatBaseAmount: expenseData.vatBaseAmount,
      vatPercent: expenseData.vatPercent,
      vatAmount: expenseData.vatAmount,
      exciseVatAmount: expenseData.exciseVatAmount,
      interiorVatAmount: expenseData.interiorVatAmount,
      total: expenseData.total,
      documentNo: expenseData.documentNo,
      documentDate: expenseData.documentDate,
      remarks: expenseData.remarks,
    });

    const res = await fetch(
      `${env.jagotaApi.baseUrl}/v1/es/eshipping/expense`,
      {
        method: "POST",
        headers,
        body: requestBody,
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data: SaveExpenseResponse = await res.json();
    return data;
  },

  // Save bill entry
  async saveBillEntry(request: SaveBillEntryRequest): Promise<any> {
    const token = getToken();
    const res = await fetch(
      `${env.jagotaApi.baseUrl}/v1/es/eshipping/pst-psw`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(request),
      }
    );

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Response is not JSON:", text);
      data = text;
    }

    if (!res.ok) {
      console.error("API Error Response:", data);
      
      // Check if we have validation errors
      if (data && Array.isArray(data.errors)) {
        const errorMessages = data.errors
          .map((error: { field: string; message: string }) => {
            // แปลงชื่อ field เป็นภาษาไทย
            const fieldNames: { [key: string]: string } = {
              invoiceNo: "เลขที่ใบแจ้งหนี้",
              dueDate: "วันครบกำหนด",
              eta: "วันที่คาดว่าจะมาถึง",
              countryOfOrigin: "ประเทศต้นทาง",
              vesselName: "ชื่อเรือ",
              importEntryNo: "เลขที่ใบขนสินค้า"
            };
            const fieldName = fieldNames[error.field] || error.field;
            return `${fieldName}: ${error.message}`;
          })
          .join("\n");

        throw new Error(`กรุณากรอกข้อมูลให้ครบถ้วน:\n${errorMessages}`);
      }

      // ถ้าไม่ใช่ validation error ให้แสดงข้อความ error ทั่วไป
      throw new Error(typeof data === 'object' ? data.message || "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง" : "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    }

    return data;
  },

  // Submit Bill API
  async submitBill(webSeqId: string): Promise<{ error: boolean; message: string; data?: any }> {
    try {
      // Use the same Bearer token as other APIs
      const bearerToken = AuthUtils.getAuthToken();
      
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", bearerToken);

      const raw = JSON.stringify({
        "webSeqId": webSeqId
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
      };

      const response = await fetch(`${env.jagotaApi.baseUrl}/v1/es/eshipping/submit-bill`, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || "ไม่สามารถส่งบิลได้ กรุณาลองใหม่อีกครั้ง");
      }

      return data;
    } catch (error) {
      console.error('Submit bill error:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error("ไม่สามารถส่งบิลได้ กรุณาลองใหม่อีกครั้ง");
    }
  },

  // Create PSW API
  async createPSW(pstWebSeqId: string): Promise<{ error: boolean; message: string; data?: any }> {
    try {
      // Use the same Bearer token as other APIs
      const bearerToken = AuthUtils.getAuthToken();
      
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", bearerToken);

      const raw = JSON.stringify({
        "pstWebSeqId": parseInt(pstWebSeqId)
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
      };

      const response = await fetch(`${env.jagotaApi.baseUrl}/v1/es/eshipping/psw`, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || "ไม่สามารถสร้าง PSW ได้ กรุณาลองใหม่อีกครั้ง");
      }

      return data;
    } catch (error) {
      console.error('Create PSW error:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error("ไม่สามารถสร้าง PSW ได้ กรุณาลองใหม่อีกครั้ง");
    }
  }
};
