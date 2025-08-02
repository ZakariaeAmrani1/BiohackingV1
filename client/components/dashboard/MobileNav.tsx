import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Calendar,
  Users,
  Activity,
  FileText,
  Settings,
  Home,
  Stethoscope,
  TestTube,
  Menu,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserService } from "@/services/userService";

const navigation = [
  { name: "Tableau de Bord", href: "/", icon: Home },
  { name: "Rendez-vous", href: "/appointments", icon: Calendar },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Traitements", href: "/treatments", icon: Stethoscope },
  { name: "Biohacking", href: "/biohacking", icon: TestTube },
  { name: "Métriques de Santé", href: "/metrics", icon: Activity },
  { name: "Rapports", href: "/reports", icon: FileText },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="lg:hidden border-b border-border bg-card">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F7fd7290220b94e06a6f7cd5d150de493%2Fce1def9ea6774ec0bb2758b12ced93f9?format=webp&width=100"
              alt="BioHacking Logo"
              className="h-6 w-6 object-contain"
            />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Biohacking</h1>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 p-0">
            <div className="flex h-full w-full flex-col bg-card">
              {/* Logo */}
              <div className="flex h-16 items-center border-b border-border px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2F7fd7290220b94e06a6f7cd5d150de493%2Fce1def9ea6774ec0bb2758b12ced93f9?format=webp&width=100"
                      alt="BioHacking Logo"
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-foreground">
                      Biohacking
                    </h1>
                    <p className="text-xs text-muted-foreground">
                      Gestion de Clinique
                    </p>
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
                      onClick={() => setOpen(false)}
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
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    title="Se déconnecter"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
