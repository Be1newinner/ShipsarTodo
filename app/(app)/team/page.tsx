'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { showSuccess, showError } from '@/lib/toast-utils';
import { apiGet, apiPost } from '@/lib/api';
import { Users, Plus, Loader, Mail } from 'lucide-react';

interface TeamMember {
  _id: string;
  email: string;
  name: string;
  role: string;
  joinedAt: string;
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    setIsLoading(true);
    try {
      const team = await apiGet<any>('/team');
      setTeamMembers(team.members || []);
    } catch (error) {
      showError('Failed to load team', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      showError('Please enter an email address');
      return;
    }

    setIsAdding(true);
    try {
      await apiPost('/team', {
        memberEmail: newMemberEmail,
      });
      setNewMemberEmail('');
      await loadTeamData();
      showSuccess('Team member added successfully');
    } catch (error) {
      showError('Failed to add team member', error);
    } finally {
      setIsAdding(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Team Management</h1>
        <p className="text-muted-foreground">
          Manage your team members and delegate tasks
        </p>
      </div>

      {/* Add Team Member */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Team Member
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="Enter email address..."
              disabled={isAdding}
            />
            <Button
              onClick={handleAddMember}
              disabled={isAdding}
              className="gap-2"
            >
              {isAdding && <Loader className="w-4 h-4 animate-spin" />}
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Members ({teamMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No team members yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </div>
                    </div>
                  </div>
                  <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
