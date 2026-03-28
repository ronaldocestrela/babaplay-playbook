import { AuthProvider } from "@/contexts/auth-context";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layouts/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Cadastro from "./pages/Cadastro.tsx";
import Associados from "./pages/Associados.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Associacao from "./pages/Associacao.tsx";
import CheckIns from "./pages/CheckIns.tsx";
import Equipas from "./pages/Equipas.tsx";
import Mensalidades from "./pages/Mensalidades.tsx";
import Caixa from "./pages/Caixa.tsx";
import Categorias from "./pages/Categorias.tsx";
import Posicoes from "./pages/Posicoes.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
    },
    mutations: {
      retry: 0,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Sonner position="top-right" richColors closeButton />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/associados" element={<Associados />} />
              <Route path="/associacao" element={<Associacao />} />
              <Route path="/check-ins" element={<CheckIns />} />
              <Route path="/equipas" element={<Equipas />} />
              <Route path="/mensalidades" element={<Mensalidades />} />
              <Route path="/caixa" element={<Caixa />} />
              <Route path="/categorias" element={<Categorias />} />
              <Route path="/posicoes" element={<Posicoes />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
