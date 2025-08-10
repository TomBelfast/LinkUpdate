import { describe, test, expect } from 'vitest';

describe('Legacy Password Format Detection', () => {
  test('should detect bcrypt vs legacy password formats', () => {
    // Przykłady różnych formatów haseł
    const testCases = [
      {
        hash: '$2b$12$abcdefghijklmnopqrstuvwxyz1234567890ABCDEF',
        expected: 'bcrypt',
        description: 'Valid bcrypt hash'
      },
      {
        hash: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEF',
        expected: 'bcrypt',
        description: 'Legacy bcrypt format'
      },
      {
        hash: 'salt$1234567890abcdef1234567890abcdef12345678',
        expected: 'sha256',
        description: 'Legacy SHA256 format (salt$hash)'
      },
      {
        hash: 'abc$defghijklmnop',
        expected: 'sha256',
        description: 'Short legacy format'
      },
      {
        hash: 'plaintext',
        expected: 'unknown',
        description: 'Plain text (security risk!)'
      },
      {
        hash: '',
        expected: 'unknown',
        description: 'Empty hash'
      }
    ];

    testCases.forEach(({ hash, expected, description }) => {
      const result = detectPasswordFormat(hash);
      expect(result).toBe(expected);
    });
  });

  test('should identify migration requirements', () => {
    const legacyHashes = [
      'salt$1234567890abcdef1234567890abcdef12345678',
      'testsalt$anotherlegacyhash123456789012345678',
      'plaintext123'
    ];

    const bcryptHashes = [
      '$2b$12$abcdefghijklmnopqrstuvwxyz1234567890ABCDEF',
      '$2a$10$zyxwvutsrqponmlkjihgfedcba0987654321ZYXWVU'
    ];

    legacyHashes.forEach(hash => {
      expect(requiresMigration(hash)).toBe(true);
    });

    bcryptHashes.forEach(hash => {
      expect(requiresMigration(hash)).toBe(false);
    });
  });
});

// Helper functions to detect password formats
function detectPasswordFormat(hash: string): 'bcrypt' | 'sha256' | 'unknown' {
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

function requiresMigration(hash: string): boolean {
  return detectPasswordFormat(hash) !== 'bcrypt';
}

// Export functions for potential use in actual migration
export { detectPasswordFormat, requiresMigration };