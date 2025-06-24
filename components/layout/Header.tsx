// components/layout/Header.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { Profile, isSupabaseConnected } from '@/lib/supabase'; // Kept for logic, but display removed
import { Button } from '@/components/ui/button';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { CheckCircle, AlertCircle, GraduationCap, Users, Menu, LogIn, ChevronDown, Bell, MessageSquare } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from '@/lib/auth';
import { toast } from 'sonner';
import Image from 'next/image'; // Import Next.js Image component

interface HeaderProps {
  user: User | null;
  profile: Profile | null;
  onAuthClick: (mode: 'signup' | 'signin') => void;
  onMobileMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, profile, onAuthClick, onMobileMenuClick }) => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 lg:flex-none">
            <Button variant="ghost" size="sm" onClick={onMobileMenuClick} className="lg:hidden mr-2 p-1">
              <Menu className="w-5 h-5" />
            </Button>
            <div
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => router.push(user ? '/?page=feed' : '/')}
            >
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <div className="flex items-center space-x-0.5">
                    <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    <Users className="w-2 h-2 sm:w-3 sm:h-3 text-white/80" />
                  </div>
                </div>
              </div>
              <div className="flex items-baseline">
                <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Edubridge</span>
                <span className="text-lg sm:text-2xl font-bold text-orange-500 ml-0.5">people</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Removed Supabase connection status from UI */}
            {/* {isSupabaseConnected ? (
              <div className="hidden md:flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Connected</span>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Not Connected</span>
              </div>
            )} */}

            {user && user.email_confirmed_at && profile ? (
                <>
                  <Button variant="ghost" size="icon" onClick={() => router.push('/?page=messages')} className="relative">
                    <MessageSquare className="w-5 h-5" />
                    {/* Placeholder for message count badge */}
                    {/* <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" /> */}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => router.push('/?page=notifications')} className="relative">
                    <Bell className="w-5 h-5" />
                    {/* Placeholder for notification count badge */}
                    {/* <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" /> */}
                  </Button>
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <button className="hidden md:flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors">
                              <span className="text-sm text-gray-600">Welcome,</span>
                              <div className="flex items-center space-x-1">
                                  <span className="font-medium text-gray-900 truncate max-w-20 sm:max-w-none">{profile.username}</span>
                                  {(profile.role === 'donor' || profile.verification_status === 'verified') && (
                                  <VerifiedBadge size={18} />
                                  )}
                              </div>
                              <ChevronDown className="w-4 h-4 text-gray-500"/>
                          </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push('/?page=profile')}>
                              View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                              Sign Out
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
                </>
            ) : (
              isSupabaseConnected && (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button onClick={() => onAuthClick('signup')} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg text-xs sm:text-sm">
                    Join Community
                  </button>
                  <button onClick={() => onAuthClick('signin')} className="text-blue-600 hover:text-blue-700 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium text-xs sm:text-sm flex items-center">
                    <LogIn className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Sign In</span>
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

