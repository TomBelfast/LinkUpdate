// Test czy zmienne środowiskowe Google OAuth są dostępne

console.log('=== Test zmiennych środowiskowych Google OAuth ===');
console.log('GOOGLE_ID:', process.env.GOOGLE_ID || 'BRAK');
console.log('GOOGLE_SECRET:', process.env.GOOGLE_SECRET || 'BRAK');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'BRAK');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET || 'BRAK');

// Sprawdź czy dane są poprawne
if (process.env.GOOGLE_ID && process.env.GOOGLE_SECRET) {
  console.log('✅ Dane Google OAuth są dostępne');
  console.log('GOOGLE_ID długość:', process.env.GOOGLE_ID.length);
  console.log('GOOGLE_SECRET długość:', process.env.GOOGLE_SECRET.length);
} else {
  console.log('❌ Brakuje danych Google OAuth');
}