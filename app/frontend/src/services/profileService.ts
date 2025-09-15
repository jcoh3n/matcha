
 const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Get current user profile
export const getCurrentUserProfile = async (accessToken: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/profiles/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateProfile = async (profileData: any, accessToken: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/profiles/me`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Add photo
export const addPhoto = async (photoData: { url: string; isProfile?: boolean }, accessToken: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/profiles/me/photos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(photoData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding photo:', error);
    throw error;
  }
};

// Set profile photo
export const setProfilePhoto = async (photoId: number, accessToken: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/profiles/me/photos/${photoId}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error setting profile photo:', error);
    throw error;
  }
};

// Delete photo
export const deletePhoto = async (photoId: number, accessToken: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/profiles/me/photos/${photoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
};

// Update location
export const updateLocation = async (locationData: any, accessToken: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/profiles/me/location`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(locationData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating location:', error);
    throw error;
  }
};

// Get user tags
export const getUserTags = async (accessToken: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/profiles/me/tags`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user tags:', error);
    throw error;
  }
};

// Add user tags
export const addUserTags = async (tags: string[], accessToken: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/profiles/me/tags`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error adding user tags:', error);
    throw error;
  }
};

// Get public profile by ID
export const getPublicProfile = async (profileId: number, accessToken: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/profiles/${profileId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching public profile:', error);
    throw error;
  }
};

// Like a user
export const likeUser = async (userId: number, accessToken: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/profiles/likes/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error liking user:', error);
    throw error;
  }
};

// Unlike a user
export const unlikeUser = async (userId: number, accessToken: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/profiles/likes/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error unliking user:', error);
    throw error;
  }
};

// Block a user
export const blockUser = async (userId: number, accessToken: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/profiles/${userId}/block`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error blocking user:', error);
    throw error;
  }
};

// Unblock a user
export const unblockUser = async (userId: number, accessToken: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/profiles/${userId}/block`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error unblocking user:', error);
    throw error;
  }
};

// Report a user
export const reportUser = async (userId: number, reason: string, accessToken: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/profiles/${userId}/report`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error reporting user:', error);
    throw error;
  }
};