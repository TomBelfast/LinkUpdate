import { executeQuery } from '@/lib/db';
import { hashPasswordSecure, detectPasswordFormat } from '@/lib/auth/password-utils';

interface User {
  id: string;
  email: string;
  password?: string;
}

async function migratePasswords() {
  console.log('🔄 Starting password migration analysis...');
  
  try {
    const allUsers = await executeQuery(
      "SELECT id, email, password FROM users WHERE password IS NOT NULL", 
      []
    ) as User[];

    if (!allUsers || allUsers.length === 0) {
      console.log('✅ No users found with passwords');
      return;
    }

    let bcryptCount = 0;
    let legacyCount = 0;
    let unknownCount = 0;
    let migratedCount = 0;

    console.log(`📊 Analyzing ${allUsers.length} users...`);

    for (const user of allUsers) {
      if (!user.password) continue;

      const format = detectPasswordFormat(user.password);
      
      switch (format) {
        case 'bcrypt':
          bcryptCount++;
          break;
        case 'sha256':
          legacyCount++;
          console.log(`⚠️  User ${user.email} has legacy SHA256 password`);
          
          // W rzeczywistej migracji tutaj można by:
          // 1. Oznaczyć użytkownika jako wymagającego zmiany hasła
          // 2. Lub zachować legacy format z obsługą hybrydową
          
          // Przykład oznaczania do zmiany:
          // await executeQuery(
          //   "UPDATE users SET requires_password_update = TRUE WHERE id = ?",
          //   [user.id]
          // );
          // migratedCount++;
          
          break;
        default:
          unknownCount++;
          console.log(`❌ User ${user.email} has unknown password format: ${user.password?.substring(0, 20)}...`);
      }
    }

    console.log('\n📈 Migration Analysis Results:');
    console.log(`  ✅ bcrypt passwords: ${bcryptCount}`);
    console.log(`  ⚠️  Legacy SHA256: ${legacyCount}`);
    console.log(`  ❌ Unknown format: ${unknownCount}`);
    console.log(`  🔄 Flagged for update: ${migratedCount}`);

    if (legacyCount > 0) {
      console.log('\n💡 Recommendations:');
      console.log('  1. Deploy hybrid password system (already implemented)');
      console.log('  2. Consider forcing password reset for legacy users');
      console.log('  3. Monitor login attempts for legacy format usage');
    } else {
      console.log('\n🎉 All passwords are already using secure bcrypt format!');
    }

  } catch (error) {
    console.error('❌ Migration analysis failed:', error);
    throw error;
  }
}

// Funkcja do wymuszania aktualizacji hasła dla legacy users
async function flagLegacyPasswordsForUpdate() {
  console.log('🔄 Flagging legacy passwords for update...');
  
  try {
    const allUsers = await executeQuery(
      "SELECT id, email, password FROM users WHERE password IS NOT NULL", 
      []
    ) as User[];

    let flaggedCount = 0;

    for (const user of allUsers) {
      if (!user.password) continue;

      const format = detectPasswordFormat(user.password);
      
      if (format === 'sha256') {
        // Dodaj kolumnę requires_password_update jeśli nie istnieje
        await executeQuery(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS requires_password_update BOOLEAN DEFAULT FALSE
        `, []);

        await executeQuery(
          "UPDATE users SET requires_password_update = TRUE WHERE id = ?",
          [user.id]
        );
        
        console.log(`✅ Flagged ${user.email} for password update`);
        flaggedCount++;
      }
    }

    console.log(`✅ Flagged ${flaggedCount} users for password update`);
    
  } catch (error) {
    console.error('❌ Failed to flag legacy passwords:', error);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  migratePasswords().catch(console.error);
}

export { migratePasswords, flagLegacyPasswordsForUpdate };