```tsx
import {
  ArrowDown,
  ArrowUp,
  LucideIcon,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  iconClassName?: string;
  trend?: number;
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName = "bg-blue-50 text-blue-600",
  trend,
}: StatCardProps) {
  const hasTrend =
    typeof trend === "number";

  return (
    <div className="card p-5 transition hover:-translate-y-0.5 hover:shadow-lg">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-2 font-poppins text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-slate-400">
              {description}
            </p>
          )}

        </div>

        <div
          className={`
            flex h-11 w-11
            items-center justify-center
            rounded-xl
            ${iconClassName}
          `}
        >
          <Icon size={21} />
        </div>

      </div>

      {hasTrend && (
        <div className="mt-4 flex items-center gap-2">

          <span
            className={`
              inline-flex items-center gap-1
              text-xs font-semibold
              ${
                trend >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }
            `}
          >
            {trend >= 0 ? (
              <ArrowUp size={14} />
            ) : (
              <ArrowDown size={14} />
            )}

            {Math.abs(trend)}%
          </span>

          <span className="text-xs text-slate-400">
            em relação ao período anterior
          </span>

        </div>
      )}

    </div>
  );
}
```
