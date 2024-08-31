async function fetchWithAuth(url, options = {}) {
  const accessToken = localStorage.getItem('sb_token');
  
  // Add the access token to the request headers
  options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
  };

  // Make the request
  let response = await fetch(url, options);

  // If the access token has expired, refresh it and retry the request
  if (response.status === 401) {
      const refreshToken = localStorage.getItem('sb_refreshToken');
      if (refreshToken) {
          try {
              const newAccessToken = await refreshAccessToken(refreshToken);
              localStorage.setItem('sb_token', newAccessToken);

              // Update the Authorization header with the new access token
              options.headers['Authorization'] = `Bearer ${newAccessToken}`;

              // Retry the original request with the new token
              response = await fetch(url, options);
          } catch (error) {
              console.error('Failed to refresh token', error);
              // Handle the case where the refresh token is invalid or expired
              // Redirect to login page or show an error message
          }
      } else {
          // If there's no refresh token, consider logging the user out
          console.error('No refresh token available');
          // Redirect to login or take other action
      }
  }

  return response;
}

async function refreshAccessToken(refreshToken) {
  const response = await fetch('http://localhost:8088/api/v1/auth/refresh-token', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
  });

  if (response.ok) {
      const data = await response.json();
      return data.accessToken;
  } else {
      throw new Error('Failed to refresh access token');
  }
}