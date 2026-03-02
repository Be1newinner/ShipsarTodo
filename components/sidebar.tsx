'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Calendar, 
  Settings, 
  LogOut, 
  Plus,
  Brain,
  Users,
  Inbox
} from 'lucide-react';
import { toast } from 'sonner';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/assistant', label: 'AI Assistant', icon: Brain },
    { href: '/team', label: 'Team', icon: Users },
    { href: '/assignments', label: 'Assignments', icon: Inbox },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-border bg-sidebar text-sidebar-foreground flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">Todo Scheduler</h1>
        <p className="text-sm text-muted-foreground mt-1">AI-Powered Tasks</p>
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
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
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
          <p className="text-sm font-medium text-sidebar-accent-foreground">{user?.name}</p>
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
