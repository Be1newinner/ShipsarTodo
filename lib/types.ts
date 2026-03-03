export interface User {
  _id: string;
  email: string;
  name: string;
  profileSetup: boolean;
  timezone: string;
  workHoursStart: number;
  workHoursEnd: number;
  activeProjectId?: string;
  projects?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  _id: string;
  name: string;
  adminId: string;
  members: ProjectMember[];
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  userId: string;
  email: string;
  name: string;
  role: "admin" | "member";
  joinedAt: Date;
}

export interface Todo {
  _id: string;
  userId: string;
  projectId: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed";
  dueDate?: Date;
  scheduledDate?: Date;
  completionProbability?: number;
  estimatedMinutes?: number;
  subtasks?: Subtask[];
  tags?: string[];
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface CompletionFeedback {
  _id: string;
  userId: string;
  todoId: string;
  timeSpent: number;
  difficulty: "easy" | "medium" | "hard";
  completed: boolean;
  notes?: string;
  createdAt: Date;
}

export interface Assignment {
  _id: string;
  todoId: string;
  assignedBy: string;
  assignedTo: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  delegationMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  _id: string;
  email: string;
  name: string;
  role: "owner" | "member";
  joinedAt: Date;
}

export interface Notification {
  _id: string;
  userId: string;
  type:
    | "assignment"
    | "completion"
    | "deadline"
    | "comment"
    | "team_invite"
    | "invite_accepted"
    | "invite_rejected";
  title: string;
  message: string;
  read: boolean;
  relatedId?: string;
  fromUserId?: string;
  projectId?: string;
  createdAt: Date;
}

export interface Activity {
  _id: string;
  userId: string;
  action: string;
  details?: any;
  createdAt: Date;
}
