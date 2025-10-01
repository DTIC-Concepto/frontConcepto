import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Facultades from "./pages/Facultades";
import Carreras from "./pages/Carreras";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/facultades" replace />} />
          <Route
            path="/facultades"
            element={
              <Layout>
                <Facultades />
              </Layout>
            }
          />
          <Route
            path="/carreras"
            element={
              <Layout>
                <Carreras />
              </Layout>
            }
          />
          <Route
            path="/usuarios"
            element={
              <Layout>
                <Placeholder pageName="Gestión de Usuarios" />
              </Layout>
            }
          />
          <Route
            path="/roles"
            element={
              <Layout>
                <Placeholder pageName="Gestión de Roles" />
              </Layout>
            }
          />
          <Route
            path="/perfil"
            element={
              <Layout>
                <Placeholder pageName="Mi Perfil" />
              </Layout>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
