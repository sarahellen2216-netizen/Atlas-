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
  ClipboardCheck,
  Eye,
  FileDown,
  Filter,
  Pencil,
  Plus,
  Search,
  Save,
  Trash2,
  User,
  X,
  RefreshCw,
} from "lucide-react";

import {
  createAuditoria,
  deleteAuditoria,
  getAuditorias,
  updateAuditoria,
} from "../services/api";

import StatusBadge from "../components/StatusBadge";

interface ChecklistItem {
  id: string;
  pergunta: string;
  resposta: string;
  observacao: string;
}

interface Auditoria {
  id: number;
  codigo: string;
  auditor: string;
  setor: string;
  data: string;
  tipo: string;
  checklist: ChecklistItem[];
  resultado: string;
  observacoes?: string;
  createdAt?: string;
}

interface FormData {
  codigo: string;
  auditor: string;
  setor: string;
  data: string;
  tipo: string;
  resultado: string;
  observacoes: string;
}

const checklistPadrao: ChecklistItem[] = [
  {
    id: "1",
    pergunta:
      "Os procedimentos do setor estão documentados e atualizados?",
    resposta: "",
    observacao: "",
  },
  {
    id: "2",
    pergunta:
      "Os colaboradores conhecem os procedimentos aplicáveis?",
    resposta: "",
    observacao: "",
  },
  {
    id: "3",
    pergunta:
      "Os registros da qualidade estão sendo preenchidos corretamente?",
    resposta: "",
    observacao: "",
  },
  {
    id: "4",
    pergunta:
      "Os equipamentos utilizados estão identificados e controlados?",
    resposta: "",
    observacao: "",
  },
  {
    id: "5",
    pergunta:
      "As não conformidades identificadas anteriormente foram tratadas?",
    resposta: "",
    observacao: "",
  },
  {
    id: "6",
    pergunta:
      "Os requisitos aplicáveis da qualidade estão sendo atendidos?",
    resposta: "",
    observacao: "",
  },
];

const initialForm: FormData = {
  codigo: "",
  auditor: "",
  setor: "",
  data: "",
  tipo: "INTERNA",
  resultado: "",
  observacoes: "",
};

export default function Auditorias() {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [resultadoFilter, setResultadoFilter] =
    useState("TODOS");
  const [tipoFilter, setTipoFilter] =
    useState("TODOS");

  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [selected, setSelected] =
    useState<Auditoria | null>(null);

  const [form, setForm] =
    useState<FormData>(initialForm);

  const [checklist, setChecklist] =
    useState<ChecklistItem[]>(checklistPadrao);

  const [error, setError] = useState("");

  async function loadAuditorias() {
    try {
      setLoading(true);
      setError("");

      const response = await getAuditorias();

      const data = Array.isArray(response)
        ? response
        : response?.data || [];

      setAuditorias(data);
    } catch {
      setError(
        "Não foi possível carregar as auditorias."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAuditorias();
  }, []);

  function openCreate() {
    const today = new Date();

    setEditingId(null);

    setForm({
      ...initialForm,
      codigo: `AUD-${Date.now()
        .toString()
        .slice(-6)}`,
      data: today
        .toISOString()
        .split("T")[0],
    });

    setChecklist(
      checklistPadrao.map((item) => ({
        ...item,
      }))
    );

    setError("");
    setModalOpen(true);
  }

  function openEdit(auditoria: Auditoria) {
    setEditingId(auditoria.id);

    setForm({
      codigo: auditoria.codigo || "",
      auditor: auditoria.auditor || "",
      setor: auditoria.setor || "",
      data: formatDateInput(auditoria.data),
      tipo: auditoria.tipo || "INTERNA",
      resultado: auditoria.resultado || "",
      observacoes:
        auditoria.observacoes || "",
    });

    setChecklist(
      auditoria.checklist?.length
        ? auditoria.checklist
        : checklistPadrao.map((item) => ({
            ...item,
          }))
    );

    setError("");
    setModalOpen(true);
  }

  function openView(auditoria: Auditoria) {
    setSelected(auditoria);
    setViewOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
    setError("");
  }

  function updateChecklist(
    index: number,
    field: keyof ChecklistItem,
    value: string
  ) {
    setChecklist((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function calculateResult(
    items: ChecklistItem[]
  ) {
    const answered = items.filter(
      (item) => item.resposta
    );

    if (!answered.length) {
      return "";
    }

    const conforme = answered.filter(
      (item) =>
        item.resposta === "CONFORME"
    ).length;

    const percentual =
      (conforme / answered.length) * 100;

    if (percentual === 100) {
      return "CONFORME";
    }

    if (percentual >= 70) {
      return "PARCIALMENTE_CONFORME";
    }

    return "NAO_CONFORME";
  }

  function handleChecklistChange(
    index: number,
    value: string
  ) {
    updateChecklist(
      index,
      "resposta",
      value
    );

    const updated = checklist.map(
      (item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              resposta: value,
            }
          : item
    );

    const resultado =
      calculateResult(updated);

    setForm((current) => ({
      ...current,
      resultado,
    }));
  }

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");

    if (
      !form.codigo ||
      !form.auditor ||
      !form.setor ||
      !form.data ||
      !form.tipo ||
      !form.resultado
    ) {
      setError(
        "Preencha todos os campos obrigatórios."
      );

      return;
    }

    try {
      setSaving(true);

      const payload = {
        codigo: form.codigo,
        auditor: form.auditor,
        setor: form.setor,
        data: form.data,
        tipo: form.tipo,
        checklist,
        resultado: form.resultado,
        observacoes:
          form.observacoes || undefined,
      };

      if (editingId) {
        await updateAuditoria(
          editingId,
          payload
        );
      } else {
        await createAuditoria(payload);
      }

      closeModal();

      await loadAuditorias();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Não foi possível salvar a auditoria."
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
        "Deseja realmente excluir esta auditoria?"
      )
    ) {
      return;
    }

    try {
      await deleteAuditoria(id);

      await loadAuditorias();
    } catch {
      alert(
        "Não foi possível excluir a auditoria."
      );
    }
  }

  function exportCSV() {
    const header = [
      "Código",
      "Auditor",
      "Setor",
      "Data",
      "Tipo",
      "Resultado",
      "Observações",
    ];

    const rows = filteredAuditorias.map(
      (item) => [
        item.codigo,
        item.auditor,
        item.setor,
        formatDate(item.data),
        typeLabel(item.tipo),
        resultLabel(item.resultado),
        item.observacoes || "",
      ]
    );

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replaceAll(
                '"',
                '""'
              )}"`
          )
          .join(";")
      )
      .join("\n");

    const blob = new Blob(
      ["\ufeff" + csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "auditorias-atlas-gestao.csv";

    link.click();

    URL.revokeObjectURL(url);
  }

  const filteredAuditorias =
    useMemo(() => {
      const term =
        search.toLowerCase().trim();

      return auditorias.filter(
        (item) => {
          const searchable = [
            item.codigo,
            item.auditor,
            item.setor,
            item.tipo,
            item.resultado,
            item.observacoes,
          ]
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !term ||
            searchable.includes(term);

          const matchesResultado =
            resultadoFilter ===
              "TODOS" ||
            item.resultado ===
              resultadoFilter;

          const matchesTipo =
            tipoFilter === "TODOS" ||
            item.tipo === tipoFilter;

          return (
            matchesSearch &&
            matchesResultado &&
            matchesTipo
          );
        }
      );
    }, [
      auditorias,
      search,
      resultadoFilter,
      tipoFilter,
    ]);

  const stats = useMemo(() => {
    const conformes =
      auditorias.filter(
        (item) =>
          item.resultado ===
          "CONFORME"
      ).length;

    const parciais =
      auditorias.filter(
        (item) =>
          item.resultado ===
          "PARCIALMENTE_CONFORME"
      ).length;

    const naoConformes =
      auditorias.filter(
        (item) =>
          item.resultado ===
          "NAO_CONFORME"
      ).length;

    const percentual =
      auditorias.length
        ? Math.round(
            (conformes /
              auditorias.length) *
              100
          )
        : 0;

    return {
      total: auditorias.length,
      conformes,
      parciais,
      naoConformes,
      percentual,
    };
  }, [auditorias]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
            <ClipboardCheck size={23} />
          </div>

          <div>
            <h1 className="page-title">
              Auditorias
            </h1>

            <p className="page-subtitle">
              Controle das auditorias internas e avaliações da qualidade.
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
            Nova auditoria
          </button>
        </div>
      </div>

      {/* INDICADORES */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          title="Auditorias"
          value={stats.total}
          icon={ClipboardCheck}
          className="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          title="Conformes"
          value={stats.conformes}
          icon={CheckCircle2}
          className="bg-green-50 text-green-600"
        />

        <SummaryCard
          title="Parciais"
          value={stats.parciais}
          icon={AlertTriangle}
          className="bg-yellow-50 text-yellow-600"
        />

        <SummaryCard
          title="Não conformes"
          value={stats.naoConformes}
          icon={AlertTriangle}
          className="bg-red-50 text-red-600"
        />

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Taxa de conformidade
            </span>

            <CheckCircle2
              size={20}
              className="text-green-500"
            />
          </div>

          <p className="font-poppins text-2xl font-bold text-slate-900 dark:text-white">
            {stats.percentual}%
          </p>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{
                width: `${stats.percentual}%`,
              }}
            />
          </div>
        </div>
      </div>

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
              placeholder="Pesquisar código, auditor, setor..."
            />
          </div>

          <div className="relative">
            <Filter
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={tipoFilter}
              onChange={(event) =>
                setTipoFilter(
                  event.target.value
                )
              }
              className="input min-w-48 pl-9"
            >
              <option value="TODOS">
                Todos os tipos
              </option>

              <option value="INTERNA">
                Interna
              </option>

              <option value="PROCESSO">
                Processo
              </option>

              <option value="PRODUTO">
                Produto
              </option>

              <option value="SISTEMA">
                Sistema
              </option>
            </select>
          </div>

          <select
            value={resultadoFilter}
            onChange={(event) =>
              setResultadoFilter(
                event.target.value
              )
            }
            className="input min-w-56"
          >
            <option value="TODOS">
              Todos os resultados
            </option>

            <option value="CONFORME">
              Conforme
            </option>

            <option value="PARCIALMENTE_CONFORME">
              Parcialmente conforme
            </option>

            <option value="NAO_CONFORME">
              Não conforme
            </option>
          </select>
        </div>
      </div>

      {/* TABELA */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                <th className="table-head">
                  Código
                </th>

                <th className="table-head">
                  Auditor
                </th>

                <th className="table-head">
                  Setor
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

                <th className="table-head">
                  Checklist
                </th>

                <th className="table-head text-right">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <LoadingRows />
              ) : filteredAuditorias.length ===
                0 ? (
                <EmptyState />
              ) : (
                filteredAuditorias.map(
                  (item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                    >
                      <td className="table-cell">
                        <span className="font-semibold text-blue-600">
                          {item.codigo}
                        </span>
                      </td>

                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <User
                            size={15}
                            className="text-slate-400"
                          />

                          {item.auditor}
                        </div>
                      </td>

                      <td className="table-cell">
                        {item.setor}
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
                        <span className="rounded-md bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-600 dark:bg-purple-500/10">
                          {typeLabel(
                            item.tipo
                          )}
                        </span>
                      </td>

                      <td className="table-cell">
                        <StatusBadge
                          status={
                            item.resultado
                          }
                        />
                      </td>

                      <td className="table-cell">
                        <ChecklistSummary
                          checklist={
                            item.checklist
                          }
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
                              handleDelete(
                                item.id
                              )
                            }
                            className="icon-button text-red-500 hover:bg-red-50 hover:text-red-600"
                            title="Excluir"
                          >
                            <Trash2 size={17} />
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
            {filteredAuditorias.length}
          </strong>{" "}
          de{" "}
          <strong className="text-slate-700 dark:text-slate-300">
            {auditorias.length}
          </strong>{" "}
          auditorias
        </div>
      </div>

      {/* MODAL CADASTRO */}
      {modalOpen && (
        <Modal
          title={
            editingId
              ? "Editar auditoria"
              : "Nova auditoria"
          }
          onClose={closeModal}
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                label="Código"
                required
              >
                <input
                  className="input"
                  value={form.codigo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      codigo:
                        e.target.value,
                    })
                  }
                  placeholder="AUD-000001"
                />
              </Field>

              <Field
                label="Auditor"
                required
              >
                <input
                  className="input"
                  value={form.auditor}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      auditor:
                        e.target.value,
                    })
                  }
                  placeholder="Nome do auditor"
                />
              </Field>

              <Field
                label="Setor"
                required
              >
                <input
                  className="input"
                  value={form.setor}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      setor: e.target.value,
                    })
                  }
                  placeholder="Ex.: Produção"
                />
              </Field>

              <Field
                label="Data"
                required
              >
                <input
                  type="date"
                  className="input"
                  value={form.data}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      data: e.target.value,
                    })
                  }
                />
              </Field>

              <Field
                label="Tipo"
                required
              >
                <select
                  className="input"
                  value={form.tipo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tipo: e.target.value,
                    })
                  }
                >
                  <option value="INTERNA">
                    Auditoria interna
                  </option>

                  <option value="PROCESSO">
                    Auditoria de processo
                  </option>

                  <option value="PRODUTO">
                    Auditoria de produto
                  </option>

                  <option value="SISTEMA">
                    Auditoria de sistema
                  </option>
                </select>
              </Field>

              <Field
                label="Resultado"
                required
              >
                <select
                  className="input"
                  value={form.resultado}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      resultado:
                        e.target.value,
                    })
                  }
                >
                  <option value="">
                    Selecione
                  </option>

                  <option value="CONFORME">
                    Conforme
                  </option>

                  <option value="PARCIALMENTE_CONFORME">
                    Parcialmente conforme
                  </option>

                  <option value="NAO_CONFORME">
                    Não conforme
                  </option>
                </select>
              </Field>
            </div>

            {/* CHECKLIST */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-poppins font-semibold text-slate-900 dark:text-white">
                    Checklist da auditoria
                  </h3>

                  <p className="text-sm text-slate-500">
                    Avalie cada requisito.
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/10">
                  {checklist.filter(
                    (item) =>
                      item.resposta
                  ).length}{" "}
                  / {checklist.length}
                </span>
              </div>

              <div className="space-y-3">
                {checklist.map(
                  (item, index) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="mb-3 flex gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600 dark:bg-blue-500/10">
                          {index + 1}
                        </span>

                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {item.pergunta}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <select
                          value={
                            item.resposta
                          }
                          onChange={(e) =>
                            handleChecklistChange(
                              index,
                              e.target.value
                            )
                          }
                          className="input"
                        >
                          <option value="">
                            Selecione o resultado
                          </option>

                          <option value="CONFORME">
                            Conforme
                          </option>

                          <option value="NAO_CONFORME">
                            Não conforme
                          </option>

                          <option value="NAO_APLICAVEL">
                            Não aplicável
                          </option>
                        </select>

                        <input
                          value={
                            item.observacao
                          }
                          onChange={(e) =>
                            updateChecklist(
                              index,
                              "observacao",
                              e.target.value
                            )
                          }
                          className="input"
                          placeholder="Observação"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <Field label="Observações gerais">
              <textarea
                value={
                  form.observacoes
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    observacoes:
                      e.target.value,
                  })
                }
                rows={4}
                className="input resize-none"
                placeholder="Observações gerais da auditoria..."
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
                    Salvar auditoria
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
          title="Detalhes da auditoria"
          onClose={() =>
            setViewOpen(false)
          }
        >
          <div className="space-y-6">
            <div className="flex flex-col justify-between gap-3 rounded-xl bg-slate-50 p-5 sm:flex-row sm:items-center dark:bg-slate-800">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Código
                </p>

                <p className="mt-1 text-xl font-bold text-blue-600">
                  {selected.codigo}
                </p>
              </div>

              <StatusBadge
                status={
                  selected.resultado
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem
                label="Auditor"
                value={
                  selected.auditor
                }
                icon={User}
              />

              <InfoItem
                label="Setor"
                value={selected.setor}
                icon={ClipboardCheck}
              />

              <InfoItem
                label="Data"
                value={formatDate(
                  selected.data
                )}
                icon={Calendar}
              />

              <InfoItem
                label="Tipo"
                value={typeLabel(
                  selected.tipo
                )}
                icon={Filter}
              />
            </div>

            <div>
              <h3 className="mb-4 font-poppins font-semibold text-slate-900 dark:text-white">
                Checklist
              </h3>

              <div className="space-y-3">
                {selected.checklist?.map(
                  (item, index) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="flex gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600 dark:bg-blue-500/10">
                          {index + 1}
                        </span>

                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {item.pergunta}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <StatusBadge
                              status={
                                item.resposta
                              }
                            />

                            {item.observacao && (
                              <span className="text-xs text-slate-500">
                                {item.observacao}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {selected.observacoes && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Observações gerais
                </p>

                <div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {selected.observacoes}
                </div>
              </div>
            )}

            <div className="flex justify-end border-t border-slate-200 pt-4 dark:border-slate-700">
              <button
                onClick={() =>
                  setViewOpen(false)
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

function ChecklistSummary({
  checklist,
}: {
  checklist?: ChecklistItem[];
}) {
  if (!checklist?.length) {
    return (
      <span className="text-sm text-slate-400">
        Sem checklist
      </span>
    );
  }

  const answered = checklist.filter(
    (item) => item.resposta
  ).length;

  const conformes = checklist.filter(
    (item) =>
      item.resposta === "CONFORME"
  ).length;

  return (
    <div className="min-w-28">
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-slate-400">
          {answered}/{checklist.length}
        </span>

        <span className="font-semibold text-green-600">
          {conformes}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-green-500"
          style={{
            width: `${
              checklist.length
                ? (answered /
                    checklist.length) *
                  100
                : 0
            }%`,
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
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
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

        <div className="max-h-[calc(92vh-70px)] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 6 }).map(
        (_, index) => (
          <tr key={index}>
            {Array.from({
              length: 8,
            }).map((_, column) => (
              <td
                key={column}
                className="px-5 py-4"
              >
                <div className="h-5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              </td>
            ))}
          </tr>
        )
      )}
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
          <ClipboardCheck size={25} />
        </div>

        <p className="mt-4 font-semibold text-slate-700 dark:text-slate-300">
          Nenhuma auditoria encontrada
        </p>

        <p className="mt-1 text-sm text-slate-400">
          Cadastre uma auditoria ou altere os filtros.
        </p>
      </td>
    </tr>
  );
}

function typeLabel(type: string) {
  const labels: Record<
    string,
    string
  > = {
    INTERNA: "Interna",
    PROCESSO: "Processo",
    PRODUTO: "Produto",
    SISTEMA: "Sistema",
  };

  return labels[type] || type;
}

function resultLabel(result: string) {
  const labels: Record<
    string,
    string
  > = {
    CONFORME: "Conforme",
    PARCIALMENTE_CONFORME:
      "Parcialmente conforme",
    NAO_CONFORME: "Não conforme",
    NAO_APLICAVEL:
      "Não aplicável",
  };

  return labels[result] || result;
}

function formatDate(date: string) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString(
    "pt-BR"
  );
}

function formatDateInput(date: string) {
  if (!date) return "";

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    return date;
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed
    .toISOString()
    .split("T")[0];
}
