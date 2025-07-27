import { Settings as SettingsIcon } from "lucide-react";
import PlaceholderPage from "@/components/PlaceholderPage";

export default function Settings() {
  return (
    <PlaceholderPage
      title="Paramètres"
      description="Configurer les paramètres de la clinique, permissions utilisateur et préférences système."
      icon={SettingsIcon}
    />
  );
}
