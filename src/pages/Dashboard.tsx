import { Link } from "react-router-dom";
import { Users } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Painel</h1>
      <p className="text-muted-foreground mb-8">Bem-vindo de volta. Escolha uma área para continuar ou use o menu à esquerda.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-3xl">
        <Link
          to="/associados"
          className="group rounded-lg border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/30"
        >
          <Users className="h-10 w-10 text-primary mb-4" />
          <h2 className="text-lg font-semibold group-hover:text-primary">Associados</h2>
          <p className="text-sm text-muted-foreground mt-1">Gerir associados do clube</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
