import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertTriangle,
  Edit,
  Loader2,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Search,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import type { Associate } from "@/api/api-response";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateAssociate,
  useUpdateAssociate,
  useAssociates,
  useSetAssociateActive,
} from "@/hooks/use-associates";
import { usePositions } from "@/hooks/use-positions";

const associateFormSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || z.string().email().safeParse(val).success,
      "E-mail inválido",
    ),
  phone: z.string().trim(),
  positionIds: z
    .array(z.string())
    .min(1, "Selecione entre 1 e 3 posições")
    .max(3, "No máximo 3 posições")
    .refine((ids) => new Set(ids).size === ids.length, "Posições devem ser distintas"),
});

type AssociateFormValues = z.infer<typeof associateFormSchema>;

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function sortPositionsForDisplay<T extends { name: string; sortOrder?: number | null }>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const ao = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const bo = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
    if (ao !== bo) return ao - bo;
    return a.name.localeCompare(b.name, "pt", { sensitivity: "base" });
  });
}

function sortAssociatePositionItems<T extends { positionId: string; positionName: string }>(list: T[]): T[] {
  return [...list].sort((a, b) =>
    a.positionName.localeCompare(b.positionName, "pt", { sensitivity: "base" }),
  );
}

const Associados = () => {
  const {
    data: associates,
    isLoading: associatesLoading,
    isError: associatesError,
    error: associatesErr,
    refetch: refetchAssociates,
    isFetching: associatesFetching,
  } = useAssociates();
  const {
    data: positions,
    isLoading: positionsLoading,
    isError: positionsError,
    error: positionsErr,
    refetch: refetchPositions,
    isFetching: positionsFetching,
  } = usePositions();

  const createMutation = useCreateAssociate();
  const updateMutation = useUpdateAssociate();
  const setActiveMutation = useSetAssociateActive();

  const [formOpen, setFormOpen] = useState(false);
  const [editingAssociate, setEditingAssociate] = useState<Associate | null>(null);
  const [search, setSearch] = useState("");
  const [activeConfirm, setActiveConfirm] = useState<{
    associate: Associate;
    nextActive: boolean;
  } | null>(null);

  const form = useForm<AssociateFormValues>({
    resolver: zodResolver(associateFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      positionIds: [],
    },
  });

  useEffect(() => {
    if (!formOpen) return;
    if (editingAssociate) {
      form.reset({
        name: editingAssociate.name,
        email: editingAssociate.email ?? "",
        phone: editingAssociate.phone ?? "",
        positionIds: editingAssociate.positions.map((p) => p.positionId),
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        positionIds: [],
      });
    }
  }, [formOpen, editingAssociate, form]);

  const sortedPositionsForForm = useMemo(() => {
    const list = positions ?? [];
    return sortPositionsForDisplay(list);
  }, [positions]);

  const filteredAssociates = useMemo(() => {
    const list = associates ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((a) => {
      const name = a.name.toLowerCase();
      const email = (a.email ?? "").toLowerCase();
      const phone = (a.phone ?? "").toLowerCase();
      const posNames = (a.positions ?? [])
        .map((l) => l.positionName ?? "")
        .join(" ")
        .toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        posNames.includes(q)
      );
    });
  }, [associates, search]);

  const stats = useMemo(() => {
    const list = associates ?? [];
    const total = list.length;
    const ativos = list.filter((a) => a.isActive).length;
    const inativos = total - ativos;
    return { total, ativos, inativos };
  }, [associates]);

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const togglingId =
    setActiveMutation.isPending && setActiveMutation.variables
      ? setActiveMutation.variables.id
      : undefined;

  async function onSubmit(values: AssociateFormValues) {
    const emailTrim = values.email.trim();
    const phoneTrim = values.phone.trim();
    const payload = {
      name: values.name.trim(),
      email: emailTrim === "" ? null : emailTrim,
      phone: phoneTrim === "" ? null : phoneTrim,
      positionIds: values.positionIds,
    };
    try {
      if (editingAssociate) {
        await updateMutation.mutateAsync({ id: editingAssociate.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setFormOpen(false);
      setEditingAssociate(null);
    } catch {
      // Erro já tratado pelo interceptor (toast)
    }
  }

  function handleNew() {
    setEditingAssociate(null);
    setFormOpen(true);
  }

  function handleEdit(associate: Associate) {
    setEditingAssociate(associate);
    setFormOpen(true);
  }

  async function confirmActiveToggle() {
    if (!activeConfirm) return;
    try {
      await setActiveMutation.mutateAsync({
        id: activeConfirm.associate.id,
        payload: { isActive: activeConfirm.nextActive },
      });
      setActiveConfirm(null);
    } catch {
      // toast via interceptor
    }
  }

  if (associatesLoading) {
    return (
      <div className="min-h-full p-4 sm:p-6 md:p-8">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-12 w-full max-w-md mb-6 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (associatesError) {
    return (
      <div className="min-h-full p-4 sm:p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Associados</h1>
          <p className="text-muted-foreground mt-1">Gerencie os membros da sua associação</p>
        </div>
        <Alert variant="destructive" className="max-w-2xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Não foi possível carregar</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {associatesErr instanceof Error ? associatesErr.message : "Erro desconhecido."}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
              onClick={() => void refetchAssociates()}
              disabled={associatesFetching}
            >
              {associatesFetching ? (
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

  const empty = (associates?.length ?? 0) === 0;

  return (
    <div className="min-h-full">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl font-bold">Associados</h1>
            <p className="text-muted-foreground mt-1">Gerencie os membros da sua associação</p>
          </div>
          <Button
            onClick={handleNew}
            className="glow-primary gap-2 shrink-0 w-full sm:w-auto"
            disabled={positionsError || (positions?.length ?? 0) === 0}
            title={
              positionsError
                ? "Não foi possível carregar as posições"
                : (positions?.length ?? 0) === 0
                  ? "Cadastre posições em Posições antes de adicionar associados"
                  : undefined
            }
          >
            <Plus className="h-4 w-4" />
            Novo Associado
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 sm:mb-8">
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
          <div
            className="glass-card p-5 flex items-center gap-4"
            title="Associados com estado ativo (podem fazer login, se aplicável)."
          >
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.ativos}</p>
              <p className="text-sm text-muted-foreground">Ativos</p>
            </div>
          </div>
          <div
            className="glass-card p-5 flex items-center gap-4"
            title="Associados desativados (não podem fazer login)."
          >
            <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <UserX className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.inativos}</p>
              <p className="text-sm text-muted-foreground">Inativos</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, e-mail, telefone ou posição..."
              className="pl-10 bg-secondary border-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {empty ? (
          <div className="glass-card p-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium text-foreground">Nenhum associado ainda</p>
            <p className="text-sm mt-1">
              {(positions?.length ?? 0) === 0
                ? "Cadastre posições em Posições e depois adicione o primeiro associado."
                : "Clique em «Novo Associado» para começar."}
            </p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[42rem]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Nome</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                      E-mail
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                      Telefone
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Posições
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Estado
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssociates.map((associado) => (
                    <tr
                      key={associado.id}
                      className="border-b border-border/50 hover:bg-secondary/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                            {initialsFromName(associado.name)}
                          </div>
                          <span className="font-medium break-words">{associado.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground hidden md:table-cell">
                        {associado.email ?? "—"}
                      </td>
                      <td className="p-4 text-muted-foreground hidden lg:table-cell">
                        {associado.phone ?? "—"}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-[14rem]">
                          {sortAssociatePositionItems(associado.positions ?? []).map((p) => (
                            <Badge
                              key={p.positionId}
                              variant="secondary"
                              className="text-xs font-normal"
                            >
                              {p.positionName}
                            </Badge>
                          ))}
                          {(associado.positions ?? []).length === 0 && (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={associado.isActive ? "default" : "secondary"}
                          className={
                            associado.isActive
                              ? "bg-primary/15 text-primary border-primary/20"
                              : "bg-destructive/15 text-destructive border-destructive/20"
                          }
                        >
                          {associado.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-0.5">
                          {associado.isActive ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive"
                              disabled={togglingId === associado.id}
                              onClick={() =>
                                setActiveConfirm({ associate: associado, nextActive: false })
                              }
                              aria-label="Desativar associado"
                              title="Desativar"
                            >
                              {togglingId === associado.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <PowerOff className="h-4 w-4" />
                              )}
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 sm:h-8 sm:w-8 text-muted-foreground hover:text-primary"
                              disabled={togglingId === associado.id}
                              onClick={() =>
                                setActiveConfirm({ associate: associado, nextActive: true })
                              }
                              aria-label="Ativar associado"
                              title="Ativar"
                            >
                              {togglingId === associado.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Power className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 sm:h-8 sm:w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleEdit(associado)}
                            aria-label="Editar associado"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredAssociates.length === 0 && !empty && (
              <p className="p-6 text-center text-sm text-muted-foreground">
                Nenhum resultado para «{search.trim()}».
              </p>
            )}
          </div>
        )}
      </div>

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingAssociate(null);
        }}
      >
        <DialogContent className="bg-card border-border sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAssociate ? "Editar Associado" : "Novo Associado"}</DialogTitle>
            <DialogDescription>
              {editingAssociate
                ? "Atualize os dados e as posições (1 a 3)."
                : "Preencha os dados e escolha entre 1 e 3 posições distintas."}
            </DialogDescription>
          </DialogHeader>

          {positionsError ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Posições indisponíveis</AlertTitle>
              <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  {positionsErr instanceof Error ? positionsErr.message : "Erro ao carregar posições."}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 shrink-0"
                  onClick={() => void refetchPositions()}
                  disabled={positionsFetching}
                >
                  {positionsFetching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Tentar novamente
                </Button>
              </AlertDescription>
            </Alert>
          ) : positionsLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nome do associado"
                          className="bg-secondary border-border"
                          {...field}
                        />
                      </FormControl>
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
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@exemplo.com"
                          className="bg-secondary border-border"
                          {...field}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(00) 00000-0000"
                          className="bg-secondary border-border"
                          {...field}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="positionIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Posições (1 a 3)</FormLabel>
                      <div className="rounded-md border border-border bg-secondary/30 p-3 space-y-2 max-h-48 overflow-y-auto">
                        {sortedPositionsForForm.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            Não há posições cadastradas. Adicione em Posições.
                          </p>
                        ) : (
                          sortedPositionsForForm.map((pos) => {
                            const checked = field.value.includes(pos.id);
                            const atMax = field.value.length >= 3 && !checked;
                            return (
                              <label
                                key={pos.id}
                                className="flex items-center gap-3 cursor-pointer rounded-md px-2 py-1.5 hover:bg-secondary/80"
                              >
                                <Checkbox
                                  checked={checked}
                                  disabled={atMax}
                                  onCheckedChange={(c) => {
                                    const on = c === true;
                                    if (on) {
                                      if (field.value.length >= 3) return;
                                      field.onChange([...field.value, pos.id]);
                                    } else {
                                      field.onChange(field.value.filter((id) => id !== pos.id));
                                    }
                                  }}
                                />
                                <span className="text-sm">{pos.name}</span>
                              </label>
                            );
                          })
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="gap-2 sm:gap-0 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormOpen(false);
                      setEditingAssociate(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="glow-primary" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Salvando…
                      </>
                    ) : editingAssociate ? (
                      "Salvar"
                    ) : (
                      "Cadastrar"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={activeConfirm != null}
        onOpenChange={(open) => {
          if (!open) setActiveConfirm(null);
        }}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {activeConfirm?.nextActive ? "Ativar associado?" : "Desativar associado?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {activeConfirm?.nextActive ? (
                <>
                  <strong className="text-foreground">{activeConfirm.associate.name}</strong> passará a
                  estar ativo e poderá fazer login (conforme regras de autenticação).
                </>
              ) : (
                <>
                  <strong className="text-foreground">{activeConfirm?.associate.name}</strong> ficará
                  inativo e <strong className="text-foreground">não poderá fazer login</strong>.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={setActiveMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className={
                activeConfirm?.nextActive
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }
              disabled={setActiveMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                void confirmActiveToggle();
              }}
            >
              {setActiveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                  A processar…
                </>
              ) : activeConfirm?.nextActive ? (
                "Ativar"
              ) : (
                "Desativar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Associados;
