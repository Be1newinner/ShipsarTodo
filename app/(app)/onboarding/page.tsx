"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showSuccess, showError } from "@/lib/toast-utils";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Plus, LogIn } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  if (user && user.projects && user.projects.length > 0) {
    // If the user lands here but already has projects, redirect to home
    router.push("/");
    return null;
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      showError("Please enter a project name");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create project");
      }

      showSuccess("Project created successfully!");
      router.push("/");
      router.refresh(); // Refresh to trigger layout auth check again
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      showError("Please enter an invite code");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/projects/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to join project");
      }

      showSuccess("Joined project successfully!");
      router.push("/");
      router.refresh();
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Welcome!</h1>
          <p className="text-muted-foreground">
            You don{"'"}t have any active projects.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Please create or join one to continue.
          </p>
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Project</TabsTrigger>
            <TabsTrigger value="join">Join Project</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card>
              <form onSubmit={handleCreateProject}>
                <CardHeader>
                  <CardTitle>Create New Project</CardTitle>
                  <CardDescription>
                    Start a fresh workspace for you and your team.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="projectName"
                      className="text-sm font-medium"
                    >
                      Project Name
                    </label>
                    <Input
                      id="projectName"
                      placeholder="e.g. Marketing Campaign Q3"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full gap-2"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Create Project
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="join">
            <Card>
              <form onSubmit={handleJoinProject}>
                <CardHeader>
                  <CardTitle>Join Project</CardTitle>
                  <CardDescription>
                    Enter the invite code from your team admin.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="inviteCode" className="text-sm font-medium">
                      Invite Code
                    </label>
                    <Input
                      id="inviteCode"
                      placeholder="e.g. A1B2C3"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      disabled={isLoading}
                      className="uppercase"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full gap-2"
                    variant="secondary"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4" />
                    )}
                    Join Project
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
