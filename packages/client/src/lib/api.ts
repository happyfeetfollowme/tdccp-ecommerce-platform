// Basic API utility to fetch data from the backend
// This will be expanded with error handling, authentication, etc.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'; // Assuming API Gateway is at /api

interface FetchOptions extends RequestInit {
  // Add any custom options if needed
}

async function fetchApi<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    // Authorization header will be added here when auth is implemented
    // e.g., 'Authorization': `Bearer ${getToken()}`
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      // Attempt to parse error response from backend
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // Not a JSON response
      }
      console.error('API Error:', response.status, errorData || response.statusText);
      throw new Error(errorData?.message || `API request failed with status ${response.status}`);
    }

    // Handle cases where response might be empty (e.g., 204 No Content for DELETE)
    if (response.status === 204) {
      return undefined as T; // Or handle as appropriate for your app
    }

    const data: T = await response.json();
    return data;

  } catch (error) {
    console.error('Fetch API error:', error);
    // Re-throw or handle error as appropriate for your application's UX
    // For now, re-throwing to be caught by the calling component/page
    throw error;
  }
}

export default fetchApi;

// Example typed GET, POST, PUT, DELETE methods (can be expanded)

export const apiGet = <T = any>(endpoint: string, options?: FetchOptions) =>
  fetchApi<T>(endpoint, { ...options, method: 'GET' });

export const apiPost = <T = any>(endpoint: string, body: any, options?: FetchOptions) =>
  fetchApi<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });

export const apiPut = <T = any>(endpoint: string, body: any, options?: FetchOptions) =>
  fetchApi<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });

export const apiDelete = <T = any>(endpoint: string, options?: FetchOptions) =>
  fetchApi<T>(endpoint, { ...options, method: 'DELETE' });
