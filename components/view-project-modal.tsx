"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Users, LayoutDashboard, Copy } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { apiGet, apiDelete } from "@/lib/api";

interface ProjectDetails {
  _id: string;
  name: string;
  adminId: string;
  inviteCode: string;
  createdAt: string;
  todoCount: number;
  members: Array<{
    userId: string;
    email: string;
    name: string;
    role: string;
    joinedAt: string;
  }>;
}

export function ViewProjectModal({
  isOpen,
  onClose,
  projectId,
}: {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | undefined;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchProjectDetails();
    }
  }, [isOpen, projectId]);

  const fetchProjectDetails = async () => {
    setIsLoading(true);
    try {
      const data = await apiGet<ProjectDetails>(`/projects/${projectId}`);
      setProject(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load project details");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteCode = () => {
    if (project?.inviteCode) {
      navigator.clipboard.writeText(project.inviteCode);
      toast.success("Invite code copied to clipboard!");
    }
  };

  const handleDeleteProject = async () => {
    if (!projectId) return;

    setIsDeleting(true);
    try {
      await apiDelete(`/projects/${projectId}`);
      toast.success("Project deleted successfully");
      onClose();
      // Reload or navigate to refresh the state across the application
      window.location.href = "/dashboard";
    } catch (error: any) {
      toast.error(error.message || "Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwner = user?.userId === project?.adminId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Project Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : project ? (
          <div className="space-y-6 pt-4">
            <div>
              <h3 className="text-2xl font-bold">{project.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                Invite Code:{" "}
                <span className="font-mono font-medium">
                  {project.inviteCode}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={copyInviteCode}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                <Users className="w-6 h-6 text-primary mb-2" />
                <span className="text-2xl font-bold">
                  {project.members.length}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Members
                </span>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                <LayoutDashboard className="w-6 h-6 text-primary mb-2" />
                <span className="text-2xl font-bold">{project.todoCount}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Todos
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3 border-b pb-2">
                Team Members
              </h4>
              <div className="space-y-3 max-h-[150px] overflow-y-auto pr-2">
                {project.members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex justify-between items-center bg-card p-2 rounded-md border text-sm"
                  >
                    <div className="truncate pr-2">
                      <p className="font-medium truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.email}
                      </p>
                    </div>
                    {member.role === "admin" && (
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded uppercase font-bold tracking-wider shrink-0">
                        Owner
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isOwner && (
              <div className="pt-4 border-t mt-4 flex justify-end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Project
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the
                        <strong> {project.name}</strong> project, including all
                        its todos and data. It will also remove all members from
                        the workspace.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteProject}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? "Deleting..." : "Yes, delete project"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground">
            Project not found.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
