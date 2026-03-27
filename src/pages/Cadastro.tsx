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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, Mail, Lock, Building2, Check, Loader2 } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo.png";
import { useState } from "react";
import { useRegister } from "@/hooks/use-auth";
import { useAuth } from "@/contexts/auth-context";
import { useCreateTenant, useCreateSubscription } from "@/hooks/use-tenants";
import { usePlans } from "@/hooks/use-plans";
import { cn } from "@/lib/utils";

const REGISTER_USER_TYPE = 1 as const;

const step1Schema = z.object({
  name: z.string().min(1, "Indique o nome do clube"),
  subdomain: z
    .string()
    .min(1, "Indique o subdomínio")
    .transform((s) => s.trim().toLowerCase())
    .refine((s) => /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(s), {
      message: "Use apenas letras minúsculas, números e hífen",
    }),
});

const step3Schema = z
  .object({
    email: z.string().min(1, "Indique o e-mail").email("E-mail inválido"),
    password: z.string().min(1, "Indique a senha"),
    confirmPassword: z.string().min(1, "Confirme a senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type Step1Values = z.input<typeof step1Schema>;
type Step3Values = z.input<typeof step3Schema>;

type WizardData = {
  tenantId: string;
  tenantSubdomain: string;
  planId: string;
};

const STEPS = [
  { n: 1, label: "Clube" },
  { n: 2, label: "Plano" },
  { n: 3, label: "Conta" },
] as const;

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex w-full max-w-md mx-auto justify-between gap-2">
      {STEPS.map((s) => {
        const active = step === s.n;
        const done = step > s.n;
        return (
          <div key={s.n} className="flex flex-1 flex-col items-center gap-2 min-w-0">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                done && "border-primary bg-primary text-primary-foreground",
                active && !done && "border-primary bg-primary/10 text-primary",
                !active && !done && "border-muted-foreground/30 text-muted-foreground",
              )}
            >
              {done ? <Check className="h-5 w-5" /> : s.n}
            </div>
            <span
              className={cn(
                "text-xs font-medium text-center truncate w-full",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const Cadastro = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [wizardData, setWizardData] = useState<WizardData | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { setTenantSubdomain } = useAuth();
  const createTenantMutation = useCreateTenant();
  const createSubscriptionMutation = useCreateSubscription();
  const registerMutation = useRegister();
  const { data: plans, isLoading: plansLoading, isError: plansError } = usePlans();

  const form1 = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { name: "", subdomain: "" },
  });

  const form3 = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  async function onSubmitStep1(values: Step1Values) {
    const tenant = await createTenantMutation.mutateAsync({
      name: values.name.trim(),
      subdomain: values.subdomain,
    });
    setWizardData({
      tenantId: tenant.id,
      tenantSubdomain: tenant.subdomain,
      planId: "",
    });
    setStep(2);
  }

  async function onSubmitStep2() {
    if (!wizardData || !selectedPlanId) return;
    await createSubscriptionMutation.mutateAsync({
      tenantId: wizardData.tenantId,
      payload: { planId: selectedPlanId },
    });
    setWizardData((prev) =>
      prev ? { ...prev, planId: selectedPlanId } : prev,
    );
    setStep(3);
  }

  async function onSubmitStep3(values: Step3Values) {
    if (!wizardData) return;
    setTenantSubdomain(wizardData.tenantSubdomain);
    await registerMutation.mutateAsync({
      email: values.email.trim(),
      password: values.password,
      userType: REGISTER_USER_TYPE,
    });
    navigate("/dashboard");
  }

  const apiConfigured = Boolean(import.meta.env.VITE_API_BASE_URL?.trim());
  const progressValue = (step / 3) * 100;

  const step1Pending = createTenantMutation.isPending;
  const step2Pending = createSubscriptionMutation.isPending;
  const step3Pending = registerMutation.isPending;

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <img src={heroBg} alt="BabaPlay" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/20" />
        <div className="relative z-10 text-center px-12">
          <h2 className="text-4xl font-bold text-gradient mb-4">Junte-se ao time!</h2>
          <p className="text-muted-foreground text-lg">
            Crie o clube, escolha o plano e a sua conta de equipa da associação.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg space-y-8">
          <div className="text-center space-y-2">
            <img src={logo} alt="BabaPlay" className="h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold">Criar conta</h1>
            <p className="text-muted-foreground">Siga os passos para configurar o seu clube</p>
          </div>

          <div className="space-y-3">
            <StepIndicator step={step} />
            <Progress value={progressValue} className="h-2" />
          </div>

          {!apiConfigured && (
            <p className="text-sm text-amber-600 dark:text-amber-500 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2">
              Defina <code className="font-mono text-xs">VITE_API_BASE_URL</code> no ficheiro{" "}
              <code className="font-mono text-xs">.env</code> para apontar para o backend.
            </p>
          )}

          {/* Step 1: Clube */}
          {step === 1 && (
            <Form {...form1}>
              <form onSubmit={form1.handleSubmit(onSubmitStep1)} className="space-y-4">
                <FormField
                  control={form1.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do clube</FormLabel>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input
                            placeholder="ex.: Associação Desportiva Central"
                            className="pl-10 h-12 bg-secondary border-border"
                            autoComplete="organization"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form1.control}
                  name="subdomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subdomínio</FormLabel>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input
                            placeholder="ex.: meu-clube"
                            className="pl-10 h-12 bg-secondary border-border"
                            autoComplete="off"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Será usado no cabeçalho <code className="font-mono">X-Tenant-Subdomain</code> nas
                        próximas etapas.
                      </p>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold glow-primary"
                  disabled={step1Pending}
                >
                  {step1Pending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      A criar clube…
                    </>
                  ) : (
                    "Continuar"
                  )}
                </Button>
              </form>
            </Form>
          )}

          {/* Step 2: Plano */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Escolha um plano. A subscrição prepara a base de dados do clube antes de criar a sua conta.
              </p>
              {plansLoading && (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}
              {plansError && (
                <p className="text-sm text-destructive">Não foi possível carregar os planos. Tente novamente.</p>
              )}
              {!plansLoading && !plansError && plans && plans.length === 0 && (
                <p className="text-sm text-muted-foreground">Não há planos disponíveis. Contacte o suporte.</p>
              )}
              {!plansLoading && plans && plans.length > 0 && (
                <div className="grid gap-3 max-h-[min(60vh,28rem)] overflow-y-auto pr-1">
                  {plans.map((plan) => {
                    const selected = selectedPlanId === plan.id;
                    const price = new Intl.NumberFormat("pt-PT", {
                      style: "currency",
                      currency: "EUR",
                    }).format(plan.monthlyPrice);
                    return (
                      <Card
                        key={plan.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedPlanId(plan.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedPlanId(plan.id);
                          }
                        }}
                        className={cn(
                          "cursor-pointer transition-colors",
                          selected ? "border-primary ring-2 ring-primary/30" : "hover:border-muted-foreground/40",
                        )}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          {plan.description && (
                            <CardDescription className="line-clamp-2">{plan.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-2xl font-bold">{price}</p>
                          <p className="text-xs text-muted-foreground">por mês</p>
                          {plan.maxAssociates != null && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Até {plan.maxAssociates} associados
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                <Button type="button" variant="outline" disabled className="sm:w-auto">
                  Voltar
                </Button>
                <Button
                  type="button"
                  className="glow-primary sm:min-w-[140px]"
                  disabled={!selectedPlanId || step2Pending || plansLoading || !plans?.length}
                  onClick={() => void onSubmitStep2()}
                >
                  {step2Pending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      A ativar…
                    </>
                  ) : (
                    "Continuar"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                O clube já foi criado; não é possível voltar ao passo anterior sem recomeçar o cadastro.
              </p>
            </div>
          )}

          {/* Step 3: Conta */}
          {step === 3 && (
            <Form {...form3}>
              <form onSubmit={form3.handleSubmit(onSubmitStep3)} className="space-y-4">
                <FormField
                  control={form3.control}
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
                  control={form3.control}
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
                  control={form3.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar senha</FormLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 h-12 bg-secondary border-border"
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                    disabled={step3Pending}
                    className="sm:w-auto"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    className="glow-primary sm:min-w-[140px]"
                    disabled={step3Pending}
                  >
                    {step3Pending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        A criar conta…
                      </>
                    ) : (
                      "Concluir cadastro"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
