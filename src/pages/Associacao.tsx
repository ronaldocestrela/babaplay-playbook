import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Building2, Edit, Loader2, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssociations, useUpsertAssociation } from "@/hooks/use-associations";

const editSchema = z.object({
  name: z.string().min(1, "Indique o nome da associação"),
  address: z.string(),
  regulation: z.string(),
});

type EditFormValues = z.infer<typeof editSchema>;

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("pt-PT", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

type AssociationDialog = "closed" | "create" | "edit";

const Associacao = () => {
  const { data: associations, isLoading, isError, error, refetch, isFetching } = useAssociations();
  const upsertMutation = useUpsertAssociation();
  const [dialog, setDialog] = useState<AssociationDialog>("closed");

  const association = associations?.[0];
  const hasMultiple = (associations?.length ?? 0) > 1;

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: "",
      address: "",
      regulation: "",
    },
  });

  useEffect(() => {
    if (dialog === "closed") return;
    if (dialog === "create") {
      form.reset({ name: "", address: "", regulation: "" });
      return;
    }
    if (dialog === "edit" && association) {
      form.reset({
        name: association.name,
        address: association.address ?? "",
        regulation: association.regulation ?? "",
      });
    }
  }, [dialog, association, form]);

  async function onSubmitForm(values: EditFormValues) {
    const payload = {
      name: values.name.trim(),
      address: values.address.trim() || null,
      regulation: values.regulation.trim() || null,
    };
    if (dialog === "create") {
      await upsertMutation.mutateAsync(payload);
    } else if (dialog === "edit" && association) {
      await upsertMutation.mutateAsync({ ...payload, id: association.id });
    }
    setDialog("closed");
  }

  if (isLoading) {
    return (
      <div className="min-h-full p-8">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-64 w-full max-w-2xl rounded-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-full p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Associação</h1>
          <p className="text-muted-foreground mt-1">Dados da associação do seu clube</p>
        </div>
        <Alert variant="destructive" className="max-w-2xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Não foi possível carregar</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{error instanceof Error ? error.message : "Erro desconhecido."}</span>
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

  const isEmpty = !association;

  return (
    <div className="min-h-full">
      <div className="p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Associação</h1>
            <p className="text-muted-foreground mt-1">
              {isEmpty
                ? "Dados da associação do seu clube"
                : "Visualize e edite os dados da associação do seu clube"}
            </p>
          </div>
          {isEmpty ? (
            <Button className="glow-primary gap-2 shrink-0" onClick={() => setDialog("create")}>
              <Plus className="h-4 w-4" />
              Criar associação
            </Button>
          ) : (
            <Button className="glow-primary gap-2 shrink-0" onClick={() => setDialog("edit")}>
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          )}
        </div>

        {!isEmpty && hasMultiple && (
          <Alert className="mb-6 max-w-2xl border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle>Inconsistência de dados</AlertTitle>
            <AlertDescription>
              Foram encontradas {associations!.length} associações para este clube. A edição aplica-se apenas à primeira
              lista. Contacte o suporte se precisar de corrigir isto.
            </AlertDescription>
          </Alert>
        )}

        {isEmpty ? (
          <Card className="max-w-2xl border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                Nenhuma associação encontrada
              </CardTitle>
              <CardDescription>
                Ainda não existe registo de associação para este clube. Utilize o botão acima para criar uma, ou contacte o
                suporte se precisar de ajuda.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card className="max-w-2xl glass-card border-border">
            <CardHeader>
              <CardTitle className="text-xl">{association.name}</CardTitle>
              <CardDescription>Identificador: {association.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Morada</p>
                <p className="mt-1 whitespace-pre-wrap">{association.address?.trim() || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Regulamento</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                  {association.regulation?.trim() || "—"}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Criado em</p>
                  <p className="mt-1 text-sm">{formatDateTime(association.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Última atualização</p>
                  <p className="mt-1 text-sm">{formatDateTime(association.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={dialog !== "closed"} onOpenChange={(open) => !open && setDialog("closed")}>
        <DialogContent className="bg-card border-border sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialog === "create" ? "Nova associação" : "Editar associação"}</DialogTitle>
            <DialogDescription>
              {dialog === "create"
                ? "Indique o nome e, se quiser, morada e regulamento. Pode editar estes dados mais tarde."
                : "Atualize o nome, morada ou regulamento. As alterações são guardadas no servidor."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input className="bg-secondary border-border" placeholder="Nome da associação" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Morada</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[80px] resize-y bg-secondary border-border"
                        placeholder="Morada (opcional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="regulation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Regulamento</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[120px] resize-y bg-secondary border-border"
                        placeholder="Texto do regulamento (opcional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialog("closed")} disabled={upsertMutation.isPending}>
                  Cancelar
                </Button>
                <Button type="submit" className="glow-primary" disabled={upsertMutation.isPending}>
                  {upsertMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {dialog === "create" ? "A criar…" : "A guardar…"}
                    </>
                  ) : dialog === "create" ? (
                    "Criar"
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Associacao;
