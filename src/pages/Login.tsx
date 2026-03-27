import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
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
import { Eye, EyeOff, Mail, Lock, Building2 } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo.png";
import { useState } from "react";
import { useLogin } from "@/hooks/use-auth";
import { useAuth } from "@/contexts/auth-context";

const loginSchema = z.object({
  tenantSubdomain: z
    .string()
    .min(1, "Indique o subdomínio do clube (tenant)")
    .transform((s) => s.trim().toLowerCase()),
  email: z.string().min(1, "Indique o e-mail").email("E-mail inválido"),
  password: z.string().min(1, "Indique a senha"),
});

type LoginFormValues = z.input<typeof loginSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setTenantSubdomain, tenantSubdomain } = useAuth();
  const loginMutation = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      tenantSubdomain: tenantSubdomain ?? "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setTenantSubdomain(values.tenantSubdomain);
    await loginMutation.mutateAsync({
      email: values.email.trim(),
      password: values.password,
    });
    navigate("/dashboard");
  }

  const apiConfigured = Boolean(import.meta.env.VITE_API_BASE_URL?.trim());

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <img src={heroBg} alt="BabaPlay" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/20" />
        <div className="relative z-10 text-center px-12">
          <h2 className="text-4xl font-bold text-gradient mb-4">Gestão Esportiva</h2>
          <p className="text-muted-foreground text-lg">
            Gerencie seus associados, eventos e muito mais em um só lugar.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <img src={logo} alt="BabaPlay" className="h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold">Bem-vindo de volta</h1>
            <p className="text-muted-foreground">Entre na sua conta para continuar</p>
          </div>

          {!apiConfigured && (
            <p className="text-sm text-amber-600 dark:text-amber-500 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2">
              Defina <code className="font-mono text-xs">VITE_API_BASE_URL</code> no ficheiro{" "}
              <code className="font-mono text-xs">.env</code> para apontar para o backend.
            </p>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="tenantSubdomain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subdomínio do clube</FormLabel>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input
                          placeholder="ex.: meu-clube"
                          className="pl-10 h-12 bg-secondary border-border"
                          autoComplete="organization"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      O mesmo valor enviado no header <code className="font-mono">X-Tenant-Subdomain</code> na API.
                    </p>
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
                          autoComplete="current-password"
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

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-border accent-primary" />
                  <span className="text-muted-foreground">Lembrar-me</span>
                </label>
                <a href="#" className="text-primary hover:underline shrink-0 sm:text-right">
                  Esqueceu a senha?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold glow-primary"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "A entrar…" : "Entrar"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link to="/cadastro" className="text-primary hover:underline font-medium">
                  Cadastre-se
                </Link>
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
