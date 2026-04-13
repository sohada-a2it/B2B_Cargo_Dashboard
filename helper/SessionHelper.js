// helper/SessionHelper.js
import Cookies from 'js-cookie';

// ============ TOKEN MANAGEMENT ============
export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    // Cookie তে রাখুন (SSR-এর জন্য)
    Cookies.set('authToken', token, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/'
    });
    localStorage.setItem('authToken', token);
  }
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    let token = Cookies.get('authToken');
    if (!token) {
      token = localStorage.getItem('authToken');
    }
    return token;
  }
  return null;
};

// ============ EMAIL MANAGEMENT ============
export const setEmail = (email) => {
  if (typeof window !== 'undefined') {
    Cookies.set('email', email, {
      expires: 1,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/'
    });
    localStorage.setItem('email', email);
  }
};

export const getEmail = () => {
  if (typeof window !== 'undefined') {
    return Cookies.get('email') || localStorage.getItem('email');
  }
  return null;
};

// ============ OTP MANAGEMENT ============
export const setOTP = (otp) => {
  if (typeof window !== 'undefined') {
    Cookies.set('otp', otp, {
      expires: 1 / 24,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/'
    });
    localStorage.setItem('otp', otp);
  }
};

export const getOTP = () => {
  if (typeof window !== 'undefined') {
    return Cookies.get('otp') || localStorage.getItem('otp');
  }
  return null;
};

// ============ USER DETAILS MANAGEMENT ============
export const setUserDetails = (user) => {
  if (typeof window !== 'undefined') {
    const userStr = JSON.stringify(user);
    Cookies.set('userDetails', userStr, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/'
    });
    localStorage.setItem('userDetails', userStr);
  }
};

export const getUserDetails = () => {
  if (typeof window !== 'undefined') {
    const userStr = Cookies.get('userDetails') || localStorage.getItem('userDetails');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user details:', e);
        return null;
      }
    }
  }
  return null;
};

// ============ SESSION CLEAR ============
export const clearAllSessions = () => {
  if (typeof window !== 'undefined') {
    Cookies.remove('authToken');
    Cookies.remove('email');
    Cookies.remove('otp');
    Cookies.remove('userDetails');
    localStorage.clear();
    window.location.href = "/auth/login";
  }
};

// ============ LOGOUT ============
export const logout = () => {
  if (typeof window !== 'undefined') {
    Cookies.remove('authToken');
    Cookies.remove('email');
    Cookies.remove('otp');
    Cookies.remove('userDetails');
    localStorage.clear();
    window.location.href = "/";
  }
};

// ============ CHECK AUTHENTICATION ============
export const isAuthenticated = () => {
  if (typeof window !== 'undefined') {
    const token = getAuthToken();
    return !!token;
  }
  return false;
};