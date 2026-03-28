import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Loader2, Plus, RefreshCw } from "lucide-react";
import type { CashEntry, Category } from "@/api/api-response";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useCategories } from "@/hooks/use-categories";
import { useCashEntries, useCreateCashEntry } from "@/hooks/use-cash-entries";

const cashEntrySchema = z.object({
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  categoryId: z.string().min(1, "Categoria obrigatória"),
  description: z.string().optional(),
});

type CashEntryFormValues = z.infer<typeof cashEntrySchema>;

export default function Caixa() {
  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
    error: categoriesErrorObj,
  } = useCategories();
  const {
    data: entries,
    isLoading: entriesLoading,
    isError: entriesError,
    error: entriesErrorObj,
    refetch,
    isFetching,
  } = useCashEntries();
  const createMutation = useCreateCashEntry();
  const [formOpen, setFormOpen] = useState(false);

  const form = useForm<CashEntryFormValues>({
    resolver: zodResolver(cashEntrySchema),
    defaultValues: { amount: 0, categoryId: "", description: "" },
  });

  function currency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  function formatDateTime(iso: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  }

  const balance = useMemo(() => {
    const list = entries ?? [];
    return list.length > 0 ? list[0].currentBalance : 0;
  }, [entries]);

  async function onSubmit(values: CashEntryFormValues) {
    const payload = {
      amount: values.amount,
      categoryId: values.categoryId,
      description: values.description?.trim() ? values.description.trim() : null,
      entryDate: new Date().toISOString(),
    };
    await createMutation.mutateAsync(payload);
    form.reset({ amount: 0, categoryId: "", description: "" });
    setFormOpen(false);
  }

  function handleOpenCreate() {
    form.reset({ amount: 0, categoryId: "", description: "" });
    setFormOpen(true);
  }

  if (categoriesLoading || entriesLoading) {
    return (
      <div className="min-h-full p-4 sm:p-6 md:p-8">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-44 w-full rounded-lg mb-6" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    );
  }

  if (categoriesError || entriesError) {
    return (
      <div className="min-h-full p-4 sm:p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Caixa</h1>
          <p className="text-muted-foreground mt-1">Registre e acompanhe lançamentos financeiros.</p>
        </div>
        <Alert variant="destructive" className="max-w-2xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar dados</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {(categoriesErrorObj || entriesErrorObj) instanceof Error
                ? (categoriesErrorObj || entriesErrorObj).message
                : "Erro desconhecido"}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Caixa</h1>
            <p className="text-muted-foreground mt-1">Controle os lançamentos financeiros do clube.</p>
          </div>
          <div className="flex flex-col gap-3 w-full sm:w-auto sm:items-end">
            <Button onClick={handleOpenCreate} className="glow-primary gap-2 shrink-0 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Novo lançamento
            </Button>
            <div className="glass-card p-4 text-sm w-full sm:min-w-52">
              <p className="text-muted-foreground">Saldo atual</p>
              <p className="text-xl font-semibold mt-1">{currency(balance)}</p>
            </div>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 font-medium text-muted-foreground">Data</th>
                  <th className="p-4 font-medium text-muted-foreground">Descrição</th>
                  <th className="p-4 font-medium text-muted-foreground">Categoria</th>
                  <th className="p-4 font-medium text-muted-foreground">Tipo</th>
                  <th className="p-4 text-right font-medium text-muted-foreground">Valor</th>
                  <th className="p-4 text-right font-medium text-muted-foreground">Saldo acumulado</th>
                </tr>
              </thead>
              <tbody>
                {(entries ?? []).map((entry: CashEntry) => (
                  <tr key={entry.id} className="border-b border-border/50 hover:bg-accent/20">
                    <td className="p-4 text-muted-foreground">{formatDateTime(entry.entryDate)}</td>
                    <td className="p-4">{entry.description ?? "-"}</td>
                    <td className="p-4">{entry.category?.name ?? "-"}</td>
                    <td className="p-4">
                      <Badge variant={entry.category?.type === 0 ? "default" : "secondary"}>
                        {entry.category?.type === 0 ? "Receita" : "Despesa"}
                      </Badge>
                    </td>
                    <td
                      className={`p-4 text-right font-medium ${entry.category?.type === 0 ? "text-emerald-600" : "text-red-600"}`}
                    >
                      {entry.category?.type === 0 ? "+" : "-"}
                      {currency(Math.abs(entry.amount))}
                    </td>
                    <td className="p-4 text-right font-medium">{currency(entry.currentBalance)}</td>
                  </tr>
                ))}
                {(entries?.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Nenhum movimento de caixa registrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo lançamento</DialogTitle>
              <DialogDescription>
                Registre um novo movimento financeiro no caixa.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form className="grid gap-3" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          value={field.value ?? ""}
                          onChange={(evt) => field.onChange(Number(evt.target.value))}
                          className="bg-secondary border-border"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-secondary border-border">
                            <SelectValue placeholder="Selecione categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category: Category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.type === 0 ? "Receita" : "Despesa"} - {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (opcional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} className="bg-secondary border-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormOpen(false)}
                    disabled={createMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="gap-2" disabled={createMutation.isPending}>
                    {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Registrar
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
