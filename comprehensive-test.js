// Test script to check the complete flow
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function comprehensiveTest() {
  try {
    console.log('=== Step 1: Checking localStorage for accessToken ===');
    // This would normally be done in the browser
    console.log('In browser, check: localStorage.getItem("accessToken")');
    
    console.log('\n=== Step 2: Login with existing user ===');
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
    
    console.log('Login response status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      console.error('Login failed:', loginResponse.status, await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('Login successful, access token:', loginData.accessToken ? 'RECEIVED' : 'MISSING');
    console.log('Full login data keys:', Object.keys(loginData));
    
    console.log('\n=== Step 3: Check current user profile ===');
    const currentUserResponse = await fetch('http://localhost:3000/api/me', {
      headers: {
        'Authorization': `Bearer ${loginData.accessToken}`
      }
    });
    
    console.log('Current user response status:', currentUserResponse.status);
    
    if (!currentUserResponse.ok) {
      console.error('Current user check failed:', currentUserResponse.status, await currentUserResponse.text());
      return;
    }
    
    const currentUserData = await currentUserResponse.json();
    console.log('Current user data:', JSON.stringify(currentUserData, null, 2));
    
    // Check if profile is complete
    const profile = currentUserData.profile;
    console.log('\n=== Profile Completeness Check ===');
    if (!profile) {
      console.log('❌ Profile is missing');
    } else {
      console.log('Profile check:');
      console.log('  bio:', profile.bio ? '✅ Present' : '❌ Missing');
      console.log('  gender:', profile.gender ? '✅ Present' : '❌ Missing');
      console.log('  orientation:', profile.orientation || profile.sexualOrientation ? '✅ Present' : '❌ Missing');
      console.log('  birthDate:', profile.birthDate ? '✅ Present' : '❌ Missing');
      
      const isComplete = profile.bio && profile.gender && (profile.orientation || profile.sexualOrientation) && profile.birthDate;
      console.log('Overall profile status:', isComplete ? '✅ Complete' : '❌ Incomplete');
    }
    
    console.log('\n=== Step 4: Call suggested endpoint ===');
    const suggestedResponse = await fetch('http://localhost:3000/api/suggested?limit=3', {
      headers: {
        'Authorization': `Bearer ${loginData.accessToken}`
      }
    });
    
    console.log('Suggested endpoint status:', suggestedResponse.status);
    
    if (!suggestedResponse.ok) {
      console.error('Suggested endpoint failed:', suggestedResponse.status, await suggestedResponse.text());
      return;
    }
    
    const suggestedData = await suggestedResponse.json();
    console.log('Suggested data type:', typeof suggestedData);
    console.log('Suggested data keys:', suggestedData ? Object.keys(suggestedData) : 'NULL');
    
    if (suggestedData && suggestedData.users) {
      console.log('Number of users:', suggestedData.users.length);
      if (suggestedData.users.length > 0) {
        console.log('First user keys:', Object.keys(suggestedData.users[0]));
        console.log('First user sample:', {
          id: suggestedData.users[0].id,
          firstName: suggestedData.users[0].firstName,
          lastName: suggestedData.users[0].lastName,
          hasProfile: !!suggestedData.users[0].profile,
          hasLocation: !!suggestedData.users[0].location
        });
      }
    } else if (Array.isArray(suggestedData)) {
      console.log('Data is array with length:', suggestedData.length);
    } else {
      console.log('Unexpected data format');
    }
    
  } catch (error) {
    console.error('Error in comprehensive test:', error);
  }
}

comprehensiveTest();