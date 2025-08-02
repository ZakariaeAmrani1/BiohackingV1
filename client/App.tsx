import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Appointments from "./pages/Appointments";
import Patients from "./pages/Patients";
import PatientDocuments from "./pages/PatientDocuments";
import Treatments from "./pages/Treatments";
import Biohacking from "./pages/Biohacking";
import Metrics from "./pages/Metrics";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import DocumentTypes from "./pages/DocumentTypes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/:cin/documents" element={<PatientDocuments />} />
          <Route path="/treatments" element={<Treatments />} />
          <Route path="/document-types" element={<DocumentTypes />} />
          <Route path="/biohacking" element={<Biohacking />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
