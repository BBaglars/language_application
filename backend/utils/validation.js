// Basit e-posta validasyonu
function validateEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

// Şifre validasyonu (en az 8 karakter, büyük/küçük harf, rakam, özel karakter)
function validatePassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
}

// Dil kodu validasyonu (2 küçük harf)
function validateLanguageCode(code) {
  return /^[a-z]{2}$/.test(code);
}

// Seviye validasyonu (A1, A2, B1, B2, C1, C2)
function validateDifficultyLevel(level) {
  return ['A1','A2','B1','B2','C1','C2'].includes(level);
}

// Basit JSON şema validasyonu (örnek, gerçek projede daha gelişmiş kullanılabilir)
function validateSchema(data, schema) {
  const errors = [];
  if (schema.required) {
    schema.required.forEach(field => {
      if (data[field] === undefined) errors.push(`${field} is required`);
    });
  }
  if (schema.properties) {
    Object.entries(schema.properties).forEach(([field, rules]) => {
      if (rules.type === 'string' && data[field] && rules.minLength && data[field].length < rules.minLength) {
        errors.push(`${field} is too short`);
      }
      if (rules.format === 'email' && data[field] && !validateEmail(data[field])) {
        errors.push(`${field} is not a valid email`);
      }
      if (rules.type === 'number' && data[field] && rules.minimum !== undefined && data[field] < rules.minimum) {
        errors.push(`${field} is too small`);
      }
    });
  }
  return {
    isValid: errors.length === 0,
    errors: errors.length ? errors : null
  };
}

module.exports = {
  validateEmail,
  validatePassword,
  validateLanguageCode,
  validateDifficultyLevel,
  validateSchema
}; 