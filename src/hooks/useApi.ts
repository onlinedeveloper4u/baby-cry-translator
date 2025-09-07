import { useState, useCallback } from 'react';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

interface ApiRequestOptions<TBody, TResponse> {
  method?: HttpMethod;
  body?: TBody;
  headers?: Record<string, string>;
  onSuccess?: (data: TResponse) => void;
  onError?: (error: string) => void;
}

interface ApiError extends Error {
  message: string;
  status?: number;
  data?: unknown;
}

export function useApi<T = unknown>(baseUrl: string = '') {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const request = useCallback(
    async <TResponse = T, TBody = unknown>(
      endpoint: string,
      options: ApiRequestOptions<TBody, TResponse> = {}
    ): Promise<TResponse | null> => {
      const {
        method = 'GET',
        body,
        headers = {},
        onSuccess,
        onError,
      } = options;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const url = `${baseUrl}${endpoint}`.replace(/([^:]\/)\/+/g, '$1'); // Remove duplicate slashes
        const config: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        };

        if (body && method !== 'GET') {
          config.body = JSON.stringify(body);
        }

        const response = await fetch(url, config);
        
        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        let data: TResponse;
        
        if (contentType?.includes('application/json')) {
          data = await response.json() as TResponse;
        } else {
          // Handle non-JSON response
          const text = await response.text();
          throw new Error(text || 'Invalid response format');
        }

        if (!response.ok) {
          const error: ApiError = new Error(
            (data as any)?.message || 'Something went wrong'
          );
          error.status = response.status;
          error.data = data;
          throw error;
        }

        // Update the state with the response data if it matches the expected type T
        const typedData = data as unknown as T;
        setState({ data: typedData, error: null, loading: false });
        
        // Call onSuccess with the response data as TResponse
        if (onSuccess) {
          onSuccess(data);
        }
        
        return data;
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'An unknown error occurred';
          
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
        
        onError?.(errorMessage);
        return null;
      }
    },
    [baseUrl]
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    request,
    clearError,
  };
}

// Example usage:
// const { request, loading, error, data } = useApi('https://api.example.com');
// 
// // In your component:
// const fetchData = async () => {
//   const result = await request<YourDataType>('/endpoint', {
//     method: 'GET',
//     onSuccess: (data) => console.log('Success:', data),
//     onError: (error) => console.error('Error:', error),
//   });
// };
// 
// // For POST requests:
// const postData = async (payload: YourPayloadType) => {
//   const result = await request<YourResponseType, YourPayloadType>('/endpoint', {
//     method: 'POST',
//     body: payload,
//     onSuccess: (data) => console.log('Success:', data),
//     onError: (error) => console.error('Error:', error),
//   });
// };
