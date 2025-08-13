import { apiClient } from '../apiClient';

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

export const pstService = {
  /**
   * Create a new PST
   */
  async createPST(request: CreatePSTRequest): Promise<CreatePSTResponse> {
    const response = await apiClient.post<CreatePSTResponse>('/v1/es/eshipping/pst', request);
    return response.data;
  },

  /**
   * Get PST details by webSeqID
   */
  async getPSTDetails(webSeqId: number): Promise<PSTDetailResponse> {
    const response = await apiClient.get<PSTDetailResponse>(`/v1/es/eshipping/web-seq-id?webSeqId=${webSeqId}`);
    return response.data;
  }
};
