import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileDown,
  Filter,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Target,
  Trash2,
  User,
  X,
  Zap,
} from "lucide-react";

import {
  createAcaoCorretiva,
  deleteAcaoCorretiva,
  getAcoesCorretivas,
  getNaoConformidades,
  updateAcaoCorretiva,
} from "../services/api";

import StatusBadge from "../components/StatusBadge";

interface NaoConformidade {
  id: number;
  codigo: string;
  descricao: string;
}

interface AcaoCorretiva {
  id: number;
  numero: string;
  nao_conformidade_id?: number;
  responsavel: string;
  data_abertura: string;
  prazo: string;
  plano_acao: string;
  status: string;
  observacoes?: string;
  percentual?: number;
  naoConformidade?: NaoConformidade;
}

interface FormData {
  numero: string;
  nao_conformidade_id: string;
  responsavel: string;
  data_abertura: string;
  prazo: string;
  plano_acao: string;
  status: string;
  observacoes: string;
  percentual: string;
}

const initialForm: FormData = {
  numero: "",
  nao_conformidade_id: "",
  responsavel: "",
  data_abertura: "",
  prazo: "",
  plano_acao: "",
  status: "ABERTA",
  observacoes: "",
  percentual: "0",
};

export default function AcoesCorretivas() {
  const [acoes, setAcoes] = useState<AcaoCorretiva[]>([]);
  const [naoConformidades, setNaoConformidades] = useState<
    NaoConformidade[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");

  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<AcaoCorretiva | null>(null);

  const [form, setForm] = useState<FormData>(initialForm);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [acoesResponse, ncResponse] = await Promise.all([
        getAcoesCorretivas(),
        getNaoConformidades(),
      ]);

      const acoesData = Array.isArray(acoesResponse)
        ? acoesResponse
        : acoesResponse?.data || [];

      const ncData = Array.isArray(ncResponse)
        ? ncResponse
        : ncResponse?.data || [];

      setAcoes(acoesData);
      setNaoConformidades(ncData);
    } catch {
      setError(
        "Não foi possível carregar as ações corretivas."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreate() {
    setEditingId(null);

    const today = new Date();
    const prazo = new Date();

    prazo.setDate(prazo.getDate() + 30);

    setForm({
      ...initialForm,
      numero: `AC-${Date.now().toString().slice(-6)}`,
      data_abertura: today.toISOString().split("T")[0],
      prazo: prazo.toISOString().split("T")[0],
    });

    setError("");
    setModalOpen(true);
  }

  function openEdit(item: AcaoCorretiva) {
    setEditingId(item.id);

    setForm({
      numero: item.numero || "",
      nao_conformidade_id: item.nao_conformidade_id
        ? String(item.nao_conformidade_id)
        : "",
      responsavel: item.responsavel || "",
      data_abertura: formatDateInput(item.data_abertura),
      prazo: formatDateInput(item.prazo),
      plano_acao: item.plano_acao || "",
      status: item.status || "ABERTA",
      observacoes: item.observacoes || "",
      percentual: String(item.percentual ?? 0),
    });

    setError("");
    setModalOpen(true);
  }

  function openView(item: AcaoCorretiva) {
    setSelected(item);
    setViewOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
    setError("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setError("");

    if (
      !form.numero ||
      !form.responsavel ||
      !form.data_abertura ||
      !form.prazo ||
      !form.plano_acao
    ) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        numero: form.numero,
        nao_conformidade_id: form.nao_conformidade_id
          ? Number(form.nao_conformidade_id)
          : undefined,
        responsavel: form.responsavel,
        data_abertura: form.data_abertura,
        prazo: form.prazo,
        plano_acao: form.plano_acao,
        status: form.status,
        observacoes: form.observacoes,
        percentual: Number(form.percentual || 0),
      };

      if (editingId) {
        await updateAcaoCorretiva(editingId, payload);
      } else {
        await createAcaoCorretiva(payload);
      }

      closeModal();
      await loadData();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Não foi possível salvar a ação corretiva."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (
      !window.confirm(
        "Deseja realmente excluir esta ação corretiva?"
      )
    ) {
      return;
    }

    try {
      await deleteAcaoCorretiva(id);
      await loadData();
    } catch {
      alert("Não foi possível excluir a ação corretiva.");
    }
  }

  function exportCSV() {
    const header = [
      "Número",
      "NC Relacionada",
      "Responsável",
      "Data de Abertura",
      "Prazo",
      "Plano de Ação",
      "Status",
      "Percentual",
      "Observações",
    ];

    const rows = filteredAcoes.map((item) => [
      item.numero,
      getNcCode(item.nao_conformidade_id),
      item.responsavel,
      formatDate(item.data_abertura),
      formatDate(item.prazo),
      item.plano_acao,
      statusLabel(item.status),
      `${item.percentual ?? 0}%`,
      item.observacoes || "",
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replaceAll('"', '""')}"`
          )
          .join(";")
      )
      .join("\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "acoes-corretivas-atlas-gestao.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  function getNcCode(id?: number) {
    if (!id) return "-";

    const nc = naoConformidades.find(
      (item) => item.id === id
    );

    return nc?.codigo || `NC #${id}`;
  }

  const filteredAcoes = useMemo(() => {
    const term = search.toLowerCase().trim();

    return acoes.filter((item) => {
      const searchable = [
        item.numero,
        item.responsavel,
        item.plano_acao,
        item.observacoes,
        getNcCode(item.nao_conformidade_id),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !term || searchable.includes(term);

      const matchesStatus =
        statusFilter === "TODOS" ||
        item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [acoes, search, statusFilter, naoConformidades]);

  const stats = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const abertas = acoes.filter(
      (item) => item.status === "ABERTA"
    ).length;

    const andamento = acoes.filter(
      (item) => item.status === "EM_ANDAMENTO"
    ).length;

    const concluidas = acoes.filter(
      (item) => item.status === "CONCLUIDA"
    ).length;

    const atrasadas = acoes.filter((item) => {
      if (item.status === "CONCLUIDA") return false;

      const prazo = new Date(item.prazo);
      prazo.setHours(0, 0, 0, 0);

      return prazo < hoje;
    }).length;

    return {
      total: acoes.length,
      abertas,
      andamento,
      concluidas,
      atrasadas,
    };
  }, [acoes]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400">
            <Target size={23} />
          </div>

          <div>
            <h1 className="page-title">
              Ações Corretivas
            </h1>

            <p className="page-subtitle">
              Transforme não conformidades em planos de melhoria.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="btn-secondary"
          >
            <FileDown size={17} />
            Exportar
          </button>

          <button
            onClick={openCreate}
            className="btn-primary"
          >
            <Plus size={18} />
            Nova ação corretiva
          </button>
        </div>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          title="Total"
          value={stats.total}
          icon={Target}
          className="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          title="Abertas"
          value={stats.abertas}
          icon={AlertTriangle}
          className="bg-yellow-50 text-yellow-600"
        />

        <SummaryCard
          title="Em andamento"
          value={stats.andamento}
          icon={Zap}
          className="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          title="Concluídas"
          value={stats.concluidas}
          icon={CheckCircle2}
          className="bg-green-50 text-green-600"
        />

        <SummaryCard
          title="Atrasadas"
          value={stats.atrasadas}
          icon={Clock}
          className="bg-red-50 text-red-600"
        />
      </div>

      {/* ALERTA */}
      {stats.atrasadas > 0 && (
        <div className="flex items-center gap-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-500/20">
            <AlertTriangle size={21} />
          </div>

          <div>
            <p className="font-semibold text-red-800 dark:text-red-400">
              Existem {stats.atrasadas} ação(ões) corretiva(s) atrasada(s).
            </p>

            <p className="text-sm text-red-700 dark:text-red-500">
              Verifique os prazos e atualize os planos de ação.
            </p>
          </div>
        </div>
      )}

      {/* FILTROS */}
      <div className="card p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="input pl-10"
              placeholder="Pesquisar número, NC, responsável ou plano..."
            />
          </div>

          <div className="relative">
            <Filter
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="input min-w-52 pl-9"
            >
              <option value="TODOS">
                Todos os status
              </option>

              <option value="ABERTA">
                Aberta
              </option>

              <option value="EM_ANDAMENTO">
                Em andamento
              </option>

              <option value="CONCLUIDA">
                Concluída
              </option>

              <option value="ATRASADA">
                Atrasada
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* TABELA */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                <th className="table-head">
                  Número
                </th>

                <th className="table-head">
                  NC relacionada
                </th>

                <th className="table-head">
                  Responsável
                </th>

                <th className="table-head">
                  Abertura
                </th>

                <th className="table-head">
                  Prazo
                </th>

                <th className="table-head">
                  Plano de ação
                </th>

                <th className="table-head">
                  Progresso
                </th>

                <th className="table-head">
                  Status
                </th>

                <th className="table-head text-right">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <LoadingRows />
              ) : filteredAcoes.length === 0 ? (
                <EmptyState />
              ) : (
                filteredAcoes.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                  >
                    <td className="table-cell">
                      <span className="font-semibold text-blue-600">
                        {item.numero}
                      </span>
                    </td>

                    <td className="table-cell">
                      <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 dark:bg-red-500/10">
                        {getNcCode(
                          item.nao_conformidade_id
                        )}
                      </span>
                    </td>

                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <User
                          size={15}
                          className="text-slate-400"
                        />

                        {item.responsavel}
                      </div>
                    </td>

                    <td className="table-cell">
                      {formatDate(item.data_abertura)}
                    </td>

                    <td className="table-cell">
                      <Deadline
                        prazo={item.prazo}
                        status={item.status}
                      />
                    </td>

                    <td className="table-cell">
                      <p className="max-w-xs truncate text-sm text-slate-600 dark:text-slate-400">
                        {item.plano_acao}
                      </p>
                    </td>

                    <td className="table-cell">
                      <ProgressBar
                        value={item.percentual ?? 0}
                      />
                    </td>

                    <td className="table-cell">
                      <StatusBadge
                        status={item.status}
                      />
                    </td>

                    <td className="table-cell">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() =>
                            openView(item)
                          }
                          className="icon-button"
                          title="Visualizar"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          onClick={() =>
                            openEdit(item)
                          }
                          className="icon-button"
                          title="Editar"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(item.id)
                          }
                          className="icon-button text-red-500 hover:bg-red-50 hover:text-red-600"
                          title="Excluir"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-sm text-slate-500 dark:border-slate-700">
          Exibindo{" "}
          <strong className="text-slate-700 dark:text-slate-300">
            {filteredAcoes.length}
          </strong>{" "}
          de{" "}
          <strong className="text-slate-700 dark:text-slate-300">
            {acoes.length}
          </strong>{" "}
          ações corretivas
        </div>
      </div>

      {/* MODAL CADASTRO */}
      {modalOpen && (
        <Modal
          title={
            editingId
              ? "Editar ação corretiva"
              : "Nova ação corretiva"
          }
          onClose={closeModal}
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                label="Número"
                required
              >
                <input
                  value={form.numero}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      numero: e.target.value,
                    })
                  }
                  className="input"
                  placeholder="AC-000001"
                />
              </Field>

              <Field label="Não conformidade relacionada">
                <select
                  value={form.nao_conformidade_id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nao_conformidade_id:
                        e.target.value,
                    })
                  }
                  className="input"
                >
                  <option value="">
                    Nenhuma NC relacionada
                  </option>

                  {naoConformidades.map((nc) => (
                    <option
                      key={nc.id}
                      value={nc.id}
                    >
                      {nc.codigo} —{" "}
                      {nc.descricao.slice(0, 60)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Responsável"
                required
              >
                <input
                  value={form.responsavel}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      responsavel:
                        e.target.value,
                    })
                  }
                  className="input"
                  placeholder="Responsável pela ação"
                />
              </Field>

              <Field
                label="Data de abertura"
                required
              >
                <input
                  type="date"
                  value={form.data_abertura}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      data_abertura:
                        e.target.value,
                    })
                  }
                  className="input"
                />
              </Field>

              <Field
                label="Prazo"
                required
              >
                <input
                  type="date"
                  value={form.prazo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      prazo: e.target.value,
                    })
                  }
                  className="input"
                />
              </Field>

              <Field
                label="Status"
                required
              >
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value,
                    })
                  }
                  className="input"
                >
                  <option value="ABERTA">
                    Aberta
                  </option>

                  <option value="EM_ANDAMENTO">
                    Em andamento
                  </option>

                  <option value="CONCLUIDA">
                    Concluída
                  </option>

                  <option value="ATRASADA">
                    Atrasada
                  </option>
                </select>
              </Field>

              <Field label="Percentual concluído">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={form.percentual}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        percentual:
                          e.target.value,
                      })
                    }
                    className="w-full"
                  />

                  <span className="w-12 text-right text-sm font-bold text-blue-600">
                    {form.percentual}%
                  </span>
                </div>
              </Field>
            </div>

            <Field
              label="Plano de ação"
              required
            >
              <textarea
                value={form.plano_acao}
                onChange={(e) =>
                  setForm({
                    ...form,
                    plano_acao: e.target.value,
                  })
                }
                rows={6}
                className="input resize-none"
                placeholder="Descreva as ações que serão realizadas para eliminar a causa da não conformidade..."
              />
            </Field>

            <Field label="Observações">
              <textarea
                value={form.observacoes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    observacoes:
                      e.target.value,
                  })
                }
                rows={4}
                className="input resize-none"
                placeholder="Informações complementares..."
              />
            </Field>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-700">
              <button
                type="button"
                onClick={closeModal}
                className="btn-secondary"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
              >
                {saving ? (
                  <>
                    <RefreshCw
                      size={17}
                      className="animate-spin"
                    />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Salvar ação
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL VISUALIZAÇÃO */}
      {viewOpen && selected && (
        <Modal
          title="Detalhes da ação corretiva"
          onClose={() => setViewOpen(false)}
        >
          <div className="space-y-5">
            <div className="flex flex-col justify-between gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center dark:bg-slate-800">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Número
                </p>

                <p className="mt-1 text-xl font-bold text-blue-600">
                  {selected.numero}
                </p>
              </div>

              <StatusBadge
                status={selected.status}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoItem
                label="NC relacionada"
                value={getNcCode(
                  selected.nao_conformidade_id
                )}
                icon={AlertTriangle}
              />

              <InfoItem
                label="Responsável"
                value={selected.responsavel}
                icon={User}
              />

              <InfoItem
                label="Data de abertura"
                value={formatDate(
                  selected.data_abertura
                )}
                icon={Calendar}
              />

              <InfoItem
                label="Prazo"
                value={formatDate(
                  selected.prazo
                )}
                icon={Clock}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Progresso
                </p>

                <span className="text-sm font-bold text-blue-600">
                  {selected.percentual ?? 0}%
                </span>
              </div>

              <ProgressBar
                value={selected.percentual ?? 0}
                large
              />
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Plano de ação
              </p>

              <div className="rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {selected.plano_acao}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Observações
              </p>

              <div className="rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {selected.observacoes ||
                  "Nenhuma observação registrada."}
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 pt-4 dark:border-slate-700">
              <button
                onClick={() => setViewOpen(false)}
                className="btn-secondary"
              >
                Fechar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* =========================================================
   COMPONENTES
========================================================= */

function SummaryCard({
  title,
  value,
  icon: Icon,
  className,
}: {
  title: string;
  value: number;
  icon: typeof Target;
  className: string;
}) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${className}`}
      >
        <Icon size={22} />
      </div>

      <div>
        <p className="text-sm text-slate-500">
          {title}
        </p>

        <p className="font-poppins text-2xl font-bold text-slate-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function Deadline({
  prazo,
  status,
}: {
  prazo: string;
  status: string;
}) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataPrazo = new Date(prazo);
  dataPrazo.setHours(0, 0, 0, 0);

  const atrasada =
    status !== "CONCLUIDA" &&
    dataPrazo < hoje;

  return (
    <div
      className={`flex items-center gap-2 ${
        atrasada
          ? "font-semibold text-red-600"
          : "text-slate-600 dark:text-slate-400"
      }`}
    >
      <Calendar size={15} />

      {formatDate(prazo)}

      {atrasada && (
        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-600">
          Atrasada
        </span>
      )}
    </div>
  );
}

function ProgressBar({
  value,
  large = false,
}: {
  value: number;
  large?: boolean;
}) {
  const percentage = Math.min(
    100,
    Math.max(0, value)
  );

  return (
    <div className={large ? "w-full" : "w-28"}>
      <div className="mb-1 flex justify-end">
        {!large && (
          <span className="text-xs font-semibold text-slate-500">
            {percentage}%
          </span>
        )}
      </div>

      <div
        className={`overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 ${
          large ? "h-3" : "h-2"
        }`}
      >
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof User;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
      <div className="mb-2 flex items-center gap-2 text-slate-400">
        <Icon size={15} />

        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="font-poppins text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[calc(90vh-70px)] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index}>
          {Array.from({ length: 9 }).map((_, column) => (
            <td
              key={column}
              className="px-5 py-4"
            >
              <div className="h-5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <tr>
      <td
        colSpan={9}
        className="px-5 py-16 text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
          <Target size={25} />
        </div>

        <p className="mt-4 font-semibold text-slate-700 dark:text-slate-300">
          Nenhuma ação corretiva encontrada
        </p>

        <p className="mt-1 text-sm text-slate-400">
          Cadastre uma ação ou altere os filtros.
        </p>
      </td>
    </tr>
  );
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    ABERTA: "Aberta",
    EM_ANDAMENTO: "Em andamento",
    CONCLUIDA: "Concluída",
    ATRASADA: "Atrasada",
  };

  return labels[status] || status;
}

function formatDate(date: string) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("pt-BR");
}

function formatDateInput(date: string) {
  if (!date) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().split("T")[0];
}
