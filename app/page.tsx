import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  Zap,
  Users,
  Brain,
  Calendar,
  BarChart3,
} from "lucide-react";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");

  if (token) {
    redirect("/dashboard");
  }
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Subtasks",
      description:
        "Automatically generate subtasks using AI with intelligent follow-up questions",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description:
        "Get AI suggestions for optimal task scheduling based on your patterns",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Delegate tasks, share updates, and collaborate in real-time",
    },
    {
      icon: BarChart3,
      title: "Task Analytics",
      description:
        "Track completion probability and get insights on your productivity",
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description:
        "WebSocket-powered live updates for team assignments and status changes",
    },
    {
      icon: CheckCircle2,
      title: "Completion Tracking",
      description:
        "Get feedback forms and track actual time spent vs estimated",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card/10">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-sidebar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-foreground">
            Todo Scheduler
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="space-y-6 mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground text-balance">
            AI-Powered Task <span className="text-primary">Management</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Schedule smarter, collaborate faster. Get AI-powered subtask
            generation, intelligent scheduling suggestions, and team
            collaboration all in one place.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Hero Image Placeholder */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-2xl p-12 mb-20 border border-primary/30">
          <div className="w-full h-96 bg-card rounded-lg border border-border/50 flex items-center justify-center">
            <p className="text-muted-foreground">Dashboard Preview</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to manage tasks like a pro
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="border-border/50 hover:border-primary/50 transition-colors"
              >
                <CardHeader>
                  <Icon className="w-8 h-8 text-primary mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Phase Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-card border border-border/50 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Our Roadmap
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Auth & Core CRUD
                </h3>
                <p className="text-muted-foreground">
                  User authentication, profile setup, and todo management basics
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Calendar & Scheduling
                </h3>
                <p className="text-muted-foreground">
                  Interactive calendar, drag-and-drop scheduling, and completion
                  tracking
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  AI Integration
                </h3>
                <p className="text-muted-foreground">
                  Google Gemini Pro for subtask generation and smart scheduling
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Team Management
                </h3>
                <p className="text-muted-foreground">
                  Team overview, delegation, and real-time WebSocket updates
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-bold">
                5
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Polish & Analytics
                </h3>
                <p className="text-muted-foreground">
                  Global assistant, insights dashboard, and advanced analytics
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-foreground">
            Ready to get started?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of users managing their tasks smarter with AI
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Create Your Free Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-sidebar mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground text-sm">
            <p>&copy; 2026 Todo Scheduler. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
