import { Outlet, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardList,
  UsersRound,
  Wallet,
  Banknote,
  Tag,
  Goal,
  LogOut,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { to: "/associados", label: "Associados", icon: Users },
  { to: "/associacao", label: "Associação", icon: Building2 },
  { to: "/check-ins", label: "Check-ins", icon: ClipboardList },
  { to: "/equipas", label: "Equipas", icon: UsersRound },
  { to: "/mensalidades", label: "Mensalidades", icon: Wallet },
  { to: "/caixa", label: "Caixa", icon: Banknote },
  { to: "/categorias", label: "Categorias", icon: Tag },
  { to: "/posicoes", label: "Posições", icon: Goal },
] as const;

export function AppShell() {
  const navigate = useNavigate();
  const { logout, tenantSubdomain } = useAuth();

  function handleLogout() {
    logout();
    void navigate("/login");
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="w-64 shrink-0 bg-card border-r border-border flex flex-col">
        <div className="p-5 border-b border-border">
          <img src={logo} alt="BabaPlay" className="h-9" />
          {tenantSubdomain && (
            <p className="text-xs text-muted-foreground mt-3 font-mono truncate" title={tenantSubdomain}>
              {tenantSubdomain}
            </p>
          )}
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard"}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground",
                "transition-colors hover:bg-secondary hover:text-foreground",
              )}
              activeClassName="bg-primary/10 text-primary font-medium"
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Sair
          </Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
