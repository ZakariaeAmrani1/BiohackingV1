import { Clock, User, TestTube, Stethoscope, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const activities = [
  {
    id: 1,
    type: "appointment",
    title: "Nouveau rendez-vous programmé",
    description: "John Smith - Consultation Biohacking",
    time: "il y a 2 minutes",
    icon: Calendar,
    color: "text-blue-500",
  },
  {
    id: 2,
    type: "treatment",
    title: "Traitement terminé",
    description: "Sarah Johnson - Séance de Thérapie IV",
    time: "il y a 15 minutes",
    icon: Stethoscope,
    color: "text-green-500",
  },
  {
    id: 3,
    type: "patient",
    title: "Nouveau patient enregistré",
    description: "Mike Davis ajouté au système",
    time: "il y a 1 heure",
    icon: User,
    color: "text-purple-500",
  },
  {
    id: 4,
    type: "test",
    title: "Résultats de laboratoire disponibles",
    description: "Résultats du bilan sanguin pour Emma Wilson",
    time: "il y a 2 heures",
    icon: TestTube,
    color: "text-orange-500",
  },
  {
    id: 5,
    type: "appointment",
    title: "Rendez-vous annulé",
    description: "David Brown - Séance de Cryothérapie",
    time: "il y a 3 heures",
    icon: Calendar,
    color: "text-red-500",
  },
];

export default function RecentActivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Activités Récentes
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
