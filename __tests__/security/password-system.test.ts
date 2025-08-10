import { hashPassword, comparePassword } from '@/app/lib/auth';

describe('Password Security System (bcrypt)', () => {
  test('should hash password with bcrypt format', async () => {
    const password = 'testPassword123!';
    const hash = await hashPassword(password);
    
    // Bcrypt hashes start with $2b$ (blowfish) and have proper format
    expect(hash).toMatch(/^\$2b\$12\$/);
    expect(hash).not.toEqual(password);
    expect(hash.length).toBeGreaterThan(50); // Bcrypt hashes are long
  });

  test('should validate correct passwords', async () => {
    const password = 'mySecurePassword456!';
    const hash = await hashPassword(password);
    
    const isValid = await comparePassword(password, hash);
    expect(isValid).toBe(true);
  });

  test('should reject incorrect passwords', async () => {
    const correctPassword = 'correctPassword789!';
    const wrongPassword = 'wrongPassword123!';
    const hash = await hashPassword(correctPassword);
    
    const isValid = await comparePassword(wrongPassword, hash);
    expect(isValid).toBe(false);
  });

  test('should handle edge cases gracefully', async () => {
    // Empty password
    await expect(hashPassword('')).resolves.toBeDefined();
    
    // Invalid hash format
    const result = await comparePassword('test', 'invalid-hash');
    expect(result).toBe(false);
    
    // Empty strings
    const emptyResult = await comparePassword('', '');
    expect(emptyResult).toBe(false);
  });

  test('should use high security salt rounds', async () => {
    const password = 'testSaltRounds123!';
    const hash = await hashPassword(password);
    
    // Salt rounds 12 = $2b$12$
    expect(hash).toMatch(/^\$2b\$12\$/);
    
    // Verify it takes reasonable time (security vs performance)
    const startTime = Date.now();
    await comparePassword(password, hash);
    const duration = Date.now() - startTime;
    
    // Should take some time due to salt rounds (but not too long)
    expect(duration).toBeGreaterThan(10); // At least 10ms
    expect(duration).toBeLessThan(5000); // Less than 5 seconds
  });

  test('should generate different hashes for same password', async () => {
    const password = 'samePassword123!';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    
    // Same password should generate different hashes due to random salt
    expect(hash1).not.toEqual(hash2);
    
    // But both should be valid
    expect(await comparePassword(password, hash1)).toBe(true);
    expect(await comparePassword(password, hash2)).toBe(true);
  });
});