import { useState, useMemo, useEffect } from "react";
import {
  Receipt,
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
  Euro,
  TrendingUp,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
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
import InvoiceFormModal from "@/components/invoices/InvoiceFormModal";
import InvoiceDetailsModal from "@/components/invoices/InvoiceDetailsModal";
import DeleteInvoiceModal from "@/components/invoices/DeleteInvoiceModal";
import {
  InvoicesService,
  Facture,
  FactureWithDetails,
  FactureFormData,
  FactureStatut,
  getAvailableDoctors,
  getFactureStatuses,
  getStatusColor,
  formatPrice,
  getInvoiceStatistics,
} from "@/services/invoicesService";

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("tous");
  const [creatorFilter, setCreatorFilter] = useState<string>("tous");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Data state
  const [invoices, setInvoices] = useState<Facture[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<FactureWithDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  // Get unique creators for filter dropdown
  const creators = Array.from(
    new Set(invoices.map((invoice) => invoice.Cree_par)),
  );

  // Load invoices on component mount
  useEffect(() => {
    loadInvoices();
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

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const data = await InvoicesService.getAll();
      setInvoices(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les factures",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and search logic
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.CIN.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.Cree_par.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.id.toString().includes(searchTerm);

      const matchesStatus =
        statusFilter === "tous" || invoice.statut === statusFilter;

      const matchesCreator =
        creatorFilter === "tous" || invoice.Cree_par === creatorFilter;

      return matchesSearch && matchesStatus && matchesCreator;
    });
  }, [searchTerm, statusFilter, creatorFilter, invoices]);

  // CRUD Operations
  const handleCreateInvoice = async (data: FactureFormData) => {
    try {
      setIsSubmitting(true);
      await InvoicesService.create(data);
      await loadInvoices();
      closeFormModal();
      toast({
        title: "Succès",
        description: "La facture a été créée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la facture",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateInvoice = async (data: FactureFormData) => {
    if (!selectedInvoice) return;

    try {
      setIsSubmitting(true);
      await InvoicesService.update(selectedInvoice.id, data);
      await loadInvoices();
      closeFormModal();
      toast({
        title: "Succès",
        description: "La facture a été modifiée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la facture",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!selectedInvoice) return;

    try {
      setIsSubmitting(true);
      await InvoicesService.delete(selectedInvoice.id);
      await loadInvoices();
      closeDeleteModal();
      toast({
        title: "Succès",
        description: "La facture a été supprimée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la facture",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (invoiceId: number, newStatus: FactureStatut) => {
    try {
      await InvoicesService.updateStatus(invoiceId, newStatus);
      await loadInvoices();
      toast({
        title: "Succès",
        description: "Le statut de la facture a été mis à jour",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  // Modal handlers
  const openCreateModal = () => {
    setSelectedInvoice(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = async (invoice: Facture) => {
    closeModals();
    try {
      const invoiceWithDetails = await InvoicesService.getById(invoice.id);
      if (invoiceWithDetails) {
        setTimeout(() => {
          setSelectedInvoice(invoiceWithDetails);
          setIsFormModalOpen(true);
        }, 100);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails de la facture",
        variant: "destructive",
      });
    }
  };

  const openDetailsModal = async (invoice: Facture) => {
    closeModals();
    try {
      const invoiceWithDetails = await InvoicesService.getById(invoice.id);
      if (invoiceWithDetails) {
        setTimeout(() => {
          setSelectedInvoice(invoiceWithDetails);
          setIsDetailsModalOpen(true);
        }, 100);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails de la facture",
        variant: "destructive",
      });
    }
  };

  const openDeleteModal = async (invoice: Facture) => {
    closeModals();
    try {
      const invoiceWithDetails = await InvoicesService.getById(invoice.id);
      if (invoiceWithDetails) {
        setTimeout(() => {
          setSelectedInvoice(invoiceWithDetails);
          setIsDeleteModalOpen(true);
        }, 100);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails de la facture",
        variant: "destructive",
      });
    }
  };

  // Force close all modals
  const forceCloseAllModals = () => {
    setIsFormModalOpen(false);
    setIsDetailsModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedInvoice(null);
    setIsSubmitting(false);
  };

  const closeModals = () => {
    setTimeout(() => {
      setIsFormModalOpen(false);
      setIsDetailsModalOpen(false);
      setIsDeleteModalOpen(false);
      setSelectedInvoice(null);
    }, 0);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedInvoice(null);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedInvoice(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedInvoice(null);
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

  // PDF Download function
  const handleDownloadPDF = async (invoice: Facture) => {
    try {
      // Get full invoice details
      const invoiceWithDetails = await InvoicesService.getById(invoice.id);
      if (!invoiceWithDetails) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails de la facture",
          variant: "destructive",
        });
        return;
      }

      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: "Erreur",
          description: "Impossible d'ouvrir la fenêtre d'impression",
          variant: "destructive",
        });
        return;
      }

      // Generate PDF content
      const pdfContent = generateInvoicePDF(invoiceWithDetails);

      printWindow.document.write(pdfContent);
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };

      toast({
        title: "Succès",
        description: "La facture PDF est en cours de génération",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF",
        variant: "destructive",
      });
    }
  };

  // Generate PDF HTML content
  const generateInvoicePDF = (invoice: FactureWithDetails): string => {
    const formatDateForPDF = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    const formatPriceForPDF = (price: number): string => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price);
    };

    const calculateTotals = (items: any[]) => {
      const prix_ht = items.reduce((total, item) => total + (item.prix_unitaire * item.quantite), 0);
      const tva_rate = 20;
      const tva_amount = parseFloat((prix_ht * (tva_rate / 100)).toFixed(2));
      const prix_total = parseFloat((prix_ht + tva_amount).toFixed(2));
      return { prix_ht, tva_amount, tva_rate, prix_total };
    };

    const totals = calculateTotals(invoice.items);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Facture #${invoice.id.toString().padStart(4, '0')}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #333;
              background: white;
              padding: 20px;
            }

            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
            }

            .invoice-header {
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }

            .company-info {
              text-align: right;
              margin-bottom: 20px;
            }

            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 5px;
            }

            .company-details {
              color: #666;
              font-size: 11px;
            }

            .invoice-title {
              font-size: 28px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }

            .invoice-number {
              font-size: 16px;
              color: #666;
            }

            .invoice-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-bottom: 30px;
            }

            .bill-to, .invoice-details {
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
            }

            .section-title {
              font-weight: bold;
              font-size: 14px;
              color: #2563eb;
              margin-bottom: 10px;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 5px;
            }

            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }

            .info-label {
              color: #666;
              font-weight: 500;
            }

            .info-value {
              font-weight: 600;
            }

            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              border: 1px solid #e2e8f0;
            }

            .items-table th {
              background: #2563eb;
              color: white;
              font-weight: 600;
              padding: 12px 8px;
              text-align: left;
              font-size: 11px;
              text-transform: uppercase;
            }

            .items-table td {
              padding: 12px 8px;
              border-bottom: 1px solid #e2e8f0;
              vertical-align: top;
            }

            .items-table tbody tr:nth-child(even) {
              background: #f8fafc;
            }

            .items-table tbody tr:hover {
              background: #f1f5f9;
            }

            .item-name {
              font-weight: 600;
              color: #2563eb;
            }

            .item-type {
              font-size: 10px;
              color: #666;
              font-style: italic;
            }

            .amount {
              font-family: 'Courier New', monospace;
              text-align: right;
              font-weight: 600;
            }

            .totals-section {
              margin-top: 20px;
              border-top: 2px solid #e2e8f0;
              padding-top: 20px;
            }

            .totals-table {
              width: 100%;
              max-width: 400px;
              margin-left: auto;
            }

            .totals-table td {
              padding: 8px 12px;
              border-bottom: 1px solid #e2e8f0;
            }

            .totals-table .label {
              text-align: left;
              font-weight: 500;
              color: #666;
            }

            .totals-table .amount {
              text-align: right;
              font-family: 'Courier New', monospace;
              font-weight: 600;
              min-width: 120px;
            }

            .total-final {
              background: #f0f9ff;
              border-top: 2px solid #2563eb;
              font-size: 16px;
              font-weight: bold;
              color: #2563eb;
            }

            .notes-section {
              margin-top: 30px;
              padding: 20px;
              background: #f8fafc;
              border-radius: 8px;
              border-left: 4px solid #2563eb;
            }

            .notes-title {
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }

            .footer {
              margin-top: 40px;
              text-align: center;
              color: #666;
              font-size: 10px;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
            }

            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
            }

            .status-payee {
              background: #dcfce7;
              color: #16a34a;
            }

            .status-envoyee {
              background: #dbeafe;
              color: #2563eb;
            }

            .status-brouillon {
              background: #f3f4f6;
              color: #374151;
            }

            .status-annulee {
              background: #fee2e2;
              color: #dc2626;
            }

            .status-en-retard {
              background: #fed7aa;
              color: #ea580c;
            }

            @media print {
              body {
                padding: 0;
                background: white;
              }

              .invoice-container {
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header -->
            <div class="invoice-header">
              <div class="company-info">
                <div class="company-name">Clinique Médicale</div>
                <div class="company-details">
                  123 Rue de la Santé<br>
                  75001 Paris, France<br>
                  Tél: +33 1 23 45 67 89<br>
                  Email: contact@clinique.fr
                </div>
              </div>

              <div class="invoice-title">FACTURE</div>
              <div class="invoice-number">#${invoice.id.toString().padStart(4, '0')}</div>
            </div>

            <!-- Invoice Info -->
            <div class="invoice-info">
              <div class="bill-to">
                <div class="section-title">Facturé à</div>
                <div class="info-row">
                  <span class="info-label">Patient:</span>
                  <span class="info-value">${invoice.CIN}</span>
                </div>
                ${invoice.patient_name ? `
                <div class="info-row">
                  <span class="info-label">Nom:</span>
                  <span class="info-value">${invoice.patient_name}</span>
                </div>
                ` : ''}
              </div>

              <div class="invoice-details">
                <div class="section-title">Détails de la facture</div>
                <div class="info-row">
                  <span class="info-label">Date:</span>
                  <span class="info-value">${formatDateForPDF(invoice.date)}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Créé par:</span>
                  <span class="info-value">${invoice.Cree_par}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Statut:</span>
                  <span class="status-badge status-${invoice.statut.toLowerCase().replace(' ', '-')}">${invoice.statut}</span>
                </div>
              </div>
            </div>

            <!-- Items Table -->
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 40%">Description</th>
                  <th style="width: 15%">Type</th>
                  <th style="width: 10%">Qté</th>
                  <th style="width: 15%">Prix unit.</th>
                  <th style="width: 20%">Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr>
                    <td>
                      <div class="item-name">${item.nom_bien}</div>
                    </td>
                    <td>
                      <span class="item-type">${item.type_bien === 'produit' ? 'Produit' : 'Soin'}</span>
                    </td>
                    <td class="amount">${item.quantite}</td>
                    <td class="amount">${formatPriceForPDF(item.prix_unitaire)}</td>
                    <td class="amount">${formatPriceForPDF(item.prix_unitaire * item.quantite)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <!-- Totals -->
            <div class="totals-section">
              <table class="totals-table">
                <tr>
                  <td class="label">Sous-total (HT):</td>
                  <td class="amount">${formatPriceForPDF(totals.prix_ht)}</td>
                </tr>
                <tr>
                  <td class="label">TVA (${totals.tva_rate}%):</td>
                  <td class="amount">${formatPriceForPDF(totals.tva_amount)}</td>
                </tr>
                <tr class="total-final">
                  <td class="label">TOTAL TTC:</td>
                  <td class="amount">${formatPriceForPDF(totals.prix_total)}</td>
                </tr>
              </table>
            </div>

            ${invoice.notes ? `
            <!-- Notes -->
            <div class="notes-section">
              <div class="notes-title">Notes</div>
              <div>${invoice.notes}</div>
            </div>
            ` : ''}

            <!-- Footer -->
            <div class="footer">
              <p>Merci pour votre confiance</p>
              <p>Cette facture a été générée le ${new Date().toLocaleDateString("fr-FR")}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  // Get statistics
  const statistics = getInvoiceStatistics(invoices);

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Factures</h1>
            <p className="text-muted-foreground">
              Gestion des factures et facturation clients
            </p>
          </div>
          <Button className="gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Nouvelle Facture
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Factures
              </CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalInvoices}</div>
              <p className="text-xs text-muted-foreground">
                Factures créées
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Chiffre d'Affaires TTC
              </CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(statistics.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                Revenu total TTC (TVA incluse)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Factures Payées
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.paidInvoices}</div>
              <p className="text-xs text-muted-foreground">
                Paiements reçus
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                En Retard
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{statistics.overdueInvoices}</div>
              <p className="text-xs text-muted-foreground">
                Factures en retard
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rechercher et Filtrer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="relative lg:col-span-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher facture..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les statuts</SelectItem>
                  {getFactureStatuses().map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Creator Filter */}
              <Select value={creatorFilter} onValueChange={setCreatorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Créé par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les créateurs</SelectItem>
                  {creators.map((creator) => (
                    <SelectItem key={creator} value={creator}>
                      {creator}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex rounded-lg border border-border p-1">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="h-8 gap-2 flex-1"
                >
                  <TableIcon className="h-4 w-4" />
                  Tableau
                </Button>
                <Button
                  variant={viewMode === "cards" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                  className="h-8 gap-2 flex-1"
                >
                  <LayoutGrid className="h-4 w-4" />
                  Cartes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Chargement..."
              : `${filteredInvoices.length} facture(s) trouvée(s)`}
          </p>
        </div>

        {/* Invoices Display - Table or Cards */}
        {viewMode === "table" ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Facture</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Montant TTC</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Créé par</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.length > 0 ? (
                      filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Receipt className="h-4 w-4 text-primary" />
                              <div>
                                <div className="font-medium">#{invoice.id.toString().padStart(4, '0')}</div>
                                <div className="text-sm text-muted-foreground">
                                  {invoice.notes ? invoice.notes.slice(0, 30) + "..." : "Aucune note"}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {invoice.CIN}
                          </TableCell>
                          <TableCell>{formatDate(invoice.date)}</TableCell>
                          <TableCell className="font-mono font-semibold">
                            {formatPrice(invoice.prix_total)}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.statut)}`}>
                              {invoice.statut}
                            </span>
                          </TableCell>
                          <TableCell>{invoice.Cree_par}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => openDetailsModal(invoice)}
                                >
                                  <Eye className="h-4 w-4" />
                                  Voir détails
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => handleDownloadPDF(invoice)}
                                >
                                  <Download className="h-4 w-4" />
                                  Télécharger PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => openEditModal(invoice)}
                                >
                                  <Edit className="h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                                {invoice.statut !== FactureStatut.PAYEE && (
                                  <DropdownMenuItem
                                    className="gap-2"
                                    onClick={() => handleUpdateStatus(invoice.id, FactureStatut.PAYEE)}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    Marquer payée
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="gap-2 text-red-600"
                                  onClick={() => openDeleteModal(invoice)}
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
                            <Receipt className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">
                              Aucune facture trouvée avec les critères sélectionnés
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Cards View */
          <div className="space-y-6">
            {filteredInvoices.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredInvoices.map((invoice) => (
                  <Card
                    key={invoice.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-primary" />
                            Facture #{invoice.id.toString().padStart(4, '0')}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {invoice.CIN}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.statut)}`}>
                          {invoice.statut}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Montant TTC</div>
                          <div className="font-mono text-lg font-semibold">
                            {formatPrice(invoice.prix_total)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Date</div>
                          <div className="text-sm font-medium">
                            {formatDate(invoice.date)}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Créé par:</span>
                          <span>{invoice.Cree_par}</span>
                        </div>
                        {invoice.notes && (
                          <div className="flex items-start gap-2 text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <span className="font-medium">Notes:</span>
                              <div className="text-muted-foreground mt-1">
                                {invoice.notes.slice(0, 60)}{invoice.notes.length > 60 ? "..." : ""}
                              </div>
                            </div>
                          </div>
                        )}
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
                                onClick={() => openDetailsModal(invoice)}
                              >
                                <Eye className="h-4 w-4" />
                                Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => handleDownloadPDF(invoice)}
                              >
                                <Download className="h-4 w-4" />
                                Télécharger PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => openEditModal(invoice)}
                              >
                                <Edit className="h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              {invoice.statut !== FactureStatut.PAYEE && (
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => handleUpdateStatus(invoice.id, FactureStatut.PAYEE)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Marquer payée
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="gap-2 text-red-600"
                                onClick={() => openDeleteModal(invoice)}
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
                    <Receipt className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-medium">
                        Aucune facture trouvée
                      </h3>
                      <p className="text-muted-foreground">
                        Aucune facture ne correspond aux critères sélectionnés
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Modals */}
        <InvoiceFormModal
          isOpen={isFormModalOpen}
          onClose={closeFormModal}
          onSubmit={selectedInvoice ? handleUpdateInvoice : handleCreateInvoice}
          invoice={selectedInvoice}
          isLoading={isSubmitting}
        />

        <InvoiceDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={closeDetailsModal}
          invoice={selectedInvoice}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />

        <DeleteInvoiceModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteInvoice}
          invoice={selectedInvoice}
          isLoading={isSubmitting}
        />
      </div>
    </DashboardLayout>
  );
}
