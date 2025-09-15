const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function debugSuggestedEndpoint() {
  try {
    // Login with an existing user
    console.log('Logging in with existing user...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'marilou.bonnet@example.com',
        password: 'Password123!'
      })
    });
    
    if (!loginResponse.ok) {
      console.error('Login failed:', loginResponse.status, await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('Login successful');
    
    // Call the suggested endpoint with debug info
    console.log('Calling suggested endpoint...');
    const suggestedResponse = await fetch('http://localhost:3000/api/suggested?limit=3', {
      headers: {
        'Authorization': `Bearer ${loginData.accessToken}`
      }
    });
    
    console.log('Response status:', suggestedResponse.status);
    console.log('Response headers:', suggestedResponse.headers.raw());
    
    if (!suggestedResponse.ok) {
      console.error('Suggested endpoint failed:', suggestedResponse.status, await suggestedResponse.text());
      return;
    }
    
    const suggestedData = await suggestedResponse.json();
    console.log('Full response data:', JSON.stringify(suggestedData, null, 2));
    
    // Check the structure of the first user if available
    if (suggestedData.users && suggestedData.users.length > 0) {
      console.log('\nFirst user structure:');
      console.log(JSON.stringify(suggestedData.users[0], null, 2));
    } else {
      console.log('No users found in response');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugSuggestedEndpoint();