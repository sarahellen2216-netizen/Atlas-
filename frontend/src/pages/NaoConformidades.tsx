```tsx
import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  X,
  Save,
  Eye,
  Calendar,
  Package,
  User,
  ClipboardCheck,
  RefreshCw,
  FileDown,
  Clock,
  CheckCircle2,
  Activity,
} from "lucide-react";

import {
  createNaoConformidade,
  deleteNaoConformidade,
  getNaoConformidades,
  updateNaoConformidade,
} from "../services/api";

import StatusBadge from "../components/StatusBadge";

interface NaoConformidade {
  id: number;
  codigo: string;
  inspecao_id?: number;
  inspeção_id?: number;
  produto?: string;
  processo?: string;
  descricao: string;
  categoria?: string;
  gravidade: string;
  responsavel: string;
  status: string;
  data: string;
  evidencias?: string;
}

interface FormData {
  codigo: string;
  inspecao_id: string;
  produto: string;
  processo: string;
  descricao: string;
  categoria: string;
  gravidade: string;
  responsavel: string;
  status: string;
  data: string;
  evidencias: string;
}

const initialForm: FormData = {
  codigo: "",
  inspecao_id: "",
  produto: "",
  processo: "",
  descricao: "",
  categoria: "Produto",
  gravidade: "MEDIA",
  responsavel: "",
  status: "ABERTA",
  data: "",
  evidencias: "",
};

export default function NaoConformidades() {
  const [
    naoConformidades,
    setNaoConformidades,
  ] = useState<NaoConformidade[]>(
    []
  );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("TODOS");

  const [gravidadeFilter, setGravidadeFilter] =
    useState("TODOS");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [viewOpen, setViewOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [selected, setSelected] =
    useState<NaoConformidade | null>(
      null
    );

  const [form, setForm] =
    useState<FormData>(
      initialForm
    );

  const [error, setError] =
    useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const response =
        await getNaoConformidades();

      setNaoConformidades(
        Array.isArray(response)
          ? response
          : response?.data || []
      );
    } catch {
      setError(
        "Não foi possível carregar as não conformidades."
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

    setForm({
      ...initialForm,
      codigo: `NC-${Date.now()
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
    item: NaoConformidade
  ) {
    setEditingId(item.id);

    setForm({
      codigo: item.codigo || "",
      inspecao_id:
        String(
          item.inspecao_id ??
            item.inspeção_id ??
            ""
        ),
      produto: item.produto || "",
      processo: item.processo || "",
      descricao:
        item.descricao || "",
      categoria:
        item.categoria ||
        "Produto",
      gravidade:
        item.gravidade ||
        "MEDIA",
      responsavel:
        item.responsavel || "",
      status:
        item.status ||
        "ABERTA",
      data: formatDateInput(
        item.data
      ),
      evidencias:
        item.evidencias || "",
    });

    setError("");
    setModalOpen(true);
  }

  function openView(
    item: NaoConformidade
  ) {
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

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");

    if (
      !form.codigo ||
      !form.descricao ||
      !form.responsavel ||
      !form.data
    ) {
      setError(
        "Preencha os campos obrigatórios."
      );

      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        inspecao_id:
          form.inspecao_id
            ? Number(
                form.inspecao_id
              )
            : undefined,
      };

      if (editingId) {
        await updateNaoConformidade(
          editingId,
          payload
        );
      } else {
        await createNaoConformidade(
          payload
        );
      }

      closeModal();

      await loadData();
    } catch (err: any) {
      setError(
        err?.response?.data
          ?.message ||
          "Não foi possível salvar a não conformidade."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    id: number
  ) {
    if (
      !window.confirm(
        "Deseja realmente excluir esta não conformidade?"
      )
    ) {
      return;
    }

    try {
      await deleteNaoConformidade(id);

      await loadData();
    } catch {
      alert(
        "Não foi possível excluir a não conformidade."
      );
    }
  }

  function exportCSV() {
    const header = [
      "Código",
      "Produto",
      "Processo",
      "Descrição",
      "Categoria",
      "Gravidade",
      "Responsável",
      "Status",
      "Data",
      "Evidências",
    ];

    const rows =
      filteredData.map(
        (item) => [
          item.codigo,
          item.produto || "",
          item.processo || "",
          item.descricao,
          item.categoria || "",
          item.gravidade,
          item.responsavel,
          item.status,
          formatDate(item.data),
          item.evidencias || "",
        ]
      );

    const csv = [
      header,
      ...rows,
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value
              ).replaceAll(
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
      "nao-conformidades-atlas-gestao.csv";

    link.click();

    URL.revokeObjectURL(url);
  }

  const filteredData =
    naoConformidades.filter(
      (item) => {
        const term =
          search
            .toLowerCase()
            .trim();

        const searchable = [
          item.codigo,
          item.produto,
          item.processo,
          item.descricao,
          item.categoria,
          item.responsavel,
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !term ||
          searchable.includes(
            term
          );

        const matchesStatus =
          statusFilter ===
            "TODOS" ||
          item.status ===
            statusFilter;

        const matchesGravidade =
          gravidadeFilter ===
            "TODOS" ||
          item.gravidade ===
            gravidadeFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesGravidade
        );
      }
    );

  const abertas =
    naoConformidades.filter(
      (item) =>
        item.status ===
        "ABERTA"
    ).length;

  const emAndamento =
    naoConformidades.filter(
      (item) =>
        item.status ===
          "EM_ANALISE" ||
        item.status ===
          "EM_ANDAMENTO"
    ).length;

  const resolvidas =
    naoConformidades.filter(
      (item) =>
        item.status ===
          "RESOLVIDA" ||
        item.status ===
          "FECHADA"
    ).length;

  const criticas =
    naoConformidades.filter(
      (item) =>
        item.gravidade ===
          "CRITICA" &&
        item.status !==
          "FECHADA"
    ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* CABEÇALHO */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
            <AlertTriangle
              size={23}
            />
          </div>

          <div>
            <h1 className="page-title">
              Não Conformidades
            </h1>

            <p className="page-subtitle">
              Registre, acompanhe e trate desvios da qualidade.
            </p>
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
            Nova não conformidade
          </button>

        </div>

      </div>

      {/* INDICADORES */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          title="Total"
          value={
            naoConformidades.length
          }
          icon={AlertTriangle}
          className="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          title="Abertas"
          value={abertas}
          icon={Clock}
          className="bg-red-50 text-red-600"
        />

        <SummaryCard
          title="Em tratamento"
          value={emAndamento}
          icon={Activity}
          className="bg-yellow-50 text-yellow-600"
        />

        <SummaryCard
          title="Resolvidas"
          value={resolvidas}
          icon={CheckCircle2}
          className="bg-green-50 text-green-600"
        />

      </div>

      {/* ALERTA CRÍTICO */}
      {criticas > 0 && (
        <div className="flex items-center gap-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-500/20">
            <AlertTriangle
              size={21}
            />
          </div>

          <div>
            <p className="font-semibold text-red-800 dark:text-red-400">
              Atenção: existem{" "}
              {criticas}{" "}
              não conformidade(s) crítica(s)
              em aberto.
            </p>

            <p className="text-sm text-red-700 dark:text-red-500">
              Priorize a análise e o tratamento dessas ocorrências.
            </p>
          </div>

        </div>
      )}

      {/* FILTROS */}
      <div className="card p-4">

        <div className="flex flex-col gap-3 xl:flex-row">

          <div className="relative flex-1">

            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              className="input pl-10"
              placeholder="Pesquisar código, produto, processo, descrição..."
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
                  statusFilter
                }
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="input min-w-48 pl-9"
              >
                <option value="TODOS">
                  Todos os status
                </option>

                <option value="ABERTA">
                  Aberta
                </option>

                <option value="EM_ANALISE">
                  Em análise
                </option>

                <option value="EM_ANDAMENTO">
                  Em andamento
                </option>

                <option value="RESOLVIDA">
                  Resolvida
                </option>

                <option value="FECHADA">
                  Fechada
                </option>
              </select>

            </div>

            <select
              value={
                gravidadeFilter
              }
              onChange={(event) =>
                setGravidadeFilter(
                  event.target.value
                )
              }
              className="input min-w-44"
            >
              <option value="TODOS">
                Todas as gravidades
              </option>

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

          </div>

        </div>

      </div>

      {/* TABELA */}
      <div className="card overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1100px]">

            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">

                <th className="table-head">
                  Código
                </th>

                <th className="table-head">
                  Produto / Processo
                </th>

                <th className="table-head">
                  Descrição
                </th>

                <th className="table-head">
                  Gravidade
                </th>

                <th className="table-head">
                  Responsável
                </th>

                <th className="table-head">
                  Data
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
              ) : filteredData.length ===
                0 ? (
                <EmptyState />
              ) : (
                filteredData.map(
                  (item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                    >

                      <td className="table-cell">

                        <span className="font-semibold text-red-600">
                          {item.codigo}
                        </span>

                      </td>

                      <td className="table-cell">

                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {item.produto ||
                              "-"}
                          </p>

                          {item.processo && (
                            <p className="mt-1 text-xs text-slate-400">
                              {item.processo}
                            </p>
                          )}
                        </div>

                      </td>

                      <td className="table-cell">

                        <p className="max-w-xs truncate text-slate-600 dark:text-slate-400">
                          {item.descricao}
                        </p>

                      </td>

                      <td className="table-cell">
                        <SeverityBadge
                          value={
                            item.gravidade
                          }
                        />
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

                        <StatusBadge
                          status={
                            item.status
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
            {filteredData.length}
          </strong>{" "}
          de{" "}
          <strong className="text-slate-700 dark:text-slate-300">
            {naoConformidades.length}
          </strong>{" "}
          registros
        </div>

      </div>

      {/* MODAL */}
      {modalOpen && (
        <Modal
          title={
            editingId
              ? "Editar não conformidade"
              : "Nova não conformidade"
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
                  onChange={(e) =>
                    setForm({
                      ...form,
                      codigo:
                        e.target
                          .value,
                    })
                  }
                  className="input"
                  placeholder="NC-000001"
                />
              </Field>

              <Field label="Inspeção relacionada">
                <input
                  type="number"
                  value={
                    form.inspecao_id
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      inspecao_id:
                        e.target
                          .value,
                    })
                  }
                  className="input"
                  placeholder="ID da inspeção"
                />
              </Field>

              <Field label="Produto">
                <input
                  value={
                    form.produto
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      produto:
                        e.target
                          .value,
                    })
                  }
                  className="input"
                  placeholder="Produto relacionado"
                />
              </Field>

              <Field label="Processo">
                <input
                  value={
                    form.processo
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      processo:
                        e.target
                          .value,
                    })
                  }
                  className="input"
                  placeholder="Processo / setor"
                />
              </Field>

              <Field label="Categoria">
                <select
                  value={
                    form.categoria
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      categoria:
                        e.target
                          .value,
                    })
                  }
                  className="input"
                >
                  <option>
                    Produto
                  </option>

                  <option>
                    Processo
                  </option>

                  <option>
                    Documentação
                  </option>

                  <option>
                    Fornecedor
                  </option>

                  <option>
                    Segurança
                  </option>

                  <option>
                    Sistema
                  </option>

                  <option>
                    Outro
                  </option>
                </select>
              </Field>

              <Field
                label="Gravidade"
                required
              >
                <select
                  value={
                    form.gravidade
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      gravidade:
                        e.target
                          .value,
                    })
                  }
                  className="input"
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

              <Field
                label="Responsável"
                required
              >
                <input
                  value={
                    form.responsavel
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      responsavel:
                        e.target
                          .value,
                    })
                  }
                  className="input"
                  placeholder="Responsável pelo tratamento"
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
                  onChange={(e) =>
                    setForm({
                      ...form,
                      data:
                        e.target
                          .value,
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
                  value={
                    form.status
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status:
                        e.target
                          .value,
                    })
                  }
                  className="input"
                >
                  <option value="ABERTA">
                    Aberta
                  </option>

                  <option value="EM_ANALISE">
                    Em análise
                  </option>

                  <option value="EM_ANDAMENTO">
                    Em andamento
                  </option>

                  <option value="RESOLVIDA">
                    Resolvida
                  </option>

                  <option value="FECHADA">
                    Fechada
                  </option>
                </select>
              </Field>

            </div>

            <Field
              label="Descrição da não conformidade"
              required
            >
              <textarea
                value={
                  form.descricao
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    descricao:
                      e.target
                        .value,
                  })
                }
                rows={5}
                className="input resize-none"
                placeholder="Descreva detalhadamente o problema identificado..."
              />
            </Field>

            <Field label="Evidências">
              <textarea
                value={
                  form.evidencias
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    evidencias:
                      e.target
                        .value,
                  })
                }
                rows={4}
                className="input resize-none"
                placeholder="Descreva fotos, documentos, amostras ou outras evidências..."
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
                    Salvar
                  </>
                )}
              </button>

            </div>

          </form>

        </Modal>
      )}

      {/* VISUALIZAÇÃO */}
      {viewOpen &&
        selected && (
          <Modal
            title="Detalhes da não conformidade"
            onClose={() =>
              setViewOpen(
                false
              )
            }
          >

            <div className="space-y-5">

              <div className="flex flex-col justify-between gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center dark:bg-slate-800">

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Código
                  </p>

                  <p className="mt-1 text-lg font-bold text-red-600">
                    {selected.codigo}
                  </p>
                </div>

                <StatusBadge
                  status={
                    selected.status
                  }
                />

              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <InfoItem
                  label="Produto"
                  value={
                    selected.produto ||
                    "-"
                  }
                  icon={Package}
                />

                <InfoItem
                  label="Processo"
                  value={
                    selected.processo ||
                    "-"
                  }
                  icon={Activity}
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
                  label="Categoria"
                  value={
                    selected.categoria ||
                    "-"
                  }
                  icon={ClipboardCheck}
                />

                <InfoItem
                  label="Gravidade"
                  value={
                    severityLabel(
                      selected.gravidade
                    )
                  }
                  icon={AlertTriangle}
                />

              </div>

              <div>

                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Descrição
                </p>

                <div className="rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {selected.descricao}
                </div>

              </div>

              <div>

                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Evidências
                </p>

                <div className="rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {selected.evidencias ||
                    "Nenhuma evidência registrada."}
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
  icon: typeof AlertTriangle;
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

function SeverityBadge({
  value,
}: {
  value: string;
}) {
  const styles: Record<
    string,
    string
  > = {
    BAIXA:
      "bg-green-50 text-green-700 border-green-200",
    MEDIA:
      "bg-yellow-50 text-yellow-700 border-yellow-200",
    ALTA:
      "bg-orange-50 text-orange-700 border-orange-200",
    CRITICA:
      "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
        styles[value] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {severityLabel(value)}
    </span>
  );
}

function severityLabel(
  value: string
) {
  const labels: Record<
    string,
    string
  > = {
    BAIXA: "Baixa",
    MEDIA: "Média",
    ALTA: "Alta",
    CRITICA: "Crítica",
  };

  return (
    labels[value] ||
    value
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

      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">

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
    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
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
          <AlertTriangle
            size={25}
          />
        </div>

        <p className="mt-4 font-semibold text-slate-700 dark:text-slate-300">
          Nenhuma não conformidade encontrada
        </p>

        <p className="mt-1 text-sm text-slate-400">
          Cadastre uma ocorrência ou altere os filtros.
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
