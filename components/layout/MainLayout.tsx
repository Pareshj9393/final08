// components/layout/MainLayout.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConnected, Profile } from '@/lib/supabase';
import { getUserProfile } from '@/lib/auth';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import LeftSidebar from './LeftSidebar';
import CenterFeed from './CenterFeed';
import RightSidebar from './RightSidebar';
import { AuthModal } from '@/components/auth/AuthModal';
import ProfilePage from '@/components/pages/ProfilePage';
import PrivacyPage from '@/components/pages/PrivacyPage';
import VerificationPage from '@/components/pages/VerificationPage';
import TermsAndConditionsPage from '@/components/pages/TermsAndConditionsPage';
import HackathonPopup from '@/components/ui/HackathonPopup';
import { toast } from 'sonner';
import Header from './Header';
import MessagesPage from '@/components/pages/MessagesPage';
import WishlistPage from '@/components/pages/WishlistPage';
import NotificationsPage from '@/components/pages/NotificationsPage';

export default function MainLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [showHackathonPopup, setShowHackathonPopup] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = searchParams.get('page') || 'feed';

  const onVerificationUpdate = useCallback(async (userId: string) => {
    const profileData = await getUserProfile(userId);
    if (profileData) setProfile(profileData);
  }, []);

  useEffect(() => {
    if (!isSupabaseConnected) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const checkSession = async (session: Session | null) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const profileData = await getUserProfile(currentUser.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => checkSession(session));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => checkSession(session));
    
    if (currentPage === 'feed' && !sessionStorage.getItem('hackathonPopupShown')) {
      setTimeout(() => {
        setShowHackathonPopup(true);
        sessionStorage.setItem('hackathonPopupShown', 'true');
      }, 1500);
    }
    if (searchParams.get('verified') === 'true') {
      toast.success("Email Verified! Welcome to Edubridgepeople.");
      router.replace('/?page=feed');
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [currentPage, router, searchParams, onVerificationUpdate]);

  const handleAuthSuccess = () => setShowAuthModal(false);
  const openAuthModal = (mode: 'signup' | 'signin') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const renderPageContent = () => {
    switch (currentPage) {
        case 'profile':
          return <ProfilePage user={user} profile={profile} onVerificationUpdate={onVerificationUpdate} />;
        case 'privacy':
          return <PrivacyPage />;
        case 'verification':
          return <VerificationPage user={user} profile={profile} onVerificationUpdate={onVerificationUpdate} />;
        case 'terms':
          return <TermsAndConditionsPage />;
        case 'messages':
          return <MessagesPage user={user} profile={profile} />;
        case 'notifications':
          return <NotificationsPage user={user} />;
        case 'wishlist':
            return <WishlistPage user={user} profile={profile} />;
        default: 
            return (
                // Adjusted responsive classes for sidebars to make them visible earlier and more flexible
                <div className="flex flex-1 w-full">
                    <aside className="w-full md:w-1/4 lg:w-[280px] flex-shrink-0 border-r border-gray-200 hidden md:block">
                      <LeftSidebar user={user} profile={profile} onAuthClick={() => openAuthModal('signup')} onSearch={setSearchQuery} />
                    </aside>
                    <main className="flex-1 max-w-[600px] bg-white border-l border-r">
                      <CenterFeed user={user} profile={profile} searchQuery={searchQuery} />
                    </main>
                    <aside className="w-full lg:w-1/4 xl:w-[350px] flex-shrink-0 border-l border-gray-200 hidden lg:block">
                      <RightSidebar />
                    </aside>
                </div>
            );
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        user={user}
        profile={profile}
        onAuthClick={openAuthModal}
        onMobileMenuClick={() => setMobileMenuOpen(true)}
      />
      
      {/* Main content area, allowing internal components to scroll if needed */}
      <div className="max-w-7xl w-full mx-auto flex flex-grow overflow-hidden"> {/* Added overflow-hidden */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          renderPageContent()
        )}
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="relative w-72 h-full bg-white shadow-xl" onClick={e => e.stopPropagation()}>
                <LeftSidebar user={user} profile={profile} onAuthClick={() => { openAuthModal('signup'); setMobileMenuOpen(false); }} onSearch={setSearchQuery} />
            </div>
        </div>
      )}

      {isSupabaseConnected && <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} initialMode={authMode} />}
      <HackathonPopup isOpen={showHackathonPopup} onClose={() => setShowHackathonPopup(false)} />
    </div>
  );
}
