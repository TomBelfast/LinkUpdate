import bcrypt from 'bcrypt';
import crypto from 'crypto';

// ZACHOWUJEMY stary system dla kompatybilności (jeśli potrzebny)
export async function comparePasswordLegacy(password: string, hash: string): Promise<boolean> {
  if (!hash || !password) return false;
  
  const [salt, hashedValue] = hash.split('$');
  if (!salt || !hashedValue) return false;
  
  const compareHash = crypto.createHash('sha256');
  compareHash.update(salt + password);
  const compareValue = compareHash.digest('hex');
  return compareValue === hashedValue;
}

// NOWY bezpieczny system (już używany w aplikacji)
export async function hashPasswordSecure(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function comparePasswordSecure(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error("Credential comparison error:", error);
    return false;
  }
}

// HYBRID system - sprawdza oba formaty (główna funkcja do użycia)
export async function comparePasswordHybrid(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  
  // Jeśli hash zawiera '$' na pozycji != bcrypt format, to stary SHA256
  if (hash.includes('$') && !hash.startsWith('$2a$') && !hash.startsWith('$2b$')) {
    try {
      return await comparePasswordLegacy(password, hash);
    } catch (error) {
      console.error("Legacy credential comparison error:", error);
      return false;
    }
  }
  
  // Nowy bcrypt format
  return await comparePasswordSecure(password, hash);
}

// Utility function to detect password format
export function detectPasswordFormat(hash: string): 'bcrypt' | 'sha256' | 'unknown' {
  if (!hash || typeof hash !== 'string') return 'unknown';
  
  // Bcrypt format: $2a$10$... or $2b$12$...
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
    return 'bcrypt';
  }
  
  // Legacy SHA256 format: salt$hash
  if (hash.includes('$') && !hash.startsWith('$')) {
    const parts = hash.split('$');
    if (parts.length === 2 && parts[0].length > 0 && parts[1].length > 0) {
      return 'sha256';
    }
  }
  
  return 'unknown';
}

// Check if password needs migration
export function requiresMigration(hash: string): boolean {
  return detectPasswordFormat(hash) !== 'bcrypt';
}