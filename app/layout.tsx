import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/context';
import Navbar from '@/components/Navbar';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BudgetTracker',
  description: 'Personal finance and budgeting tracker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <AppProvider>
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-6 pb-24 sm:pb-6">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
