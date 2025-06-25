'use client';

import { useEffect, useRef, useState, Dispatch, SetStateAction } from 'react';
import { User } from '@supabase/supabase-js';
import { Profile } from '../../lib/supabase'; // Explicit relative path
import { Button } from '../ui/button'; // Explicit relative path
import { Card, CardContent } from '../ui/card'; // Explicit relative path
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'; // Explicit relative path
import { Badge } from '../ui/badge'; // Explicit relative path
import { signOut } from '../../lib/auth'; // Explicit relative path
import { useRouter, useSearchParams } from 'next/navigation'; // Keeping as Next.js built-in, might be env issue
import { CheckCircle, Clock, AlertCircle, Home, User as UserIcon, Shield, LogOut, Heart, ListChecks } from 'lucide-react';
import { toast } from 'sonner';
import TrendingTopics from './TrendingTopics'; // Sibling component
import { VerifiedBadge } from '../ui/VerifiedBadge'; // Explicit relative path
import { Input } from '../ui/input'; // Explicit relative path
import Image from 'next/image'; // Keeping as Next.js built-in, might be env issue

interface LeftSidebarProps {
  user: User | null;
  profile: Profile | null;
  onAuthClick: () => void;
  onSearch: Dispatch<SetStateAction<string>>;
}

export default function LeftSidebar({ user, profile, onAuthClick, onSearch }: LeftSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = searchParams.get('page') || 'feed';

  const sidebarRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [isSticky, setSticky] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      router.push('/?page=feed');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setSticky(!entry.isIntersecting),
      { rootMargin: '-20px 0px 0px 0px' }
    );

    const currentTriggerRef = triggerRef.current;
    if (currentTriggerRef) {
      observer.observe(currentTriggerRef);
    }

    return () => {
      if (currentTriggerRef) {
        observer.unobserve(currentTriggerRef);
      }
    };
  }, []);
  
  const getRoleAndVerification = () => {
    if (!profile) return null;
    let statusBadge, roleBadge;

    if (profile.role === 'donor') {
        roleBadge = <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><Heart className="w-3 h-3 mr-1" />Donor/Mentor</Badge>;
        statusBadge = <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>
    } else {
        roleBadge = <Badge variant="secondary"><UserIcon className="w-3 h-3 mr-1" />Student</Badge>;
        switch (profile.verification_status) {
            case 'verified':
                statusBadge = <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
                break;
            case 'pending':
                statusBadge = <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
                break;
            default:
                statusBadge = <Button variant="outline" size="sm" className="h-auto text-xs px-2 py-0.5 text-blue-600 border-blue-600 hover:bg-blue-50" onClick={() => router.push('/?page=verification')}><AlertCircle className="w-3 h-3 mr-1" />Get Verified</Button>
        }
    }
    return <div className="space-y-2 flex flex-col items-start">{roleBadge}{statusBadge}</div>
  }

  return (
    <div className="space-y-4">
      {/* Profile Section */}
      {user && user.email_confirmed_at && profile ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={profile.avatar_url} alt={profile.username} />
                <AvatarFallback className={`text-white text-lg ${profile.role === 'donor' ? 'bg-green-600' : 'bg-blue-600'}`}>
                  {profile.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-gray-900 truncate">{profile.username}</h3>
                    {(profile.role === 'donor' || profile.verification_status === 'verified') && (
                        <VerifiedBadge />
                    )}
                </div>
                <p className="text-sm text-gray-600 truncate">{profile.email}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
                {getRoleAndVerification()}
            </div>

            <Button variant="outline" className="w-full" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Welcome to Edubridgepeople</h3>
            <p className="text-sm text-gray-600 mb-4">Join our community to share knowledge and resources.</p>
            <Button onClick={onAuthClick} className="w-full bg-blue-600 hover:bg-blue-700">
              Join Community
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <nav className="space-y-2">
            <Button variant={currentPage === 'feed' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => router.push('/?page=feed')}>
              <Home className="w-4 h-4 mr-2" /> Home Feed
            </Button>
            {user && user.email_confirmed_at && (
              <>
                <Button variant={currentPage === 'profile' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => router.push('/?page=profile')}>
                  <UserIcon className="w-4 h-4 mr-2" /> My Profile
                </Button>
                {/* Added Wishlist option here */}
                <Button variant={currentPage === 'wishlist' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => router.push('/?page=wishlist')}>
                  <ListChecks className="w-4 h-4 mr-2" /> My Wishlist
                </Button>
              </>
            )}
            <Button variant={currentPage === 'privacy' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => router.push('/?page=privacy')}>
              <Shield className="w-4 h-4 mr-2" /> Privacy Policy
            </Button>
          </nav>
        </CardContent>
      </Card>

      {/* Trigger Element for Sticky */}
      <div ref={triggerRef}></div>

      {/* Sticky Trending Topics */}
      <div ref={sidebarRef} className={`transition-all ${isSticky ? 'fixed top-4 w-[calc(25%-2rem)]' : 'relative'}`}>
        <TrendingTopics />
      </div>
    </div>
  );
}
