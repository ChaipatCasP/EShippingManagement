import { useNavigate } from 'react-router-dom';
import { LoginScreen } from '../components/LoginScreen';

interface LoginCredentials {
  username: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const navigate = useNavigate();
  
  const handleLogin = async (_credentials: LoginCredentials) => {
    // Simulate login process
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.removeItem('isOTPVerified'); // Reset OTP status on new login
    navigate('/otp', { replace: true });
  };

  const handleForgotPassword = async (username: string) => {
    console.log('Forgot password for:', username);
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
