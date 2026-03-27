import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Shield, BarChart3, ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo.png";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <img src={logo} alt="BabaPlay" className="h-8" />
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link to="/cadastro">
              <Button className="glow-primary">Cadastre-se</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-16 min-h-[90vh] flex items-center">
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Gerencie sua <span className="text-gradient">associação esportiva</span> com facilidade
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Controle associados, mensalidades e eventos em uma plataforma moderna e intuitiva.
            </p>
            <div className="flex gap-4">
              <Link to="/cadastro">
                <Button size="lg" className="glow-primary gap-2 text-base h-13 px-8">
                  Começar agora <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/associados">
                <Button size="lg" variant="outline" className="text-base h-13 px-8">
                  Ver demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Tudo que você precisa</h2>
          <p className="text-muted-foreground text-center mb-16 max-w-lg mx-auto">
            Ferramentas completas para a gestão da sua associação esportiva.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: "Gestão de Associados", desc: "Cadastre, edite e acompanhe todos os membros da sua associação." },
              { icon: Shield, title: "Controle de Acesso", desc: "Defina permissões e níveis de acesso para cada tipo de usuário." },
              { icon: BarChart3, title: "Relatórios", desc: "Acompanhe métricas e gere relatórios detalhados da sua associação." },
            ].map((feature) => (
              <div key={feature.title} className="glass-card p-8 hover:glow-primary transition-all duration-300 group">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 BabaPlay. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Index;
