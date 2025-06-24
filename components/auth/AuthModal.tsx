'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { signUp, signIn, resendVerificationEmail } from '@/lib/auth';
import { toast } from 'sonner';
import { GraduationCap, Heart, CheckCircle, Mail } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: 'signup' | 'signin';
}

export function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'signup' }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'donor'>('student');
  const [loading, setLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Update mode when initialMode changes
  useEffect(() => {
    setIsSignUp(initialMode === 'signup');
  }, [initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (isSignUp && password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const data = await signUp(email, password, role);
        
        if (data.user && !data.user.email_confirmed_at) {
          setUserEmail(email);
          setShowEmailVerification(true);
          toast.success("Check your email for a verification link!");
        } else {
          toast.success("Registration successful!");
          onSuccess();
        }
        
      } else {
        await signIn(email, password);
        toast.success('Welcome back!');
        onSuccess();
      }
      
    } catch (error: any) {
      let errorMessage = error.message || 'Authentication failed';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email before signing in.';
        setUserEmail(email);
        setShowEmailVerification(true);
      } else if (error.message.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Try signing in.';
        setIsSignUp(false);
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      await resendVerificationEmail();
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      toast.error('Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setRole('student');
    setIsSignUp(initialMode === 'signup');
    setLoading(false);
    setShowEmailVerification(false);
    setUserEmail('');
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (showEmailVerification) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="w-[95vw] max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Verify Your Email</DialogTitle>
            <DialogDescription>
              We've sent a link to <strong className="break-all">{userEmail}</strong>. Please click it to activate your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
             <p className="text-xs text-center text-gray-600">
                Didn't receive it? Check your spam folder or resend.
            </p>
            <Button onClick={handleResendVerification} disabled={loading} variant="outline" className="w-full">
              {loading ? 'Sending...' : 'Resend Verification Email'}
            </Button>
            <Button onClick={() => { setShowEmailVerification(false); setIsSignUp(false); }} variant="ghost" className="w-full">
              Already verified? Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-sm mx-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isSignUp ? 'Join Edubridgepeople' : 'Welcome Back'}</DialogTitle>
          <DialogDescription>
            {isSignUp ? 'Create your account to start sharing and learning.' : 'Sign in to your account.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} minLength={6} />
              {isSignUp && <p className="text-xs text-gray-500">Must be at least 6 characters.</p>}
            </div>
            {isSignUp && (
              <div className="space-y-3">
                <Label>Choose your role:</Label>
                <RadioGroup value={role} onValueChange={(value) => setRole(value as 'student' | 'donor')} disabled={loading} className="space-y-2">
                  <Label className={`flex items-start space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${role === 'student' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-blue-50'}`}>
                    <RadioGroupItem value="student" id="student" />
                    <div className="flex-1">
                      <span className="font-medium flex items-center"><GraduationCap className="w-4 h-4 mr-2" />Student</span>
                      <p className="text-xs text-gray-600 mt-1">Seeking resources and mentorship.</p>
                    </div>
                  </Label>
                  <Label className={`flex items-start space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${role === 'donor' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-green-50'}`}>
                    <RadioGroupItem value="donor" id="donor" />
                    <div className="flex-1">
                      <span className="font-medium flex items-center"><Heart className="w-4 h-4 mr-2" />Donor / Mentor</span>
                      <p className="text-xs text-gray-600 mt-1">Sharing knowledge and resources.</p>
                    </div>
                  </Label>
                </RadioGroup>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
            <div className="text-center pt-3 border-t">
              <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-blue-600 hover:underline" disabled={loading}>
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
