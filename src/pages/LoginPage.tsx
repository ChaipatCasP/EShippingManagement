import { useNavigate } from 'react-router-dom';
import { LoginScreen } from '../components/LoginScreen';

export default function LoginPage() {
  const navigate = useNavigate();
  
  const handleLoginSuccess = () => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.removeItem('isOTPVerified'); // Reset OTP status on new login
    navigate('/otp', { replace: true });
  };

  return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
}
