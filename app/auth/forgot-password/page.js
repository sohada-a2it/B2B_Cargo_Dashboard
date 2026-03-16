'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { forgotPassword, verifyResetOTP, resetPassword } from '@/Api/Authentication';

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
    lg: 'px-6 py-3 text-lg'
  };

  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className} ${(disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Processing...
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
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-[#E67E22] transition-all duration-200 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

const OtpInput = ({
  index,
  value,
  onChange,
  onKeyDown,
  onPaste,
  error
}) => {
  return (
    <input
      id={`otp-${index}`}
      type="text"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onPaste={index === 0 ? onPaste : undefined}
      placeholder="0"
      maxLength={1}
      required
      className={`w-12 md:w-14 h-12 md:h-14 text-center text-xl font-bold border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-[#E67E22] ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
    />
  );
};

export default function ForgotPasswordPage() {
  const router = useRouter();

  useEffect(() => {
    // Hide all header, sidebar, navbar elements
    const elementsToHide = document.querySelectorAll(
      'aside, .topbar, header, nav, .sidebar, .navbar, [class*="header"], [class*="sidebar"], [class*="navbar"]'
    );
    
    elementsToHide.forEach(el => {
      if (el && el.style) {
        el.style.display = 'none';
      }
    });
    
    // Prevent scrolling on all devices
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      elementsToHide.forEach(el => {
        if (el && el.style) {
          el.style.display = '';
        }
      });
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Timer for resend OTP
  useEffect(() => {
    if (currentStep === 2 && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, currentStep]);

  // Password strength checker
  useEffect(() => {
    calculatePasswordStrength(newPassword);
  }, [newPassword]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]+/)) strength += 25;
    if (password.match(/[A-Z]+/)) strength += 25;
    if (password.match(/[0-9]+/) || password.match(/[$@#&!]+/)) strength += 25;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500';
    if (passwordStrength <= 50) return 'bg-orange-500';
    if (passwordStrength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
  };

  const validateEmail = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    return newErrors;
  };

  const validateOtp = () => {
    const newErrors = {};
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      newErrors.otp = 'Please enter complete 6-digit OTP';
    }
    return newErrors;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const emailErrors = validateEmail();
    
    if (Object.keys(emailErrors).length === 0) {
      setLoading(true);
      try {
        await forgotPassword(email);
        
        toast.success('Reset code sent to your email!', {
          position: 'top-right',
          autoClose: 5000,
        });
        
        setCurrentStep(2);
        setTimeLeft(60);
        setCanResend(false);
      } catch (error) {
        toast.error(error.message || 'Failed to send reset code. Please try again.', {
          position: 'top-right',
          autoClose: 5000,
        });
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(emailErrors);
      setTouched({ email: true });
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpErrors = validateOtp();
    
    if (Object.keys(otpErrors).length === 0) {
      setLoading(true);
      try {
        const otpString = otp.join('');
        await verifyResetOTP(email, otpString);
        
        toast.success('OTP verified successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
        
        setCurrentStep(3);
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
    } else {
      setErrors(otpErrors);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const passwordErrors = validatePassword();
    
    if (Object.keys(passwordErrors).length === 0) {
      setLoading(true);
      try {
        const otpString = otp.join('');
        await resetPassword(email, otpString, newPassword);
        
        toast.success('Password reset successfully! Redirecting to login...', {
          position: 'top-right',
          autoClose: 3000,
        });
        
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } catch (error) {
        toast.error(error.message || 'Failed to reset password. Please try again.', {
          position: 'top-right',
          autoClose: 5000,
        });
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(passwordErrors);
      Object.keys(passwordErrors).forEach(field => {
        setTouched(prev => ({ ...prev, [field]: true }));
      });
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setLoading(true);
    try {
      await forgotPassword(email);
      
      toast.info('New reset code sent to your email!', {
        position: 'top-right',
        autoClose: 3000,
      });
      
      setTimeLeft(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      toast.error('Failed to resend code. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setErrors({});

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

  const renderIcon = (type) => {
    switch(type) {
      case 'email':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'password':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      default:
        return null;
    }
  };

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
      
      {/* Main Container - No Scroll */}
      <div className="fixed inset-0 w-full h-full bg-[#fffaf6] overflow-hidden">
        {/* Desktop Layout (lg and above) */}
        <div className="hidden lg:flex w-full h-full">
          {/* Left Side - Branding/Info */}
          <div className="w-1/2 bg-[#122652] p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-[#E67E22] rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
              <div className="absolute top-0 -right-4 w-72 h-72 bg-[#3C719D] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#E67E22] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10">
              <div className="w-20 h-auto mb-6">
                <img src="/logo.png" alt="LogiSwift Logo" className="w-full h-auto" />
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                Reset Your
                <span className="text-[#E67E22] block">Password</span>
              </h1>
              <p className="mt-6 text-gray-300 text-lg max-w-md">
                Don't worry! It happens to the best of us. We'll help you get back into your account.
              </p>
            </div>

            {/* Progress Steps */}
            <div className="relative z-10 mt-6">
              <div className="flex items-center space-x-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step ? 'bg-[#E67E22] text-white' : 'bg-white/20 text-gray-300'
                    }`}>
                      {step}
                    </div>
                    {step < 3 && (
                      <div className={`w-12 h-1 mx-2 rounded ${
                        currentStep > step ? 'bg-[#E67E22]' : 'bg-white/20'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-8 sm:gap-10 mt-2 text-sm text-gray-300">
                <span>Verify Email</span>
                <span>Verify Code</span>
                <span>New Password</span>
              </div>
            </div>

            {/* Security Tips */}
            <div className="relative z-10 mt-12 space-y-4">
              {currentStep === 1 && (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#E67E22] rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-200">Enter your registered email address</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#E67E22] rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-200">We'll send a 6-digit verification code</span>
                  </div>
                </>
              )}
              {currentStep === 2 && (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#E67E22] rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-200">Check your email for the verification code</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#E67E22] rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-gray-200">Code expires in 10 minutes</span>
                  </div>
                </>
              )}
              {currentStep === 3 && (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#E67E22] rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-gray-200">Create a strong password</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#E67E22] rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-200">Use at least 8 characters with mix of letters, numbers & symbols</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-1/2 flex items-center justify-center p-8 lg:p-12">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[#122652]">
                  {currentStep === 1 && 'Forgot Password?'}
                  {currentStep === 2 && 'Verify Code'}
                  {currentStep === 3 && 'Create New Password'}
                </h2>
                <p className="text-gray-600 mt-2">
                  {currentStep === 1 && "Enter your email to receive a verification code"}
                  {currentStep === 2 && `We've sent a code to ${email}`}
                  {currentStep === 3 && "Enter your new password below"}
                </p>
                {currentStep === 2 && (
                  <button
                    onClick={handleResendOTP}
                    disabled={!canResend || loading}
                    className={`mt-2 text-sm font-semibold ${canResend && !loading ? 'text-[#E67E22] hover:underline' : 'text-gray-400 cursor-not-allowed'}`}
                  >
                    Resend code {!canResend && `(${timeLeft}s)`}
                  </button>
                )}
              </div>

              {/* Step 1: Email Form */}
              {currentStep === 1 && (
                <form onSubmit={handleEmailSubmit} className="space-y-6 animate-fadeIn">
                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched({ ...touched, email: true })}
                    placeholder="john.doe@company.com"
                    error={touched.email && errors.email}
                    required
                    icon={renderIcon('email')}
                  />

                  <div className="space-y-4">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={loading}
                      className="w-full"
                    >
                      Send Reset Code
                      <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>

                    <Link
                      href="/"
                      className="block text-center text-sm text-gray-600 hover:text-[#E67E22] transition-colors"
                    >
                      ← Back to Login
                    </Link>
                  </div>
                </form>
              )}

              {/* Step 2: OTP Form */}
              {currentStep === 2 && (
                <form onSubmit={handleOtpSubmit} className="space-y-8 animate-fadeIn">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 text-center">
                      Enter 6-digit verification code
                    </label>
                    
                    <div className="flex justify-center gap-2 md:gap-4">
                      {otp.map((digit, index) => (
                        <OtpInput
                          key={index}
                          index={index}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={handlePaste}
                          error={errors.otp}
                        />
                      ))}
                    </div>

                    {errors.otp && (
                      <p className="text-center text-sm text-red-600 animate-pulse">
                        {errors.otp}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={loading}
                      className="w-full"
                    >
                      Verify Code
                      <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </Button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="block w-full text-center text-sm text-gray-600 hover:text-[#E67E22] transition-colors"
                    >
                      ← Use different email
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: New Password Form */}
              {currentStep === 3 && (
                <form onSubmit={handlePasswordSubmit} className="space-y-6 animate-fadeIn">
                  <div className="relative">
                    <Input
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onBlur={() => setTouched({ ...touched, newPassword: true })}
                      placeholder="********"
                      error={touched.newPassword && errors.newPassword}
                      required
                      icon={renderIcon('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-9 text-gray-500 hover:text-[#E67E22]"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {newPassword && (
                    <div className="space-y-2 -mt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                            style={{ width: passwordStrength + '%' }}
                          />
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-600">
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <Input
                      label="Confirm New Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                      placeholder="********"
                      error={touched.confirmPassword && errors.confirmPassword}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-9 text-gray-500 hover:text-[#E67E22]"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Password requirements:</p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li className="flex items-center">
                        <span className={`mr-2 ${newPassword.length >= 8 ? 'text-green-500' : 'text-gray-400'}`}>
                          {newPassword.length >= 8 ? '✓' : '○'}
                        </span>
                        At least 8 characters
                      </li>
                      <li className="flex items-center">
                        <span className={`mr-2 ${/([a-z])/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}`}>
                          {/([a-z])/.test(newPassword) ? '✓' : '○'}
                        </span>
                        Contains lowercase letter
                      </li>
                      <li className="flex items-center">
                        <span className={`mr-2 ${/([A-Z])/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}`}>
                          {/([A-Z])/.test(newPassword) ? '✓' : '○'}
                        </span>
                        Contains uppercase letter
                      </li>
                      <li className="flex items-center">
                        <span className={`mr-2 ${/([0-9!@#$%^&*])/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}`}>
                          {/([0-9!@#$%^&*])/.test(newPassword) ? '✓' : '○'}
                        </span>
                        Contains number or special character
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={loading}
                      className="w-full"
                    >
                      Reset Password
                      <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="block w-full text-center text-sm text-gray-600 hover:text-[#E67E22] transition-colors"
                    >
                      ← Back to verification
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Layout (below lg) - Scrollable with all content */}
        <div className="lg:hidden w-full h-full overflow-y-auto">
          {/* Header with Pattern */}
          <div className="bg-[#122652] p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 -left-4 w-48 h-48 bg-[#E67E22] rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
              <div className="absolute top-0 -right-4 w-48 h-48 bg-[#3C719D] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative z-10">
              <div className="w-16 h-auto mb-4">
                <img src="/logo.png" alt="LogiSwift Logo" className="w-full h-auto" />
              </div>

              <h1 className="text-2xl font-bold text-white">
                Reset Your Password
              </h1>
              <p className="text-gray-300 text-sm mt-2">
                Don't worry! We'll help you get back into your account.
              </p>
            </div>
          </div>

          {/* Progress Steps - Mobile */}
          <div className="px-6 py-4 bg-white border-b">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    currentStep >= step ? 'bg-[#E67E22] text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-8 h-1 mx-1 rounded ${
                      currentStep > step ? 'bg-[#E67E22]' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Email</span>
              <span>Verify</span>
              <span>Password</span>
            </div>
          </div>

          {/* Main Content - Mobile */}
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#122652]">
                {currentStep === 1 && 'Forgot Password?'}
                {currentStep === 2 && 'Verify Code'}
                {currentStep === 3 && 'Create New Password'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {currentStep === 1 && "Enter your email to receive a verification code"}
                {currentStep === 2 && `We've sent a code to ${email}`}
                {currentStep === 3 && "Enter your new password below"}
              </p>
              {currentStep === 2 && (
                <button
                  onClick={handleResendOTP}
                  disabled={!canResend || loading}
                  className={`mt-2 text-sm font-semibold ${canResend && !loading ? 'text-[#E67E22]' : 'text-gray-400 cursor-not-allowed'}`}
                >
                  Resend code {!canResend && `(${timeLeft}s)`}
                </button>
              )}
            </div>

            {/* Step 1: Email Form - Mobile */}
            {currentStep === 1 && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  placeholder="john.doe@company.com"
                  error={touched.email && errors.email}
                  required
                  icon={renderIcon('email')}
                />

                <div className="space-y-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={loading}
                    className="w-full"
                  >
                    Send Reset Code
                  </Button>

                  <Link
                    href="/auth/login"
                    className="block text-center text-sm text-gray-600 hover:text-[#E67E22]"
                  >
                    ← Back to Login
                  </Link>
                </div>
              </form>
            )}

            {/* Step 2: OTP Form - Mobile */}
            {currentStep === 2 && (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 text-center">
                    Enter 6-digit verification code
                  </label>
                  
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <OtpInput
                        key={index}
                        index={index}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        error={errors.otp}
                      />
                    ))}
                  </div>

                  {errors.otp && (
                    <p className="text-center text-sm text-red-600">
                      {errors.otp}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={loading}
                    className="w-full"
                  >
                    Verify Code
                  </Button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="block w-full text-center text-sm text-gray-600 hover:text-[#E67E22]"
                  >
                    ← Use different email
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: New Password Form - Mobile */}
            {currentStep === 3 && (
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div className="relative">
                  <Input
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onBlur={() => setTouched({ ...touched, newPassword: true })}
                    placeholder="********"
                    error={touched.newPassword && errors.newPassword}
                    required
                    icon={renderIcon('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-500"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Strength Meter - Mobile */}
                {newPassword && (
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getPasswordStrengthColor()}`}
                          style={{ width: passwordStrength + '%' }}
                        />
                      </div>
                      <span className="ml-2 text-xs font-medium text-gray-600">
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <Input
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                    placeholder="********"
                    error={touched.confirmPassword && errors.confirmPassword}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-9 text-gray-500"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Requirements - Mobile */}
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Password requirements:</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li className="flex items-center">
                      <span className={`mr-2 ${newPassword.length >= 8 ? 'text-green-500' : 'text-gray-400'}`}>
                        {newPassword.length >= 8 ? '✓' : '○'}
                      </span>
                      At least 8 characters
                    </li>
                    <li className="flex items-center">
                      <span className={`mr-2 ${/([a-z])/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}`}>
                        {/([a-z])/.test(newPassword) ? '✓' : '○'}
                      </span>
                      Contains lowercase letter
                    </li>
                    <li className="flex items-center">
                      <span className={`mr-2 ${/([A-Z])/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}`}>
                        {/([A-Z])/.test(newPassword) ? '✓' : '○'}
                      </span>
                      Contains uppercase letter
                    </li>
                    <li className="flex items-center">
                      <span className={`mr-2 ${/([0-9!@#$%^&*])/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}`}>
                        {/([0-9!@#$%^&*])/.test(newPassword) ? '✓' : '○'}
                      </span>
                      Contains number or special character
                    </li>
                  </ul>
                </div>

                <div className="space-y-4 pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={loading}
                    className="w-full"
                  >
                    Reset Password
                  </Button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="block w-full text-center text-sm text-gray-600 hover:text-[#E67E22]"
                  >
                    ← Back to verification
                  </button>
                </div>
              </form>
            )}

            {/* Security Tips - Mobile */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">Security Tips:</p>
              <div className="space-y-3">
                {currentStep === 1 && (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-[#E67E22] rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600">Enter your registered email address</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-[#E67E22] rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600">We'll send a 6-digit verification code</span>
                    </div>
                  </>
                )}
                {currentStep === 2 && (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-[#E67E22] rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600">Check your email for the verification code</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-[#E67E22] rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600">Code expires in 10 minutes</span>
                    </div>
                  </>
                )}
                {currentStep === 3 && (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-[#E67E22] rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600">Create a strong password</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-[#E67E22] rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600">Use at least 8 characters with mix of letters, numbers & symbols</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Support Link - Mobile */}
            {/* <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                Need help? <a href="mailto:support@logiswift.com" className="text-[#E67E22]">Contact support</a>
              </p>
            </div> */}
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
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
}