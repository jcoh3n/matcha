const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testSuggestedEndpoint() {
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
    console.log('Login successful, access token:', loginData.accessToken);
    
    // Test 1: Basic suggested endpoint
    console.log('\n--- Test 1: Basic suggested endpoint ---');
    const suggestedResponse1 = await fetch('http://localhost:3000/api/suggested?limit=3', {
      headers: {
        'Authorization': `Bearer ${loginData.accessToken}`
      }
    });
    
    if (!suggestedResponse1.ok) {
      console.error('Suggested endpoint failed:', suggestedResponse1.status, await suggestedResponse1.text());
      return;
    }
    
    const suggestedData1 = await suggestedResponse1.json();
    console.log('Suggested users (default sorting by fame):', JSON.stringify(suggestedData1.users.map(u => ({ 
      id: u.id, 
      name: `${u.firstName} ${u.lastName}`, 
      age: u.age, 
      distance: u.distance, 
      fame: u.profile.fameRating,
      sharedTags: u.sharedTags
    })), null, 2));
    
    // Test 2: Sort by distance
    console.log('\n--- Test 2: Sort by distance ---');
    const suggestedResponse2 = await fetch('http://localhost:3000/api/suggested?limit=3&sortBy=distance&sortOrder=asc', {
      headers: {
        'Authorization': `Bearer ${loginData.accessToken}`
      }
    });
    
    if (!suggestedResponse2.ok) {
      console.error('Suggested endpoint failed:', suggestedResponse2.status, await suggestedResponse2.text());
      return;
    }
    
    const suggestedData2 = await suggestedResponse2.json();
    console.log('Suggested users (sorted by distance):', JSON.stringify(suggestedData2.users.map(u => ({ 
      id: u.id, 
      name: `${u.firstName} ${u.lastName}`, 
      age: u.age, 
      distance: u.distance, 
      fame: u.profile.fameRating,
      sharedTags: u.sharedTags
    })), null, 2));
    
    // Test 3: Filter by age range
    console.log('\n--- Test 3: Filter by age range (25-35) ---');
    const suggestedResponse3 = await fetch('http://localhost:3000/api/suggested?limit=3&minAge=25&maxAge=35', {
      headers: {
        'Authorization': `Bearer ${loginData.accessToken}`
      }
    });
    
    if (!suggestedResponse3.ok) {
      console.error('Suggested endpoint failed:', suggestedResponse3.status, await suggestedResponse3.text());
      return;
    }
    
    const suggestedData3 = await suggestedResponse3.json();
    console.log('Suggested users (age 25-35):', JSON.stringify(suggestedData3.users.map(u => ({ 
      id: u.id, 
      name: `${u.firstName} ${u.lastName}`, 
      age: u.age, 
      distance: u.distance, 
      fame: u.profile.fameRating,
      sharedTags: u.sharedTags
    })), null, 2));
    
    // Test 4: Filter by fame rating
    console.log('\n--- Test 4: Filter by fame rating (min 3) ---');
    const suggestedResponse4 = await fetch('http://localhost:3000/api/suggested?limit=3&minFameRating=3', {
      headers: {
        'Authorization': `Bearer ${loginData.accessToken}`
      }
    });
    
    if (!suggestedResponse4.ok) {
      console.error('Suggested endpoint failed:', suggestedResponse4.status, await suggestedResponse4.text());
      return;
    }
    
    const suggestedData4 = await suggestedResponse4.json();
    console.log('Suggested users (fame rating >= 100):', JSON.stringify(suggestedData4.users.map(u => ({ 
      id: u.id, 
      name: `${u.firstName} ${u.lastName}`, 
      age: u.age, 
      distance: u.distance, 
      fame: u.profile.fameRating,
      sharedTags: u.sharedTags
    })), null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testSuggestedEndpoint();