'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { verifyResetOTP, resendOTP } from '@/Api/Authentication';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
}) => {
  const baseClasses = 'rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-[#E67E22] text-white hover:bg-[#d35400] focus:ring-[#E67E22]',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border-2 border-[#E67E22] text-[#E67E22] hover:bg-[#fffaf6] focus:ring-[#E67E22]'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-base'
  };

  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      className={baseClasses + ' ' + variantClass + ' ' + sizeClass + ' ' + className + ' ' + (disabled || isLoading ? 'opacity-50 cursor-not-allowed' : '')}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Verifying...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  disabled = false,
  maxLength,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={
            'w-full px-2 py-2 border rounded-lg shadow-sm ' +
            'focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-[#E67E22] ' +
            'text-center text-lg font-semibold ' +
            (error ? 'border-red-500 ' : 'border-gray-300 ') +
            (disabled ? 'bg-gray-100 cursor-not-allowed ' : '') +
            className
          }
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default function verifyResetOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!email) {
      router.push('/auth/register');
    }
  }, [email, router]);

  // Timer for resend OTP
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newOtp = [...otp];
      digits.forEach((digit, index) => {
        if (index < 6) newOtp[index] = digit;
      });
      setOtp(newOtp);
      
      const nextIndex = Math.min(digits.length, 5);
      const nextInput = document.getElementById(`otp-${nextIndex}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyResetOTP(email, otpString);
      
      if (response.success) {
        toast.success('Email verified successfully! Redirecting to dashboard...', {
          position: 'top-right',
          autoClose: 3000,
        });
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    } catch (error) {
      toast.error(error.message || 'Invalid OTP. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleresendOTP = async () => {
    if (!canResend) return;
    
    setResendLoading(true);
    try {
      // Call resend OTP API
      await resendOTP(email);
      
      toast.success('New OTP sent to your email!', {
        position: 'top-right',
        autoClose: 3000,
      });
      
      setTimeLeft(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      
      // Focus first input after resend
      setTimeout(() => {
        document.getElementById('otp-0')?.focus();
      }, 100);
      
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
      <div className="h-screen flex flex-col lg:flex-row overflow-hidden bg-[#fffaf6]">
        {/* Left Side - Branding/Info */}
        <div className="lg:w-1/2 bg-[#122652] p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-[#E67E22] rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-[#3C719D] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#E67E22] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-[#E67E22] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">Logi<span className="text-[#E67E22]">Swift</span></span>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-3">
                Verify Your
                <span className="text-[#E67E22] block">Email Address</span>
              </h1>
              <p className="text-gray-300 text-base max-w-md mb-4">
                We've sent a verification code to your email. Please enter it below to complete your registration.
              </p>

              {/* Email Info */}
              <div className="mb-4 p-3 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
                <p className="text-gray-200 text-xs">
                  Verification email sent to:
                </p>
                <p className="text-white font-semibold text-sm mt-0.5 break-all">
                  {email}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-4">
                {[
                  'Secure verification process',
                  'Quick account activation',
                  'Access to all features',
                  '24/7 customer support'
                ].map(function(feature, index) {
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="flex-shrink-0 w-5 h-5 bg-[#E67E22] rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-200 text-sm">{feature}</span>
                    </div>
                  );
                })}
              </div>

              {/* Testimonial */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <p className="text-white text-sm italic">
                  "The verification process was seamless. I was up and running in minutes!"
                </p>
                <div className="mt-2 flex items-center">
                  <div className="w-8 h-8 bg-[#E67E22] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    MK
                  </div>
                  <div className="ml-2">
                    <p className="text-white text-sm font-semibold">Mike Khan</p>
                    <p className="text-gray-300 text-xs">Verified Trader</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - OTP Verification Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-4 lg:p-6 overflow-y-auto">
          <div className="w-full max-w-md py-4">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-[#122652]">Enter Verification Code</h2>
              <p className="text-gray-600 text-sm mt-1">
                Didn't receive the code?{' '}
                <button
                  onClick={handleresendOTP}
                  disabled={!canResend || resendLoading}
                  className={'font-semibold text-sm ' + (canResend && !resendLoading ? 'text-[#E67E22] hover:underline' : 'text-gray-400 cursor-not-allowed')}
                >
                  {resendLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    `Resend OTP ${!canResend ? `(${timeLeft}s)` : ''}`
                  )}
                </button>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* OTP Input Fields */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 text-center">
                  Enter 6-digit code
                </label>
                
                <div className="flex justify-center gap-2">
                  {otp.map(function(digit, index) {
                    return (
                      <div key={index} className="w-11">
                        <Input
                          id={`otp-${index}`}
                          name={`otp-${index}`}
                          type="text"
                          value={digit}
                          onChange={function(e) { handleOtpChange(index, e.target.value); }}
                          onKeyDown={function(e) { handleKeyDown(index, e); }}
                          onPaste={index === 0 ? handlePaste : undefined}
                          placeholder="0"
                          maxLength={1}
                          required
                          disabled={loading || resendLoading}
                          className="text-center text-lg font-bold px-1"
                          error={error && index === 0 ? error : ''}
                        />
                      </div>
                    );
                  })}
                </div>

                {error && (
                  <p className="text-center text-sm text-red-600 animate-pulse">
                    {error}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  disabled={resendLoading}
                  className="w-full"
                >
                  Verify Email
                  <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Button>

                <Link
                  href="/auth/register"
                  className="block text-center text-xs text-gray-600 hover:text-[#E67E22] transition-colors"
                >
                  ← Back to Registration
                </Link>
              </div>

              {/* Help Text */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs text-blue-800">
                    <p className="font-semibold mb-0.5">Having trouble?</p>
                    <p>Check spam folder or click "Resend OTP". Code expires in 10 minutes.</p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        /* Custom scrollbar for right side */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #E67E22;
          border-radius: 4px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #d35400;
        }
      `}</style>
    </>
  );
}