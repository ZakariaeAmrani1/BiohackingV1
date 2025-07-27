import { Plus, Calendar, Users, FileText, TestTube, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const quickActions = [
  {
    title: "New Appointment",
    description: "Schedule a patient appointment",
    icon: Calendar,
    color: "bg-blue-500",
    action: () => console.log("New appointment")
  },
  {
    title: "Add Patient",
    description: "Register a new patient",
    icon: Users,
    color: "bg-green-500",
    action: () => console.log("Add patient")
  },
  {
    title: "Order Lab Test",
    description: "Request laboratory tests",
    icon: TestTube,
    color: "bg-purple-500",
    action: () => console.log("Order lab test")
  },
  {
    title: "New Treatment",
    description: "Start a new treatment plan",
    icon: Stethoscope,
    color: "bg-orange-500",
    action: () => console.log("New treatment")
  },
  {
    title: "Generate Report",
    description: "Create patient or clinic report",
    icon: FileText,
    color: "bg-teal-500",
    action: () => console.log("Generate report")
  },
];

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 justify-start gap-3 hover:bg-accent"
              onClick={action.action}
            >
              <div className={`rounded-lg p-2 ${action.color} text-white`}>
                <action.icon className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-xs text-muted-foreground">
                  {action.description}
                </div>
              </div>
              <Plus className="h-4 w-4 ml-auto" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
