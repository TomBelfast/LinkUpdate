// Test bezpośredniego logowania przez NextAuth API

async function testDirectLogin() {
  try {
    console.log('Testuję bezpośrednie logowanie przez NextAuth API...');
    
    // Najpierw pobierz CSRF token
    const csrfResponse = await fetch('http://localhost:9999/api/auth/csrf');
    const csrfData = await csrfResponse.json();
    console.log('CSRF Token:', csrfData.csrfToken);
    
    // Teraz spróbuj zalogować się
    const loginResponse = await fetch('http://localhost:9999/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'test@test.com',
        password: 'test123',
        csrfToken: csrfData.csrfToken,
        callbackUrl: 'http://localhost:9999/',
        json: 'true'
      })
    });
    
    console.log('Status logowania:', loginResponse.status);
    console.log('Headers logowania:', Object.fromEntries(loginResponse.headers.entries()));
    
    const loginResult = await loginResponse.text();
    console.log('Wynik logowania:', loginResult);
    
    // Sprawdź czy otrzymaliśmy cookies sesji
    const cookies = loginResponse.headers.get('set-cookie');
    if (cookies) {
      console.log('Otrzymane cookies:', cookies);
    }
    
  } catch (error) {
    console.error('❌ Błąd podczas testowania logowania:', error.message);
  }
}

testDirectLogin();