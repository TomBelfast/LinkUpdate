import fs from 'fs';
import path from 'path';

describe('Security: Debug Logs', () => {
  test('should not contain password logging in auth route', () => {
    const authFile = fs.readFileSync(
      path.join(process.cwd(), 'app/api/auth/[...nextauth]/route.ts'), 
      'utf-8'
    );
    
    // Sprawdź czy nie ma logowania haseł
    expect(authFile).not.toMatch(/console\.log.*password/i);
    expect(authFile).not.toMatch(/console\.log.*hash.*\$2b/i);
    expect(authFile).not.toMatch(/console\.error.*password/i);
    
    // Sprawdź czy nie ma logowania całego user object (może zawierać hasło)
    expect(authFile).not.toMatch(/console\.log.*user\)/);
  });
  
  test('should not contain password logging in auth lib', () => {
    const authLibFile = fs.readFileSync(
      path.join(process.cwd(), 'app/lib/auth.ts'), 
      'utf-8'
    );
    
    // Sprawdź czy nie ma logowania haseł w bibliotece
    expect(authLibFile).not.toMatch(/console\.log.*password/i);
    expect(authLibFile).not.toMatch(/console\.log.*hash.*\$2b/i);
    expect(authLibFile).not.toMatch(/console\.error.*password(?!.*error)/i); // Pozwalamy "Password comparison error"
  });

  test('should not expose sensitive environment variables', () => {
    const authFile = fs.readFileSync(
      path.join(process.cwd(), 'app/api/auth/[...nextauth]/route.ts'), 
      'utf-8'
    );
    
    // Nie powinno być bezpośredniego logowania secrets
    expect(authFile).not.toMatch(/console\.log.*GOOGLE_SECRET/);
    expect(authFile).not.toMatch(/console\.log.*NEXTAUTH_SECRET/);
    expect(authFile).not.toMatch(/console\.log.*DATABASE_PASSWORD/);
  });

  test('should use production-safe error logging', () => {
    const authFile = fs.readFileSync(
      path.join(process.cwd(), 'app/api/auth/[...nextauth]/route.ts'), 
      'utf-8'
    );
    
    // Sprawdź czy błędy są logowane bezpiecznie
    const errorLogs = authFile.match(/console\.error/g) || [];
    
    // Można mieć bezpieczne logi błędów
    expect(errorLogs.length).toBeGreaterThanOrEqual(0);
    
    // Ale nie powinny zawierać wrażliwych danych
    expect(authFile).not.toMatch(/console\.error.*credentials.*password/i);
    expect(authFile).not.toMatch(/console\.error.*\$2b\$/);
  });

  test('should validate security patterns in critical files', () => {
    const authFiles = [
      'app/api/auth/[...nextauth]/route.ts',
      'app/lib/auth.ts'
    ];

    authFiles.forEach(filePath => {
      const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8');
      
      // Powinny używać bcrypt
      expect(content).toMatch(/bcrypt/);
      
      // Nie powinny zawierać crypto.createHash (legacy SHA256)
      expect(content).not.toMatch(/crypto\.createHash\(['"]sha256['"]\)/);
      
      // Nie powinny zawierać hardcoded secrets (ale pozwalamy na type definitions)
      expect(content).not.toMatch(/const.*password.*=.*['"][a-zA-Z0-9]{20,}/);
      expect(content).not.toMatch(/const.*secret.*=.*['"][a-zA-Z0-9]{20,}/);
    });
  });
});