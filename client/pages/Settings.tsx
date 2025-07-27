import { Settings as SettingsIcon } from "lucide-react";
import PlaceholderPage from "@/components/PlaceholderPage";

export default function Settings() {
  return (
    <PlaceholderPage
      title="Settings"
      description="Configure clinic settings, user permissions, and system preferences."
      icon={SettingsIcon}
    />
  );
}
