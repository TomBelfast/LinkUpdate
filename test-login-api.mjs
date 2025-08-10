// Używamy wbudowanego fetch w Node.js 18+

async function testLoginAPI() {
  try {
    console.log('Testuję logowanie przez API NextAuth...');
    
    // Test logowania przez credentials
    const loginData = {
      email: 'test@test.com',
      password: 'test123'
    };
    
    console.log('Dane logowania:', loginData);
    
    // Wywołaj endpoint NextAuth
    const response = await fetch('http://localhost:9999/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: loginData.email,
        password: loginData.password,
        csrfToken: 'test', // W prawdziwej aplikacji to powinien być prawdziwy token
        callbackUrl: 'http://localhost:9999/',
        json: 'true'
      })
    });
    
    console.log('Status odpowiedzi:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Odpowiedź:', responseText);
    
  } catch (error) {
    console.error('❌ Błąd podczas testowania API:', error.message);
  }
}

testLoginAPI();