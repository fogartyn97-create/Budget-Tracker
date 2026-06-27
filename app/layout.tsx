import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/context';
import Navbar from '@/components/Navbar';
import Toast from '@/components/Toast';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BudgetTracker',
  description: 'Personal finance and budgeting tracker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.className} style={{ backgroundColor: '#f0f4f8', minHeight: '100vh' }}>
        <AppProvider>
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-28 sm:pb-10">
            {children}
          </main>
          <Toast />
        </AppProvider>
      </body>
    </html>
  );
}
