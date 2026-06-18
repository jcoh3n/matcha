// Password strength validation.
//
// The subject requires that "commonly used English words should not be accepted
// as passwords". We enforce this with three complementary rules:
//   1. a minimum length,
//   2. at least one letter and one digit (a bare dictionary word has no digit),
//   3. a blacklist of the most common passwords / English words, checked both
//      against the raw password and against its letters-only form so that
//      trivial variations like "password123" or "qwerty!" are still rejected.

const MIN_LENGTH = 8;

// Most common weak passwords and very frequent English words. Lowercased.
const COMMON_PASSWORDS = new Set([
  // top leaked passwords
  'password', 'passw0rd', 'password1', 'passwords', 'qwerty', 'qwertyuiop',
  'azerty', 'motdepasse', '123456', '1234567', '12345678', '123456789',
  '1234567890', '12345', '111111', '000000', '666666', '121212', '654321',
  'abc123', 'a1b2c3', 'qwerty123', 'admin', 'administrator', 'root', 'toor',
  'letmein', 'welcome', 'login', 'pass', 'secret', 'master', 'access',
  'shadow', 'superman', 'batman', 'trustno1', 'whatever', 'changeme',
  'iloveyou', 'sunshine', 'princess', 'football', 'baseball', 'starwars',
  'monkey', 'dragon', 'michael', 'jordan', 'hunter', 'freedom', 'ninja',
  'computer', 'internet', 'samsung', 'google', 'matcha',
  // very common english words
  'love', 'hello', 'world', 'house', 'happy', 'flower', 'orange', 'purple',
  'yellow', 'summer', 'winter', 'spring', 'autumn', 'family', 'friend',
  'school', 'people', 'money', 'water', 'music', 'coffee', 'garden',
  'animal', 'planet', 'rabbit', 'cookie', 'banana', 'apple', 'cheese',
  'guitar', 'rocket', 'soccer', 'tennis', 'forest', 'mountain', 'ocean',
  'beauty', 'pretty', 'simple', 'secret', 'random', 'temporary',
]);

function isBlacklisted(value) {
  return COMMON_PASSWORDS.has(value);
}

// Returns { valid: boolean, message?: string }
function validatePassword(password) {
  if (typeof password !== 'string' || password.length === 0) {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < MIN_LENGTH) {
    return {
      valid: false,
      message: `Password must be at least ${MIN_LENGTH} characters long`,
    };
  }

  const lower = password.toLowerCase();
  const lettersOnly = lower.replace(/[^a-z]/g, '');

  if (isBlacklisted(lower) || (lettersOnly.length >= 4 && isBlacklisted(lettersOnly))) {
    return {
      valid: false,
      message: 'Password is too common. Avoid common words and predictable passwords.',
    };
  }

  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one letter and one number',
    };
  }

  return { valid: true };
}

module.exports = { validatePassword, MIN_LENGTH };
