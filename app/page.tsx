'use client'; // This is important for using hooks like useRouter

import { useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import LandingPage from '@/components/pages/LandingPage'; // Corrected import path for LandingPage component

export default function Home() {
  const searchParams = useSearchParams();
  const currentPage = searchParams.get('page');

  // Render LandingPage if no specific page is requested (i.e., it's the root path)
  // Otherwise, render MainLayout to handle other pages like 'feed', 'profile', etc.
  if (!currentPage) {
    return <LandingPage />;
  } else {
    return <MainLayout />;
  }
}
