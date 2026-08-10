```tsx
import {
  FormEvent,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
} from "lucide-react";

import {
  login,
} from "../services/api";

export default function Login() {
  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState(
      "admin@atlasgestao.com"
    );

  const [senha, setSenha] =
    useState(
      "Admin@123"
    );

  const [mostrarSenha, setMostrarSenha] =
    useState(false);

  const [carregando, setCarregando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setErro("");

    if (!email || !senha) {
      setErro(
        "Informe seu e-mail e senha."
      );

      return;
    }

    try {
      setCarregando(true);

      await login(
        email,
        senha
      );

      navigate(
        "/dashboard",
        {
          replace: true,
        }
      );
    } catch (error: any) {
      setErro(
        error?.response
          ?.data?.message ||
          "Não foi possível realizar o login."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* LADO ESQUERDO */}
      <div className="relative hidden overflow-hidden bg-blue-600 lg:flex lg:w-1/2">

        <div className="absolute inset-0">

          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/10" />

          <div className="absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full bg-white/10" />

          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-400/10" />

        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center px-16 xl:px-24">

          <div className="mb-10 flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-2xl">
              <ShieldCheck
                size={38}
              />
            </div>

            <div>

              <h1 className="font-poppins text-3xl font-bold text-white">
                Atlas Gestão
              </h1>

              <p className="text-blue-100">
                Gestão da Qualidade
              </p>

            </div>

          </div>

          <h2 className="max-w-xl font-poppins text-4xl font-bold leading-tight text-white xl:text-5xl">
            Gestão Inteligente da Qualidade para Empresas Modernas
          </h2>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-blue-100">
            Controle inspeções, auditorias,
            não conformidades, ações
            corretivas e documentos em uma
            única plataforma.
          </p>

          <div className="mt-10 grid max-w-lg grid-cols-2 gap-4">

            <Feature
              title="Indicadores"
              description="KPIs em tempo real"
            />

            <Feature
              title="Auditorias"
              description="Controle completo"
            />

            <Feature
              title="Documentos"
              description="Gestão de revisões"
            />

            <Feature
              title="Relatórios"
              description="PDF e Excel"
            />

          </div>

        </div>

      </div>

      {/* LADO DIREITO */}
      <div className="flex flex-1 items-center justify-center p-6">

        <div className="w-full max-w-md">

          {/* LOGO MOBILE */}
          <div className="mb-8 flex justify-center lg:hidden">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                <ShieldCheck
                  size={28}
                />
              </div>

              <div>
                <h1 className="font-poppins text-xl font-bold text-slate-900">
                  Atlas Gestão
                </h1>

                <p className="text-xs text-slate-500">
                  Gestão da Qualidade
                </p>
              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">

            <div className="mb-8">

              <h2 className="font-poppins text-2xl font-bold text-slate-900">
                Bem-vindo de volta
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Entre na sua conta para
                acessar o sistema.
              </p>

            </div>

            {/* ERRO */}
            {erro && (
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">

                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  {erro}
                </span>

              </div>
            )}

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5"
            >

              {/* E-MAIL */}
              <div>

                <label className="label">
                  E-mail
                </label>

                <div className="relative">

                  <Mail
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target
                          .value
                      )
                    }
                    placeholder="seu@email.com"
                    className="input pl-10"
                    autoComplete="email"
                  />

                </div>

              </div>

              {/* SENHA */}
              <div>

                <label className="label">
                  Senha
                </label>

                <div className="relative">

                  <Lock
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={
                      mostrarSenha
                        ? "text"
                        : "password"
                    }
                    value={senha}
                    onChange={(event) =>
                      setSenha(
                        event.target
                          .value
                      )
                    }
                    placeholder="Digite sua senha"
                    className="input px-10"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarSenha(
                        !mostrarSenha
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {mostrarSenha ? (
                      <EyeOff
                        size={19}
                      />
                    ) : (
                      <Eye
                        size={19}
                      />
                    )}
                  </button>

                </div>

              </div>

              {/* RECUPERAR */}
              <div className="flex justify-end">

                <button
                  type="button"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Esqueci minha senha
                </button>

              </div>

              {/* ENTRAR */}
              <button
                type="submit"
                disabled={
                  carregando
                }
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {carregando ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />

                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar
                  </>
                )}

              </button>

            </form>

            {/* CREDENCIAL */}
            <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">

              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                Acesso inicial
              </p>

              <p className="text-xs text-blue-600">
                admin@atlasgestao.com
              </p>

              <p className="text-xs text-blue-600">
                Senha: Admin@123
              </p>

            </div>

          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()}
            {" "}
            Atlas Gestão. Todos os direitos
            reservados.
          </p>

        </div>

      </div>

    </div>
  );
}

interface FeatureProps {
  title: string;
  description: string;
}

function Feature({
  title,
  description,
}: FeatureProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">

      <p className="font-semibold text-white">
        {title}
      </p>

      <p className="mt-1 text-sm text-blue-100">
        {description}
      </p>

    </div>
  );
}
```
