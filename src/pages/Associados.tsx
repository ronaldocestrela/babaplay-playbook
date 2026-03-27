import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  UserCheck,
  UserX,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import logo from "@/assets/logo.png";

const mockAssociados = [
  { id: 1, nome: "Carlos Silva", email: "carlos@email.com", telefone: "(11) 99999-1111", status: "ativo", posicao: "Atacante" },
  { id: 2, nome: "Ana Oliveira", email: "ana@email.com", telefone: "(11) 99999-2222", status: "ativo", posicao: "Meio-campo" },
  { id: 3, nome: "Bruno Santos", email: "bruno@email.com", telefone: "(11) 99999-3333", status: "inativo", posicao: "Goleiro" },
  { id: 4, nome: "Maria Costa", email: "maria@email.com", telefone: "(11) 99999-4444", status: "ativo", posicao: "Defesa" },
  { id: 5, nome: "Pedro Lima", email: "pedro@email.com", telefone: "(11) 99999-5555", status: "ativo", posicao: "Atacante" },
  { id: 6, nome: "Juliana Ferreira", email: "juliana@email.com", telefone: "(11) 99999-6666", status: "inativo", posicao: "Meio-campo" },
];

const Associados = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingAssociado, setEditingAssociado] = useState<typeof mockAssociados[0] | null>(null);
  const [deletingAssociado, setDeletingAssociado] = useState<typeof mockAssociados[0] | null>(null);

  const handleEdit = (associado: typeof mockAssociados[0]) => {
    setEditingAssociado(associado);
    setIsFormOpen(true);
  };

  const handleDelete = (associado: typeof mockAssociados[0]) => {
    setDeletingAssociado(associado);
    setIsDeleteOpen(true);
  };

  const handleNew = () => {
    setEditingAssociado(null);
    setIsFormOpen(true);
  };

  const ativos = mockAssociados.filter((a) => a.status === "ativo").length;
  const inativos = mockAssociados.filter((a) => a.status === "inativo").length;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <img src={logo} alt="BabaPlay" className="h-10" />
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium">
            <Users className="h-5 w-5" />
            Associados
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </a>
        </nav>
        <div className="p-4 border-t border-border">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary transition-colors w-full">
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Associados</h1>
            <p className="text-muted-foreground mt-1">Gerencie os membros da sua associação</p>
          </div>
          <Button onClick={handleNew} className="glow-primary gap-2">
            <Plus className="h-4 w-4" />
            Novo Associado
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockAssociados.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{ativos}</p>
              <p className="text-sm text-muted-foreground">Ativos</p>
            </div>
          </div>
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <UserX className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inativos}</p>
              <p className="text-sm text-muted-foreground">Inativos</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="glass-card p-4 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar associado..." className="pl-10 bg-secondary border-border" />
          </div>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Nome</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">E-mail</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Telefone</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Posição</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {mockAssociados.map((associado) => (
                <tr key={associado.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        {associado.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-medium">{associado.nome}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">{associado.email}</td>
                  <td className="p-4 text-muted-foreground hidden lg:table-cell">{associado.telefone}</td>
                  <td className="p-4 text-muted-foreground">{associado.posicao}</td>
                  <td className="p-4">
                    <Badge
                      variant={associado.status === "ativo" ? "default" : "secondary"}
                      className={associado.status === "ativo" ? "bg-primary/15 text-primary border-primary/20" : "bg-destructive/15 text-destructive border-destructive/20"}
                    >
                      {associado.status === "ativo" ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEdit(associado)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(associado)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Create/Edit Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-card border-border sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAssociado ? "Editar Associado" : "Novo Associado"}</DialogTitle>
            <DialogDescription>
              {editingAssociado ? "Atualize os dados do associado." : "Preencha os dados do novo associado."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome completo</Label>
              <Input defaultValue={editingAssociado?.nome} placeholder="Nome do associado" className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input defaultValue={editingAssociado?.email} placeholder="email@exemplo.com" className="bg-secondary border-border" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input defaultValue={editingAssociado?.telefone} placeholder="(00) 00000-0000" className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label>Posição</Label>
                <Input defaultValue={editingAssociado?.posicao} placeholder="Ex: Atacante" className="bg-secondary border-border" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
            <Button className="glow-primary">{editingAssociado ? "Salvar" : "Cadastrar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong className="text-foreground">{deletingAssociado?.nome}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Associados;
