import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import QueryProvider from '@/components/QueryProvider';

export const metadata: Metadata = {
  title: 'ThreadVerse – Dive into what matters',
  description: 'A modern Reddit-style community platform with AI-powered features.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0d1117] text-[#e6edf3] antialiased">
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#1c2128',
                  color: '#e6edf3',
                  border: '1px solid #30363d',
                  borderRadius: '8px',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
              }}
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
