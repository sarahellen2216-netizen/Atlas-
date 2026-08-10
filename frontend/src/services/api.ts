```ts
import axios from "axios";

const api = axios.create({
  baseURL: "/api",

  headers: {
    "Content-Type": "application/json"
  }
});

/* =========================================================
   TOKEN
========================================================= */

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "atlas_token"
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  }
);

/* =========================================================
   ERROS DE AUTENTICAÇÃO
========================================================= */

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (
      error.response?.status === 401
    ) {
      localStorage.removeItem(
        "atlas_token"
      );

      localStorage.removeItem(
        "atlas_usuario"
      );

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

/* =========================================================
   AUTENTICAÇÃO
========================================================= */

export async function login(
  email: string,
  senha: string
) {
  const response =
    await api.post(
      "/auth/login",
      {
        email,
        senha
      }
    );

  localStorage.setItem(
    "atlas_token",
    response.data.token
  );

  localStorage.setItem(
    "atlas_usuario",
    JSON.stringify(
      response.data.usuario
    )
  );

  return response.data;
}

export function logout() {
  localStorage.removeItem(
    "atlas_token"
  );

  localStorage.removeItem(
    "atlas_usuario"
  );

  window.location.href =
    "/login";
}

export function getUsuario() {
  const usuario =
    localStorage.getItem(
      "atlas_usuario"
    );

  if (!usuario) {
    return null;
  }

  try {
    return JSON.parse(usuario);
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(
    localStorage.getItem(
      "atlas_token"
    )
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export async function getDashboard() {
  const response =
    await api.get(
      "/dashboard"
    );

  return response.data;
}

/* =========================================================
   INSPEÇÕES
========================================================= */

export async function getInspecoes() {
  const response =
    await api.get(
      "/inspecoes"
    );

  return response.data;
}

export async function createInspecao(
  data: unknown
) {
  const response =
    await api.post(
      "/inspecoes",
      data
    );

  return response.data;
}

export async function updateInspecao(
  id: string,
  data: unknown
) {
  const response =
    await api.put(
      `/inspecoes/${id}`,
      data
    );

  return response.data;
}

export async function deleteInspecao(
  id: string
) {
  await api.delete(
    `/inspecoes/${id}`
  );
}

/* =========================================================
   NÃO CONFORMIDADES
========================================================= */

export async function getNaoConformidades() {
  const response =
    await api.get(
      "/nao-conformidades"
    );

  return response.data;
}

export async function createNaoConformidade(
  data: unknown
) {
  const response =
    await api.post(
      "/nao-conformidades",
      data
    );

  return response.data;
}

export async function updateNaoConformidade(
  id: string,
  data: unknown
) {
  const response =
    await api.put(
      `/nao-conformidades/${id}`,
      data
    );

  return response.data;
}

export async function deleteNaoConformidade(
  id: string
) {
  await api.delete(
    `/nao-conformidades/${id}`
  );
}

/* =========================================================
   AÇÕES CORRETIVAS
========================================================= */

export async function getAcoesCorretivas() {
  const response =
    await api.get(
      "/acoes-corretivas"
    );

  return response.data;
}

export async function createAcaoCorretiva(
  data: unknown
) {
  const response =
    await api.post(
      "/acoes-corretivas",
      data
    );

  return response.data;
}

export async function updateAcaoCorretiva(
  id: string,
  data: unknown
) {
  const response =
    await api.put(
      `/acoes-corretivas/${id}`,
      data
    );

  return response.data;
}

export async function deleteAcaoCorretiva(
  id: string
) {
  await api.delete(
    `/acoes-corretivas/${id}`
  );
}

/* =========================================================
   AUDITORIAS
========================================================= */

export async function getAuditorias() {
  const response =
    await api.get(
      "/auditorias"
    );

  return response.data;
}

export async function createAuditoria(
  data: unknown
) {
  const response =
    await api.post(
      "/auditorias",
      data
    );

  return response.data;
}

export async function updateAuditoria(
  id: string,
  data: unknown
) {
  const response =
    await api.put(
      `/auditorias/${id}`,
      data
    );

  return response.data;
}

export async function deleteAuditoria(
  id: string
) {
  await api.delete(
    `/auditorias/${id}`
  );
}

/* =========================================================
   DOCUMENTOS
========================================================= */

export async function getDocumentos() {
  const response =
    await api.get(
      "/documentos"
    );

  return response.data;
}

export async function uploadDocumento(
  formData: FormData
) {
  const response =
    await api.post(
      "/documentos/upload",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data"
        }
      }
    );

  return response.data;
}

/* =========================================================
   USUÁRIOS
========================================================= */

export async function getUsuarios() {
  const response =
    await api.get(
      "/usuarios"
    );

  return response.data;
}

export async function createUsuario(
  data: unknown
) {
  const response =
    await api.post(
      "/usuarios",
      data
    );

  return response.data;
}

/* =========================================================
   RELATÓRIOS
========================================================= */

export async function baixarRelatorio(
  tipo: string,
  formato: "pdf" | "excel"
) {
  const response =
    await api.get(
      `/relatorios/${tipo}/${formato}`,
      {
        responseType: "blob"
      }
    );

  const blob =
    new Blob(
      [response.data],
      {
        type:
          formato === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }
    );

  const url =
    window.URL.createObjectURL(
      blob
    );

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    `atlas-${tipo}.${formato === "pdf" ? "pdf" : "xlsx"}`;

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  window.URL.revokeObjectURL(
    url
  );
}

export default api;
```
export async function getAcoesCorretivas() {
  const response = await api.get("/acoes-corretivas");
  return response.data;
}

export async function getAcaoCorretiva(id: number) {
  const response = await api.get(
    `/acoes-corretivas/${id}`
  );

  return response.data;
}

export async function createAcaoCorretiva(
  data: any
) {
  const response = await api.post(
    "/acoes-corretivas",
    data
  );

  return response.data;
}

export async function updateAcaoCorretiva(
  id: number,
  data: any
) {
  const response = await api.put(
    `/acoes-corretivas/${id}`,
    data
  );

  return response.data;
}

export async function deleteAcaoCorretiva(
  id: number
) {
  const response = await api.delete(
    `/acoes-corretivas/${id}`
  );

  return response.data;
}
