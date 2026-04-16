import { isAxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  Lock,
  Plus,
  Save,
  ScrollText,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  MATCH_REPORT_STATUS,
  type MatchReport,
  type MatchReportGamePayload,
  type MatchReportPlayerStatPayload,
  type UpsertMatchReportPayload,
} from "@/api/api-response";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssociates } from "@/hooks/use-associates";
import {
  canEditMatchReport,
  useFinalizeMatchReport,
  useMatchReport,
  useUpsertMatchReport,
} from "@/hooks/use-match-reports";

type EditablePlayerStat = {
  associateId: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  observations: string;
};

type EditableGame = {
  title: string;
  notes: string;
  playerStats: EditablePlayerStat[];
};

type EditableMatchReport = {
  notes: string;
  games: EditableGame[];
};

function createEmptyPlayerStat(associateId = ""): EditablePlayerStat {
  return {
    associateId,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    observations: "",
  };
}

function createEmptyGame(defaultAssociateId = ""): EditableGame {
  return {
    title: "",
    notes: "",
    playerStats: defaultAssociateId ? [createEmptyPlayerStat(defaultAssociateId)] : [],
  };
}

function createEmptyDraft(defaultAssociateId = ""): EditableMatchReport {
  return {
    notes: "",
    games: [createEmptyGame(defaultAssociateId)],
  };
}

function mapReportToDraft(report: MatchReport): EditableMatchReport {
  return {
    notes: report.notes ?? "",
    games: report.games.map((game) => ({
      title: game.title,
      notes: game.notes ?? "",
      playerStats: game.playerStats.map((stat) => ({
        associateId: stat.associateId,
        goals: stat.goals,
        assists: stat.assists,
        yellowCards: stat.yellowCards,
        redCards: stat.redCards,
        observations: stat.observations ?? "",
      })),
    })),
  };
}

function toPayload(draft: EditableMatchReport): UpsertMatchReportPayload {
  const games: MatchReportGamePayload[] = draft.games.map((game) => ({
    title: game.title.trim(),
    notes: game.notes.trim() || null,
    playerStats: game.playerStats.map<MatchReportPlayerStatPayload>((stat) => ({
      associateId: stat.associateId,
      goals: stat.goals,
      assists: stat.assists,
      yellowCards: stat.yellowCards,
      redCards: stat.redCards,
      observations: stat.observations.trim() || null,
    })),
  }));

  return {
    notes: draft.notes.trim() || null,
    games,
  };
}

function statusLabel(status: number | undefined): string {
  return status === MATCH_REPORT_STATUS.Finalized ? "Finalizada" : "Rascunho";
}

export default function Sumulas() {
  const { roles } = useAuth();
  const [sessionIdInput, setSessionIdInput] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<string>();
  const { data: associates, isLoading: associatesLoading } = useAssociates();
  const defaultAssociateId = associates?.[0]?.id ?? "";
  const [draft, setDraft] = useState<EditableMatchReport>(() => createEmptyDraft());

  const reportQuery = useMatchReport(activeSessionId);
  const upsertMutation = useUpsertMatchReport();
  const finalizeMutation = useFinalizeMatchReport();

  const isNotFound = isAxiosError(reportQuery.error) && reportQuery.error.response?.status === 404;
  const loadedReport = isNotFound ? null : reportQuery.data;
  const reportStatus = loadedReport?.status;
  const canEdit = canEditMatchReport(reportStatus, roles);
  const isBusy = reportQuery.isLoading || upsertMutation.isPending || finalizeMutation.isPending;

  useEffect(() => {
    if (!activeSessionId) {
      setDraft(createEmptyDraft(defaultAssociateId));
      return;
    }

    if (loadedReport) {
      setDraft(mapReportToDraft(loadedReport));
      return;
    }

    if (isNotFound) {
      setDraft(createEmptyDraft(defaultAssociateId));
    }
  }, [activeSessionId, loadedReport, isNotFound, defaultAssociateId]);

  const associateOptions = useMemo(
    () => [...(associates ?? [])].sort((a, b) => a.name.localeCompare(b.name, "pt", { sensitivity: "base" })),
    [associates],
  );

  function updateGame(gameIndex: number, patch: Partial<EditableGame>) {
    setDraft((current) => ({
      ...current,
      games: current.games.map((game, index) => (index === gameIndex ? { ...game, ...patch } : game)),
    }));
  }

  function updatePlayerStat(gameIndex: number, playerIndex: number, patch: Partial<EditablePlayerStat>) {
    setDraft((current) => ({
      ...current,
      games: current.games.map((game, gIndex) => {
        if (gIndex !== gameIndex) return game;
        return {
          ...game,
          playerStats: game.playerStats.map((player, pIndex) =>
            pIndex === playerIndex ? { ...player, ...patch } : player,
          ),
        };
      }),
    }));
  }

  function addGame() {
    setDraft((current) => ({
      ...current,
      games: [...current.games, createEmptyGame(defaultAssociateId)],
    }));
  }

  function removeGame(gameIndex: number) {
    setDraft((current) => {
      const nextGames = current.games.filter((_, index) => index !== gameIndex);
      return {
        ...current,
        games: nextGames.length > 0 ? nextGames : [createEmptyGame(defaultAssociateId)],
      };
    });
  }

  function addPlayerStat(gameIndex: number) {
    setDraft((current) => ({
      ...current,
      games: current.games.map((game, index) =>
        index === gameIndex
          ? { ...game, playerStats: [...game.playerStats, createEmptyPlayerStat(defaultAssociateId)] }
          : game,
      ),
    }));
  }

  function removePlayerStat(gameIndex: number, playerIndex: number) {
    setDraft((current) => ({
      ...current,
      games: current.games.map((game, gIndex) => {
        if (gIndex !== gameIndex) return game;
        return {
          ...game,
          playerStats: game.playerStats.filter((_, pIndex) => pIndex !== playerIndex),
        };
      }),
    }));
  }

  async function handleSave() {
    if (!activeSessionId) return;
    await upsertMutation.mutateAsync({ sessionId: activeSessionId, payload: toPayload(draft) });
  }

  async function handleFinalize() {
    if (!activeSessionId || !loadedReport) return;
    await finalizeMutation.mutateAsync(activeSessionId);
  }

  if (associatesLoading) {
    return (
      <div className="min-h-full p-6">
        <Skeleton className="h-10 w-56 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Súmulas</h1>
          <p className="text-muted-foreground">
            Registe várias partidas por sessão com gols, assistências, cartões e observações por jogador.
          </p>
        </div>

        <div className="w-full max-w-xl flex flex-col gap-3 sm:flex-row">
          <Input
            value={sessionIdInput}
            onChange={(event) => setSessionIdInput(event.target.value)}
            placeholder="Informe o ID da sessão"
          />
          <Button
            type="button"
            disabled={!sessionIdInput.trim() || reportQuery.isFetching}
            onClick={() => setActiveSessionId(sessionIdInput.trim())}
          >
            {reportQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScrollText className="h-4 w-4" />}
            Carregar sessão
          </Button>
        </div>
      </div>

      {!activeSessionId && (
        <Alert>
          <ScrollText className="h-4 w-4" />
          <AlertTitle>Selecione uma sessão</AlertTitle>
          <AlertDescription>
            A tela trabalha por sessão de jogo. Informe o ID da sessão para consultar ou iniciar a súmula.
          </AlertDescription>
        </Alert>
      )}

      {activeSessionId && reportQuery.isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {activeSessionId && reportQuery.isError && !isNotFound && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao consultar a súmula</AlertTitle>
          <AlertDescription>
            {reportQuery.error instanceof Error
              ? reportQuery.error.message
              : "Nao foi possivel carregar a súmula desta sessão."}
          </AlertDescription>
        </Alert>
      )}

      {activeSessionId && (loadedReport || isNotFound) && (
        <>
          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sessão</p>
                  <p className="font-mono text-sm">{activeSessionId}</p>
                </div>
                <Badge variant={reportStatus === MATCH_REPORT_STATUS.Finalized ? "destructive" : "secondary"}>
                  {statusLabel(reportStatus)}
                </Badge>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Observações gerais</label>
                <Textarea
                  value={draft.notes}
                  onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
                  disabled={!canEdit || isBusy}
                  placeholder="Resumo geral da sessão, arbitragem, clima, ocorrências..."
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              {!canEdit && (
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertTitle>Edição bloqueada</AlertTitle>
                  <AlertDescription>
                    A súmula está finalizada. Apenas utilizadores com role Admin podem alterá-la.
                  </AlertDescription>
                </Alert>
              )}

              {canEdit && reportStatus === MATCH_REPORT_STATUS.Finalized && (
                <Alert>
                  <ShieldCheck className="h-4 w-4" />
                  <AlertTitle>Edição administrativa</AlertTitle>
                  <AlertDescription>
                    Você está a editar uma súmula já finalizada. As alterações permanecem no estado finalizado.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-3">
                <Button type="button" onClick={handleSave} disabled={!canEdit || isBusy}>
                  {upsertMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Salvar súmula
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFinalize}
                  disabled={!loadedReport || reportStatus === MATCH_REPORT_STATUS.Finalized || isBusy}
                >
                  {finalizeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Finalizar súmula
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Partidas da sessão</h2>
              <p className="text-sm text-muted-foreground">
                Cada sessão pode conter vários jogos e estatísticas individuais por jogador.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={addGame} disabled={!canEdit || isBusy}>
              <Plus className="h-4 w-4" />
              Adicionar partida
            </Button>
          </div>

          <div className="space-y-4">
            {draft.games.map((game, gameIndex) => (
              <section key={`game-${gameIndex}`} className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="grid gap-3 flex-1 md:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Título da partida</label>
                      <Input
                        value={game.title}
                        onChange={(event) => updateGame(gameIndex, { title: event.target.value })}
                        disabled={!canEdit || isBusy}
                        placeholder={`Jogo ${gameIndex + 1}`}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Observações da partida</label>
                      <Input
                        value={game.notes}
                        onChange={(event) => updateGame(gameIndex, { notes: event.target.value })}
                        disabled={!canEdit || isBusy}
                        placeholder="Ex.: semifinal, amistoso, jogo decisivo"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeGame(gameIndex)}
                    disabled={!canEdit || isBusy}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover partida
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-medium">Jogadores da partida</h3>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addPlayerStat(gameIndex)}
                      disabled={!canEdit || isBusy || associateOptions.length === 0}
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar jogador
                    </Button>
                  </div>

                  {game.playerStats.length === 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Nenhum jogador registado</AlertTitle>
                      <AlertDescription>Adicione os atletas que participaram desta partida.</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-3">
                    {game.playerStats.map((player, playerIndex) => (
                      <div
                        key={`game-${gameIndex}-player-${playerIndex}`}
                        className="rounded-lg border border-border/70 bg-background p-4 space-y-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="grid gap-2 flex-1 lg:max-w-sm">
                            <label className="text-sm font-medium">Jogador</label>
                            <select
                              value={player.associateId}
                              onChange={(event) => updatePlayerStat(gameIndex, playerIndex, { associateId: event.target.value })}
                              disabled={!canEdit || isBusy}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="">Selecione um associado</option>
                              {associateOptions.map((associate) => (
                                <option key={associate.id} value={associate.id}>
                                  {associate.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => removePlayerStat(gameIndex, playerIndex)}
                            disabled={!canEdit || isBusy}
                          >
                            <Trash2 className="h-4 w-4" />
                            Remover
                          </Button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          {[
                            ["goals", "Gols", player.goals],
                            ["assists", "Assistências", player.assists],
                            ["yellowCards", "Amarelos", player.yellowCards],
                            ["redCards", "Vermelhos", player.redCards],
                          ].map(([field, label, value]) => (
                            <div key={field} className="grid gap-2">
                              <label className="text-sm font-medium">{label}</label>
                              <Input
                                type="number"
                                min={0}
                                value={value}
                                onChange={(event) =>
                                  updatePlayerStat(gameIndex, playerIndex, {
                                    [field]: Math.max(0, Number(event.target.value || 0)),
                                  })
                                }
                                disabled={!canEdit || isBusy}
                              />
                            </div>
                          ))}
                        </div>

                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Observações do jogador</label>
                          <Textarea
                            value={player.observations}
                            onChange={(event) => updatePlayerStat(gameIndex, playerIndex, { observations: event.target.value })}
                            disabled={!canEdit || isBusy}
                            placeholder="Ex.: lesionado, destaque do jogo, reclamação, capitão..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}