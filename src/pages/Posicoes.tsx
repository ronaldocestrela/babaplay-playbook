import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import {
  AlertTriangle,
  Edit,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import type { Position } from "@/api/api-response";
import { extractErrorMessage } from "@/api/axios-instance";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import {
  useCreatePosition,
  useDeletePosition,
  usePositions,
  useUpdatePosition,
} from "@/hooks/use-positions";

const positionFormSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
});

type PositionFormValues = z.infer<typeof positionFormSchema>;

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

const CONFLICT_DELETE_MESSAGE =
  "Esta posição está atribuída a um ou mais associados. Remova primeiro as atribuições.";

const Posicoes = () => {
  const { data: positions, isLoading, isError, error, refetch, isFetching } = usePositions();
  const createMutation = useCreatePosition();
  const updateMutation = useUpdatePosition();
  const deleteMutation = useDeletePosition();

  const [formOpen, setFormOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingPosition, setDeletingPosition] = useState<Position | null>(null);
  const [search, setSearch] = useState("");

  const form = useForm<PositionFormValues>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (!formOpen) return;
    if (editingPosition) {
      form.reset({
        name: editingPosition.name,
      });
    } else {
      form.reset({ name: "" });
    }
  }, [formOpen, editingPosition, form]);

  const sortedFiltered = useMemo(() => {
    const list = positions ?? [];
    const q = search.trim().toLowerCase();
    const filtered = q ? list.filter((p) => p.name.toLowerCase().includes(q)) : list;
    return [...filtered].sort((a, b) =>
      a.name.localeCompare(b.name, "pt", { sensitivity: "base" }),
    );
  }, [positions, search]);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(values: PositionFormValues) {
    const payload = { name: values.name.trim() };
    if (editingPosition) {
      await updateMutation.mutateAsync({ id: editingPosition.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setFormOpen(false);
    setEditingPosition(null);
  }

  function handleNew() {
    setEditingPosition(null);
    setFormOpen(true);
  }

  function handleEdit(position: Position) {
    setEditingPosition(position);
    setFormOpen(true);
  }

  function handleDeleteClick(position: Position) {
    setDeletingPosition(position);
    setDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingPosition) return;
    try {
      await deleteMutation.mutateAsync(deletingPosition.id);
      setDeleteOpen(false);
      setDeletingPosition(null);
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 409) {
        toast.error(CONFLICT_DELETE_MESSAGE);
        return;
      }
      const msg = isAxiosError(e)
        ? extractErrorMessage(e.response?.data) ||
          e.message ||
          "Não foi possível eliminar a posição."
        : "Não foi possível eliminar a posição.";
      toast.error(msg);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-full p-4 sm:p-6 md:p-8">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-full p-4 sm:p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Posições</h1>
          <p className="text-muted-foreground mt-1">Defina as posições usadas nos associados e equipas</p>
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

  const isEmpty = (positions?.length ?? 0) === 0;

  return (
    <div className="min-h-full">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Posições</h1>
            <p className="text-muted-foreground mt-1">
              Cadastre as posições do clube (ex.: Goleiro, Defesa, Meio-campo). A lista segue ordem alfabética.
            </p>
          </div>
          <Button onClick={handleNew} className="glow-primary gap-2 shrink-0 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Nova posição
          </Button>
        </div>

        {isEmpty ? (
          <Card className="max-w-2xl border-border bg-card/50">
            <CardHeader>
              <CardTitle>Nenhuma posição ainda</CardTitle>
              <CardDescription>
                Crie a primeira posição para começar a classificar associados e equipas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar posição
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
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                      Criada em
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFiltered.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-muted-foreground">
                        Nenhum resultado para &quot;{search}&quot;.
                      </td>
                    </tr>
                  ) : (
                    sortedFiltered.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-border/50 hover:bg-secondary/50 transition-colors"
                      >
                        <td className="p-4 font-medium break-words max-w-[12rem] sm:max-w-none">{p.name}</td>
                        <td className="p-4 text-muted-foreground hidden md:table-cell">
                          {formatDateTime(p.createdAt)}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 sm:h-8 sm:w-8 text-muted-foreground hover:text-primary"
                              onClick={() => handleEdit(p)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteClick(p)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingPosition(null);
        }}
      >
        <DialogContent className="bg-card border-border sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPosition ? "Editar posição" : "Nova posição"}</DialogTitle>
            <DialogDescription>
              {editingPosition
                ? "Altere o nome da posição."
                : "Indique o nome da nova posição (ex.: Atacante)."}
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
                      <Input placeholder="Ex.: Atacante" className="bg-secondary border-border" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormOpen(false);
                    setEditingPosition(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} className="gap-2">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {editingPosition ? "Guardar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja remover a posição{" "}
              <strong className="text-foreground">{deletingPosition?.name}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeletingPosition(null);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              className="gap-2"
              disabled={deleteMutation.isPending}
              onClick={() => void handleConfirmDelete()}
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Excluir
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Posicoes;
