import { useState, useMemo, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { OTPVerification } from './components/OTPVerification';
import { CreatePSTForm } from './components/CreatePSTForm';
import { CreatePSWForm } from './components/CreatePSWForm';
import { NotificationCenter } from './components/NotificationCenter';
import { SidePanel } from './components/SidePanel';
import { MainContent } from './components/MainContent';
import { KPISection } from './components/KPISection';
import { FilterBar } from './components/FilterBar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HistoryView } from './components/HistoryView';
import { Badge } from './components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './components/ui/alert-dialog';
import { Button } from './components/ui/button';
import { InboxContainer } from './containers/InboxContainer';
import { mockShipments } from './data/mockData';
import { useNotifications } from './hooks/useNotifications';
import { useEShippingPOList } from './hooks/useEShippingPOList';
import { convertPOListToShipments } from './utils/poListConverter';
import { formatDateRangeForAPI } from './utils/dateUtils';
import { AuthService } from './api/services/authService';
import { 
  statusPriority,
  getDateRange,
  calculateKPIs
} from './lib/shipmentUtils';
import { CheckCircle, FileText, Calendar, Building, ArrowRight } from 'lucide-react';
import type { Shipment, SortOption, CurrentView, DateFilterMode } from './types/shipment';

interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export default function ShippingDashboard() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsOTP, setNeedsOTP] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [loginToken, setLoginToken] = useState('');
  const [loginRefno, setLoginRefno] = useState('');
  const [loginCredentials, setLoginCredentials] = useState<LoginCredentials | null>(null);
  const [user, setUser] = useState<{ email: string; name: string; company?: string; supCode?: string } | null>(null);

  // Filter state
  const [selectedTransportType, setSelectedTransportType] = useState<string>('all');
  const [selectedPSTStatus, setSelectedPSTStatus] = useState<string>('');
  const [selectedPSWStatus, setSelectedPSWStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  
  // Date filter state with chip-based approach
  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>('today');
  const [customDateStart, setCustomDateStart] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customDateEnd, setCustomDateEnd] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [activePOTypeTab, setActivePOTypeTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('none');
  
  // Navigation state
  const [currentView, setCurrentView] = useState<CurrentView>('dashboard');
  const [selectedPOForPST, setSelectedPOForPST] = useState<string | null>(null);
  const [selectedPOForPSW, setSelectedPOForPSW] = useState<string | null>(null);
  const [pstCompleted, setPstCompleted] = useState<boolean>(false);
  const [pswCompleted, setPswCompleted] = useState<boolean>(false);
  
  // Loading states
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // PST and PSW tracking state
  const [createdPSTNumber, setCreatedPSTNumber] = useState<string | null>(null);
  const [createdPSWNumber, setCreatedPSWNumber] = useState<string | null>(null);

  // Confirmation dialog state
  const [showPSTConfirmDialog, setShowPSTConfirmDialog] = useState(false);
  const [pendingPSTData, setPendingPSTData] = useState<any>(null);

  // Use notifications hook
  const {
    notifications,
    unreadNotificationCount,
    handleMarkNotificationAsRead,
    handleMarkAllNotificationsAsRead,
    handleDeleteNotification
  } = useNotifications();

  // ตรวจสอบสถานะการ login เมื่อ component โหลด
  useEffect(() => {
    const token = AuthService.getToken();
    if (token) {
      // ตรวจสอบว่ามีข้อมูลผู้ใช้ที่ถูกต้อง
      const savedUser = localStorage.getItem('user_data');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          // ตรวจสอบว่าข้อมูลผู้ใช้มีครบถ้วน
          if (userData.name && userData.email) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // ข้อมูลผู้ใช้ไม่ครบถ้วน ให้ logout
            AuthService.logout();
          }
        } catch (error) {
          // ข้อมูลผู้ใช้ผิดรูปแบบ ให้ logout
          console.error('Invalid user data in localStorage:', error);
          AuthService.logout();
        }
      } else {
        // มี token แต่ไม่มีข้อมูลผู้ใช้ ให้ logout
        AuthService.logout();
      }
    }
  }, []);

  // Update URL based on authentication state and current view
  useEffect(() => {
    if (!isAuthenticated && !needsOTP) {
      // Show login
      window.history.replaceState(null, '', '/login');
    } else if (needsOTP && !isAuthenticated) {
      // Show OTP
      window.history.replaceState(null, '', '/otp');
    } else if (isAuthenticated) {
      // Show authenticated views
      switch (currentView) {
        case 'dashboard':
          window.history.replaceState(null, '', '/dashboard');
          break;
        case 'inbox':
          window.history.replaceState(null, '', '/inbox');
          break;
        case 'history':
          window.history.replaceState(null, '', '/history');
          break;
        case 'create-pst':
          if (selectedPOForPST) {
            window.history.replaceState(null, '', `/create-pst/${selectedPOForPST}`);
          } else {
            window.history.replaceState(null, '', '/create-pst');
          }
          break;
        case 'create-psw':
          if (selectedPOForPSW) {
            window.history.replaceState(null, '', `/create-psw/${selectedPOForPSW}`);
          } else {
            window.history.replaceState(null, '', '/create-psw');
          }
          break;
        default:
          window.history.replaceState(null, '', '/dashboard');
      }
    }
  }, [isAuthenticated, needsOTP, currentView, selectedPOForPST, selectedPOForPSW]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      
      if (path === '/login') {
        // User navigated to login page
        if (isAuthenticated || needsOTP) {
          // Only logout if currently authenticated or in OTP state
          setIsAuthenticated(false);
          setUser(null);
          setNeedsOTP(false);
          setOtpEmail('');
          setCurrentView('dashboard');
        }
      } else if (path === '/otp' && isAuthenticated) {
        // User trying to go back to OTP while authenticated
        setCurrentView('dashboard');
      } else if (path === '/dashboard' && isAuthenticated) {
        setCurrentView('dashboard');
      } else if (path === '/inbox' && isAuthenticated) {
        setCurrentView('inbox');
      } else if (path === '/history' && isAuthenticated) {
        setCurrentView('history');
      } else if (path.startsWith('/create-pst') && isAuthenticated) {
        const poNumber = path.split('/')[2];
        setSelectedPOForPST(poNumber || null);
        setCurrentView('create-pst');
      } else if (path.startsWith('/create-psw') && isAuthenticated) {
        const poNumber = path.split('/')[2];
        setSelectedPOForPSW(poNumber || null);
        setCurrentView('create-psw');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, needsOTP]);

  // Calculate enhanced PO KPIs for compact layout
  // Use API data when available, fallback to mock data
  const dateRange = useMemo(() => {
    const range = getDateRange(dateFilterMode, customDateStart, customDateEnd);
    return formatDateRangeForAPI(range);
  }, [dateFilterMode, customDateStart, customDateEnd]);

  const {
    data: poListData,
    loading: isAPILoading,
    refetch: refetchPOList
  } = useEShippingPOList({
    fromDate: dateRange.start,
    toDate: dateRange.end,
    transportBy: selectedTransportType === 'all' ? undefined : selectedTransportType,
    keyword: '',
    pstStatus: selectedPSTStatus === 'all' ? '' : selectedPSTStatus,
    pswStatus: selectedPSWStatus === 'all' ? '' : selectedPSWStatus
  });

  // Convert API data to Shipment format
  const shipments = useMemo(() => {
    if (poListData && poListData.length > 0) {
      return convertPOListToShipments(poListData);
    }
    // Fallback to mock data when API is not available
    return mockShipments;
  }, [poListData]);

  // Calculate KPIs from current shipments data
  const kpis = useMemo(() => calculateKPIs(shipments), [shipments]);

  // Generate PST number
  const generatePSTNumber = () => {
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PST-${new Date().getFullYear()}-${random}`;
  };

  // Generate PSW number
  const generatePSWNumber = () => {
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PSW-${new Date().getFullYear()}-${random}`;
  };

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      console.log('Attempting login with credentials:', { username: credentials.username });
      
      // เรียกใช้ AuthService.login เพื่อส่งข้อมูลไปยัง JAGOTA API
      const loginResponse = await AuthService.login({
        username: credentials.username,
        password: credentials.password
      });
      
      console.log('Login response:', loginResponse);
      
      if (loginResponse.data.status === 'success' && loginResponse.data.token) {
        // Handle remember me functionality
        if (credentials.rememberMe) {
          localStorage.setItem('jagota_remember_credentials', JSON.stringify({
            username: credentials.username,
            rememberMe: true
          }));
        } else {
          localStorage.removeItem('jagota_remember_credentials');
        }
        
        // เก็บ login token และข้อมูลการ login
        setLoginToken(loginResponse.data.token);
        setLoginRefno(loginResponse.data.refno);
        setLoginCredentials(credentials);
        
        // ตั้งค่าข้อมูลผู้ใช้เบื้องต้น
        setUser({
          name: credentials.username,
          email: credentials.username,
          company: 'JB',
          supCode: ''
        });
        
        // เปลี่ยนไปหน้า OTP
        setOtpEmail(credentials.username); // ใช้ username แทน email
        setNeedsOTP(true);
        
        console.log('Login successful, redirecting to OTP verification');
      } else {
        console.error('Login failed: Invalid response structure');
        alert('เข้าสู่ระบบไม่สำเร็จ: ไม่สามารถเข้าสู่ระบบได้');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ' + (error.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'));
    }
  };

  const handleOTPVerification = async (otpCode: string) => {
    try {
      if (!loginToken || !loginCredentials) {
        alert('ไม่พบข้อมูลการ login กรุณาเข้าสู่ระบบใหม่');
        setNeedsOTP(false);
        return;
      }

      console.log('Verifying OTP with token:', loginToken);
      
      // เรียกใช้ AuthService.validateOTP
      const otpResponse = await AuthService.validateOTP({
        username: loginCredentials.username,
        moduleName: 'SHIPPING',
        token: loginToken,
        otp: otpCode
      });

      console.log('OTP validation response:', otpResponse);

      if (!otpResponse.error && otpResponse.accessToken) {
        // บันทึก access token
        localStorage.setItem('auth_token', otpResponse.accessToken);
        
        // อัปเดตข้อมูลผู้ใช้จาก OTP response
        setUser({
          name: otpResponse.data.contactPerson || loginCredentials.username,
          email: loginCredentials.username,
          company: otpResponse.data.company,
          supCode: otpResponse.data.supCode
        });

        // บันทึกข้อมูลผู้ใช้ใน localStorage
        localStorage.setItem('user_data', JSON.stringify({
          name: otpResponse.data.contactPerson || loginCredentials.username,
          email: loginCredentials.username,
          company: otpResponse.data.company,
          supCode: otpResponse.data.supCode
        }));

        // เข้าสู่ระบบสำเร็จ
        setIsAuthenticated(true);
        setNeedsOTP(false);
        setOtpEmail('');
        setLoginToken('');
        setLoginCredentials(null);

        console.log('OTP verification successful, user authenticated');
      } else {
        console.error('OTP validation failed:', otpResponse.message);
        alert('รหัส OTP ไม่ถูกต้อง: ' + (otpResponse.message || 'กรุณาลองใหม่อีกครั้ง'));
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      alert('เกิดข้อผิดพลาดในการยืนยัน OTP: ' + (error.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'));
    }
  };

  const handleBackToLogin = () => {
    setNeedsOTP(false);
    setOtpEmail('');
  };

  const handleResendOTP = async () => {
    // Simulate resend OTP API call
    console.log('Resending OTP to:', otpEmail);
  };

  const handleLogout = () => {
    // เรียก AuthService.logout() เพื่อเคลียร์ token และข้อมูลทั้งหมด
    AuthService.logout();
    
    setIsAuthenticated(false);
    setUser(null);
    setNeedsOTP(false);
    setOtpEmail('');
    setLoginToken('');
    setLoginRefno('');
    setLoginCredentials(null);
    setCurrentView('dashboard');
    // Reset other state as needed
    setSelectedShipment(null);
    setIsPanelOpen(false);
    setIsNotificationOpen(false);
    setCreatedPSTNumber(null);
    setCreatedPSWNumber(null);
    
    // Update URL to login page
    window.history.pushState(null, '', '/login');
  };

  const handleHistoryClick = () => {
    setIsTransitioning(true);
    setCurrentView('history');
    // Reset transition state after animation
    setTimeout(() => setIsTransitioning(false), 400);
  };

  const handleCloseHistory = () => {
    setIsTransitioning(true);
    setCurrentView('dashboard');
    setTimeout(() => setIsTransitioning(false), 400);
  };

  const handleForgotPassword = async (email: string) => {
    console.log('Password reset requested for:', email);
    // Simulate password reset
    return Promise.resolve();
  };

  const handleSignUp = async (credentials: LoginCredentials & { confirmPassword: string }) => {
    console.log('Sign up attempted:', credentials);
    // Simulate sign up
    return Promise.resolve();
  };

  // Helper function to handle date filter mode change
  const handleDateFilterChange = (mode: DateFilterMode) => {
    setIsDataLoading(true);
    setDateFilterMode(mode);
    // When switching to custom mode, set dates to current date
    if (mode === 'custom') {
      const currentDate = new Date().toISOString().split('T')[0];
      setCustomDateStart(currentDate);
      setCustomDateEnd(currentDate);
    } else {
      // Clear custom dates when switching away from custom mode
      setCustomDateStart('');
      setCustomDateEnd('');
    }
    // Simulate data loading delay
    setTimeout(() => setIsDataLoading(false), 300);
  };

  // Refetch API data when essential filters change only (with debounce for custom dates)
  useEffect(() => {
    if (!isAuthenticated || !refetchPOList) return;
    
    // Debounce custom date changes to prevent excessive API calls
    if (dateFilterMode === 'custom' && (customDateStart || customDateEnd)) {
      const debounceTimeout = setTimeout(() => {
        refetchPOList();
      }, 500); // รอ 500ms หลังจากหยุดการพิมพ์
      
      return () => clearTimeout(debounceTimeout);
    } else if (dateFilterMode !== 'custom') {
      // เรียกทันทีสำหรับ predefined filters
      refetchPOList();
    }
  }, [dateFilterMode, customDateStart, customDateEnd, selectedTransportType, selectedPSTStatus, selectedPSWStatus, isAuthenticated, refetchPOList]);

  // Enhanced filter and sort shipments with new separated status filters
  const filteredShipments = useMemo(() => {
    let filtered = shipments.filter(shipment => {
      // Transport Type filtering (new API-based filter)
      let matchesTransportType = true;
      if (selectedTransportType !== 'all') {
        // Map API transport type to shipment type
        const transportTypeMap: { [key: string]: string } = {
          'Sea Freight': 'Sea',
          'Air Freight': 'Air', 
          'Land Freight': 'Land'
        };
        const mappedType = transportTypeMap[selectedTransportType] || selectedTransportType;
        matchesTransportType = shipment.type === mappedType;
      }
      
      // PO Type filtering
      const matchesTabPOType = activePOTypeTab === 'all' || shipment.poType === activePOTypeTab;
      
      // PST Status filtering (ใช้สำหรับ fallback หรือ mock data)
      let matchesPSTStatus = true;
      if (selectedPSTStatus !== '') {
        // ใช้ค่าตรงๆ จาก API (N, Y, Z)
        matchesPSTStatus = shipment.pstStatus === selectedPSTStatus;
      }
      
      // PSW Status filtering
      let matchesPSWStatus = true;
      if (selectedPSWStatus !== 'all') {
        switch (selectedPSWStatus) {
          case 'pending':
            matchesPSWStatus = shipment.pstNumber !== null && !shipment.pswNumber;
            break;
          case 'done':
            matchesPSWStatus = shipment.pswNumber !== null;
            break;
        }
      }
      
      // Enhanced search functionality - search by Reference key, Invoice No., PO no., PE number, PST number, PSW number, import entry no., BL/AWB no., country of origin
      const matchesSearch = searchTerm === '' || 
        shipment.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.referenceKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.importEntryNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (shipment.pstNumber && shipment.pstNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (shipment.pswNumber && shipment.pswNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        shipment.blAwbNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.originCountry.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Date range filtering based on current filter mode
      let matchesDateRange = true;
      const { start, end } = getDateRange(dateFilterMode, customDateStart, customDateEnd);
      
      if (start && end) {
        matchesDateRange = shipment.etd >= start && shipment.etd <= end;
      } else if (start) {
        matchesDateRange = shipment.etd >= start;
      } else if (end) {
        matchesDateRange = shipment.etd <= end;
      }
      
      return matchesTransportType && matchesTabPOType && matchesPSTStatus && 
             matchesPSWStatus && matchesSearch && matchesDateRange;
    });

    // Apply sorting
    if (sortOption !== 'none') {
      filtered.sort((a, b) => {
        if (sortOption === 'clearDate-asc' || sortOption === 'clearDate-desc') {
          const aDate = new Date(a.dateClear).getTime();
          const bDate = new Date(b.dateClear).getTime();
          return sortOption === 'clearDate-asc' ? aDate - bDate : bDate - aDate;
        }
        
        if (sortOption === 'status-asc' || sortOption === 'status-desc') {
          const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 999;
          const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 999;
          return sortOption === 'status-asc' ? aPriority - bPriority : bPriority - aPriority;
        }
        
        return 0;
      });
    }

    return filtered;
  }, [shipments, selectedTransportType, selectedPSTStatus, selectedPSWStatus, 
      dateFilterMode, customDateStart, customDateEnd, 
      activePOTypeTab, searchTerm, sortOption]);

  const handleShipmentClick = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsPanelOpen(true);
  };

  const handleCreatePST = (poNumber?: string) => {
    setIsTransitioning(true);
    setSelectedPOForPST(poNumber || null);
    setCurrentView('create-pst');
    // Reset PST states when creating new
    setCreatedPSTNumber(null);
    setPstCompleted(false);
    // Reset transition state after animation
    setTimeout(() => setIsTransitioning(false), 400);
  };

  const handleCreatePSW = (poNumber?: string) => {
    setIsTransitioning(true);
    setSelectedPOForPSW(poNumber || null);
    setCurrentView('create-psw');
    // Reset transition state after animation
    setTimeout(() => setIsTransitioning(false), 400);
  };

  const handleClosePSTForm = () => {
    setIsTransitioning(true);
    setCurrentView('dashboard');
    setSelectedPOForPST(null);
    // Keep PST completed status and number for dashboard display
    // Don't reset these when just closing the form
    setTimeout(() => setIsTransitioning(false), 400);
  };

  const handleClosePSWForm = () => {
    setIsTransitioning(true);
    setCurrentView('dashboard');
    setSelectedPOForPSW(null);
    // Keep PSW completed status and number for dashboard display
    // Don't reset these when just closing the form
    setTimeout(() => setIsTransitioning(false), 400);
  };

  const handlePSTSubmit = async (data: any) => {
    console.log('PST Form submitted:', data);
    
    // Store the pending data and show confirmation dialog
    setPendingPSTData(data);
    setShowPSTConfirmDialog(true);
    
    return Promise.resolve();
  };

  const handlePSTConfirmSubmit = async () => {
    try {
      // Generate PST number
      const newPSTNumber = generatePSTNumber();
      setCreatedPSTNumber(newPSTNumber);
      
      // Here you would typically send the data to your API
      console.log('Processing PST data:', pendingPSTData);
      
      // Mark as completed
      setPstCompleted(true);
      
      // Close the confirmation dialog
      setShowPSTConfirmDialog(false);
      setPendingPSTData(null);
      
      // Navigate to dashboard after a short delay to show success message
      setTimeout(() => {
        setCurrentView('dashboard');
        setSelectedPOForPST(null);
      }, 1500);
      
    } catch (error) {
      console.error('Error processing PST:', error);
      // Handle error appropriately
    }
  };

  const handlePSTConfirmCancel = () => {
    setShowPSTConfirmDialog(false);
    setPendingPSTData(null);
  };

  const handlePSWSubmit = async (data: any) => {
    console.log('PSW Form submitted:', data);
    
    // Generate PSW number
    const newPSWNumber = generatePSWNumber();
    setCreatedPSWNumber(newPSWNumber);
    
    // Here you would typically send the data to your API
    // For now, we'll just simulate success
    setPswCompleted(true);
    
    return Promise.resolve();
  };

  const handleViewDocs = () => {
    alert('View Documents functionality would be implemented here');
  };

  const handleNotificationClick = (notification: any) => {
    const shipment = shipments.find(s => s.poNumber === notification.poNumber);
    if (shipment) {
      setSelectedShipment(shipment);
      setIsPanelOpen(true);
      setIsNotificationOpen(false);
    }
  };

  // Show login screen if not authenticated
  if (!isAuthenticated && !needsOTP) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onForgotPassword={handleForgotPassword}
        onSignUp={handleSignUp}
      />
    );
  }

  // Show OTP verification screen
  if (needsOTP && !isAuthenticated) {
    return (
      <OTPVerification
        email={otpEmail}
        refno={loginRefno}
        onVerifySuccess={handleOTPVerification}
        onBackToLogin={handleBackToLogin}
        onResendOTP={handleResendOTP}
      />
    );
  }

  // Render PST Form if currentView is 'create-pst'
  if (currentView === 'create-pst') {
    return (
      <>
        <CreatePSTForm
          createdPSTNumber={createdPSTNumber}
          onClose={handleClosePSTForm}
          onSubmit={handlePSTSubmit}
        />
        
        {/* PST Confirmation Dialog */}
        <AlertDialog open={showPSTConfirmDialog} onOpenChange={setShowPSTConfirmDialog}>
          <AlertDialogContent className="max-w-lg bg-white">
            <AlertDialogHeader className="bg-white">
              <AlertDialogTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Confirm PST Submission
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                You are about to submit your PST (Prepare for Shipping Tax) request. Please review the details before confirming.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            {/* Details Section - Outside of AlertDialogDescription to avoid nesting issues */}
            {pendingPSTData && (
              <div className="px-6 pb-4 bg-white">
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">PO Number:</span>
                    <span className="font-medium">{selectedPOForPST || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Supplier:</span>
                    <span className="font-medium">{pendingPSTData.supplierName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Invoice No:</span>
                    <span className="font-medium">{pendingPSTData.invoiceNo}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Currency:</span>
                    <span className="font-medium">{pendingPSTData.currency}</span>
                  </div>
                  {pendingPSTData.expenseSummary && pendingPSTData.expenseSummary.total > 0 && (
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="text-gray-600">Total Tax & Expenses:</span>
                      <span className="font-semibold text-green-600">
                        {pendingPSTData.expenseSummary.total.toFixed(2)} {pendingPSTData.currency}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg mt-3">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>After submission, you will be redirected to the dashboard where you can track your PST status.</span>
                </div>
              </div>
            )}
            
            <AlertDialogFooter className="flex gap-2 bg-white border-t border-gray-100 pt-4">
              <Button
                variant="outline"
                onClick={handlePSTConfirmCancel}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <AlertDialogAction
                onClick={handlePSTConfirmSubmit}
                className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
              >
                <span>Confirm & Submit</span>
                <ArrowRight className="w-4 h-4" />
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Render PSW Form if currentView is 'create-psw'
  if (currentView === 'create-psw') {
    return (
      <CreatePSWForm
        poNumber={selectedPOForPSW || undefined}
        pstNumber={createdPSTNumber || "PST-2025-001"}
        onClose={handleClosePSWForm}
        onSubmit={handlePSWSubmit}
      />
    );
  }

  // Render Inbox if currentView is 'inbox'
  if (currentView === 'inbox') {
    return (
      <div className={`min-h-screen bg-gray-50 flex flex-col transition-all duration-300 ${isTransitioning ? 'opacity-90' : 'opacity-100'}`}>
        {/* Header - Sticky at top */}
        <Header
          user={user}
          onLogout={handleLogout}
          unreadNotificationCount={unreadNotificationCount}
          onNotificationClick={() => setIsNotificationOpen(true)}
          onHistoryClick={handleHistoryClick}
          notifications={[]}
          isNotificationOpen={false}
          setIsNotificationOpen={() => {}}
          onMarkNotificationAsRead={() => {}}
          onMarkAllNotificationsAsRead={() => {}}
          onDeleteNotification={() => {}}
          NotificationCenter={NotificationCenter}
        />
        
        {/* Main Scrollable Content */}
        <div className="flex-1 relative">
          {/* Top Section for spacing */}
          <div className="px-6 pt-6">
            <div className="max-w-7xl mx-auto">
              {/* Optional: Add breadcrumb or other top content here */}
            </div>
          </div>
          
          {/* Inbox Content */}
          <InboxContainer />
        </div>
        
        <Footer />
      </div>
    );
  }

  // Render HistoryView if currentView is 'history'
  if (currentView === 'history') {
    return (
      <HistoryView onBack={handleCloseHistory} />
    );
  }

  // Render main dashboard with proper sticky layout
  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col transition-all duration-300 ${isTransitioning ? 'opacity-90' : 'opacity-100'}`}>
      {/* Header - Sticky at top */}
      <Header
        notifications={notifications}
        unreadNotificationCount={unreadNotificationCount}
        isNotificationOpen={isNotificationOpen}
        setIsNotificationOpen={setIsNotificationOpen}
        onNotificationClick={handleNotificationClick}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        onDeleteNotification={handleDeleteNotification}
        NotificationCenter={NotificationCenter}
        user={user}
        onLogout={handleLogout}
        onHistoryClick={handleHistoryClick}
      />

      {/* Main Scrollable Content */}
      <div className="flex-1 relative">
        {/* Top Section - Status Badges and KPIs */}
        <div className="px-6 pt-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Completion Badges - Show when completed */}
            {(createdPSTNumber && pstCompleted) || (createdPSWNumber && pswCompleted) ? (
              <div className="flex justify-center gap-4">
                {createdPSTNumber && pstCompleted && (
                  <Badge className="bg-green-50 text-green-700 border-green-200 px-4 py-2 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    PST Completed: {createdPSTNumber}
                    <FileText className="w-4 h-4 ml-2" />
                  </Badge>
                )}
                {createdPSWNumber && pswCompleted && (
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    PSW Completed: {createdPSWNumber}
                    <Calendar className="w-4 h-4 ml-2" />
                  </Badge>
                )}
              </div>
            ) : null}

            {/* KPI Section */}
            <KPISection kpis={kpis} />
          </div>
        </div>

        {/* Sticky Filter Bar with Segment & View Controls */}
        <div className="sticky top-0 z-40">
          <FilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedTransportType={selectedTransportType}
            setSelectedTransportType={setSelectedTransportType}
            selectedPSTStatus={selectedPSTStatus}
            setSelectedPSTStatus={setSelectedPSTStatus}
            selectedPSWStatus={selectedPSWStatus}
            setSelectedPSWStatus={setSelectedPSWStatus}
            selectedPriority={selectedPriority}
            setSelectedPriority={setSelectedPriority}
            dateFilterMode={dateFilterMode}
            handleDateFilterChange={handleDateFilterChange}
            customDateStart={customDateStart}
            setCustomDateStart={setCustomDateStart}
            customDateEnd={customDateEnd}
            setCustomDateEnd={setCustomDateEnd}
            filteredShipments={filteredShipments}
            activePOTypeTab={activePOTypeTab}
            setActivePOTypeTab={setActivePOTypeTab}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>

        {/* Main Content */}
        <div className="px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            <MainContent
              activePOTypeTab={activePOTypeTab}
              viewMode={viewMode}
              filteredShipments={filteredShipments}
              selectedShipment={selectedShipment}
              sortOption={sortOption}
              onShipmentClick={handleShipmentClick}
              onCreatePST={handleCreatePST}
              onCreatePSW={handleCreatePSW}
              onSortOptionChange={setSortOption}
              isLoading={isDataLoading || isAPILoading}
            />
          </div>
        </div>

        {/* Side Panel - Positioned overlay */}
        <SidePanel
          isOpen={isPanelOpen}
          onOpenChange={setIsPanelOpen}
          selectedShipment={selectedShipment}
          onCreatePST={handleCreatePST}
          onCreatePSW={handleCreatePSW}
          onViewDocs={handleViewDocs}
        />
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}