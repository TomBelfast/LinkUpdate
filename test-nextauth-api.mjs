import fetch from 'node-fetch';

async function testNextAuthAPI() {
  try {
    console.log('=== TESTING NEXTAUTH API ===');
    
    // Test 1: Check if NextAuth API is working
    console.log('\n1. Testing NextAuth providers endpoint...');
    const providersResponse = await fetch('http://localhost:8888/api/auth/providers');
    console.log('Providers status:', providersResponse.status);
    
    if (providersResponse.ok) {
      const providers = await providersResponse.json();
      console.log('Available providers:', Object.keys(providers));
    }
    
    // Test 2: Try to sign in with credentials
    console.log('\n2. Testing credentials sign in...');
    const signInResponse = await fetch('http://localhost:8888/api/auth/signin/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'tomaszpasiekauk@gmail.com',
        password: 'Swiat1976@#',
        redirect: 'false'
      })
    });
    
    console.log('Sign in status:', signInResponse.status);
    console.log('Sign in headers:', Object.fromEntries(signInResponse.headers));
    
    const signInText = await signInResponse.text();
    console.log('Sign in response:', signInText.substring(0, 200) + '...');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testNextAuthAPI();