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
        // Attach the access token to the request headers
        const token = localStorage.getItem('sb_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Response Interceptor
apiClient.interceptors.response.use(
    response => response, // Return the response data if successful
    async error => {
        const originalRequest = error.config;

        // Handle 401 errors (unauthorized due to expired token)
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark the request as retried

            try {
                const { data } = await axios.post('/api/v1/auth/refresh-token', {}, { withCredentials: true });
                localStorage.setItem('sb_token', data.access_token);

                // Update the authorization header and retry the original request
                originalRequest.headers['Authorization'] = `Bearer ${data.access_token}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Handle the error (e.g., log out the user)
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
