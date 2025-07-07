// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
};

// Password strength validation
export const validatePassword = (password) => {
  const minLength = import.meta.env.VITE_MIN_PASSWORD_LENGTH || 8;
  const pattern = new RegExp(import.meta.env.VITE_PASSWORD_PATTERN || '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$');
  
  if (password.length < minLength) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }
  
  if (!pattern.test(password)) {
    return 'La contraseña debe incluir mayúsculas, minúsculas, números y caracteres especiales';
  }
  
  return null;
};

// Email validation
export const validateEmail = (email) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
};

// Token validation
export const isTokenExpired = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const { exp } = JSON.parse(jsonPayload);
    return exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// CSRF token management
export const generateCSRFToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Secure data handling
export const secureDataHandling = {
  encrypt: (data) => {
    // In a real application, implement proper encryption here
    return btoa(JSON.stringify(data));
  },
  decrypt: (data) => {
    try {
      return JSON.parse(atob(data));
    } catch (e) {
      console.error('Error decrypting data:', e);
      return null;
    }
  }
};
