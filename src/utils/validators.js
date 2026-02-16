// src/utils/validators.js
export const isValidUrl = (string) => {
  try {
    // Check if string has any protocol, if not, add http://
    let urlString = string;
    
    // If string doesn't start with http://, https://, ftp://, etc., prepend http://
    if (!/^(https?|ftp|mailto|file|data|irc|ssh|telnet):\/\//i.test(string)) {
      urlString = 'http://' + string;
    }
    
    new URL(urlString);
    return true;
  } catch (_) {
    return false;
  }
};

export const isValidSlug = (slug) => {
  if (!slug) return true;
  const slugRegex = /^[a-zA-Z0-9-_]+$/;
  return slugRegex.test(slug);
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  const requirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(password)
  };

  const strength = Object.values(requirements).filter(Boolean).length;
  
  return {
    requirements,
    strength,
    isValid: strength >= 3
  };
};

export const validateCSVRow = (row, index) => {
  const errors = [];
  
  if (!row.long_url) {
    errors.push('Missing URL');
  } else if (!isValidUrl(row.long_url)) {
    errors.push('Invalid URL format');
  }
  
  if (row.custom_slug && !isValidSlug(row.custom_slug)) {
    errors.push('Invalid custom slug (use only letters, numbers, hyphens, underscores)');
  }
  
  if (row.tags && row.tags.split(',').length > 10) {
    errors.push('Maximum 10 tags allowed');
  }
  
  return {
    row: index + 1,
    errors: errors.length > 0 ? errors : null
  };
};

export const validateTextContent = (text) => {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return {
    wordCount: words.length,
    isValid: words.length <= 1000,
    characters: text.length
  };
};

export const validateFile = (file, maxSizeMB = 5, allowedTypes = ['csv', 'xlsx', 'xls']) => {
  const errors = [];
  
  // Check file size
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${maxSizeMB}MB limit`);
  }
  
  // Check file type
  const extension = file.name.split('.').pop().toLowerCase();
  if (!allowedTypes.includes(extension)) {
    errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};