import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Calendar,
  Users,
  Activity,
  FileText,
  Settings,
  Home,
  Stethoscope,
  Heart,
  TestTube,
  FolderOpen,
  Package,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const navigation = [
  { name: "Tableau de Bord", href: "/", icon: Home },
  { name: "Rendez-vous", href: "/appointments", icon: Calendar },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Traitements", href: "/treatments", icon: Stethoscope },
  { name: "Types de Documents", href: "/document-types", icon: FolderOpen },
  {
    name: "Biens",
    icon: Package,
    dropdown: true,
    children: [
      { name: "Produits", href: "/products", icon: Package },
      { name: "Soins", href: "/soins", icon: Stethoscope },
    ]
  },
  { name: "Biohacking", href: "/biohacking", icon: TestTube },
  { name: "Métriques de Santé", href: "/metrics", icon: Activity },
  { name: "Rapports", href: "/reports", icon: FileText },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Heart className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Biohacking
            </h1>
            <p className="text-xs text-muted-foreground">Gestion de Clinique</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">DR</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              Dr. Smith
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Administrateur
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
