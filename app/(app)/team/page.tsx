"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { showSuccess, showError } from "@/lib/toast-utils";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { Users, Plus, Loader, Mail, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface TeamMember {
  _id: string;
  email: string;
  name: string;
  role: string;
  joinedAt: string;
}

export default function TeamPage() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [inviteCode, setInviteCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    setIsLoading(true);
    try {
      const team = await apiGet<any>("/team");
      setTeamMembers(team.members || []);
      setInviteCode(team.inviteCode || "");
    } catch (error) {
      showError("Failed to load team", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      showError("Please enter an email address");
      return;
    }

    setIsAdding(true);
    try {
      await apiPost("/team", {
        memberEmail: newMemberEmail,
      });
      setNewMemberEmail("");
      await loadTeamData();
      showSuccess("Team member added successfully");
    } catch (error) {
      showError("Failed to add team member", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from the team?`))
      return;

    setRemovingEmail(email);
    try {
      await apiDelete(`/team?email=${encodeURIComponent(email)}`);
      await loadTeamData();
      showSuccess("Team member removed successfully");
    } catch (error) {
      showError("Failed to remove team member", error);
    } finally {
      setRemovingEmail(null);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return (
      name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const isOwner = teamMembers.some(
    (m) =>
      m.role === "owner" &&
      user?.email &&
      m.email.toLowerCase() === user.email.toLowerCase(),
  );

  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Team Management</h1>
        <p className="text-muted-foreground">
          {isOwner
            ? "Manage your team members and delegate tasks"
            : "View your team members"}
        </p>
      </div>

      {/* Add Team Member */}
      {isOwner && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Team Member
            </CardTitle>
            {inviteCode && (
              <Badge variant="outline" className="text-sm py-1 font-mono">
                Invite Code: {inviteCode}
              </Badge>
            )}
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
      )}

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
              {teamMembers.map((member, index) => (
                <div
                  key={`${member._id}-${index}`}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {getInitials(member.name || member.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {member.name || "Unnamed User"}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        member.role === "owner" ? "default" : "secondary"
                      }
                    >
                      {member.role.charAt(0).toUpperCase() +
                        member.role.slice(1)}
                    </Badge>
                    {member.role !== "owner" && isOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleRemoveMember(member.email)}
                        disabled={removingEmail === member.email}
                      >
                        {removingEmail === member.email ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-500" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
