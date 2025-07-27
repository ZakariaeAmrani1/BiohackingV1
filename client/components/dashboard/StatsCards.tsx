import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Activity,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Total Patients",
    value: "2,543",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    description: "Active patients this month",
  },
  {
    title: "Today's Appointments",
    value: "18",
    change: "+3",
    trend: "up",
    icon: Calendar,
    description: "Scheduled for today",
  },
  {
    title: "Monthly Revenue",
    value: "$45,280",
    change: "+8.2%",
    trend: "up",
    icon: DollarSign,
    description: "Compared to last month",
  },
  {
    title: "Treatment Success Rate",
    value: "94.2%",
    change: "+2.1%",
    trend: "up",
    icon: Activity,
    description: "Patient satisfaction rate",
  },
];

export default function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stat.trend === "up" ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span
                className={
                  stat.trend === "up" ? "text-green-500" : "text-red-500"
                }
              >
                {stat.change}
              </span>
              <span className="ml-1">{stat.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
