/**
 * Mock bcrypt implementation for browser compatibility
 */
const crypto = require('crypto');

// Prosta funkcja haszująca zastępująca bcrypt.hash
const hash = async (data, saltRounds) => {
  // Generowanie soli - prosta implementacja
  const salt = crypto.randomBytes(16).toString('hex');
  
  // Zastosowanie funkcji skrótu SHA-256
  const hash = crypto.createHash('sha256');
  hash.update(salt + data);
  const hashedValue = salt + '$' + hash.digest('hex');
  
  return hashedValue;
};

// Funkcja porównująca hasło z haszem - prosta implementacja
const compare = async (data, hash) => {
  // Podział hashu na sól i wartość skrótu
  const [salt, hashedValue] = hash.split('$');
  
  // Jeśli nie ma oczekiwanego formatu, zwróć false
  if (!salt || !hashedValue) return false;
  
  // Haszowanie podanego hasła z tą samą solą
  const compareHash = crypto.createHash('sha256');
  compareHash.update(salt + data);
  const compareValue = compareHash.digest('hex');
  
  // Porównanie wyliczonego skrótu z zapisanym
  return compareValue === hashedValue;
};

module.exports = {
  hash,
  compare
}; 