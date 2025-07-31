import { useNavigate, useLocation } from 'react-router-dom';
import { OTPVerification } from '../components/OTPVerification';

export default function OTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleOTPSuccess = () => {
    localStorage.setItem('isOTPVerified', 'true');
    const from = location.state?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  };

  const handleBackToLogin = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isOTPVerified');
    navigate('/login', { replace: true });
  };

  return (
    <OTPVerification 
      email="user@example.com" // In real app, get from auth context
      onVerifySuccess={handleOTPSuccess}
      onBackToLogin={handleBackToLogin}
    />
  );
}
