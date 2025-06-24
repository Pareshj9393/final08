import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Zap, Info, Database, Layers, TrendingUp, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function RightSidebar() {
  const sidebarRef = useRef(null);
  const triggerRef = useRef(null);
  const [isSticky, setSticky] = useState(false);

  const communityStats = {
    students: '250+',
    resources: '1,200+',
    donors: '150+',
    stories: '50+',
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setSticky(!entry.isIntersecting);
      },
      { rootMargin: '-20px 0px 0px 0px' }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-full flex flex-col p-4">
      <div className="h-full overflow-y-auto space-y-4 pr-2">

        {/* Removed the individual search bar here, assuming it will be handled centrally */}
        {/* <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input placeholder="Search..." className="pl-9" />
        </div> */}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
              About Edubridge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              A trusted community platform connecting donors and verified students to share educational resources and knowledge.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="secondary" className="text-xs">#EducationForAll</Badge>
                <Badge variant="secondary" className="text-xs">#StudentSupport</Badge>
                <Badge variant="secondary" className="text-xs">#KnowledgeSharing</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Trigger element for sticky activation */}
        <div ref={triggerRef}></div>

        {/* Sidebar content that becomes sticky */}
        <div
          ref={sidebarRef}
          className={`space-y-4 transition-all ${
            isSticky ? 'fixed top-4 xl:w-[calc((100vw-896px)/2-2rem)]' : 'relative' // Adjusted width for sticky
          }`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Layers className="w-5 h-5 mr-2 text-indigo-500" />
                Community Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Students</span>
                  <Badge className="bg-blue-100 text-blue-800">{communityStats.students}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Resources Shared</span>
                  <Badge className="bg-green-100 text-green-800">{communityStats.resources}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Verified Donors</span>
                  <Badge className="bg-purple-100 text-purple-800">{communityStats.donors}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Success Stories</span>
                  <Badge className="bg-orange-100 text-orange-800">{communityStats.stories}</Badge>
                </div>
              </div>
              <Alert className="mt-4 border-yellow-200 bg-yellow-50 text-yellow-800">
                <Info className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-xs">
                  <strong>Note:</strong> These numbers are simulated for demonstration purposes.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-teal-500" />
                Key Technologies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">Bolt.new</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                    <Database className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">Supabase</span>
                </div>
                 <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" /> {/* Placeholder icon */}
                  </div>
                  <span className="text-sm font-medium">Next.js</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic content placeholder for 'More content here...' */}
        <Card className="h-auto min-h-[150px] bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg flex items-center justify-center text-gray-600 text-center p-4">
          <p className="font-semibold text-lg">💡 Discover more opportunities or find a mentor!</p>
        </Card>

      </div>
    </div>
  );
}

