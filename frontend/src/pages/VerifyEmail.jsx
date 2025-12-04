import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { verifyOTP, resendOTP } from '../store/slices/authSlice';
import Layout from '../components/common/Layout';
import { toast } from 'react-hot-toast';
import { 
  EnvelopeIcon, 
  ArrowPathIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

const VerifyEmail = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const inputRefs = useRef([]);
  
  // Get email from location state
  const { email } = location.state || {};
  
  useEffect(() => {
    if (!email) {
      toast.error('Registration session expired');
      navigate('/register');
    }
  }, [email, navigate]);
  
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);
  
  // Add effect for auto-redirect after verification
  useEffect(() => {
    if (verificationSuccess) {
      const redirectTimer = setTimeout(() => {
        navigate('/');
      }, 2000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [verificationSuccess, navigate]);
  
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d{6}$/.test(pasteData)) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await dispatch(verifyOTP({ email, otp: otpCode })).unwrap();
      toast.success('Email verified successfully!');
      setVerificationSuccess(true);
      
      // Don't navigate here - let the useEffect handle it
    } catch (error) {
      toast.error(error.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    
    try {
      await dispatch(resendOTP({ email })).unwrap();
      toast.success('New OTP sent to your email');
      setCountdown(60); // Reset countdown
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };
  
  if (!email) {
    return null;
  }
  
  if (verificationSuccess) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Email Verified!
            </h2>
            <p className="mt-2 text-gray-600">
              Your email has been successfully verified. 
              <br />
              Redirecting you to the home page in 2 seconds...
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100">
              <EnvelopeIcon className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Verify Your Email
            </h2>
            <p className="mt-2 text-gray-600">
              We've sent a 6-digit verification code to
            </p>
            <p className="font-medium text-gray-900">{email}</p>
            <p className="mt-2 text-sm text-gray-500">
              Enter the code below to complete your registration
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Verification Code
              </label>
              <div className="flex justify-center space-x-2" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  />
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <button
                type="submit"
                disabled={isLoading || otp.join('').length !== 6}
                className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || isResending}
                  className="font-medium text-primary-600 hover:text-primary-500 disabled:opacity-50"
                >
                  {isResending ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 inline animate-spin mr-1" />
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    `Resend in ${countdown}s`
                  ) : (
                    'Resend OTP'
                  )}
                </button>
              </p>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>The code will expire in 10 minutes</p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyEmail;