'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Profile, supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle, Clock, AlertCircle, User as UserIcon, Mail, Calendar, Heart, Upload } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProfilePageProps {
  user: User | null;
  profile: Profile | null;
  onVerificationUpdate: (userId: string) => void;
}

export default function ProfilePage({ user, profile, onVerificationUpdate }: ProfilePageProps) {
  const router = useRouter();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return;

    setUploading(true);
    try {
      const filePath = `${user.id}/${Date.now()}_${avatarFile.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, avatarFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      toast.success('Profile picture updated successfully!');
      onVerificationUpdate(user.id); // Refresh profile data
      setAvatarFile(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload profile picture.');
    } finally {
      setUploading(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">Please sign in to view your profile.</p>
            <Button className="mt-4" onClick={() => router.push('/?page=feed')}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getVerificationBadge = () => {
    if (profile.role === 'donor') {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified Donor
        </Badge>
      );
    }
    switch (profile.verification_status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified Student
          </Badge>
        );
      case 'pending':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 cursor-help">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending Verification
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Your document is under review (24-48 hours).</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            Unverified
          </Badge>
        );
    }
  };

  const getRoleBadge = () => {
    if (profile.role === 'donor') {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <Heart className="w-3 h-3 mr-1" />
          Donor/Mentor
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary">
          <UserIcon className="w-3 h-3 mr-1" />
          Student
        </Badge>
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserIcon className="w-6 h-6 mr-2 text-blue-600" />
            My Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20 text-3xl">
              <AvatarImage src={profile.avatar_url} alt={profile.username} />
              <AvatarFallback className={`text-white ${profile.role === 'donor' ? 'bg-green-600' : 'bg-blue-600'}`}>
                {profile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{profile.username}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {getRoleBadge()}
                {getVerificationBadge()}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="avatar-upload">Update Profile Picture</Label>
            <div className="flex items-center space-x-2">
               <Input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="flex-grow" />
               <Button onClick={handleAvatarUpload} disabled={!avatarFile || uploading}>
                 <Upload className="w-4 h-4 mr-2" />
                 {uploading ? 'Uploading...' : 'Upload'}
               </Button>
            </div>
            {avatarFile && <p className="text-sm text-gray-500">Selected: {avatarFile.name}</p>}
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{profile.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">
                Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>

          {profile.role === 'student' && profile.verification_status === 'unverified' && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Get Verified</h3>
              <p className="text-blue-800 text-sm mb-3">
                Verify your student status to unlock all features including claiming resources.
              </p>
              <Button 
                size="sm" 
                onClick={() => router.push('/?page=verification')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Start Verification
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
