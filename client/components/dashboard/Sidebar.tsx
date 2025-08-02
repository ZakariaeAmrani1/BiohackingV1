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
  Receipt,
  DollarSign,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserService } from "@/services/userService";
import { Button } from "@/components/ui/button";

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
    ],
  },
  { name: "Factures", href: "/invoices", icon: Receipt },
  { name: "Paiements", href: "/payments", icon: DollarSign },
  { name: "Biohacking", href: "/biohacking", icon: TestTube },
  { name: "Métriques de Santé", href: "/metrics", icon: Activity },
  { name: "Rapports", href: "/reports", icon: FileText },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [expandedDropdowns, setExpandedDropdowns] = useState<string[]>([
    "Biens",
  ]);

  const toggleDropdown = (itemName: string) => {
    setExpandedDropdowns((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName],
    );
  };

  const isChildActive = (children: any[]) => {
    return children.some((child) => location.pathname === child.href);
  };

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
          if (item.dropdown && item.children) {
            const isExpanded = expandedDropdowns.includes(item.name);
            const hasActiveChild = isChildActive(item.children);

            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleDropdown(item.name)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    hasActiveChild
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 ml-auto" />
                  ) : (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </button>

                {isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const isChildActiveItem =
                        location.pathname === child.href;
                      return (
                        <Link
                          key={child.name}
                          to={child.href}
                          className={cn(
                            "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isChildActiveItem
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                          )}
                        >
                          <child.icon className="h-4 w-4" />
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          } else {
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
          }
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">
              {user?.prenom?.[0]?.toUpperCase()}{user?.nom?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user ? UserService.getDisplayName(user) : 'Utilisateur'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user ? UserService.getRoleDisplayName(user.role) : 'Rôle'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            title="Se déconnecter"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
