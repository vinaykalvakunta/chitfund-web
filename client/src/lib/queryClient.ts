import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes (adjust as needed)
      refetchOnWindowFocus: false, // Since it's a PWA, we might want to manage this carefully
      retry: 1,
    },
  },
});
