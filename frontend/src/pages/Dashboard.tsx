```tsx
import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  ClipboardCheck,
  AlertTriangle,
  CheckSquare,
  SearchCheck,
  FileText,
  TrendingUp,
  Plus,
  FileBarChart,
  Clock,
  PackageCheck,
  PackageX,
  RefreshCw,
  ArrowRight,
  CalendarClock,
} from "lucide-react";

import {
  getDashboard,
} from "../services/api";

import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";

interface DashboardData {
  cards: {
    inspecoes: number;
    naoConformidades: number;
    acoesAbertas: number;
    acoesConcluidas: number;
    auditorias: number;
    documentos: number;
    conformes: number;
    reprovados: number;
    taxaConformidade: number;
  };

  graficos: {
    inspecoesPorMes: {
      mes: string;
      total: number;
      conformes: number;
    }[];
  };
}

export default function Dashboard() {
  const [data, setData] =
    useState<DashboardData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadDashboard() {
    try {
      setError("");

      const response =
        await getDashboard();

      setData(response);
    } catch {
      setError(
        "Não foi possível carregar os indicadores."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();

    const interval =
      window.setInterval(
        loadDashboard,
        30000
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, []);

  if (loading) {
    return (
      <DashboardLoading />
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-7xl">

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">

          <AlertTriangle
            className="mx-auto text-red-500"
            size={32}
          />

          <p className="mt-3 font-semibold text-red-700">
            {error}
          </p>

          <button
            onClick={
              loadDashboard
            }
            className="btn-primary mt-4"
          >
            <RefreshCw size={17} />
            Tentar novamente
          </button>

        </div>

      </div>
    );
  }

  const {
    cards,
    graficos,
  } = data;

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* CABEÇALHO */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="page-title">
            Dashboard
          </h1>

          <p className="page-subtitle">
            Visão geral da qualidade da empresa.
          </p>
        </div>

        <div className="flex items-center gap-2">

          <button
            onClick={
              loadDashboard
            }
            className="btn-secondary"
          >
            <RefreshCw
              size={17}
            />
            Atualizar
          </button>

          <Link
            to="/relatorios"
            className="btn-primary"
          >
            <FileBarChart
              size={17}
            />
            Relatórios
          </Link>

        </div>

      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Inspeções realizadas"
          value={cards.inspecoes}
          icon={ClipboardCheck}
          iconClassName="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
        />

        <StatCard
          title="Não conformidades"
          value={cards.naoConformidades}
          icon={AlertTriangle}
          iconClassName="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
        />

        <StatCard
          title="Ações abertas"
          value={cards.acoesAbertas}
          icon={CheckSquare}
          iconClassName="bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400"
        />

        <StatCard
          title="Taxa de conformidade"
          value={`${cards.taxaConformidade}%`}
          icon={TrendingUp}
          iconClassName="bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
        />

      </div>

      {/* SEGUNDA LINHA */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Ações concluídas"
          value={cards.acoesConcluidas}
          icon={CheckSquare}
          iconClassName="bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
        />

        <StatCard
          title="Auditorias realizadas"
          value={cards.auditorias}
          icon={SearchCheck}
          iconClassName="bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
        />

        <StatCard
          title="Produtos aprovados"
          value={cards.conformes}
          icon={PackageCheck}
          iconClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
        />

        <StatCard
          title="Produtos reprovados"
          value={cards.reprovados}
          icon={PackageX}
          iconClassName="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
        />

      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* INSPEÇÕES POR MÊS */}
        <div className="card p-6 xl:col-span-2">

          <div className="mb-6 flex items-center justify-between">

            <div>
              <h2 className="font-poppins text-lg font-semibold text-slate-900 dark:text-white">
                Inspeções por período
              </h2>

              <p className="text-sm text-slate-500">
                Comparativo de inspeções realizadas.
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <ClipboardCheck
                size={20}
              />
            </div>

          </div>

          <InspectionChart
            data={
              graficos.inspecoesPorMes
            }
          />

        </div>

        {/* TAXA */}
        <div className="card p-6">

          <h2 className="font-poppins text-lg font-semibold text-slate-900 dark:text-white">
            Taxa de conformidade
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Resultado geral das inspeções.
          </p>

          <div className="flex flex-1 flex-col items-center justify-center py-8">

            <div className="relative flex h-48 w-48 items-center justify-center">

              <svg
                className="h-48 w-48 -rotate-90"
                viewBox="0 0 120 120"
              >

                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-slate-100 dark:text-slate-700"
                />

                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray="314"
                  strokeDashoffset={
                    314 -
                    (314 *
                      cards.taxaConformidade) /
                      100
                  }
                  className="text-green-500 transition-all duration-1000"
                />

              </svg>

              <div className="absolute text-center">

                <p className="font-poppins text-4xl font-bold text-slate-900 dark:text-white">
                  {cards.taxaConformidade}%
                </p>

                <p className="text-xs text-slate-500">
                  conformidade
                </p>

              </div>

            </div>

            <div className="mt-5 grid w-full grid-cols-2 gap-3">

              <div className="rounded-lg bg-green-50 p-3 text-center dark:bg-green-500/10">

                <p className="text-2xl font-bold text-green-600">
                  {cards.conformes}
                </p>

                <p className="text-xs text-green-700">
                  Aprovados
                </p>

              </div>

              <div className="rounded-lg bg-red-50 p-3 text-center dark:bg-red-500/10">

                <p className="text-2xl font-bold text-red-600">
                  {cards.reprovados}
                </p>

                <p className="text-xs text-red-700">
                  Reprovados
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ATALHOS E RESUMO */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* ATALHOS */}
        <div className="card p-6">

          <div className="mb-5">

            <h2 className="font-poppins text-lg font-semibold text-slate-900 dark:text-white">
              Ações rápidas
            </h2>

            <p className="text-sm text-slate-500">
              Acesse rapidamente as principais funções.
            </p>

          </div>

          <div className="grid grid-cols-2 gap-3">

            <QuickAction
              to="/inspecoes"
              icon={ClipboardCheck}
              title="Nova inspeção"
            />

            <QuickAction
              to="/auditorias"
              icon={SearchCheck}
              title="Nova auditoria"
            />

            <QuickAction
              to="/nao-conformidades"
              icon={AlertTriangle}
              title="Nova não conformidade"
            />

            <QuickAction
              to="/acoes-corretivas"
              icon={CheckSquare}
              title="Nova ação corretiva"
            />

            <QuickAction
              to="/documentos"
              icon={FileText}
              title="Novo documento"
            />

            <QuickAction
              to="/relatorios"
              icon={FileBarChart}
              title="Gerar relatório"
            />

          </div>

        </div>

        {/* RESUMO */}
        <div className="card p-6">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="font-poppins text-lg font-semibold text-slate-900 dark:text-white">
                Status da qualidade
              </h2>

              <p className="text-sm text-slate-500">
                Resumo dos principais indicadores.
              </p>
            </div>

            <TrendingUp
              className="text-green-500"
              size={22}
            />

          </div>

          <div className="space-y-4">

            <ProgressRow
              label="Conformidade"
              value={
                cards.taxaConformidade
              }
              color="green"
            />

            <ProgressRow
              label="Ações concluídas"
              value={
                cards.acoesAbertas +
                  cards.acoesConcluidas >
                0
                  ? Math.round(
                      (cards.acoesConcluidas /
                        (cards.acoesAbertas +
                          cards.acoesConcluidas)) *
                        100
                    )
                  : 0
              }
              color="blue"
            />

            <ProgressRow
              label="Produtos aprovados"
              value={
                cards.conformes +
                  cards.reprovados >
                0
                  ? Math.round(
                      (cards.conformes /
                        (cards.conformes +
                          cards.reprovados)) *
                        100
                    )
                  : 0
              }
              color="green"
            />

          </div>

          <Link
            to="/relatorios"
            className="mt-6 flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >

            Ver todos os indicadores

            <ArrowRight
              size={17}
            />

          </Link>

        </div>

      </div>

      {/* ALERTA */}
      {(cards.naoConformidades > 0 ||
        cards.acoesAbertas > 0) && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 dark:border-yellow-500/20 dark:bg-yellow-500/10">

          <div className="flex items-start gap-4">

            <div className="rounded-lg bg-yellow-100 p-2 text-yellow-600 dark:bg-yellow-500/20">
              <CalendarClock
                size={22}
              />
            </div>

            <div className="flex-1">

              <h3 className="font-semibold text-yellow-800 dark:text-yellow-400">
                Existem pendências que precisam de atenção
              </h3>

              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-500">
                O sistema identificou{" "}
                {cards.naoConformidades}{" "}
                não conformidade(s) e{" "}
                {cards.acoesAbertas}{" "}
                ação(ões) corretiva(s) em aberto.
              </p>

            </div>

            <Link
              to="/acoes-corretivas"
              className="hidden items-center gap-1 text-sm font-semibold text-yellow-700 hover:underline sm:flex"
            >
              Ver pendências
              <ArrowRight
                size={15}
              />
            </Link>

          </div>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   GRÁFICO
========================================================= */

function InspectionChart({
  data,
}: {
  data: {
    mes: string;
    total: number;
    conformes: number;
  }[];
}) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        Nenhuma inspeção registrada.
      </div>
    );
  }

  const max =
    Math.max(
      ...data.map(
        (item) => item.total
      ),
      1
    );

  return (
    <div className="flex h-64 items-end gap-2 overflow-x-auto px-2">

      {data.map((item) => {

        const height =
          Math.max(
            (item.total /
              max) *
              100,
            5
          );

        const conformidade =
          item.total > 0
            ? Math.round(
                (item.conformes /
                  item.total) *
                  100
              )
            : 0;

        return (
          <div
            key={item.mes}
            className="flex min-w-14 flex-1 flex-col items-center justify-end gap-2"
          >

            <div className="group relative flex h-48 w-full items-end justify-center">

              <div
                className="w-full max-w-10 rounded-t-lg bg-blue-500 transition hover:bg-blue-600"
                style={{
                  height: `${height}%`,
                }}
              />

              <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg group-hover:block">

                <p>
                  Total:{" "}
                  {item.total}
                </p>

                <p>
                  Conformes:{" "}
                  {item.conformes}
                </p>

                <p>
                  Taxa:{" "}
                  {conformidade}%
                </p>

              </div>

            </div>

            <span className="text-xs text-slate-500">
              {formatMonth(
                item.mes
              )}
            </span>

          </div>
        );
      })}

    </div>
  );
}

function formatMonth(
  value: string
) {
  const [
    year,
    month,
  ] = value.split("-");

  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  return (
    months[
      Number(month) - 1
    ] || value
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  to,
  icon: Icon,
  title,
}: {
  to: string;
  icon: typeof Plus;
  title: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-blue-200 hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-blue-500/10"
    >

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-500/10 dark:text-blue-400">
        <Icon size={19} />
      </div>

      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {title}
      </span>

    </Link>
  );
}

/* =========================================================
   PROGRESS
========================================================= */

function ProgressRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "blue" | "green";
}) {
  const safeValue =
    Math.min(
      Math.max(value, 0),
      100
    );

  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {label}
        </span>

        <span className="text-sm font-bold text-slate-800 dark:text-white">
          {safeValue}%
        </span>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">

        <div
          className={`h-full rounded-full transition-all duration-700 ${
            color === "green"
              ? "bg-green-500"
              : "bg-blue-500"
          }`}
          style={{
            width: `${safeValue}%`,
          }}
        />

      </div>

    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">

      <div className="animate-pulse">

        <div className="mb-6 h-8 w-48 rounded bg-slate-200" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {Array.from({
            length: 8,
          }).map((_, index) => (
            <div
              key={index}
              className="h-32 rounded-xl bg-slate-200"
            />
          ))}

        </div>

      </div>

    </div>
  );
}
```
