// components/pages/VerificationPage.tsx
'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Profile, supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Upload, CheckCircle, Clock } from 'lucide-react';

interface VerificationPageProps {
  user: User | null;
  profile: Profile | null;
  onVerificationUpdate: (userId: string) => void;
}

export default function VerificationPage({ user, profile, onVerificationUpdate }: VerificationPageProps) {
  const router = useRouter();
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!user || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
            <CardHeader>
                <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
                <p>You must be logged in to view this page.</p>
                <Button onClick={() => router.push('/')} className="mt-4">Go to Home</Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setVerificationFile(e.target.files[0]);
    }
  };

  const handleSubmitVerification = async () => {
    if (!verificationFile) {
      toast.error('Please select a file to upload.');
      return;
    }
    if (!user) return;

    setUploading(true);
    try {
      const filePath = `${user.id}/${Date.now()}_${verificationFile.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('verification-uploads')
        .upload(filePath, verificationFile);

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ verification_status: 'pending' })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      toast.success('Verification document uploaded! Your request is now pending review.');
      onVerificationUpdate(user.id);
      setVerificationFile(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload verification document.');
    } finally {
      setUploading(false);
    }
  };

  const renderStatus = () => {
    switch (profile.verification_status) {
      case 'verified':
        return (
          <div className="text-center space-y-4 p-8 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            <h3 className="text-2xl font-bold text-green-800">You are Verified!</h3>
            <p className="text-green-700">You have full access to all platform features.</p>
            <Button onClick={() => router.push('/?page=feed')}>Back to Feed</Button>
          </div>
        );
      case 'pending':
        return (
          <div className="text-center space-y-4 p-8 bg-yellow-50 rounded-lg border border-yellow-200">
            <Clock className="w-16 h-16 mx-auto text-yellow-500" />
            <h3 className="text-2xl font-bold text-yellow-800">Verification Pending</h3>
            <p className="text-yellow-700">Your document has been submitted and is currently under review. This usually takes 24-48 hours.</p>
          </div>
        );
      default: // 'unverified'
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Verify Your Student Status</h2>
              <p className="text-muted-foreground">Please upload a valid student ID to get access to all features, including claiming resources.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="verification-file">Upload Student ID</Label>
              <Input id="verification-file" type="file" accept="image/*" onChange={handleFileChange} />
              {verificationFile && <p className="text-sm text-muted-foreground">Selected: {verificationFile.name}</p>}
            </div>
            <Button onClick={handleSubmitVerification} disabled={!verificationFile || uploading} className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Submit for Verification'}
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Student Verification</CardTitle>
          <CardDescription>
            Secure your student status to unlock the full potential of Edubridgepeople.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStatus()}
        </CardContent>
      </Card>
    </div>
  );
}
