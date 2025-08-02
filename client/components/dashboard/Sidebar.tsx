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
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

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
  const [isCollapsed, setIsCollapsed] = useState(false);
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
    <TooltipProvider>
      <div className={cn(
        "flex h-full flex-col bg-card border-r border-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* Logo */}
        <div className={cn(
          "flex h-16 items-center border-b border-border transition-all duration-300",
          isCollapsed ? "px-3 justify-center" : "px-6 justify-between"
        )}>
          <div className="flex items-center">
            <div className="flex h-20 w-48 items-center justify-center">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F7fd7290220b94e06a6f7cd5d150de493%2Fce1def9ea6774ec0bb2758b12ced93f9?format=webp&width=600"
                alt="BioHacking Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(true)}
              className="h-8 w-8 p-0"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
          {isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(false)}
              className="h-8 w-8 p-0 absolute top-4 left-12"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className={cn(
          "flex-1 space-y-1 py-4 transition-all duration-300",
          isCollapsed ? "px-2" : "px-3"
        )}>
          {navigation.map((item) => {
            if (item.dropdown && item.children) {
              const isExpanded = expandedDropdowns.includes(item.name);
              const hasActiveChild = isChildActive(item.children);

              if (isCollapsed) {
                // For collapsed state, show only the first child if any is active
                const activeChild = item.children.find(child => location.pathname === child.href);
                if (activeChild) {
                  return (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>
                        <Link
                          to={activeChild.href}
                          className={cn(
                            "group flex items-center justify-center rounded-lg p-2 text-sm font-medium transition-colors bg-primary text-primary-foreground"
                          )}
                        >
                          <activeChild.icon className="h-5 w-5" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{activeChild.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                } else {
                  return (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => !isCollapsed && toggleDropdown(item.name)}
                          className={cn(
                            "group flex items-center justify-center rounded-lg p-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }
              }

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

              if (isCollapsed) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.href}
                        className={cn(
                          "group flex items-center justify-center rounded-lg p-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

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
        <div className={cn(
          "border-t border-border transition-all duration-300",
          isCollapsed ? "p-2" : "p-4"
        )}>
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {user?.prenom?.[0]?.toUpperCase()}{user?.nom?.[0]?.toUpperCase()}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div>
                    <p className="font-medium">{user ? UserService.getDisplayName(user) : 'Utilisateur'}</p>
                    <p className="text-xs text-muted-foreground">{user ? UserService.getRoleDisplayName(user.role) : 'Rôle'}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Se déconnecter</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
