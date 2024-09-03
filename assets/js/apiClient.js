// Create an Axios instance with default settings
const apiClient = axios.create({
  baseURL: 'http://localhost:8088', // Replace with your API's base URL
  timeout: 10000, // Optional: set a timeout for requests
  headers: {
    'Content-Type': 'application/json', // Set default content type
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  config => {
    console.log('Request Config:', config); // Debugging line
    const token = localStorage.getItem('sb_token');
    if (token) {
      console.log('Attaching token to request:', token); // Debugging line
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Function to refresh the token
async function refreshToken() {
  const refreshToken = localStorage.getItem('sb_refreshToken');
  if (refreshToken) {
    try {
      const { data } = await axios.post('http://localhost:8088/api/v1/auth/refresh-token', {}, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
        }
      });
      localStorage.setItem('sb_token', data.access_token);
      return data.access_token;
    } catch (error) {
      console.error('Failed to refresh token', error);
      // Clear tokens and redirect to login
      localStorage.removeItem('sb_token');
      localStorage.removeItem('sb_refreshToken');
      window.location.href = 'sign-in.html';
      return Promise.reject(error);
    }
  } else {
    console.error('No refresh token available');
    localStorage.removeItem('sb_token');
    localStorage.removeItem('sb_refreshToken');
    window.location.href = 'sign-in.html';
    return Promise.reject(new Error('No refresh token available'));
  }
}

// Response Interceptor
apiClient.interceptors.response.use(
  response => response,
  async error => {
    console.error('Response Error:', error); // // Debugging line
    const originalRequest = error.config;
    console.log('Interceptor caught an error:', error.response ? error.response.status : error.message); // Debugging line

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshToken();
        console.log('Refreshing token. New access token:', newAccessToken); // Debugging line
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
