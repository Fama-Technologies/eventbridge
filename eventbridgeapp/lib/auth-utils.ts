import crypto from 'crypto';

// Generate a secure 64-character token
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Hash token with SHA-256 before storing
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isStrongPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
}