import { 
  hashPasswordSecure, 
  comparePasswordHybrid,
  comparePasswordLegacy,
  comparePasswordSecure,
  detectPasswordFormat,
  requiresMigration
} from '@/lib/auth/password-utils';
import crypto from 'crypto';

describe('Hybrid Password System', () => {
  test('should work with new bcrypt passwords', async () => {
    const password = 'newTestPassword123!';
    const hash = await hashPasswordSecure(password);
    
    // Should detect bcrypt format
    expect(detectPasswordFormat(hash)).toBe('bcrypt');
    expect(requiresMigration(hash)).toBe(false);
    
    // Should validate correctly
    const isValid = await comparePasswordHybrid(password, hash);
    expect(isValid).toBe(true);
    
    // Wrong password should fail
    const isInvalid = await comparePasswordHybrid('wrongPassword', hash);
    expect(isInvalid).toBe(false);
  });

  test('should work with legacy SHA256 passwords', async () => {
    // Simulate legacy password creation
    const password = 'legacyPassword456!';
    const salt = 'testsalt123';
    const hash = crypto.createHash('sha256');
    hash.update(salt + password);
    const legacyHash = salt + '$' + hash.digest('hex');
    
    // Should detect legacy format
    expect(detectPasswordFormat(legacyHash)).toBe('sha256');
    expect(requiresMigration(legacyHash)).toBe(true);
    
    // Should validate correctly with hybrid system
    const isValid = await comparePasswordHybrid(password, legacyHash);
    expect(isValid).toBe(true);
    
    // Should also work with legacy function directly
    const isValidLegacy = await comparePasswordLegacy(password, legacyHash);
    expect(isValidLegacy).toBe(true);
    
    // Wrong password should fail
    const isInvalid = await comparePasswordHybrid('wrongPassword', legacyHash);
    expect(isInvalid).toBe(false);
  });

  test('should handle edge cases gracefully', async () => {
    // Empty/invalid inputs
    expect(await comparePasswordHybrid('', '')).toBe(false);
    expect(await comparePasswordHybrid('test', '')).toBe(false);
    expect(await comparePasswordHybrid('', 'hash')).toBe(false);
    
    // Invalid hash formats
    expect(await comparePasswordHybrid('test', 'invalid-hash')).toBe(false);
    expect(await comparePasswordHybrid('test', 'just$')).toBe(false);
    expect(await comparePasswordHybrid('test', '$invalid')).toBe(false);
    
    // Unknown format detection
    expect(detectPasswordFormat('plaintext')).toBe('unknown');
    expect(detectPasswordFormat('')).toBe('unknown');
    expect(detectPasswordFormat('$invalid$')).toBe('unknown');
  });

  test('should prioritize bcrypt over legacy', async () => {
    const password = 'testPassword789!';
    
    // Create both formats
    const bcryptHash = await hashPasswordSecure(password);
    const salt = 'testsalt';
    const sha256Hash = crypto.createHash('sha256');
    sha256Hash.update(salt + password);
    const legacyHash = salt + '$' + sha256Hash.digest('hex');
    
    // Both should work
    expect(await comparePasswordHybrid(password, bcryptHash)).toBe(true);
    expect(await comparePasswordHybrid(password, legacyHash)).toBe(true);
    
    // But bcrypt should be preferred for new passwords
    expect(detectPasswordFormat(bcryptHash)).toBe('bcrypt');
    expect(detectPasswordFormat(legacyHash)).toBe('sha256');
  });

  test('should maintain security standards', async () => {
    const password = 'securityTest123!';
    const hash = await hashPasswordSecure(password);
    
    // Bcrypt hash should meet security requirements
    expect(hash).toMatch(/^\$2b\$12\$/); // Proper bcrypt format with high cost
    expect(hash.length).toBeGreaterThan(50); // Adequate length
    
    // Performance test - should not be too slow
    const start = Date.now();
    await comparePasswordHybrid(password, hash);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(5000); // Less than 5 seconds
    expect(duration).toBeGreaterThan(10); // Not instant (shows work factor)
  });

  test('should prevent timing attacks on legacy passwords', async () => {
    const password = 'timingTest123!';
    const salt = 'uniformsalt';
    const hash = crypto.createHash('sha256');
    hash.update(salt + password);
    const legacyHash = salt + '$' + hash.digest('hex');
    
    // Test multiple attempts to ensure consistent timing
    const attempts = 3;
    const times: number[] = [];
    
    for (let i = 0; i < attempts; i++) {
      const start = Date.now();
      await comparePasswordLegacy('wrongpassword', legacyHash);
      times.push(Date.now() - start);
    }
    
    // Times should be relatively consistent (not perfect due to system variance)
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    const variance = maxTime - minTime;
    
    // Allow some variance but not extreme differences
    expect(variance).toBeLessThan(50); // Less than 50ms variance
  });
});