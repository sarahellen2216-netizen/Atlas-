```tsx
import {
  useState,
} from "react";

import {
  Outlet,
  NavLink,
  useLocation,
} from "react-router-dom";

import {
  LayoutDashboard,
  ClipboardCheck,
  AlertTriangle,
  CheckSquare,
  SearchCheck,
  FileText,
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  ShieldCheck,
  Moon,
  Sun,
} from "lucide-react";

import {
  getUsuario,
  logout,
} from "../services/api";

const menu = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Inspeções",
    path: "/inspecoes",
    icon: ClipboardCheck,
  },
  {
    label: "Não Conformidades",
    path: "/nao-conformidades",
    icon: AlertTriangle,
  },
  {
    label: "Ações Corretivas",
    path: "/acoes-corretivas",
    icon: CheckSquare,
  },
  {
    label: "Auditorias",
    path: "/auditorias",
    icon: SearchCheck,
  },
  {
    label: "Documentos",
    path: "/documentos",
    icon: FileText,
  },
  {
    label: "Relatórios",
    path: "/relatorios",
    icon: BarChart3,
  },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(
      localStorage.getItem(
        "atlas_theme"
      ) === "dark"
    );

  const usuario =
    getUsuario();

  const location =
    useLocation();

  const isAdmin =
    usuario?.perfil ===
    "ADMINISTRADOR";

  function toggleTheme() {
    const next = !darkMode;

    setDarkMode(next);

    if (next) {
      document.documentElement.classList.add(
        "dark"
      );

      localStorage.setItem(
        "atlas_theme",
        "dark"
      );
    } else {
      document.documentElement.classList.remove(
        "dark"
      );

      localStorage.setItem(
        "atlas_theme",
        "light"
      );
    }
  }

  const currentPage =
    menu.find(
      (item) =>
        location.pathname ===
        item.path
    );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          w-72
          flex-col
          border-r
          border-slate-200
          bg-white
          transition-transform
          dark:border-slate-800
          dark:bg-slate-900

          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >

        {/* LOGO */}
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6 dark:border-slate-800">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <ShieldCheck
                size={26}
              />
            </div>

            <div>
              <h1 className="font-poppins text-lg font-bold text-slate-900 dark:text-white">
                Atlas Gestão
              </h1>

              <p className="text-xs text-slate-500">
                Gestão da Qualidade
              </p>
            </div>

          </div>

          <button
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <X size={20} />
          </button>

        </div>

        {/* MENU */}
        <nav className="flex-1 overflow-y-auto p-4">

          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Gestão
          </p>

          <div className="space-y-1">

            {menu.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() =>
                      setSidebarOpen(
                        false
                      )
                    }
                    className={({ isActive }) =>
                      `
                      flex
                      items-center
                      gap-3
                      rounded-lg
                      px-3
                      py-3
                      text-sm
                      font-medium
                      transition

                      ${
                        isActive
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                      }
                      `
                    }
                  >
                    <Icon
                      size={19}
                    />

                    <span>
                      {item.label}
                    </span>
                  </NavLink>
                );
              }
            )}

          </div>

          <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Sistema
          </p>

          <div className="space-y-1">

            {isAdmin && (
              <NavLink
                to="/usuarios"
                className={({ isActive }) =>
                  `
                  flex
                  items-center
                  gap-3
                  rounded-lg
                  px-3
                  py-3
                  text-sm
                  font-medium
                  transition

                  ${
                    isActive
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  }
                  `
                }
              >
                <Users size={19} />
                Usuários
              </NavLink>
            )}

            <NavLink
              to="/configuracoes"
              className={({ isActive }) =>
                `
                flex
                items-center
                gap-3
                rounded-lg
                px-3
                py-3
                text-sm
                font-medium

                ${
                  isActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                }
                `
              }
            >
              <Settings size={19} />
              Configurações
            </NavLink>

          </div>

        </nav>

        {/* USUÁRIO */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">

          <div className="mb-3 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              {usuario?.nome
                ?.charAt(0)
                .toUpperCase() ||
                "U"}
            </div>

            <div className="min-w-0 flex-1">

              <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                {usuario?.nome ||
                  "Usuário"}
              </p>

              <p className="truncate text-xs text-slate-500">
                {usuario?.perfil ||
                  "Visualizador"}
              </p>

            </div>

          </div>

          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <LogOut size={18} />
            Sair
          </button>

        </div>

      </aside>

      {/* CONTEÚDO */}
      <div className="lg:pl-72">

        {/* HEADER */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-8 dark:border-slate-800 dark:bg-slate-900/95">

          <div className="flex items-center gap-4">

            <button
              onClick={() =>
                setSidebarOpen(
                  true
                )
              }
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div>
              <h2 className="font-poppins text-lg font-semibold text-slate-900 dark:text-white">
                {currentPage?.label ||
                  "Atlas Gestão"}
              </h2>

              <p className="hidden text-xs text-slate-500 sm:block">
                Gestão inteligente da qualidade
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2">

            {/* TEMA */}
            <button
              onClick={
                toggleTheme
              }
              className="rounded-lg p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              title="Alterar tema"
            >
              {darkMode ? (
                <Sun size={20} />
              ) : (
                <Moon size={20} />
              )}
            </button>

            {/* NOTIFICAÇÕES */}
            <button
              className="relative rounded-lg p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              title="Notificações"
            >
              <Bell size={20} />

              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

          </div>

        </header>

        {/* PÁGINA */}
        <main className="min-h-[calc(100vh-80px)] p-4 md:p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
}
```
