import AppRouter from './router';
import { Providers } from './providers';
import  '../App.css';
import { useEffect } from 'react';
import ScrollToTop from '../utils/ScrollToTop';

export default function App() {
     useEffect(() => {
       if ('scrollRestoration' in window.history) {
         window.history.scrollRestoration = 'manual';
       }
     }, []);
     
  return (  
    <Providers>
      <ScrollToTop />
      <AppRouter />
    </Providers>
  );
}
