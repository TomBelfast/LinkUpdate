import dotenv from 'dotenv';

// Załaduj zmienne środowiskowe
dotenv.config({ path: '.env.local' });

console.log('=== TESTING ENVIRONMENT VARIABLES ===');
console.log('GOOGLE_ID:', process.env.GOOGLE_ID);
console.log('GOOGLE_SECRET:', process.env.GOOGLE_SECRET ? 'SET' : 'NOT SET');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET');

// Test if variables are properly loaded
if (!process.env.GOOGLE_ID) {
  console.error('❌ GOOGLE_ID is not set!');
} else {
  console.log('✅ GOOGLE_ID is properly set');
}

if (!process.env.GOOGLE_SECRET) {
  console.error('❌ GOOGLE_SECRET is not set!');
} else {
  console.log('✅ GOOGLE_SECRET is properly set');
}