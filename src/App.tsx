import { AuthProvider } from "@/contexts/auth-context";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layouts/AppShell";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Cadastro from "./pages/Cadastro.tsx";
import Associados from "./pages/Associados.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Associacao from "./pages/Associacao.tsx";
import PlaceholderPage from "./pages/PlaceholderPage.tsx";
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
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/associados" element={<Associados />} />
              <Route path="/associacao" element={<Associacao />} />
              <Route path="/check-ins" element={<PlaceholderPage title="Check-ins" />} />
              <Route path="/equipas" element={<PlaceholderPage title="Equipas" />} />
              <Route path="/mensalidades" element={<PlaceholderPage title="Mensalidades" />} />
              <Route path="/caixa" element={<PlaceholderPage title="Caixa" />} />
              <Route path="/categorias" element={<PlaceholderPage title="Categorias" />} />
              <Route path="/posicoes" element={<PlaceholderPage title="Posições" />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
