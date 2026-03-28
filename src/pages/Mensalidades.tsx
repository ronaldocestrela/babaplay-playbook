import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Loader2, Plus, RefreshCw } from "lucide-react";
import type { Associate, Membership } from "@/api/api-response";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssociates } from "@/hooks/use-associates";
import { useMembershipsByAssociate, useCreateMembership, useAddMembershipPayment } from "@/hooks/use-memberships";

const membershipSchema = z.object({
  associateId: z.string().min(1, "Associado obrigatório"),
  year: z.number().min(2000, "Ano inválido"),
  month: z.number().min(1, "Mês inválido").max(12, "Mês inválido"),
  amount: z.number().min(0.01, "Valor mínimo 0,01"),
});

type MembershipFormValues = z.infer<typeof membershipSchema>;

const paymentSchema = z.object({
  amount: z.number().min(0.01, "Valor mínimo 0,01"),
  method: z.string().min(1, "Método obrigatório"),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function Mensalidades() {
  const [selectedAssociate, setSelectedAssociate] = useState<string>("");
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

  async function onSubmit(values: MembershipFormValues) {
    await createMembership.mutateAsync(values);
    form.reset({ associateId: values.associateId, year: values.year, month: values.month, amount: 0 });
    setSelectedAssociate(values.associateId);
  }

  async function onPay(membership: Membership) {
    const values = paymentForm.getValues();
    await addPayment.mutateAsync({ membershipId: membership.id, payload: values, associateId: selectedAssociate});
    paymentForm.reset();
  }

  return (
    <div className="min-h-full p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mensalidades</h1>
          <p className="text-muted-foreground">Registre mensalidades e pagamentos por associado.</p>
        </div>
      </div>

      <div className="mb-6 max-w-2xl">
        <Form {...form}>
          <form className="grid gap-3 sm:grid-cols-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="associateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Associado</FormLabel>
                  <FormControl>
                    <Select onValueChange={(value) => {field.onChange(value); setSelectedAssociate(value);}} value={field.value}>
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
                    <Input type="number" {...field} />
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
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={createMembership.isPending} className="sm:col-span-4">
              {createMembership.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Criar Mensalidade
            </Button>
          </form>
        </Form>
      </div>

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
                <td className="px-4 py-2">{membership.amount.toFixed(2)} €</td>
                <td className="px-4 py-2">{membership.status === 0 ? "Pendente" : membership.status === 1 ? "Pago" : "Atrasado"}</td>
                <td className="px-4 py-2">
                  <form onSubmit={paymentForm.handleSubmit(() => onPay(membership))} className="flex flex-wrap gap-2 items-center">
                    <Input type="number" step="0.01" placeholder="Valor" className="w-24" value={paymentForm.watch("amount") || ""} onChange={(e) => paymentForm.setValue("amount", Number(e.target.value))} />
                    <Input placeholder="Método" className="w-32" value={paymentForm.watch("method") || ""} onChange={(e) => paymentForm.setValue("method", e.target.value)} />
                    <Button type="submit" size="sm" disabled={addPayment.isPending || selectedAssociate === ""}>
                      {addPayment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pagar"}
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
            {(nextMemberships.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  Selecione um associado e crie uma mensalidade.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
