import { useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useValidateAssociateInvitation } from "@/hooks/use-associates";

function formatExpiry(iso: string): string {
  try {
    return new Intl.DateTimeFormat("pt-PT", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/**
 * Página pública: valida GET /api/associates/invitations/{token} (sem JWT).
 * O tenant deve estar definido (subdomínio ou armazenamento local) antes de abrir o link.
 */
export default function Convite() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, isError, error } = useValidateAssociateInvitation(token);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Link inválido</AlertTitle>
          <AlertDescription>Falta o token do convite na URL.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">A validar convite…</p>
      </div>
    );
  }

  if (isError || !data) {
    const message = error instanceof Error ? error.message : "Convite inválido ou expirado.";
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Não foi possível validar</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 text-primary">
          <CheckCircle2 className="h-6 w-6 shrink-0" />
          <h1 className="text-xl font-semibold">Convite válido</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Este convite pode ser usado para concluir o registo no clube. A data de expiração é{" "}
          <strong className="text-foreground">{formatExpiry(data.expiresAt)}</strong>.
        </p>
        {data.email != null && data.email !== "" && (
          <p className="text-sm">
            <span className="text-muted-foreground">E-mail associado: </span>
            <span className="font-medium">{data.email}</span>
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {data.isSingleUse ? "Este convite é de uso único." : "Este convite pode ser reutilizado até expirar."}
        </p>
      </div>
    </div>
  );
}
