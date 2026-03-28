import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Loader2, Plus, RefreshCw, Search } from "lucide-react";
import type { Category } from "@/api/api-response";
import { Badge } from "@/components/ui/badge";
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
import { useCategories, useCreateCategory } from "@/hooks/use-categories";

const categorySchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  type: z.union([z.literal(0), z.literal(1)]),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function Categorias() {
  const {
    data: categories,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useCategories();

  const createCategory = useCreateCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState("");

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", type: 0 },
  });

  const sortedFilteredCategories = useMemo(() => {
    const list = categories ?? [];
    const q = search.trim().toLowerCase();
    const filtered = q
      ? list.filter((category) => category.name.toLowerCase().includes(q))
      : list;
    return [...filtered].sort((a, b) =>
      a.name.localeCompare(b.name, "pt", { sensitivity: "base" }),
    );
  }, [categories, search]);

  const isSaving = createCategory.isPending;

  async function onSubmit(values: CategoryFormValues) {
    try {
      await createCategory.mutateAsync({
        name: values.name.trim(),
        type: values.type,
      });
      form.reset({ name: "", type: 0 });
      setFormOpen(false);
    } catch {
      // Erro já tratado no interceptor global
    }
  }

  function handleNew() {
    form.reset({ name: "", type: 0 });
    setFormOpen(true);
  }

  if (isLoading) {
    return (
      <div className="min-h-full p-4 sm:p-6 md:p-8">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-12 w-full max-w-md mb-6 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-full p-4 sm:p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie categorias para lançamentos financeiros da associação
          </p>
        </div>
        <Alert variant="destructive" className="max-w-2xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar categorias</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{error instanceof Error ? error.message : "Erro desconhecido."}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="gap-2 shrink-0"
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isEmpty = (categories?.length ?? 0) === 0;

  return (
    <div className="min-h-full">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
            <p className="text-muted-foreground mt-1">
              Cadastre e consulte categorias para os lançamentos de caixa.
            </p>
          </div>
          <Button onClick={handleNew} className="glow-primary gap-2 shrink-0 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Nova categoria
          </Button>
        </div>

        {isEmpty ? (
          <Card className="max-w-2xl border-border bg-card/50">
            <CardHeader>
              <CardTitle>Nenhuma categoria ainda</CardTitle>
              <CardDescription>
                Crie a primeira categoria para organizar os movimentos do caixa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar categoria
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="glass-card p-4 mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                />
              </div>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[28rem]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Nome</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tipo</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Criada em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFilteredCategories.map((cat: Category) => (
                      <tr key={cat.id} className="border-b border-border/50 hover:bg-accent/20">
                        <td className="p-4 font-medium">{cat.name}</td>
                        <td className="p-4 text-sm">
                          <Badge variant={cat.type === 0 ? "default" : "secondary"}>
                            {cat.type === 0 ? "Receita" : "Despesa"}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(cat.createdAt).toLocaleString("pt-PT")}
                        </td>
                      </tr>
                    ))}
                    {sortedFilteredCategories.length === 0 && (
                      <tr>
                        <td className="p-8 text-center text-muted-foreground" colSpan={3}>
                          Nenhuma categoria encontrada para o filtro atual.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nova categoria</DialogTitle>
              <DialogDescription>
                Informe os dados da categoria para uso em lançamentos de caixa.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex.: Mensalidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Receita</SelectItem>
                          <SelectItem value="1">Despesa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormOpen(false)}
                    disabled={isSaving}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="gap-2" disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Guardar
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
