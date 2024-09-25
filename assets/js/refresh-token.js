export async function fetchWithAuth(url, options = {}) {
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
              window.location.href = '../../login/index.html'; 
          }
      } else {
          console.error('No refresh token available');
          window.location.href = '../../login/index.html'; 
      }
  }

  return response;
}

export async function fetchWithAuthUpload(url, options = {}) {
  const accessToken = localStorage.getItem('sb_token');

  // Add the access token to the request headers
  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`,
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
        window.location.href = '../../login/index.html';
      }
    } else {
      console.error('No refresh token available');
      window.location.href = '../../login/index.html';
    }
  }

  return response;
}

export async function refreshAccessToken(refreshToken) {
  const response = await fetch('http://localhost:8088/api/v1/auth/refresh-token', {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${refreshToken}`,
          'Content-Type': 'application/json'
      },
  });

  if (response.ok) {
      const data = await response.json();
      return data.access_token;
  } else {
      throw new Error('Failed to refresh access token');
  }
}