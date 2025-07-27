import { Clock, User, TestTube, Stethoscope, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const activities = [
  {
    id: 1,
    type: "appointment",
    title: "New appointment scheduled",
    description: "John Smith - Biohacking Consultation",
    time: "2 minutes ago",
    icon: Calendar,
    color: "text-blue-500",
  },
  {
    id: 2,
    type: "treatment",
    title: "Treatment completed",
    description: "Sarah Johnson - IV Therapy Session",
    time: "15 minutes ago",
    icon: Stethoscope,
    color: "text-green-500",
  },
  {
    id: 3,
    type: "patient",
    title: "New patient registered",
    description: "Mike Davis added to system",
    time: "1 hour ago",
    icon: User,
    color: "text-purple-500",
  },
  {
    id: 4,
    type: "test",
    title: "Lab results available",
    description: "Blood panel results for Emma Wilson",
    time: "2 hours ago",
    icon: TestTube,
    color: "text-orange-500",
  },
  {
    id: 5,
    type: "appointment",
    title: "Appointment cancelled",
    description: "David Brown - Cryotherapy Session",
    time: "3 hours ago",
    icon: Calendar,
    color: "text-red-500",
  },
];

export default function RecentActivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`rounded-full p-2 bg-accent ${activity.color}`}>
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {activity.title}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {activity.description}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
