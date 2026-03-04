import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { showSuccess, showError } from "@/lib/toast-utils";
import { apiGet, apiPost } from "@/lib/api";
import { Loader, Send, History } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AssignmentHistory {
  _id: string;
  assignedBy: string;
  assignedByName: string;
  assignedTo: string;
  assignedToName: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  delegationMessage: string;
  createdAt: string;
}

interface ProjectMember {
  userId: string;
  name: string;
  email: string;
  role: string;
}

interface AssignmentManagerProps {
  todoId: string;
  projectId: string;
}

export function AssignmentManager({
  todoId,
  projectId,
}: AssignmentManagerProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [history, setHistory] = useState<AssignmentHistory[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchMembers();
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, todoId]);

  const fetchMembers = async () => {
    try {
      const projectData = await apiGet<any>(`/projects/${projectId}`);
      // Filter out the current user so they don't assign to themselves
      const otherMembers = (projectData.members || []).filter(
        (m: any) => m.userId !== user?.userId,
      );
      setMembers(otherMembers);
    } catch (error) {
      showError("Failed to fetch project members", error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const historyData = await apiGet<AssignmentHistory[]>(
        `/assignments?todoId=${todoId}`,
      );
      setHistory(historyData);
    } catch (error) {
      showError("Failed to fetch assignment history", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) {
      showError("Please select a team member");
      return;
    }

    setIsAssigning(true);
    try {
      await apiPost("/assignments", {
        todoId,
        assignedTo: selectedUserId,
        delegationMessage: message,
      });
      showSuccess("Task assigned successfully");
      setMessage("");
      setSelectedUserId("");
      fetchHistory(); // Refresh history log
    } catch (error) {
      showError("Failed to assign task", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in flex flex-col md:flex-row gap-6">
      {/* Assignment Form */}
      <div className="flex-1 space-y-4">
        <h3 className="text-lg font-semibold">Assign Task</h3>
        <Card className="border-border/50 shadow-xs">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Team Member
              </label>
              {isLoadingMembers ? (
                <div className="h-10 border rounded-md flex items-center px-3 text-sm text-muted-foreground bg-muted/30">
                  <Loader className="w-4 h-4 mr-2 animate-spin" /> Loading
                  members...
                </div>
              ) : (
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No other members in project
                      </div>
                    ) : (
                      members.map((member) => (
                        <SelectItem key={member.userId} value={member.userId}>
                          {member.name} ({member.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Message (Optional)
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add instructions or notes..."
                className="resize-y"
              />
            </div>

            <Button
              onClick={handleAssign}
              disabled={isAssigning || !selectedUserId}
              className="w-full"
            >
              {isAssigning ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Assign Task
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Assignment History */}
      <div className="flex-1 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <History className="w-5 h-5" /> Assignment History
        </h3>

        {isLoadingHistory ? (
          <div className="flex justify-center p-8">
            <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          <Card className="border-dashed bg-transparent shadow-none">
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>No assignment history yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {history.map((record) => (
              <Card
                key={record._id}
                className="border-border/50 shadow-none text-sm"
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold">
                        {record.assignedByName}
                      </span>
                      <span className="text-muted-foreground mx-1">
                        assigned to
                      </span>
                      <span className="font-semibold">
                        {record.assignedToName}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={getStatusColor(record.status)}
                    >
                      {record.status.charAt(0).toUpperCase() +
                        record.status.slice(1)}
                    </Badge>
                  </div>

                  {record.delegationMessage && (
                    <div className="bg-muted/50 p-2 rounded text-muted-foreground text-xs italic border border-border/50">
                      "{record.delegationMessage}"
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground text-right">
                    {format(
                      new Date(record.createdAt),
                      "MMM d, yyyy 'at' h:mm a",
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
