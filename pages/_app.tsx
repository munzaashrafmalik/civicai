import type { AppProps } from 'next/app';
import '../frontend/styles/globals.css';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/components/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Chatbot from '@/components/Chatbot/Chatbot';
import AnimatedBackground from '@/components/AnimatedBackground/AnimatedBackground';
import NotificationPrompt from '@/components/NotificationPrompt/NotificationPrompt';
import SplashScreen from '@/components/SplashScreen/SplashScreen';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const isAdmin = pageProps.router?.pathname?.startsWith('/admin');

  return (
    <div className={`${inter.variable} ${jakarta.variable} font-sans`}>
      <SplashScreen />
      {!isAdmin && <AnimatedBackground />}
      <SessionProvider session={session}>
        <ToastProvider>
          <ErrorBoundary>
            <Component {...pageProps} />
            <Chatbot />
            <NotificationPrompt />
          </ErrorBoundary>
        </ToastProvider>
      </SessionProvider>
    </div>
  );
}
