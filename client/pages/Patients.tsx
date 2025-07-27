import { Users } from "lucide-react";
import PlaceholderPage from "@/components/PlaceholderPage";

export default function Patients() {
  return (
    <PlaceholderPage
      title="Patients"
      description="Gérer les dossiers patients, l'historique médical et les informations personnelles."
      icon={Users}
    />
  );
}
