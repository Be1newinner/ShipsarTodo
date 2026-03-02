import { z } from 'zod';

// User Schema
export const UserSchema = z.object({
  _id: z.string().optional(),
  email: z.string().email(),
  name: z.string(),
  password: z.string(),
  timezone: z.string().default('UTC'),
  role: z.enum(['user', 'admin']).default('user'),
  onboardingComplete: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type User = z.infer<typeof UserSchema>;

// Todo Schema
export const TodoSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string(), // ISO date string
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['pending', 'in-progress', 'completed']).default('pending'),
  estimatedTime: z.number().optional(), // in minutes
  actualTime: z.number().optional(), // in minutes
  completionProbability: z.number().min(0).max(100).default(50),
  subtasks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    completed: z.boolean().default(false),
    generatedByAI: z.boolean().default(false),
  })).default([]),
  assignedTo: z.string().optional(), // userId of assigned team member
  tags: z.array(z.string()).default([]),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type Todo = z.infer<typeof TodoSchema>;

// Feedback Schema (for completion feedback form)
export const FeedbackSchema = z.object({
  _id: z.string().optional(),
  todoId: z.string(),
  userId: z.string(),
  actualTime: z.number(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  blockers: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
});

export type Feedback = z.infer<typeof FeedbackSchema>;

// Team Member Assignment Schema
export const AssignmentSchema = z.object({
  _id: z.string().optional(),
  todoId: z.string(),
  fromUserId: z.string(),
  toUserId: z.string(),
  status: z.enum(['pending', 'accepted', 'rejected', 'completed']).default('pending'),
  message: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  respondedAt: z.date().optional(),
});

export type Assignment = z.infer<typeof AssignmentSchema>;

// Notification Schema
export const NotificationSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  type: z.enum(['assignment', 'deadline', 'system']),
  message: z.string(),
  relatedItemId: z.string().optional(),
  read: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
});

export type Notification = z.infer<typeof NotificationSchema>;
