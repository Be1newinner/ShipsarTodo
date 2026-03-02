'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [timezone, setTimezone] = useState('UTC');
  const [isLoading, setIsLoading] = useState(false);

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Singapore',
    'Australia/Sydney',
  ];

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      // Update user timezone - would call an API endpoint
      await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timezone }),
      });
      toast.success('Onboarding complete!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-background p-4">
      <Card className="w-full max-w-md border border-border/50 shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold">Welcome, {user?.name}!</CardTitle>
          <CardDescription>Let's set up your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Select your timezone</h3>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-card-foreground/5 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm">What's next?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Create and manage your first todo</li>
              <li>• Use AI to generate subtasks</li>
              <li>• Schedule tasks on your calendar</li>
              <li>• Collaborate with your team</li>
            </ul>
          </div>

          <Button onClick={handleContinue} className="w-full" disabled={isLoading}>
            {isLoading ? 'Setting up...' : 'Get Started'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
