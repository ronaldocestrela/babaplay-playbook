import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Loader2, Plus, RefreshCw } from "lucide-react";
import type {
  Associate,
  CreateMembershipPayload,
  Membership,
  MembershipPaymentPayload,
} from "@/api/api-response";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAssociates } from "@/hooks/use-associates";
import { useMembershipsByAssociate, useCreateMembership, useAddMembershipPayment } from "@/hooks/use-memberships";

const membershipSchema = z.object({
  associateId: z.string().min(1, "Associado obrigatório"),
  year: z.coerce.number().int().min(2000, "Ano inválido"),
  month: z.coerce.number().int().min(1, "Mês inválido").max(12, "Mês inválido"),
  amount: z.coerce.number().min(0.01, "Valor mínimo 0,01"),
});

type MembershipFormValues = z.infer<typeof membershipSchema>;

const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, "Valor mínimo 0,01"),
  method: z.string().min(1, "Método obrigatório"),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function Mensalidades() {
  const [selectedAssociate, setSelectedAssociate] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const { data: associates, isLoading: associatesLoading, isError: associatesError, error: associatesErrorObj } = useAssociates();

  const {
    data: memberships,
    isLoading: membershipsLoading,
    isError: membershipsError,
    error: membershipsErrorObj,
    refetch,
  } = useMembershipsByAssociate(selectedAssociate || undefined);

  const createMembership = useCreateMembership();
  const addPayment = useAddMembershipPayment();

  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipSchema),
    defaultValues: { associateId: "", year: new Date().getFullYear(), month: new Date().getMonth() + 1, amount: 0 },
  });

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount: 0, method: "Dinheiro" },
  });

  const nextMemberships = useMemo(() => memberships ?? [], [memberships]);

  const canCreate = (associates?.length ?? 0) > 0;

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  function statusLabel(status: Membership["status"]) {
    if (status === 1) return "Pago";
    if (status === 2) return "Atrasado";
    return "Pendente";
  }

  function handleOpenCreate() {
    form.reset({
      associateId: selectedAssociate,
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      amount: 0,
    });
    setCreateOpen(true);
  }

  function handleOpenPayment(membership: Membership) {
    setSelectedMembership(membership);
    paymentForm.reset({ amount: membership.amount, method: "Dinheiro" });
    setPaymentOpen(true);
  }

  if (associatesLoading || membershipsLoading) {
    return (
      <div className="min-h-full p-6">
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-8 w-full max-w-sm mb-2" />
      </div>
    );
  }

  if (associatesError || membershipsError) {
    return (
      <div className="min-h-full p-6">
        <h1 className="text-3xl font-bold mb-2">Mensalidades</h1>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar</AlertTitle>
          <AlertDescription>
            {(associatesErrorObj || membershipsErrorObj) instanceof Error
              ? (associatesErrorObj || membershipsErrorObj).message
              : "Erro desconhecido"}
          </AlertDescription>
          <Button className="mt-2" size="sm" onClick={() => void refetch()}>
            <RefreshCw className="h-4 w-4" /> Recarregar
          </Button>
        </Alert>
      </div>
    );
  }

  async function onSubmit(values: CreateMembershipPayload) {
    await createMembership.mutateAsync(values);
    form.reset({ associateId: values.associateId, year: values.year, month: values.month, amount: 0 });
    setSelectedAssociate(values.associateId);
    setCreateOpen(false);
  }

  async function onPay(values: MembershipPaymentPayload) {
    if (!selectedMembership) return;

    await addPayment.mutateAsync({
      membershipId: selectedMembership.id,
      payload: values,
      associateId: selectedMembership.associateId,
    });

    paymentForm.reset();
    setPaymentOpen(false);
    setSelectedMembership(null);
  }

  return (
    <div className="min-h-full p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mensalidades</h1>
          <p className="text-muted-foreground">Registre mensalidades e pagamentos por associado.</p>
        </div>
        <Button onClick={handleOpenCreate} className="glow-primary gap-2" disabled={!canCreate}>
          <Plus className="h-4 w-4" />
          Nova mensalidade
        </Button>
      </div>

      <div className="mb-6 glass-card p-4 max-w-xl">
        <p className="text-sm text-muted-foreground mb-2">Filtrar mensalidades por associado</p>
        <Select value={selectedAssociate} onValueChange={(value) => setSelectedAssociate(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione associado" />
          </SelectTrigger>
          <SelectContent>
            {associates?.map((associate: Associate) => (
              <SelectItem key={associate.id} value={associate.id}>{associate.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedAssociate === "" ? (
        <Card className="max-w-2xl border-border bg-card/50">
          <CardHeader>
            <CardTitle>Selecione um associado</CardTitle>
            <CardDescription>
              Escolha um associado no filtro acima para consultar mensalidades e registrar pagamentos.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="glass-card overflow-hidden border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/20">
              <tr>
                <th className="px-4 py-2">Mês</th>
                <th className="px-4 py-2">Ano</th>
                <th className="px-4 py-2">Valor</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {nextMemberships.map((membership: Membership) => (
                <tr key={membership.id} className="border-t border-border">
                  <td className="px-4 py-2">{String(membership.month).padStart(2, "0")}</td>
                  <td className="px-4 py-2">{membership.year}</td>
                  <td className="px-4 py-2">{formatCurrency(membership.amount)}</td>
                  <td className="px-4 py-2">{statusLabel(membership.status)}</td>
                  <td className="px-4 py-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={addPayment.isPending || membership.status === 1}
                      onClick={() => handleOpenPayment(membership)}
                    >
                      {membership.status === 1 ? "Pago" : "Registar pagamento"}
                    </Button>
                  </td>
                </tr>
              ))}
              {nextMemberships.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    Nenhuma mensalidade encontrada para o associado selecionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova mensalidade</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar uma mensalidade.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form className="grid gap-3 sm:grid-cols-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="associateId"
                render={({ field }) => (
                  <FormItem className="sm:col-span-4">
                    <FormLabel>Associado</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione associado" />
                        </SelectTrigger>
                        <SelectContent>
                          {associates?.map((associate: Associate) => (
                            <SelectItem key={associate.id} value={associate.id}>{associate.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano</FormLabel>
                    <FormControl>
                      <Input type="number" min={2000} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mês</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={12} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min={0.01} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="sm:col-span-4">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={createMembership.isPending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMembership.isPending} className="gap-2">
                  {createMembership.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Criar mensalidade
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registar pagamento</DialogTitle>
            <DialogDescription>
              {selectedMembership
                ? `Mensalidade ${String(selectedMembership.month).padStart(2, "0")}/${selectedMembership.year}`
                : "Informe os dados do pagamento."}
            </DialogDescription>
          </DialogHeader>

          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(onPay)} className="space-y-4">
              <FormField
                control={paymentForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min={0.01} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex.: Dinheiro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPaymentOpen(false)} disabled={addPayment.isPending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={addPayment.isPending} className="gap-2">
                  {addPayment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Confirmar pagamento
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
