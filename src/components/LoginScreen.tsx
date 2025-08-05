import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Globe, 
  Shield,
  AlertTriangle,
  ArrowRight,
  Loader2
} from 'lucide-react';
// import jagotaLogo from 'figma:asset/f9992255b81ceaea2bb1cfe9e3d3c7bbe4bb82bf.png';

interface LoginScreenProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onForgotPassword: (email: string) => Promise<void>;
  onSignUp: (credentials: LoginCredentials & { confirmPassword: string }) => Promise<void>;
}

interface LoginCredentials {
  username: string;
  password: string;
  rememberMe: boolean;
}

const REMEMBER_ME_KEY = 'jagota_remember_credentials';

export function LoginScreen({ onLogin, onForgotPassword, onSignUp }: LoginScreenProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load saved credentials on component mount
  useEffect(() => {
    try {
      const savedCredentials = localStorage.getItem(REMEMBER_ME_KEY);
      if (savedCredentials) {
        const parsed = JSON.parse(savedCredentials);
        
        // Check if saved credentials are still valid (within 30 days)
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        const isExpired = parsed.timestamp && (Date.now() - parsed.timestamp > thirtyDaysInMs);
        
        if (isExpired) {
          localStorage.removeItem(REMEMBER_ME_KEY);
          console.log('Saved credentials expired, cleared from storage');
        } else {
          setCredentials(prev => ({
            ...prev,
            username: parsed.username || '',
            password: parsed.password || '',
            rememberMe: true
          }));
        }
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error);
      // Clear invalid data
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  }, []);

  const handleInputChange = (field: keyof LoginCredentials, value: string | boolean) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    
    // Handle remember me toggle
    if (field === 'rememberMe') {
      if (!value) {
        // If unchecked, remove saved credentials
        localStorage.removeItem(REMEMBER_ME_KEY);
      }
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!credentials.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (credentials.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!credentials.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await onLogin(credentials);
      
      // Save credentials if remember me is checked
      if (credentials.rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          timestamp: Date.now()
        }));
      } else {
        // Remove saved credentials if remember me is not checked
        localStorage.removeItem(REMEMBER_ME_KEY);
      }
    } catch (error) {
      setErrors({ general: 'Invalid username or password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Header with JAGOTA Branding */}
      <header className="relative bg-navy-900 text-white" style={{ backgroundColor: '#0c1631' }}>
        {/* Dark navy gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-gray-900"></div>
        
        {/* Content overlay */}
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left side - Logo and Title */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  {/* JAGOTA Logo Image */}
                  <div className="flex items-center">
                    <div 
                      className="h-8 px-4 bg-white text-black rounded flex items-center text-sm font-bold"
                    >
                      JAGOTA
                    </div>
                  </div>
                  <div className="h-8 w-px bg-gray-400"></div>
                  <div>
                    <h1 className="text-xl font-semibold text-white">Jagota eShipping</h1>
                    <p className="text-xs text-gray-300">Premium Food Ingredients Trading & Logistics</p>
                  </div>
                </div>
              </div>

              {/* Right side - Security Badge */}
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
                  <Shield className="w-3 h-3 mr-1" />
                  Secure Login
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Login Content */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[rgba(232,241,255,0.98)]">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Simplified Brand Messaging */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Main Brand Message */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-slate-700 font-medium text-sm">
                <Globe className="w-4 h-4" />
                Premium Food Ingredients Trading Since 1985
              </div>
              
              <div className="space-y-4">
                <h2 className="text-5xl font-bold text-gray-900 leading-tight">
                  Welcome to<br />
                  <span className="text-slate-700">JAGOTA</span> eShipping
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Leading distributor of premium food ingredients with comprehensive logistics and import management solutions.
                </p>
              </div>
            </div>


          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="shadow-lg border-0">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
                <p className="text-sm text-gray-600 text-center">
                  Access your premium food ingredients trading platform
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* General Error */}
                  {errors.general && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-700">{errors.general}</span>
                    </div>
                  )}

                  {/* Username Field */}
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={credentials.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className={`pl-10 ${errors.username ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.username && (
                      <p className="text-sm text-red-600">{errors.username}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={credentials.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        checked={credentials.rememberMe}
                        onCheckedChange={(checked) => handleInputChange('rememberMe', checked as boolean)}
                        disabled={isLoading}
                      />
                      <Label htmlFor="rememberMe" className="text-sm">Remember me</Label>
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-sm"
                      onClick={() => onForgotPassword(credentials.username)}
                      disabled={isLoading}
                    >
                      Forgot password?
                    </Button>
                  </div>

                  {/* Sign In Button */}
                  <Button 
                    type="submit" 
                    className="w-full flex items-center justify-center gap-2" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>

                  <Separator />

                  {/* Sign Up Link */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{' '}
                      <Button
                        type="button"
                        variant="link"
                        className="px-0 text-sm font-medium"
                        onClick={() => onSignUp({ ...credentials, confirmPassword: '' })}
                        disabled={isLoading}
                      >
                        Contact Administrator
                      </Button>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Demo Credentials */}
            {/* <Card className="mt-4 bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="text-center">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials</h3>
                  <div className="space-y-1 text-xs text-blue-700">
                    <p><strong>Email:</strong> demo@jagota.com</p>
                    <p><strong>Password:</strong> demo123</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-blue-200">
                    <p className="text-xs text-blue-600">
                      💡 Check "Remember me" to save credentials for faster login
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-white" style={{ backgroundColor: '#0c1631' }}>
        <div className="bg-gradient-to-r from-slate-900 to-gray-900">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span>© 2025 JAGOTA eShipping Platform</span>
                <Separator orientation="vertical" className="h-4 bg-gray-400" />
                <span>Powered by Compass Softwares (Thailand) Ltd.</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>Version 2.1.0</span>
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
                  <Shield className="w-3 h-3 mr-1" />
                  Secure
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}