'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { signUp, signIn, resendVerificationEmail, signInWithGoogle } from '@/lib/auth';
import { toast } from 'sonner';
import { GraduationCap, Heart, Mail, Chrome, Loader2 } from 'lucide-react';

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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      // The redirect will handle the success state, so we might not call onSuccess here.
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google.');
      setLoading(false);
    }
  };

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
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-6 h-6 text-blue-600" />
              Verify Your Email
            </DialogTitle>
            <DialogDescription>
              We've sent a link to <strong className="break-all">{userEmail}</strong>. Please click it to activate your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-4">
             <p className="text-xs text-center text-gray-600">
                Didn't receive it? Check your spam folder or resend.
            </p>
            <Button onClick={handleResendVerification} disabled={loading} variant="outline" className="w-full">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null}
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
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh]">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">{isSignUp ? 'Join Edubridgepeople' : 'Welcome Back'}</DialogTitle>
          <DialogDescription>
            {isSignUp ? 'Create your account to start sharing and learning.' : 'Sign in to access your account.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1">
            <div className="p-6 space-y-6">
                <Button variant="outline" className="w-full text-lg py-6" onClick={handleGoogleSignIn} disabled={loading}>
                  <Chrome className="w-5 h-5 mr-3" />
                  {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} placeholder="you@example.com" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} minLength={6} placeholder="••••••••" />
                    {isSignUp && <p className="text-xs text-gray-500">Must be at least 6 characters.</p>}
                  </div>
                  {isSignUp && (
                    <div className="space-y-3">
                      <Label>Choose your role:</Label>
                      <RadioGroup value={role} onValueChange={(value) => setRole(value as 'student' | 'donor')} disabled={loading} className="grid grid-cols-2 gap-4">
                        <Label className={`flex flex-col items-center justify-center text-center space-y-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${role === 'student' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-blue-50'}`}>
                          <RadioGroupItem value="student" id="student" className="sr-only" />
                          <GraduationCap className="w-8 h-8 text-blue-600 mb-2"/>
                          <span className="font-medium">Student</span>
                          <p className="text-xs text-gray-600">Seeking resources & mentorship.</p>
                        </Label>
                        <Label className={`flex flex-col items-center justify-center text-center space-y-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${role === 'donor' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-green-50'}`}>
                          <RadioGroupItem value="donor" id="donor" className="sr-only" />
                          <Heart className="w-8 h-8 text-green-600 mb-2" />
                          <span className="font-medium">Donor / Mentor</span>
                          <p className="text-xs text-gray-600">Sharing knowledge & resources.</p>
                        </Label>
                      </RadioGroup>
                    </div>
                  )}
                  <Button type="submit" className="w-full text-lg py-6" disabled={loading}>
                     {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin"/> : null}
                    {loading ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? 'Create Account' : 'Sign In')}
                  </Button>
                  <div className="text-center pt-4">
                    <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-blue-600 hover:underline" disabled={loading}>
                      {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                    </button>
                  </div>
                </form>
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
