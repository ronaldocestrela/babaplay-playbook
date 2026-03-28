import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Loader2, Plus, RefreshCw } from "lucide-react";
import type { Team } from "@/api/api-response";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useGenerateTeams, useTeamsBySession } from "@/hooks/use-teams";
import { useSessionCheckIns } from "@/hooks/use-checkins";

const teamSchema = z.object({
  sessionId: z.string().min(1, "ID da sessão obrigatório"),
  teamCount: z
    .number()
    .min(2, "No mínimo 2 equipes")
    .max(20, "No máximo 20 equipes"),
});

type TeamFormValues = z.infer<typeof teamSchema>;

export default function Equipas() {
  const [sessionId, setSessionId] = useState("");
  const { data: checkIns, isLoading: checkInsLoading, isError: checkInsError, error: checkInsErrorObj } = useSessionCheckIns(sessionId || undefined);
  const { data: teams, isLoading: teamsLoading, isError: teamsError, error: teamsErrorObj } = useTeamsBySession(sessionId || undefined);

  const generateTeams = useGenerateTeams();
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: { sessionId: "", teamCount: 2 },
  });

  async function onSubmit(values: TeamFormValues) {
    await generateTeams.mutateAsync(values);
    setSessionId(values.sessionId);
  }

  if (checkInsLoading || teamsLoading) {
    return (
      <div className="min-h-full p-6">
        <Skeleton className="h-10 w-48 mb-4" />
      </div>
    );
  }

  if (checkInsError || teamsError) {
    return (
      <div className="min-h-full p-6">
        <h1 className="text-3xl font-bold mb-2">Equipas</h1>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar</AlertTitle>
          <AlertDescription>
            {(checkInsErrorObj || teamsErrorObj) instanceof Error
              ? (checkInsErrorObj || teamsErrorObj).message
              : "Erro desconhecido"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-full p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Equipas</h1>
          <p className="text-muted-foreground">Gere equipes automáticas para uma sessão de check-in.</p>
        </div>
      </div>

      <div className="mb-6 max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
            <FormField
              control={form.control}
              name="sessionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID da sessão</FormLabel>
                  <FormControl>
                    <Input {...field} onChange={(e) => { field.onChange(e); setSessionId(e.target.value); }} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="teamCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de equipes</FormLabel>
                  <FormControl>
                    <Input type="number" min={2} max={20} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={generateTeams.isPending}>
              {generateTeams.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Gerar equipes
            </Button>
          </form>
        </Form>
      </div>

      <div className="glass-card overflow-hidden border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/20">
            <tr>
              <th className="px-4 py-2">Equipe</th>
              <th className="px-4 py-2">Membros</th>
            </tr>
          </thead>
          <tbody>
            {teams?.map((team: Team) => (
              <tr key={team.id} className="border-t border-border">
                <td className="px-4 py-2">{team.name}</td>
                <td className="px-4 py-2">{team.members?.map((item) => item.associateId).join(", ") || "-"}</td>
              </tr>
            ))}
            {(teams?.length ?? 0) === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-muted-foreground">
                  Nenhuma equipe gerada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-sm text-muted-foreground">
        {sessionId && <p>{(checkIns ?? []).length} check-ins encontrados para a sessão.</p>}
      </div>
    </div>
  );
}
