```tsx
import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  X,
  Save,
  FileDown,
  AlertTriangle,
  Eye,
  Calendar,
  MapPin,
  Package,
  User,
  RefreshCw,
} from "lucide-react";

import {
  createInspecao,
  deleteInspecao,
  getInspecoes,
  updateInspecao,
} from "../services/api";

import StatusBadge from "../components/StatusBadge";

interface Inspecao {
  id: number;
  codigo: string;
  produto: string;
  lote: string;
  responsavel: string;
  data: string;
  local?: string;
  tipo: string;
  resultado: string;
  observacoes?: string;
  gravidade?: string;
}

interface FormData {
  codigo: string;
  produto: string;
  lote: string;
  responsavel: string;
  data: string;
  local: string;
  tipo: string;
  resultado: string;
  observacoes: string;
  gravidade: string;
}

const initialForm: FormData = {
  codigo: "",
  produto: "",
  lote: "",
  responsavel: "",
  data: "",
  local: "",
  tipo: "Recebimento",
  resultado: "CONFORME",
  observacoes: "",
  gravidade: "BAIXA",
};

export default function Inspecoes() {
  const [inspecoes, setInspecoes] =
    useState<Inspecao[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [resultadoFilter, setResultadoFilter] =
    useState("TODOS");

  const [tipoFilter, setTipoFilter] =
    useState("TODOS");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [viewOpen, setViewOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [selected, setSelected] =
    useState<Inspecao | null>(null);

  const [form, setForm] =
    useState<FormData>(
      initialForm
    );

  const [error, setError] =
    useState("");

  async function loadInspecoes() {
    try {
      setLoading(true);

      const response =
        await getInspecoes();

      setInspecoes(
        Array.isArray(response)
          ? response
          : response?.data || []
      );
    } catch {
      setError(
        "Não foi possível carregar as inspeções."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInspecoes();
  }, []);

  function openCreate() {
    setEditingId(null);

    setForm({
      ...initialForm,
      codigo: `INS-${Date.now()
        .toString()
        .slice(-6)}`,
      data: new Date()
        .toISOString()
        .split("T")[0],
    });

    setError("");
    setModalOpen(true);
  }

  function openEdit(
    inspecao: Inspecao
  ) {
    setEditingId(inspecao.id);

    setForm({
      codigo: inspecao.codigo || "",
      produto: inspecao.produto || "",
      lote: inspecao.lote || "",
      responsavel:
        inspecao.responsavel || "",
      data: formatDateInput(
        inspecao.data
      ),
      local: inspecao.local || "",
      tipo: inspecao.tipo || "Recebimento",
      resultado:
        inspecao.resultado ||
        "CONFORME",
      observacoes:
        inspecao.observacoes ||
        "",
      gravidade:
        inspecao.gravidade ||
        "BAIXA",
    });

    setError("");
    setModalOpen(true);
  }

  function openView(
    inspecao: Inspecao
  ) {
    setSelected(inspecao);
    setViewOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
    setError("");
  }

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");

    if (
      !form.codigo ||
      !form.produto ||
      !form.lote ||
      !form.responsavel ||
      !form.data
    ) {
      setError(
        "Preencha todos os campos obrigatórios."
      );

      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await updateInspecao(
          editingId,
          form
        );
      } else {
        await createInspecao(
          form
        );
      }

      closeModal();

      await loadInspecoes();
    } catch (err: any) {
      setError(
        err?.response?.data
          ?.message ||
          "Não foi possível salvar a inspeção."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    id: number
  ) {
    const confirmed =
      window.confirm(
        "Deseja realmente excluir esta inspeção?"
      );

    if (!confirmed) return;

    try {
      await deleteInspecao(id);

      await loadInspecoes();
    } catch {
      alert(
        "Não foi possível excluir a inspeção."
      );
    }
  }

  function exportCSV() {
    const header = [
      "Código",
      "Produto",
      "Lote",
      "Responsável",
      "Data",
      "Local",
      "Tipo",
      "Resultado",
      "Gravidade",
    ];

    const rows =
      filteredInspecoes.map(
        (item) => [
          item.codigo,
          item.produto,
          item.lote,
          item.responsavel,
          formatDate(item.data),
          item.local || "",
          item.tipo,
          item.resultado,
          item.gravidade || "",
        ]
      );

    const csv = [
      header,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value)
              .replaceAll(
                '"',
                '""'
              )}"`
          )
          .join(";")
      )
      .join("\n");

    const blob =
      new Blob(
        ["\ufeff" + csv],
        {
          type: "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;
    link.download =
      "inspecoes-atlas-gestao.csv";

    link.click();

    URL.revokeObjectURL(url);
  }

  const filteredInspecoes =
    inspecoes.filter(
      (item) => {
        const normalizedSearch =
          search
            .toLowerCase()
            .trim();

        const matchesSearch =
          !normalizedSearch ||
          [
            item.codigo,
            item.produto,
            item.lote,
            item.responsavel,
            item.local,
          ]
            .join(" ")
            .toLowerCase()
            .includes(
              normalizedSearch
            );

        const matchesResultado =
          resultadoFilter ===
            "TODOS" ||
          item.resultado ===
            resultadoFilter;

        const matchesTipo =
          tipoFilter === "TODOS" ||
          item.tipo ===
            tipoFilter;

        return (
          matchesSearch &&
          matchesResultado &&
          matchesTipo
        );
      }
    );

  const totalConforme =
    inspecoes.filter(
      (item) =>
        item.resultado ===
        "CONFORME"
    ).length;

  const totalNaoConforme =
    inspecoes.filter(
      (item) =>
        item.resultado ===
        "NAO_CONFORME"
    ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* CABEÇALHO */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <ClipboardCheck
                size={23}
              />
            </div>

            <div>
              <h1 className="page-title">
                Inspeções
              </h1>

              <p className="page-subtitle">
                Controle e acompanhamento das inspeções da qualidade.
              </p>
            </div>

          </div>
        </div>

        <div className="flex gap-2">

          <button
            onClick={
              exportCSV
            }
            className="btn-secondary"
          >
            <FileDown
              size={17}
            />
            Exportar
          </button>

          <button
            onClick={
              openCreate
            }
            className="btn-primary"
          >
            <Plus size={18} />
            Nova inspeção
          </button>

        </div>

      </div>

      {/* RESUMO */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <SummaryCard
          title="Total"
          value={
            inspecoes.length
          }
          icon={ClipboardCheck}
          className="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          title="Conformes"
          value={
            totalConforme
          }
          icon={Package}
          className="bg-green-50 text-green-600"
        />

        <SummaryCard
          title="Não conformes"
          value={
            totalNaoConforme
          }
          icon={AlertTriangle}
          className="bg-red-50 text-red-600"
        />

      </div>

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
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="Pesquisar por código, produto, lote ou responsável..."
              className="input pl-10"
            />

          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            <div className="relative">

              <Filter
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={
                  resultadoFilter
                }
                onChange={(event) =>
                  setResultadoFilter(
                    event.target
                      .value
                  )
                }
                className="input min-w-48 pl-9"
              >
                <option value="TODOS">
                  Todos os resultados
                </option>

                <option value="CONFORME">
                  Conforme
                </option>

                <option value="NAO_CONFORME">
                  Não Conforme
                </option>
              </select>

            </div>

            <select
              value={tipoFilter}
              onChange={(event) =>
                setTipoFilter(
                  event.target.value
                )
              }
              className="input min-w-48"
            >
              <option value="TODOS">
                Todos os tipos
              </option>

              <option value="Recebimento">
                Recebimento
              </option>

              <option value="Processo">
                Processo
              </option>

              <option value="Produto">
                Produto
              </option>

              <option value="Final">
                Final
              </option>

              <option value="Expedição">
                Expedição
              </option>
            </select>

          </div>

        </div>

      </div>

      {/* TABELA */}
      <div className="card overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1000px]">

            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">

                <th className="table-head">
                  Código
                </th>

                <th className="table-head">
                  Produto
                </th>

                <th className="table-head">
                  Lote
                </th>

                <th className="table-head">
                  Responsável
                </th>

                <th className="table-head">
                  Data
                </th>

                <th className="table-head">
                  Tipo
                </th>

                <th className="table-head">
                  Resultado
                </th>

                <th className="table-head text-right">
                  Ações
                </th>

              </tr>
            </thead>

            <tbody>

              {loading ? (
                <LoadingRows />
              ) : filteredInspecoes.length ===
                0 ? (
                <EmptyState />
              ) : (
                filteredInspecoes.map(
                  (item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                    >

                      <td className="table-cell font-semibold text-blue-600">
                        {item.codigo}
                      </td>

                      <td className="table-cell">

                        <div className="flex items-center gap-2">

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800">
                            <Package
                              size={15}
                            />
                          </div>

                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {item.produto}
                          </span>

                        </div>

                      </td>

                      <td className="table-cell text-slate-600 dark:text-slate-400">
                        {item.lote}
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

                        <div className="flex items-center gap-2">

                          <Calendar
                            size={15}
                            className="text-slate-400"
                          />

                          {formatDate(
                            item.data
                          )}

                        </div>

                      </td>

                      <td className="table-cell">
                        {item.tipo}
                      </td>

                      <td className="table-cell">

                        <StatusBadge
                          status={
                            item.resultado
                          }
                        />

                      </td>

                      <td className="table-cell">

                        <div className="flex justify-end gap-1">

                          <button
                            onClick={() =>
                              openView(
                                item
                              )
                            }
                            className="icon-button"
                            title="Visualizar"
                          >
                            <Eye
                              size={17}
                            />
                          </button>

                          <button
                            onClick={() =>
                              openEdit(
                                item
                              )
                            }
                            className="icon-button"
                            title="Editar"
                          >
                            <Pencil
                              size={17}
                            />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                item.id
                              )
                            }
                            className="icon-button text-red-500 hover:bg-red-50 hover:text-red-600"
                            title="Excluir"
                          >
                            <Trash2
                              size={17}
                            />
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-sm text-slate-500 dark:border-slate-700">
          Exibindo{" "}
          <strong className="text-slate-700 dark:text-slate-300">
            {filteredInspecoes.length}
          </strong>{" "}
          de{" "}
          <strong className="text-slate-700 dark:text-slate-300">
            {inspecoes.length}
          </strong>{" "}
          inspeções
        </div>

      </div>

      {/* MODAL FORMULÁRIO */}
      {modalOpen && (
        <Modal
          title={
            editingId
              ? "Editar inspeção"
              : "Nova inspeção"
          }
          onClose={
            closeModal
          }
        >

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-5"
          >

            {error && (
              <ErrorBox
                message={error}
              />
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <Field
                label="Código"
                required
              >
                <input
                  value={
                    form.codigo
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      codigo:
                        event
                          .target
                          .value,
                    })
                  }
                  className="input"
                  placeholder="INS-000001"
                />
              </Field>

              <Field
                label="Produto"
                required
              >
                <input
                  value={
                    form.produto
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      produto:
                        event
                          .target
                          .value,
                    })
                  }
                  className="input"
                  placeholder="Nome do produto"
                />
              </Field>

              <Field
                label="Lote"
                required
              >
                <input
                  value={
                    form.lote
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      lote:
                        event
                          .target
                          .value,
                    })
                  }
                  className="input"
                  placeholder="Número do lote"
                />
              </Field>

              <Field
                label="Responsável"
                required
              >
                <input
                  value={
                    form.responsavel
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      responsavel:
                        event
                          .target
                          .value,
                    })
                  }
                  className="input"
                  placeholder="Responsável pela inspeção"
                />
              </Field>

              <Field
                label="Data"
                required
              >
                <input
                  type="date"
                  value={
                    form.data
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      data:
                        event
                          .target
                          .value,
                    })
                  }
                  className="input"
                />
              </Field>

              <Field label="Local">
                <div className="relative">

                  <MapPin
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={
                      form.local
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        local:
                          event
                            .target
                            .value,
                      })
                    }
                    className="input pl-9"
                    placeholder="Setor / local"
                  />

                </div>
              </Field>

              <Field
                label="Tipo de inspeção"
                required
              >
                <select
                  value={
                    form.tipo
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      tipo:
                        event
                          .target
                          .value,
                    })
                  }
                  className="input"
                >
                  <option>
                    Recebimento
                  </option>

                  <option>
                    Processo
                  </option>

                  <option>
                    Produto
                  </option>

                  <option>
                    Final
                  </option>

                  <option>
                    Expedição
                  </option>
                </select>
              </Field>

              <Field
                label="Resultado"
                required
              >
                <select
                  value={
                    form.resultado
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      resultado:
                        event
                          .target
                          .value,
                    })
                  }
                  className="input"
                >
                  <option value="CONFORME">
                    Conforme
                  </option>

                  <option value="NAO_CONFORME">
                    Não Conforme
                  </option>
                </select>
              </Field>

            </div>

            {form.resultado ===
              "NAO_CONFORME" && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">

                <div className="mb-4 flex items-center gap-2">

                  <AlertTriangle
                    size={18}
                    className="text-red-600"
                  />

                  <h3 className="font-semibold text-red-700">
                    Dados da não conformidade
                  </h3>

                </div>

                <Field label="Gravidade">
                  <select
                    value={
                      form.gravidade
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        gravidade:
                          event
                            .target
                            .value,
                      })
                    }
                    className="input bg-white"
                  >
                    <option value="BAIXA">
                      Baixa
                    </option>

                    <option value="MEDIA">
                      Média
                    </option>

                    <option value="ALTA">
                      Alta
                    </option>

                    <option value="CRITICA">
                      Crítica
                    </option>
                  </select>
                </Field>

              </div>
            )}

            <Field label="Observações">
              <textarea
                value={
                  form.observacoes
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    observacoes:
                      event
                        .target
                        .value,
                  })
                }
                rows={4}
                className="input resize-none"
                placeholder="Descreva observações, evidências ou informações adicionais..."
              />
            </Field>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-700">

              <button
                type="button"
                onClick={
                  closeModal
                }
                className="btn-secondary"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={
                  saving
                }
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
                    <Save
                      size={17}
                    />
                    Salvar inspeção
                  </>
                )}

              </button>

            </div>

          </form>

        </Modal>
      )}

      {/* MODAL VISUALIZAÇÃO */}
      {viewOpen &&
        selected && (
          <Modal
            title="Detalhes da inspeção"
            onClose={() =>
              setViewOpen(
                false
              )
            }
          >

            <div className="space-y-5">

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800">

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Código
                  </p>

                  <p className="mt-1 text-lg font-bold text-blue-600">
                    {selected.codigo}
                  </p>
                </div>

                <StatusBadge
                  status={
                    selected.resultado
                  }
                />

              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <InfoItem
                  label="Produto"
                  value={
                    selected.produto
                  }
                  icon={Package}
                />

                <InfoItem
                  label="Lote"
                  value={
                    selected.lote
                  }
                  icon={Package}
                />

                <InfoItem
                  label="Responsável"
                  value={
                    selected.responsavel
                  }
                  icon={User}
                />

                <InfoItem
                  label="Data"
                  value={formatDate(
                    selected.data
                  )}
                  icon={Calendar}
                />

                <InfoItem
                  label="Local"
                  value={
                    selected.local ||
                    "-"
                  }
                  icon={MapPin}
                />

                <InfoItem
                  label="Tipo"
                  value={
                    selected.tipo
                  }
                  icon={ClipboardCheck}
                />

              </div>

              {selected.gravidade && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Gravidade
                  </p>

                  <StatusBadge
                    status={
                      selected.gravidade
                    }
                  />
                </div>
              )}

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Observações
                </p>

                <div className="rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {selected.observacoes ||
                    "Nenhuma observação registrada."}
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-200 pt-4 dark:border-slate-700">

                <button
                  onClick={() =>
                    setViewOpen(
                      false
                    )
                  }
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
  icon: typeof ClipboardCheck;
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

      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">

          <h2 className="font-poppins text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h2>

          <button
            onClick={
              onClose
            }
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

function InfoItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Package;
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

function ErrorBox({
  message,
}: {
  message: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <AlertTriangle
        size={18}
        className="mt-0.5 shrink-0"
      />

      {message}
    </div>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <tr key={index}>

          {Array.from({
            length: 8,
          }).map(
            (_, column) => (
              <td
                key={column}
                className="px-5 py-4"
              >
                <div className="h-5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              </td>
            )
          )}

        </tr>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <tr>
      <td
        colSpan={8}
        className="px-5 py-16 text-center"
      >

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
          <ClipboardCheck
            size={25}
          />
        </div>

        <p className="mt-4 font-semibold text-slate-700 dark:text-slate-300">
          Nenhuma inspeção encontrada
        </p>

        <p className="mt-1 text-sm text-slate-400">
          Cadastre uma nova inspeção ou altere os filtros.
        </p>

      </td>
    </tr>
  );
}

function formatDate(
  date: string
) {
  if (!date) return "-";

  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return date;
  }

  return parsed.toLocaleDateString(
    "pt-BR"
  );
}

function formatDateInput(
  date: string
) {
  if (!date) return "";

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      date
    )
  ) {
    return date;
  }

  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "";
  }

  return parsed
    .toISOString()
    .split("T")[0];
}
```
