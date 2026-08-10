```tsx
interface StatusBadgeProps {
  status: string;
}

const statusStyles: Record<
  string,
  string
> = {
  CONFORME:
    "bg-green-50 text-green-700 border-green-200",

  NAO_CONFORME:
    "bg-red-50 text-red-700 border-red-200",

  "Não Conforme":
    "bg-red-50 text-red-700 border-red-200",

  ABERTA:
    "bg-red-50 text-red-700 border-red-200",

  Aberta:
    "bg-red-50 text-red-700 border-red-200",

  EM_ANALISE:
    "bg-yellow-50 text-yellow-700 border-yellow-200",

  EM_ANDAMENTO:
    "bg-blue-50 text-blue-700 border-blue-200",

  "Em andamento":
    "bg-blue-50 text-blue-700 border-blue-200",

  RESOLVIDA:
    "bg-green-50 text-green-700 border-green-200",

  FECHADA:
    "bg-slate-100 text-slate-700 border-slate-200",

  CONCLUIDA:
    "bg-green-50 text-green-700 border-green-200",

  ATRASADA:
    "bg-red-50 text-red-700 border-red-200",

  PARCIALMENTE_CONFORME:
    "bg-yellow-50 text-yellow-700 border-yellow-200",

  ATIVO:
    "bg-green-50 text-green-700 border-green-200",

  INATIVO:
    "bg-slate-100 text-slate-600 border-slate-200",
};

const statusLabels: Record<
  string,
  string
> = {
  CONFORME: "Conforme",
  NAO_CONFORME: "Não Conforme",

  ABERTA: "Aberta",
  EM_ANALISE: "Em análise",
  EM_ANDAMENTO: "Em andamento",
  RESOLVIDA: "Resolvida",
  FECHADA: "Fechada",

  CONCLUIDA: "Concluída",
  ATRASADA: "Atrasada",

  PARCIALMENTE_CONFORME:
    "Parcialmente Conforme",

  ATIVO: "Ativo",
  INATIVO: "Inativo",
};

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const style =
    statusStyles[status] ||
    "bg-slate-100 text-slate-600 border-slate-200";

  const label =
    statusLabels[status] ||
    status.replaceAll("_", " ");

  return (
    <span
      className={`
        inline-flex items-center
        rounded-full
        border
        px-2.5
        py-1
        text-xs
        font-semibold
        ${style}
      `}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />

      {label}
    </span>
  );
}
```
