'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthModal } from '@/components/auth/AuthModal';
import HackathonPopup from '@/components/ui/HackathonPopup';
import Image from 'next/image'; // Import the Next.js Image component

// Import Lucide icons directly as React components
import {
  GraduationCap,
  Users,
  UserPlus,
  Gift,
  MessageSquare,
  CheckCircle,
  Heart,
  Lightbulb,
  Laptop,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [showHackathonPopup, setShowHackathonPopup] = useState(false);

  // Show hackathon popup on component mount
  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('hasSeenHackathonPopup');
    if (!hasSeenPopup) {
      setTimeout(() => {
        setShowHackathonPopup(true);
        sessionStorage.setItem('hasSeenHackathonPopup', 'true');
      }, 1500);
    }
  }, []);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    router.push('/?page=feed');
  };

  const openAuthModal = (mode: 'signup' | 'signin') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="overflow-x-hidden">
      {/* Navbar */}
      <nav className="bg-white shadow-md py-3 px-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                    <GraduationCap className="w-4 h-4 text-white" />
                    <Users className="w-3 h-3 text-white/80" />
                </div>
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Edubridge</span>
                <span className="text-xl sm:text-2xl font-bold text-orange-500 ml-0.5">people</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={() => openAuthModal('signin')}
                  className="px-4 py-2 rounded-full text-blue-600 border-2 border-blue-600 bg-white hover:bg-blue-50 transition-all duration-300 font-semibold text-sm shadow-md"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold text-sm"
                >
                  Join Free
                </button>
            </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-blue-50 to-indigo-100 min-h-[calc(100vh-64px)] flex items-center justify-center text-center py-16 sm:py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-10">
              <svg className="w-full h-full" fill="none" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
                  <defs><pattern id="pattern-circles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse"><circle cx="20" cy="20" r="2" className="fill-blue-300 opacity-50"></circle></pattern></defs>
                  <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)"></rect>
              </svg>
          </div>
          <div className="relative z-10 max-w-4xl mx-auto space-y-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-gray-900 drop-shadow-lg">
                  Bridge the Gap. Empower Futures.
                  <span className="block bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mt-3">Education for Everyone.</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                  Edubridgepeople is a trusted community platform connecting students seeking knowledge
                  and resources with generous donors and mentors worldwide.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-full shadow-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 flex items-center justify-center text-lg sm:text-xl"
                  >
                      <Users className="w-6 h-6 mr-2" />
                      Join the Community
                  </button>
                  <button
                    onClick={() => router.push('/?page=feed')}
                    className="w-full sm:w-auto px-8 py-3 border-2 border-blue-600 text-blue-800 font-bold rounded-full bg-white shadow-lg hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 flex items-center justify-center text-lg sm:text-xl"
                  >
                      <BookOpen className="w-6 h-6 mr-2" />
                      Explore Resources
                  </button>
              </div>
          </div>
      </header>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 bg-white px-4">
          <div className="max-w-6xl mx-auto text-center space-y-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">How Edubridgepeople Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-8 rounded-xl shadow-lg bg-blue-50/70 border border-blue-200 backdrop-blur-sm space-y-4 transform transition-transform hover:scale-105 duration-300">
                      <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
                          <UserPlus className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">1. Join & Get Verified</h3>
                      <p className="text-gray-700">Sign up as a student or donor. Students verify their status for full access and trust.</p>
                  </div>
                  <div className="p-8 rounded-xl shadow-lg bg-green-50/70 border border-green-200 backdrop-blur-sm space-y-4 transform transition-transform hover:scale-105 duration-300">
                      <div className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto shadow-md">
                          <Gift className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">2. Share or Request</h3>
                      <p className="text-gray-700">Donors post resources (books, courses, mentorship), students browse and claim.</p>
                  </div>
                  <div className="p-8 rounded-xl shadow-lg bg-purple-50/70 border border-purple-200 backdrop-blur-sm space-y-4 transform transition-transform hover:scale-105 duration-300">
                      <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center mx-auto shadow-md">
                          <MessageSquare className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">3. Connect & Learn</h3>
                      <p className="text-gray-700">Directly connect with matches, share wisdom posts, and grow together.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-tl from-gray-100 to-white px-4">
          <div className="max-w-7xl mx-auto text-center space-y-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Why Edubridgepeople?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex flex-col items-center p-6 rounded-xl bg-white shadow-md border border-gray-200 space-y-3 transform transition-transform hover:translate-y-[-5px] duration-300">
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900">Verified Trust</h3>
                      <p className="text-sm text-gray-600">Our verification process builds a safe and reliable community.</p>
                  </div>
                  <div className="flex flex-col items-center p-6 rounded-xl bg-white shadow-md border border-gray-200 space-y-3 transform transition-transform hover:translate-y-[-5px] duration-300">
                      <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center">
                          <Heart className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900">Generous Giving</h3>
                      <p className="text-sm text-gray-600">Connect with individuals eager to donate valuable resources.</p>
                  </div>
                  <div className="flex flex-col items-center p-6 rounded-xl bg-white shadow-md border border-gray-200 space-y-3 transform transition-transform hover:translate-y-[-5px] duration-300">
                      <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                          <Lightbulb className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900">Shared Wisdom</h3>
                      <p className="text-sm text-gray-600">Gain insights and share experiences through community posts.</p>
                  </div>
                  <div className="flex flex-col items-center p-6 rounded-xl bg-white shadow-md border border-gray-200 space-y-3 transform transition-transform hover:translate-y-[-5px] duration-300">
                      <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center">
                          <Laptop className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900">Access to Opportunities</h3>
                      <p className="text-sm text-gray-600">Discover scholarships, internships, and educational tools.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-purple-50 to-pink-50 px-4">
          <div className="max-w-6xl mx-auto text-center space-y-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">What Our Community Says</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-xl shadow-lg border border-purple-200 space-y-4">
                      <p className="text-lg italic text-gray-700">
                          "Edubridgepeople helped me get a scholarship I never knew existed! This platform is a game-changer for students like me."
                      </p>
                      <div className="flex items-center justify-center space-x-3">
                          {/* Replaced placehold.co with a generic avatar image from a reliable source */}
                          <Image src="https://api.dicebear.com/7.x/initials/svg?seed=AishaS&backgroundColor=6d28d9&radius=50" alt="Aisha S. Avatar" width={40} height={40} className="rounded-full w-10 h-10 border-2 border-purple-400" unoptimized />
                          <div className="text-left">
                              <p className="font-semibold text-gray-900">Aisha S.</p>
                              <p className="text-sm text-gray-600">Verified Student</p>
                          </div>
                      </div>
                  </div>
                  <div className="bg-white p-8 rounded-xl shadow-lg border border-pink-200 space-y-4">
                      <p className="text-lg italic text-gray-700">
                          "Donating my old textbooks through Edubridgepeople was incredibly easy and fulfilling. Knowing they directly help a student makes all the difference."
                      </p>
                      <div className="flex items-center justify-center space-x-3">
                          {/* Replaced placehold.co with a generic avatar image from a reliable source */}
                          <Image src="https://api.dicebear.com/7.x/initials/svg?seed=DavidB&backgroundColor=ec4899&radius=50" alt="David B. Avatar" width={40} height={40} className="rounded-full w-10 h-10 border-2 border-pink-400" unoptimized />
                          <div className="text-left">
                              <p className="font-semibold text-gray-900">David B.</p>
                              <p className="text-sm text-gray-600">Verified Donor</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight">Ready to Make a Difference?</h2>
              <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto">
                  Join Edubridgepeople today and become part of a movement that empowers education and transforms lives.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="w-full sm:w-auto px-8 py-3 bg-white text-blue-700 font-semibold rounded-full shadow-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                  >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Get Started Now
                  </button>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4">
          <div className="max-w-7xl mx-auto text-center space-y-6">
              <div className="flex items-center justify-center space-x-2">
                  <span className="text-xl font-bold">Edubridge</span>
                  <span className="text-xl font-bold text-orange-500">people</span>
              </div>
              <p className="text-gray-400 text-sm">&copy; 2024 Edubridgepeople. All rights reserved.</p>
              <div className="flex flex-wrap justify-center space-x-4 text-sm">
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200" onClick={() => router.push('/?page=privacy')}>Privacy Policy</a>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200" onClick={() => router.push('/?page=terms')}>Terms of Service</a>
                  <a href="mailto:info@edubridgepeople.com" className="text-gray-300 hover:text-white transition-colors duration-200">Contact Us</a>
              </div>
          </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authMode}
      />

      {/* Hackathon Popup */}
      <HackathonPopup
        isOpen={showHackathonPopup}
        onClose={() => setShowHackathonPopup(false)}
      />
    </div>
  );
}

