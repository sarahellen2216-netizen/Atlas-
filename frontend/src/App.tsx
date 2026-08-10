```tsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inspecoes from "./pages/Inspecoes";
import NaoConformidades from "./pages/NaoConformidades";
import AcoesCorretivas from "./pages/AcoesCorretivas";
import Auditorias from "./pages/Auditorias";
import Documentos from "./pages/Documentos";
import Relatorios from "./pages/Relatorios";
import Usuarios from "./pages/Usuarios";
import Configuracoes from "./pages/Configuracoes";

import Layout from "./layouts/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* ÁREA PROTEGIDA */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/inspecoes"
            element={<Inspecoes />}
          />

          <Route
            path="/nao-conformidades"
            element={
              <NaoConformidades />
            }
          />

          <Route
            path="/acoes-corretivas"
            element={
              <AcoesCorretivas />
            }
          />

          <Route
            path="/auditorias"
            element={<Auditorias />}
          />

          <Route
            path="/documentos"
            element={<Documentos />}
          />

          <Route
            path="/relatorios"
            element={<Relatorios />}
          />

          <Route
            path="/usuarios"
            element={<Usuarios />}
          />

          <Route
            path="/configuracoes"
            element={
              <Configuracoes />
            }
          />
        </Route>

        {/* PÁGINA NÃO ENCONTRADA */}
        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
```
