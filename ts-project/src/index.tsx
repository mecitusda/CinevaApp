import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import App from './app/App';

// 1️⃣ QueryClient (default ayarlar)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 20,      // 5 dk taze
      gcTime: 1000 * 60 * 30,     // 30 dk cache
      refetchOnWindowFocus: false,  // tab değişince refetch yok
      refetchOnMount: false,        // component mount olunca refetch yok
      retry: 1,
    },
  },
});

// 2️⃣ SessionStorage persister (TAB KAPANINCA SİLİNİR)
const persister = createSyncStoragePersister({
  storage: window.sessionStorage,
});

// 3️⃣ Persist'i bağla
persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 30, // 30 dk sonra otomatik expire
  dehydrateOptions: {
    shouldDehydrateQuery: (query) =>
      query.queryKey[0] !== 'home',
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(

    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>

);
