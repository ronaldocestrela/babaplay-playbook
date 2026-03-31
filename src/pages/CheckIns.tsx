import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Loader2, Plus, RefreshCw } from "lucide-react";
import type { Associate, CheckIn } from "@/api/api-response";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssociates } from "@/hooks/use-associates";
import { useCreateCheckInSession, useCreateCheckIn, useSessionCheckIns } from "@/hooks/use-checkins";
import { useAuth } from "@/contexts/auth-context";

const checkInSchema = z.object({
  associateId: z.string().min(1, "Associado obrigatório"),
});

type CheckInFormValues = z.infer<typeof checkInSchema>;

export default function CheckIns() {
  const auth = useAuth();
  const { data: associates, isLoading: associatesLoading, isError: associatesError, error: associatesErrorObj } = useAssociates();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const sessionCheckIns = useSessionCheckIns(sessionId || undefined);

  const createSession = useCreateCheckInSession();
  const createCheckIn = useCreateCheckIn();

  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(checkInSchema),
    defaultValues: { associateId: "" },
  });

  const incoming = useMemo(() => sessionCheckIns.data ?? [], [sessionCheckIns.data]);
  const myAssociates = useMemo(
    () => (associates ?? []).filter((associate) => associate.userId === auth.userId),
    [associates, auth.userId],
  );

  if (associatesLoading) {
    return (
      <div className="min-h-full p-6">
        <Skeleton className="h-10 w-48 mb-4" />
      </div>
    );
  }

  if (associatesError) {
    return (
      <div className="min-h-full p-6">
        <h1 className="text-3xl font-bold mb-2">Check-ins</h1>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar associados</AlertTitle>
          <AlertDescription>
            {associatesErrorObj instanceof Error ? associatesErrorObj.message : "Erro desconhecido"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  async function startSession() {
    const session = await createSession.mutateAsync();
    setSessionId(session.id);
  }

  async function onSubmit(values: CheckInFormValues) {
    if (!sessionId) return;

    const selectedAssociate = (associates ?? []).find((associate) => associate.id === values.associateId);
    if (!selectedAssociate || selectedAssociate.userId !== auth.userId) {
      form.setError("associateId", {
        type: "manual",
        message: "Voce so pode registrar check-in para o seu proprio associado.",
      });
      return;
    }

    await createCheckIn.mutateAsync({
      sessionId,
      associateId: values.associateId,
      currentUserId: auth.userId,
      associateOwnerUserId: selectedAssociate.userId,
    });
    form.reset();
  }

  return (
    <div className="min-h-full p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Check-ins</h1>
          <p className="text-muted-foreground">Inicie sessão e faça check-in dos associados presentes.</p>
        </div>
        <Button onClick={startSession} disabled={createSession.isPending}>
          {createSession.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Criar sessão
        </Button>
      </div>

      <div className="mb-6">
        <p className="text-sm text-muted-foreground">ID da sessão: <strong>{sessionId ?? "Nenhuma sessão ativa"}</strong></p>
      </div>

      <div className="mb-6 max-w-sm">
        {myAssociates.length === 0 && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Sem associado vinculado</AlertTitle>
            <AlertDescription>
              O seu utilizador nao possui associado vinculado. Apenas o proprio associado pode fazer check-in.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
            <FormField
              control={form.control}
              name="associateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Associado</FormLabel>
                  <FormControl>
                    <Select {...field} onValueChange={(value) => field.onChange(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione associado" />
                      </SelectTrigger>
                      <SelectContent>
                        {myAssociates.map((associate: Associate) => (
                          <SelectItem key={associate.id} value={associate.id}>
                            {associate.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={!sessionId || createCheckIn.isPending || myAssociates.length === 0}>
              {createCheckIn.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar check-in"}
            </Button>
          </form>
        </Form>
      </div>

      <div className="glass-card overflow-hidden border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/20">
            <tr>
              <th className="px-4 py-2">Associado</th>
              <th className="px-4 py-2">Data / Hora</th>
            </tr>
          </thead>
          <tbody>
            {incoming.map((item: CheckIn) => {
              const associate = associates?.find((a) => a.id === item.associateId);
              return (
                <tr key={item.id} className="border-t border-border">
                  <td className="px-4 py-2">{associate?.name ?? item.associateId}</td>
                  <td className="px-4 py-2">{new Date(item.checkedInAt).toLocaleString("pt-PT")}</td>
                </tr>
              );
            })}
            {incoming.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-muted-foreground">
                  Nenhum check-in registrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
