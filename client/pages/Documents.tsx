import { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  LayoutGrid,
  Table as TableIcon,
  Clock,
  User,
  Settings,
  Filter,
  Download,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { TableLoader, GridLoader } from "@/components/ui/table-loader";
import DocumentFormModal from "@/components/documents/DocumentFormModal";
import DocumentDetailsModal from "@/components/documents/DocumentDetailsModal";
import DeleteDocumentModal from "@/components/documents/DeleteDocumentModal";
import {
  DocumentsService,
  Document,
  DocumentFormData,
} from "@/services/documentsService";
import {
  DocumentTemplatesService,
  DocumentTemplate,
} from "@/services/documentTemplatesService";
import {
  ClientsService,
  Client,
} from "@/services/clientsService";

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [patientFilter, setPatientFilter] = useState<string>("tous");
  const [templateFilter, setTemplateFilter] = useState<string>("tous");
  const [creatorFilter, setCreatorFilter] = useState<string>("tous");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Data state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  // Get unique values for filters
  const uniquePatients = useMemo(() => {
    const patientCINs = Array.from(new Set(documents.map((doc) => doc.CIN)));
    return patientCINs.map((cin) => {
      const client = clients.find((c) => c.CIN === cin);
      return {
        cin,
        name: client ? `${client.prenom} ${client.nom}` : cin,
      };
    });
  }, [documents, clients]);

  const uniqueCreators = Array.from(
    new Set(documents.map((doc) => doc.Cree_par))
  );

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Add escape key handler to force close modals if stuck
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && event.ctrlKey) {
        forceCloseAllModals();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [documentsData, templatesData, clientsData] = await Promise.all([
        DocumentsService.getAll(),
        DocumentTemplatesService.getAll(),
        ClientsService.getAll(),
      ]);
      
      setDocuments(documentsData);
      setTemplates(templatesData);
      setClients(clientsData);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and search logic
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const client = clients.find((c) => c.CIN === doc.CIN);
      const template = templates.find((t) => t.id === doc.template_id);
      
      const matchesSearch =
        doc.Cree_par.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.CIN.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client && 
          (`${client.prenom} ${client.nom}`.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (template && 
          template.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        JSON.stringify(doc.data_json).toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPatient =
        patientFilter === "tous" || doc.CIN === patientFilter;

      const matchesTemplate =
        templateFilter === "tous" || 
        doc.template_id.toString() === templateFilter;

      const matchesCreator =
        creatorFilter === "tous" || doc.Cree_par === creatorFilter;

      return matchesSearch && matchesPatient && matchesTemplate && matchesCreator;
    });
  }, [searchTerm, patientFilter, templateFilter, creatorFilter, documents, clients, templates]);

  // Helper functions
  const getClientName = (cin: string) => {
    const client = clients.find((c) => c.CIN === cin);
    return client ? `${client.prenom} ${client.nom}` : cin;
  };

  const getTemplateName = (templateId: number) => {
    const template = templates.find((t) => t.id === templateId);
    return template ? template.name : "Modèle inconnu";
  };

  const getSelectedTemplate = (document: Document) => {
    return templates.find((t) => t.id === document.template_id) || null;
  };

  // Generate PDF function - same as PatientDocuments page
  const generatePDF = async (document: Document) => {
    const template = templates.find((t) => t.id === document.template_id);
    const patient = clients.find((c) => c.CIN === document.CIN);

    // Create a new window for PDF generation
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir la fenêtre d'impression",
        variant: "destructive",
      });
      return;
    }

    // Generate HTML content for the document
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Document ${document.id} - ${template?.name || "Document"}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              line-height: 1.6;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .subtitle {
              font-size: 14px;
              color: #666;
            }
            .patient-info {
              background-color: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 30px;
            }
            .section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #2563eb;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
              margin-bottom: 15px;
            }
            .field {
              margin-bottom: 10px;
              display: flex;
            }
            .field-label {
              font-weight: bold;
              min-width: 150px;
              margin-right: 10px;
            }
            .field-value {
              flex: 1;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ccc;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body { margin: 20px; }
              .header { page-break-after: avoid; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${template?.name || "Document Médical"}</div>
            <div class="subtitle">Document ID: ${document.id}</div>
          </div>

          <div class="patient-info">
            <h3>Informations Patient</h3>
            <div class="field">
              <span class="field-label">Nom:</span>
              <span class="field-value">${patient?.prenom || ""} ${patient?.nom || ""}</span>
            </div>
            <div class="field">
              <span class="field-label">CIN:</span>
              <span class="field-value">${document.CIN}</span>
            </div>
            <div class="field">
              <span class="field-label">Date de création:</span>
              <span class="field-value">${formatDate(document.created_at)}</span>
            </div>
            <div class="field">
              <span class="field-label">Créé par:</span>
              <span class="field-value">${document.Cree_par}</span>
            </div>
          </div>

          ${
            template
              ? template.sections_json.sections
                  .map(
                    (section) => `
            <div class="section">
              <div class="section-title">${section.title}</div>
              ${section.fields
                .map((field) => {
                  const value = document.data_json[field.name];
                  let displayValue = value;

                  if (value === null || value === undefined || value === "") {
                    displayValue = "Non renseigné";
                  } else if (field.type === "checkbox") {
                    displayValue = value ? "Oui" : "Non";
                  } else if (field.type === "date" && value) {
                    try {
                      displayValue = new Date(value).toLocaleDateString(
                        "fr-FR",
                      );
                    } catch (e) {
                      displayValue = value;
                    }
                  }

                  return `
                  <div class="field">
                    <span class="field-label">${field.name}:</span>
                    <span class="field-value">${displayValue}</span>
                  </div>
                `;
                })
                .join("")}
            </div>
          `,
                  )
                  .join("")
              : ""
          }

          <div class="footer">
            <p>Document généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}</p>
            <p>Système de Gestion Médicale - Document confidentiel</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load then trigger print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      // Close the window after printing (user can cancel)
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    };

    toast({
      title: "PDF généré",
      description: "Le document a été ouvert pour impression/sauvegarde en PDF",
    });
  };

  // CRUD Operations
  const handleCreateDocument = async (data: DocumentFormData) => {
    try {
      setIsSubmitting(true);
      await DocumentsService.create(data);
      await loadAllData();
      closeFormModal();
      toast({
        title: "Succès",
        description: "Le document a été créé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le document",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDocument = async (data: DocumentFormData) => {
    if (!selectedDocument) return;

    try {
      setIsSubmitting(true);
      await DocumentsService.update(selectedDocument.id, data);
      await loadAllData();
      closeFormModal();
      toast({
        title: "Succès",
        description: "Le document a été modifié avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le document",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;

    try {
      setIsSubmitting(true);
      await DocumentsService.delete(selectedDocument.id);
      await loadAllData();
      closeDeleteModal();
      toast({
        title: "Succès",
        description: "Le document a été supprimé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le document",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal handlers
  const openCreateModal = () => {
    setSelectedDocument(null);
    setSelectedClient(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (document: Document) => {
    closeModals();
    setTimeout(() => {
      const client = clients.find((c) => c.CIN === document.CIN);
      setSelectedDocument(document);
      setSelectedClient(client || null);
      setIsFormModalOpen(true);
    }, 100);
  };

  const openDetailsModal = (document: Document) => {
    closeModals();
    setTimeout(() => {
      setSelectedDocument(document);
      setIsDetailsModalOpen(true);
    }, 100);
  };

  const openDeleteModal = (document: Document) => {
    closeModals();
    setTimeout(() => {
      setSelectedDocument(document);
      setIsDeleteModalOpen(true);
    }, 100);
  };

  // Force close all modals
  const forceCloseAllModals = () => {
    setIsFormModalOpen(false);
    setIsDetailsModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedDocument(null);
    setSelectedClient(null);
    setIsSubmitting(false);
  };

  const closeModals = () => {
    setTimeout(() => {
      setIsFormModalOpen(false);
      setIsDetailsModalOpen(false);
      setIsDeleteModalOpen(false);
      setSelectedDocument(null);
      setSelectedClient(null);
    }, 0);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedDocument(null);
    setSelectedClient(null);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedDocument(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedDocument(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Documents
            </h1>
            <p className="text-muted-foreground">
              Gestion des documents de tous les patients
            </p>
          </div>
          <Button className="gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Nouveau Document
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Rechercher et Filtrer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par patient, créateur, type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Patient Filter */}
              <Select value={patientFilter} onValueChange={setPatientFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Patient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les patients</SelectItem>
                  {uniquePatients.map((patient) => (
                    <SelectItem key={patient.cin} value={patient.cin}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Template Filter */}
              <Select value={templateFilter} onValueChange={setTemplateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Type de document" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les types</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mt-4">
              {/* Creator Filter */}
              <Select value={creatorFilter} onValueChange={setCreatorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Créé par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les créateurs</SelectItem>
                  {uniqueCreators.map((creator) => (
                    <SelectItem key={creator} value={creator}>
                      {creator}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setPatientFilter("tous");
                  setTemplateFilter("tous");
                  setCreatorFilter("tous");
                }}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Réinitialiser les filtres
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary and View Toggle */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Chargement..."
              : `${filteredDocuments.length} document(s) trouvé(s)`}
          </p>
          <div className="flex rounded-lg border border-border p-1">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-8 gap-2"
            >
              <TableIcon className="h-4 w-4" />
              Tableau
            </Button>
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className="h-8 gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              Cartes
            </Button>
          </div>
        </div>

        {/* Documents Display - Table or Cards */}
        {viewMode === "table" ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                {isLoading ? (
                  <TableLoader columns={7} rows={6} />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type de document</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>CIN</TableHead>
                        <TableHead>Créé par</TableHead>
                        <TableHead>Date de création</TableHead>
                        <TableHead>État</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.length > 0 ? (
                        filteredDocuments.map((document) => (
                          <TableRow
                            key={document.id}
                            className="hover:bg-muted/50"
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <div>
                                  <div className="font-medium">
                                    {getTemplateName(document.template_id)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    #{document.id}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {getClientName(document.CIN)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-sm">
                                {document.CIN}
                              </span>
                            </TableCell>
                            <TableCell>{document.Cree_par}</TableCell>
                            <TableCell>
                              {formatDate(document.created_at)}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  Object.keys(document.data_json).length > 0 
                                    ? "default" 
                                    : "secondary"
                                }
                              >
                                {Object.keys(document.data_json).length > 0 
                                  ? "Complet" 
                                  : "Vide"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    className="gap-2"
                                    onClick={() => openDetailsModal(document)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    Voir détails
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="gap-2"
                                    onClick={() => generatePDF(document)}
                                  >
                                    <Download className="h-4 w-4" />
                                    Télécharger PDF
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="gap-2"
                                    onClick={() => openEditModal(document)}
                                  >
                                    <Edit className="h-4 w-4" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="gap-2 text-red-600"
                                    onClick={() => openDeleteModal(document)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <FileText className="h-8 w-8 text-muted-foreground" />
                              <p className="text-muted-foreground">
                                Aucun document trouvé avec les critères sélectionnés
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Cards View */
          <div className="space-y-6">
            {isLoading ? (
              <GridLoader items={6} />
            ) : filteredDocuments.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDocuments.map((document) => (
                  <Card
                    key={document.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            {getTemplateName(document.template_id)}
                          </CardTitle>
                          <div className="text-xs text-muted-foreground">
                            Document #{document.id}
                          </div>
                        </div>
                        <Badge 
                          variant={
                            Object.keys(document.data_json).length > 0 
                              ? "default" 
                              : "secondary"
                          }
                        >
                          {Object.keys(document.data_json).length > 0 
                            ? "Complet" 
                            : "Vide"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Patient:</span>
                          <span>{getClientName(document.CIN)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">CIN:</span>
                          <span className="font-mono">{document.CIN}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Créé par:</span>
                          <span>{document.Cree_par}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Créé le:</span>
                          <span>{formatDateTime(document.created_at)}</span>
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => openDetailsModal(document)}
                              >
                                <Eye className="h-4 w-4" />
                                Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => handleDownloadPDF(document)}
                              >
                                <Download className="h-4 w-4" />
                                Télécharger PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => openEditModal(document)}
                              >
                                <Edit className="h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 text-red-600"
                                onClick={() => openDeleteModal(document)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-medium">
                        Aucun document trouvé
                      </h3>
                      <p className="text-muted-foreground">
                        Aucun document ne correspond aux critères sélectionnés
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Modals */}
        <DocumentFormModal
          isOpen={isFormModalOpen}
          onClose={closeFormModal}
          onSubmit={
            selectedDocument ? handleUpdateDocument : handleCreateDocument
          }
          document={selectedDocument}
          patient={selectedClient}
          templates={templates}
          clients={clients}
          isLoading={isSubmitting}
        />

        <DocumentDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={closeDetailsModal}
          document={selectedDocument}
          template={selectedDocument ? getSelectedTemplate(selectedDocument) : null}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />

        <DeleteDocumentModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteDocument}
          document={selectedDocument}
          template={selectedDocument ? getSelectedTemplate(selectedDocument) : null}
          isLoading={isSubmitting}
        />
      </div>
    </DashboardLayout>
  );
}
