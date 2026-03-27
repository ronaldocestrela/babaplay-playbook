/** Página temporária para módulos ainda sem ecrã dedicado. */
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-8 max-w-2xl">
    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
    <p className="text-muted-foreground mt-2">Este módulo está em desenvolvimento.</p>
  </div>
);

export default PlaceholderPage;
