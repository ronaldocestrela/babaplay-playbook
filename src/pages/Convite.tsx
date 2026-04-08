import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useSearchParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/auth-context";
import { useValidateAssociateInvitation } from "@/hooks/use-associates";
import { useRegisterWithInvitation } from "@/hooks/use-auth";

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
 * O link devolvido pela API inclui `?tenant={subdomínio}` — esse valor deve ser enviado em
 * `X-Tenant-Subdomain` (definido aqui via `setTenantSubdomain`) antes da validação e do registo.
 */
export default function Convite() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const tenantFromUrl = searchParams.get("tenant")?.trim() ?? null;

  const { tenantSubdomain, setTenantSubdomain } = useAuth();
  const [tenantSynced, setTenantSynced] = useState(false);

  useLayoutEffect(() => {
    if (tenantFromUrl) {
      setTenantSubdomain(tenantFromUrl);
    }
    setTenantSynced(true);
  }, [tenantFromUrl, setTenantSubdomain]);

  const resolvedTenant = tenantFromUrl ?? tenantSubdomain;
  const canResolveTenant = Boolean(resolvedTenant);
  const validateEnabled = tenantSynced && Boolean(token) && canResolveTenant;

  const { data, isLoading, isError, error } = useValidateAssociateInvitation(token, {
    enabled: validateEnabled,
  });

  const registerMutation = useRegisterWithInvitation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailLocked = Boolean(data?.email != null && data.email !== "");

  const formSchema = useMemo(
    () =>
      z
        .object({
          name: z.string().min(1, "Indique o seu nome"),
          email: z.string().min(1, "Indique o e-mail").email("E-mail inválido"),
          password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
          confirmPassword: z.string().min(1, "Confirme a senha"),
        })
        .refine((v) => v.password === v.confirmPassword, {
          message: "As senhas não coincidem",
          path: ["confirmPassword"],
        }),
    [],
  );

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  // Preenche e-mail quando a validação do convite chega (convite single-use com e-mail fixo).
  const inviteEmail = data?.email?.trim() ?? "";
  useEffect(() => {
    if (data && emailLocked && inviteEmail) {
      form.setValue("email", inviteEmail);
    }
  }, [data, emailLocked, inviteEmail, form]);

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

  if (tenantSynced && !canResolveTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Tenant em falta</AlertTitle>
          <AlertDescription>
            Abra o convite pelo link completo enviado pela equipa (deve incluir{" "}
            <code className="font-mono text-xs">?tenant=...</code> na URL) ou defina o subdomínio do
            clube antes de continuar.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!tenantSynced || (validateEnabled && isLoading)) {
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

  async function onSubmit(values: FormValues) {
    await registerMutation.mutateAsync({
      invitationToken: data.token,
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 text-primary">
          <CheckCircle2 className="h-6 w-6 shrink-0" />
          <h1 className="text-xl font-semibold">Concluir registo</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Convite válido até{" "}
          <strong className="text-foreground">{formatExpiry(data.expiresAt)}</strong>.
        </p>
        <p className="text-xs text-muted-foreground">
          {data.isSingleUse
            ? "Este convite é de uso único."
            : "Este convite pode ser reutilizado até expirar."}
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="ex.: João Silva"
                        className="pl-10 h-12 bg-secondary border-border"
                        autoComplete="name"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10 h-12 bg-secondary border-border"
                        autoComplete="email"
                        readOnly={emailLocked}
                        {...field}
                      />
                    </FormControl>
                  </div>
                  {emailLocked && (
                    <p className="text-xs text-muted-foreground">
                      Este convite está associado a este e-mail.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 h-12 bg-secondary border-border"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar senha</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 h-12 bg-secondary border-border"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A criar conta…
                </>
              ) : (
                "Criar conta e entrar"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
