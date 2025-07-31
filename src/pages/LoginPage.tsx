import { useNavigate } from 'react-router-dom';
import { LoginScreen } from '../components/LoginScreen';

interface LoginCredentials {
  email: string;
  password: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  
  const handleLogin = async (_credentials: LoginCredentials) => {
    // Simulate login process
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.removeItem('isOTPVerified'); // Reset OTP status on new login
    navigate('/otp', { replace: true });
  };

  const handleForgotPassword = async (email: string) => {
    console.log('Forgot password for:', email);
    // Implement forgot password logic
  };

  const handleSignUp = async (credentials: LoginCredentials & { confirmPassword: string }) => {
    console.log('Sign up:', credentials);
    // Implement sign up logic
  };

  return (
    <LoginScreen 
      onLogin={handleLogin}
      onForgotPassword={handleForgotPassword}
      onSignUp={handleSignUp}
    />
  );
}
