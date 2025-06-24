'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Zap, Globe, Database, Code, Heart, Award, ExternalLink, Sparkles } from 'lucide-react';

interface HackathonPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HackathonPopup({ isOpen, onClose }: HackathonPopupProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none">
        <div className="relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 z-50 bg-white/90 hover:bg-white rounded-full w-8 h-8 p-0 shadow-lg"
          >
            <X className="w-4 h-4" />
          </Button>

          {currentStep === 1 ? (
            // Step 1: Project Overview
            <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 shadow-2xl">
              <CardContent className="p-6 sm:p-8">
                <div className="text-center space-y-6">
                  {/* Logo and Title */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <div className="flex items-center space-x-1">
                            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            <Code className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
                          </div>
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="text-left">
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          Edubridgepeople
                        </h1>
                        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 text-xs">
                          <Award className="w-3 h-3 mr-1" />
                          Hackathon Project
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-blue-200">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                        🎓 Community-Driven Social Learning Platform
                      </h2>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        Connecting verified students with generous donors and mentors to share educational resources, 
                        wisdom, and opportunities in a trusted community environment.
                      </p>
                    </div>
                  </div>

                  {/* Key Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-blue-100">
                      <div className="flex items-center space-x-2 mb-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="font-medium text-sm sm:text-base">Resource Sharing</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">Donors share books, courses, and opportunities</p>
                    </div>
                    
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-blue-100">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-sm sm:text-base">Verified Community</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">Student verification ensures trust and safety</p>
                    </div>
                    
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-blue-100">
                      <div className="flex items-center space-x-2 mb-2">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-sm sm:text-base">Wisdom Sharing</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">Community members share knowledge and experiences</p>
                    </div>
                    
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-blue-100">
                      <div className="flex items-center space-x-2 mb-2">
                        <Globe className="w-4 h-4 text-purple-500" />
                        <span className="font-medium text-sm sm:text-base">Global Access</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">Accessible worldwide for educational equality</p>
                    </div>
                  </div>

                  {/* Built with Bolt.new Badge */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-lg shadow-lg">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Zap className="w-5 h-5" />
                      <span className="font-bold text-sm sm:text-base">Built with Bolt.new</span>
                    </div>
                    <p className="text-xs sm:text-sm text-blue-100">
                      AI-powered development platform enabling rapid prototyping and deployment
                    </p>
                  </div>

                  {/* Navigation */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button 
                      onClick={handleNext}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 sm:py-3"
                    >
                      View Credits & Partners
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={onClose}
                      className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50 py-2 sm:py-3"
                    >
                      Start Exploring
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Step 2: Credits and Acknowledgments
            <Card className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 border-2 border-green-200 shadow-2xl">
              <CardContent className="p-6 sm:p-8">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center space-y-3">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      🙏 Special Thanks & Credits
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">
                      This hackathon project was made possible by amazing partners and open-source tools
                    </p>
                  </div>

                  {/* Partners Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Bolt.new */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200 hover:shadow-lg transition-shadow">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Bolt.new</h3>
                          <Badge className="bg-blue-100 text-blue-800 text-xs">Primary Platform</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        AI-powered development platform that enabled rapid prototyping and full-stack development
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open('https://bolt.new', '_blank')}
                        className="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Visit Bolt.new
                      </Button>
                    </div>

                    {/* INOS Domain */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-green-200 hover:shadow-lg transition-shadow">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                          <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">INOS</h3>
                          <Badge className="bg-green-100 text-green-800 text-xs">Free Domain</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        Providing free domain hosting services for hackathon participants and open-source projects
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full text-green-600 border-green-300 hover:bg-green-50"
                        disabled
                      >
                        <Heart className="w-3 h-3 mr-1" />
                        Thank You INOS!
                      </Button>
                    </div>

                    {/* Supabase */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-purple-200 hover:shadow-lg transition-shadow">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                          <Database className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Supabase</h3>
                          <Badge className="bg-purple-100 text-purple-800 text-xs">Database & Auth</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        Open-source Firebase alternative providing database, authentication, and real-time features
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open('https://supabase.com', '_blank')}
                        className="w-full text-purple-600 border-purple-300 hover:bg-purple-50"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Visit Supabase
                      </Button>
                    </div>

                    {/* Netlify */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-teal-200 hover:shadow-lg transition-shadow">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                          <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Netlify</h3>
                          <Badge className="bg-teal-100 text-teal-800 text-xs">Deployment</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        Modern web deployment platform with continuous integration and global CDN
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open('https://netlify.com', '_blank')}
                        className="w-full text-teal-600 border-teal-300 hover:bg-teal-50"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Visit Netlify
                      </Button>
                    </div>
                  </div>

                  {/* Open Source Technologies */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Code className="w-4 h-4 mr-2" />
                      Open Source Technologies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Shadcn/ui', 'Lucide Icons'].map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Confirmation */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-lg text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Award className="w-5 h-5" />
                      <span className="font-bold">Hackathon Project Confirmation</span>
                    </div>
                    <p className="text-sm text-blue-100 mb-3">
                      This project was built using Bolt.new for a hackathon competition, showcasing the power of AI-assisted development.
                    </p>
                    <Badge className="bg-white/20 text-white border-white/30">
                      ✅ Built with Bolt.new - Confirmed
                    </Badge>
                  </div>

                  {/* Navigation */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={handlePrevious}
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      ← Back to Overview
                    </Button>
                    <Button 
                      onClick={onClose}
                      className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium"
                    >
                      Start Using Platform
                      <Sparkles className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}