import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
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
  ScrollText,
  LogOut,
  Menu,
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
  { to: "/sumulas", label: "Súmulas", icon: ScrollText },
  { to: "/mensalidades", label: "Mensalidades", icon: Wallet },
  { to: "/caixa", label: "Caixa", icon: Banknote },
  { to: "/categorias", label: "Categorias", icon: Tag },
  { to: "/posicoes", label: "Posições", icon: Goal },
] as const;

const navLinkClass = cn(
  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-muted-foreground min-h-11",
  "transition-colors hover:bg-secondary hover:text-foreground",
);

function SidebarBody({
  tenantSubdomain,
  onNavigate,
  onLogout,
}: {
  tenantSubdomain: string | null | undefined;
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      <div className="p-5 border-b border-border shrink-0">
        <img src={logo} alt="BabaPlay" className="h-9" />
        {tenantSubdomain && (
          <p className="text-xs text-muted-foreground mt-3 font-mono truncate" title={tenantSubdomain}>
            {tenantSubdomain}
          </p>
        )}
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto min-h-0">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={navLinkClass}
            activeClassName="bg-primary/10 text-primary font-medium"
            onClick={onNavigate}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-border shrink-0">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground min-h-11"
          onClick={() => {
            onNavigate?.();
            onLogout();
          }}
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </>
  );
}

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, tenantSubdomain } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    void navigate("/login");
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="hidden md:flex md:w-64 shrink-0 bg-card border-r border-border flex-col">
        <SidebarBody tenantSubdomain={tenantSubdomain} onLogout={handleLogout} />
      </aside>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          className="w-[min(100%,20rem)] p-0 flex flex-col bg-card border-border sm:max-w-sm"
        >
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <SidebarBody
            tenantSubdomain={tenantSubdomain}
            onNavigate={() => setMobileNavOpen(false)}
            onLogout={handleLogout}
          />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col min-w-0 min-h-0">
        <header className="flex md:hidden items-center gap-3 h-14 px-4 border-b border-border bg-card shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            aria-label="Abrir menu"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <img src={logo} alt="BabaPlay" className="h-8" />
        </header>

        <main className="flex-1 min-w-0 min-h-0 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
