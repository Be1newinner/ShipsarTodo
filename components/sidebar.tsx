"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Calendar,
  Settings,
  LogOut,
  Plus,
  Brain,
  Users,
  Inbox,
  ChevronsUpDown,
  Check,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [projects, setProjects] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && user.projects && user.projects.length > 0) {
      fetch("/api/projects")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setProjects(data);
        })
        .catch(console.error);
    }

    if (user) {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setUnreadCount(data.filter((n: any) => !n.read).length);
          }
        })
        .catch(console.error);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const switchProject = async (projectId: string) => {
    try {
      const res = await fetch("/api/projects/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (res.ok) {
        toast.success("Project switched");
        window.location.reload(); // Reload to refresh contexts across the app
      } else {
        toast.error("Failed to switch project");
      }
    } catch (e) {
      toast.error("Failed to switch project");
    }
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/assistant", label: "AI Assistant", icon: Brain },
    { href: "/team", label: "Team", icon: Users },
    { href: "/assignments", label: "Assignments", icon: Inbox },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-border bg-sidebar text-sidebar-foreground flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between px-2 text-left h-auto py-2"
            >
              <div className="flex flex-col items-start truncate overflow-hidden">
                <span className="text-sm font-bold text-sidebar-foreground truncate max-w-[160px]">
                  {projects.find((p) => p._id === user?.activeProjectId)
                    ?.name || "Select Project"}
                </span>
                <span className="text-xs text-muted-foreground">Workspace</span>
              </div>
              <ChevronsUpDown className="w-4 h-4 text-muted-foreground ml-2 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            {projects.map((project) => (
              <DropdownMenuItem
                key={project._id}
                onClick={() => switchProject(project._id)}
                className="justify-between cursor-pointer"
              >
                <span className="truncate">{project.name}</span>
                {project._id === user?.activeProjectId && (
                  <Check className="w-4 h-4 ml-2" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem asChild className="cursor-pointer border-t mt-1">
              <Link
                href="/onboarding"
                className="w-full text-primary flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create or Join Project
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.href === "/notifications" && unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* New Todo Button */}
      <div className="p-6 border-t border-sidebar-border">
        <Button className="w-full gap-2 mb-4" asChild>
          <Link href="/dashboard?new=true">
            <Plus className="w-4 h-4" />
            New Task
          </Link>
        </Button>

        {/* User Info */}
        <div className="mb-4 p-3 bg-sidebar-accent rounded-lg">
          <p className="text-sm font-medium text-sidebar-accent-foreground">
            {user?.name}
          </p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
