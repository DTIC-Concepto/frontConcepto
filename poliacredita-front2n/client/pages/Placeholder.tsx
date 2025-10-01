export default function Placeholder({ pageName }: { pageName: string }) {
  return (
    <div className="p-6 flex items-center justify-center min-h-[calc(100vh-116px)]">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-montserrat text-foreground mb-4">
          {pageName}
        </h1>
        <p className="text-muted text-lg">
          Esta página aún no ha sido implementada. Continúa conversando para agregar contenido aquí.
        </p>
      </div>
    </div>
  );
}
