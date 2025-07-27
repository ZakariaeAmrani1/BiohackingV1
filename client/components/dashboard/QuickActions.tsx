import {
  Plus,
  Calendar,
  Users,
  FileText,
  TestTube,
  Stethoscope,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const quickActions = [
  {
    title: "Nouveau Rendez-vous",
    description: "Planifier un rendez-vous patient",
    icon: Calendar,
    color: "bg-blue-500",
    action: () => console.log("New appointment"),
  },
  {
    title: "Ajouter Patient",
    description: "Enregistrer un nouveau patient",
    icon: Users,
    color: "bg-green-500",
    action: () => console.log("Add patient"),
  },
  {
    title: "Commander Test Labo",
    description: "Demander des tests de laboratoire",
    icon: TestTube,
    color: "bg-purple-500",
    action: () => console.log("Order lab test"),
  },
  {
    title: "Nouveau Traitement",
    description: "Démarrer un nouveau plan de traitement",
    icon: Stethoscope,
    color: "bg-orange-500",
    action: () => console.log("New treatment"),
  },
  {
    title: "Générer Rapport",
    description: "Créer un rapport patient ou clinique",
    icon: FileText,
    color: "bg-teal-500",
    action: () => console.log("Generate report"),
  },
];

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Actions Rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-1">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 justify-start gap-3 hover:bg-accent w-full"
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
