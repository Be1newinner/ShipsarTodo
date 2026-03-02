'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="flex-1 space-y-8 p-8 max-w-2xl">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Name</label>
            <p className="text-lg font-semibold mt-1">{user?.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="text-lg font-semibold mt-1">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Timezone</label>
            <p className="text-lg font-semibold mt-1">{user?.timezone || 'UTC'}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>More settings coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Additional preference options will be available in Phase 5</p>
        </CardContent>
      </Card>
    </div>
  );
}
