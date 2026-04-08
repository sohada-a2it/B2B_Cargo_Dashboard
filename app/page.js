'use client';
import { 
  setAuthToken, 
  setUserDetails, 
  setEmail,
  getAuthToken,
  getUserDetails
} from '@/helper/SessionHelper';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { login } from '@/Api/Authentication';

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
          Logging in...
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
    <div className="mb-3">
      {label && (
        <label htmlFor={name} className="block text-xs font-medium text-gray-700 mb-1">
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
          className={`w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-[#E67E22] transition-all duration-200 text-sm ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default function LoginPage() {
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
    

useEffect(() => {
  const token = getAuthToken();
  const user = getUserDetails();
  
  // URL থেকে redirect প্যারামিটার নিন
  const searchParams = new URLSearchParams(window.location.search);
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  
  if (token && user) {
    router.replace(redirectUrl); 
  }
}, [router]);
   
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const validationErrors = validateForm();
    setErrors(validationErrors);
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setTouched({
      email: true,
      password: true
    });

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        const response = await login(formData.email, formData.password);
        
        if (response.success) {
          const token = response.token || response.data?.token;
          const userData = response.user || response.data?.user || response.data;
          
          console.log('👤 User Data:', userData);
          console.log('👤 User Role:', userData?.role);
          
          const allowedRoles = ['admin', 'employee', 'manager', 'superadmin', 'warehouse'];
          
          if (userData?.role === 'customer') {
            toast.error(
              <div>
                <strong>⚠️ Customer Access Denied</strong>
                <p className="text-sm mt-1">This portal is for employees and administrators only.</p>
                <p className="text-xs mt-1">Please use the customer tracking portal to manage your shipments.</p>
              </div>, 
              {
                position: 'top-right',
                autoClose: 7000,
                className: 'bg-red-50 border-l-4 border-red-500',
              }
            );
            setLoading(false);
            return;
          }
          
          if (!allowedRoles.includes(userData?.role)) {
            toast.error(`Access Denied: Role "${userData?.role}" does not have permission to access this portal.`, {
              position: 'top-right',
              autoClose: 5000,
            });
            setLoading(false);
            return;
          }
          
          if (token) {
            setAuthToken(token);
          }
          
          if (userData) {
            setUserDetails(userData);
          }
          
          setEmail(formData.email);
          // URL থেকে redirect প্যারামিটার নিন
  const searchParams = new URLSearchParams(window.location.search);
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
          toast.success(
            <div>
              <strong>Login Successful!</strong>
              <p className="text-sm mt-1">Welcome back, {userData?.firstName || userData?.name || 'User'}!</p>
              <p className="text-xs mt-1">Role: {userData?.role}</p>
            </div>, 
            {
              position: 'top-right',
              autoClose: 3000,
            }
          );
          
          setTimeout(() => {
            router.push(redirectUrl);
          }, 3000);
        } else {
          toast.error(response.message || 'Invalid email or password', {
            position: 'top-right',
            autoClose: 5000,
          });
        }
      } catch (error) {
        console.error('❌ Login error:', error);
        toast.error(error.message || 'Invalid email or password', {
          position: 'top-right',
          autoClose: 5000,
        });
      } finally {
        setLoading(false);
      }
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
      
      {/* Main Container - No Scroll on any device */}
      <div className="fixed inset-0 w-full h-full bg-[#fffaf6] overflow-hidden">
        {/* Desktop Layout (lg and above) */}
        <div className="hidden lg:flex w-full h-full">
          {/* Left Side - Branding */}
          <div className="w-1/2 bg-[#122652] relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-[#E67E22] rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
              <div className="absolute top-0 -right-4 w-72 h-72 bg-[#3C719D] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#E67E22] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 h-full flex flex-col justify-center px-12">
              <div className="mb-8 ">
                <img src="/logo.png" alt="LogiSwift" className="w-24 h-auto text-white" />
              </div>
              
              <h1 className="text-5xl font-bold text-white leading-tight mb-6">
                Welcome Back to
                <span className="text-[#E67E22] block text-4xl mt-2">Your Logistics Hub</span>
              </h1>
              
              <p className="text-gray-300 text-lg max-w-md mb-8">
                Access your dashboard, track shipments, and manage your global logistics operations.
              </p>

              <div className="space-y-4">
                {[
                  'Real-time shipment tracking',
                  'Digital documentation',
                  'Global network coverage',
                  'Competitive rates'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-[#E67E22] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-200 text-base">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-1/2 flex items-center justify-center p-8">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[#122652]">Sign In</h2>
                <p className="text-gray-600 mt-2">Welcome back! Please enter your details</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  placeholder="john.doe@company.com"
                  error={touched.email && errors.email}
                  required
                  icon={renderIcon('email')}
                />

                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                    placeholder="********"
                    error={touched.password && errors.password}
                    required
                    icon={renderIcon('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-500 hover:text-[#E67E22] transition-colors"
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-[#E67E22] border-gray-300 rounded focus:ring-[#E67E22]"
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                      Remember me
                    </label>
                  </div>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-[#E67E22] hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  className="w-full"
                >
                  Sign In
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Mobile Layout (below lg) - Complete Information with No Scroll */}
        <div className="lg:hidden w-full h-full flex flex-col">
          {/* Header Section with Pattern */}
          <div className="bg-[#122652] px-4 py-8 relative overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 -left-4 w-40 h-40 bg-[#E67E22] rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
              <div className="absolute top-0 -right-4 w-40 h-40 bg-[#3C719D] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <img src="/logo.png" alt="LogiSwift" className="w-12 h-auto" />
                <span className="text-[#E67E22] text-xs font-medium px-2 py-1 bg-white/10 rounded-full">Logistics Hub</span>
              </div>
              
              <div className="mt-2">
                <h1 className="text-lg font-bold text-white">
                  Welcome Back!
                </h1>
                <p className="text-gray-300 text-xs mt-0.5">
                  Access your dashboard, track shipments, and manage your global logistics operations.


                </p>
              </div>
            </div>
          </div>

          {/* Main Content - Scrollable Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {/* Welcome Message */}
            <div className="mb-3">
              <h2 className="text-base font-bold text-[#122652]">Sign In to Your Account</h2>
              <p className="text-xs text-gray-600 mt-0.5">Access your dashboard and manage operations</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="mb-4">
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                placeholder="Enter your email"
                error={touched.email && errors.email}
                required
                icon={renderIcon('email')}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  placeholder="Enter your password"
                  error={touched.password && errors.password}
                  required
                  icon={renderIcon('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-7 text-gray-500 hover:text-[#E67E22]"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between mt-2 mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#E67E22] border-gray-300 rounded focus:ring-[#E67E22]"
                  />
                  <label htmlFor="remember" className="ml-1.5 text-xs text-gray-600">
                    Remember me
                  </label>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-[#E67E22] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                className="w-full text-sm py-3"
              >
                Sign In
              </Button>
            </form>

            {/* Features Section - All 4 features with full description */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <h3 className="text-xs font-semibold text-[#122652] mb-2">Why choose LogiSwift?</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-start space-x-1.5">
                  <div className="w-4 h-4 bg-[#E67E22] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-800">Real-time tracking</p>
                    <p className="text-[10px] text-gray-500">Live shipment updates</p>
                  </div>
                </div>
                <div className="flex items-start space-x-1.5">
                  <div className="w-4 h-4 bg-[#E67E22] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-800">Digital docs</p>
                    <p className="text-[10px] text-gray-500">Paperless processing</p>
                  </div>
                </div>
                <div className="flex items-start space-x-1.5">
                  <div className="w-4 h-4 bg-[#E67E22] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-800">Global network</p>
                    <p className="text-[10px] text-gray-500">200+ countries</p>
                  </div>
                </div>
                <div className="flex items-start space-x-1.5">
                  <div className="w-4 h-4 bg-[#E67E22] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-800">Best rates</p>
                    <p className="text-[10px] text-gray-500">Competitive pricing</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Info */}
            {/* <div className="mt-3 text-center">
              <p className="text-[10px] text-gray-400">
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
        .animate-blob {
          animation: blob 7s infinite;
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