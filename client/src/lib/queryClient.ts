import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    
    // Handle specific HTTP status codes with better error messages
    switch (res.status) {
      case 401:
        throw new Error("Authentication failed. Please log in again.");
      case 403:
        throw new Error("Access denied. You don't have permission to perform this action.");
      case 404:
        throw new Error("Resource not found.");
      case 500:
        throw new Error("Server error. Please try again later.");
      default:
        throw new Error(`${res.status}: ${text}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = 'http://localhost:8080';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  
  console.log(`Making ${method} request to ${fullUrl}`, data);
  
  const headers: Record<string, string> = {};
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Add Authorization header if token exists
  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  console.log(`Response status: ${res.status} for ${fullUrl}`);
  
  if (!res.ok) {
    const text = await res.text();
    console.error(`API Error ${res.status}: ${text}`);
    
    // Handle specific HTTP status codes with better error messages
    switch (res.status) {
      case 401:
        throw new Error("Authentication failed. Please log in again.");
      case 403:
        throw new Error("Access denied. You don't have permission to perform this action.");
      case 404:
        throw new Error("Resource not found.");
      case 500:
        throw new Error("Server error. Please try again later.");
      default:
        throw new Error(`${res.status}: ${text}`);
    }
  }
  
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    const baseUrl = 'http://localhost:8080';
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    
    console.log(`Making GET request to ${fullUrl}`);
    
    const headers: Record<string, string> = {};
    // Add Authorization header if token exists
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const res = await fetch(fullUrl, {
      headers,
    });

    console.log(`Response status: ${res.status} for ${fullUrl}`);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    if (!res.ok) {
      const text = await res.text();
      console.error(`Query Error ${res.status}: ${text}`);
      
      // Handle specific HTTP status codes with better error messages
      switch (res.status) {
        case 401:
          throw new Error("Authentication failed. Please log in again.");
        case 403:
          throw new Error("Access denied. You don't have permission to perform this action.");
        case 404:
          throw new Error("Resource not found.");
        case 500:
          throw new Error("Server error. Please try again later.");
        default:
          throw new Error(`${res.status}: ${text}`);
      }
    }
    
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});