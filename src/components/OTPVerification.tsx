import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { LoadingSpinner } from './ui/loading';
import { ArrowLeft, Shield, Mail, RefreshCw, CheckCircle2 } from 'lucide-react';

interface OTPVerificationProps {
  email: string;
  refno?: string;
  onVerifySuccess: (otpCode: string) => void;
  onBackToLogin: () => void;
  onResendOTP?: () => Promise<void>;
}

interface OTPInputProps {
  length: number;
  onComplete: (otp: string) => void;
  disabled?: boolean;
  error?: boolean;
}

const OTPInput = ({ length, onComplete, disabled, error }: OTPInputProps) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    // Reset OTP when error changes
    if (error) {
      setOtp(new Array(length).fill(''));
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }
  }, [error, length]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if OTP is complete
    if (newOtp.join('').length === length) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Move to previous input on backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Move to next input on arrow right
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    // Move to previous input on arrow left
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, length);
    if (!/^\d+$/.test(pasteData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasteData.length && i < length; i++) {
      newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);

    // Focus last filled input or next empty one
    const nextIndex = Math.min(pasteData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();

    // Check if OTP is complete
    if (newOtp.join('').length === length) {
      onComplete(newOtp.join(''));
    }
  };

  return (
    <div className="flex justify-center space-x-3">
      {otp.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg transition-all duration-200 ${
            error 
              ? 'border-red-500 bg-red-50 text-red-900' 
              : digit 
                ? 'border-blue-500 bg-blue-50 text-blue-900' 
                : 'border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500'
          }`}
          autoComplete="off"
        />
      ))}
    </div>
  );
};

export function OTPVerification({ 
  email, 
  refno,
  onVerifySuccess, 
  onBackToLogin,
  onResendOTP 
}: OTPVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string>('');
  const [success] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;
  const otpLength = 6;

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-start cooldown on mount
  useEffect(() => {
    setResendCooldown(30);
  }, []);

  const handleOTPComplete = async (otp: string) => {
    if (isVerifying || success) return;

    setIsVerifying(true);
    setError('');

    try {
      // เรียก onVerifySuccess ซึ่งจะไปเรียก AuthService.validateOTP ใน App.tsx
      await onVerifySuccess(otp);
      
      // หาก success จะถูกจัดการใน App.tsx แล้ว
      // OTP component นี้จะถูกซ่อนเมื่อ authentication สำเร็จ
      
    } catch (error: any) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= maxAttempts) {
        setError(`Invalid OTP. Maximum attempts (${maxAttempts}) reached. Please try again later.`);
      } else {
        setError(error.message || `Invalid OTP. ${maxAttempts - newAttempts} attempts remaining.`);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (isResending || resendCooldown > 0) return;

    setIsResending(true);
    setError('');
    setAttempts(0); // Reset attempts on resend

    try {
      if (onResendOTP) {
        await onResendOTP();
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setResendCooldown(30);
      setError('');
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    return `${username[0]}${'*'.repeat(username.length - 2)}${username[username.length - 1]}@${domain}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            {success ? (
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            ) : (
              <Shield className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {success ? 'Verification Successful!' : 'Enter Verification Code'}
          </CardTitle>
          <div className="space-y-2">
            <div className="flex items-center justify-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2" />
              We sent a code to
            </div>
            <div className="font-medium text-gray-900">{maskEmail(email)}</div>
            {refno && (
              <div className="text-xs text-gray-500 text-center">
                Reference: <span className="font-mono font-medium">{refno}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!success && (
            <>
              <div className="space-y-4">
                <OTPInput
                  length={otpLength}
                  onComplete={handleOTPComplete}
                  disabled={isVerifying || attempts >= maxAttempts}
                  error={!!error}
                />

                {isVerifying && (
                  <div className="flex items-center justify-center py-2">
                    <LoadingSpinner className="w-5 h-5 mr-2" />
                    <span className="text-sm text-gray-600">Verifying...</span>
                  </div>
                )}
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-center space-y-3">
                <div className="text-sm text-gray-600">
                  Didn't receive the code?
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOTP}
                  disabled={isResending || resendCooldown > 0 || attempts >= maxAttempts}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend Code
                    </>
                  )}
                </Button>
              </div>

              <div className="border-t pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBackToLogin}
                  className="w-full text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </div>
            </>
          )}

          {success && (
            <div className="text-center space-y-4">
              <div className="text-green-600 font-medium">
                OTP verified successfully!
              </div>
              <div className="text-sm text-gray-600">
                Redirecting to dashboard...
              </div>
              <div className="w-full bg-green-100 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </div>
          )}

          {/* Demo Information */}
          <div className="text-xs text-gray-400 text-center space-y-1 border-t pt-4">
            <div>Demo OTP: 123456 or 000000</div>
            <div>For testing purposes only</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}