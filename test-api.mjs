import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('Testing /api/ideas endpoint...');
    
    const response = await fetch('http://localhost:8888/api/ideas');
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success! Data:', data);
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testAPI();