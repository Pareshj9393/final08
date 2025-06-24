import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import BoltBadge from '@/components/ui/BoltBadge';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Edubridgepeople - Community-Driven Social Learning',
  description: 'Connecting donors and students through trusted community learning',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* The <head> tag is automatically managed by Next.js, 
          so we don't need to add it here unless for very specific cases. 
          The <style> tag has been moved to globals.css */}
      <body className={inter.className} suppressHydrationWarning>
        {children}
        <Toaster />
        <BoltBadge />
      </body>
    </html>
  );
}
