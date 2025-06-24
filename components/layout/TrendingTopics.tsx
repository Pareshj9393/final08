import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame } from 'lucide-react';

export default function TrendingTopics() {
  // NOTE: In a real application, these topics would be fetched dynamically.
  const topics = [
    { name: '#ExamTips', posts: '1.2k' },
    { name: '#Scholarships2025', posts: '890' },
    { name: '#CollegeLife', posts: '2.5k' },
    { name: '#MentalHealth', posts: '500' },
    { name: '#CodingHelp', posts: '3.1k' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Flame className="w-5 h-5 mr-2 text-orange-500" />
          Trending Topics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topics.map((topic) => (
            <div key={topic.name} className="flex justify-between items-center group cursor-pointer">
              <div>
                <p className="font-semibold text-sm text-gray-800 group-hover:text-blue-600">{topic.name}</p>
                <p className="text-xs text-gray-500">{topic.posts} posts</p>
              </div>
              <Badge variant="secondary">{topic.posts}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
