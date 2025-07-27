import { useState, useMemo, useEffect } from "react";
import { Users, Search, Plus, Eye, Edit, Trash2, ChevronDown, LayoutGrid, Table as TableIcon, Clock, User, Mail, Phone, Heart } from "lucide-react";
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
import ClientFormModal from "@/components/clients/ClientFormModal";
import ClientDetailsModal from "@/components/clients/ClientDetailsModal";
import DeleteClientModal from "@/components/clients/DeleteClientModal";
import {
  ClientsService,
  Client,
  ClientFormData,
  calculateAge,
  getBloodGroups,
} from "@/services/clientsService";

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>("tous");
  const [creatorFilter, setCreatorFilter] = useState<string>("tous");
  const [ageFilter, setAgeFilter] = useState<string>("tous");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  
  // Data state
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  // Get unique creators and blood groups for filter dropdowns
  const creators = Array.from(new Set(clients.map(client => client.Cree_par)));
  const bloodGroups = getBloodGroups();

  // Load clients on component mount
  useEffect(() => {
    loadClients();
  }, []);

  // Add escape key handler to force close modals if stuck
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && event.ctrlKey) {
        // Ctrl+Escape force closes all modals
        forceCloseAllModals();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const data = await ClientsService.getAll();
      setClients(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les patients",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and search logic
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch = 
        client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.CIN.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.numero_telephone.includes(searchTerm);

      const matchesBloodGroup = bloodGroupFilter === "tous" || client.groupe_sanguin === bloodGroupFilter;
      
      const matchesCreator = creatorFilter === "tous" || client.Cree_par === creatorFilter;
      
      let matchesAge = true;
      if (ageFilter !== "tous") {
        const age = calculateAge(client.date_naissance);
        switch (ageFilter) {
          case "enfant":
            matchesAge = age < 18;
            break;
          case "adulte":
            matchesAge = age >= 18 && age < 65;
            break;
          case "senior":
            matchesAge = age >= 65;
            break;
        }
      }

      return matchesSearch && matchesBloodGroup && matchesCreator && matchesAge;
    });
  }, [searchTerm, bloodGroupFilter, creatorFilter, ageFilter, clients]);

  // CRUD Operations
  const handleCreateClient = async (data: ClientFormData) => {
    try {
      setIsSubmitting(true);
      await ClientsService.create(data);
      await loadClients();
      closeFormModal();
      toast({
        title: "Succès",
        description: "Le patient a été créé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le patient",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateClient = async (data: ClientFormData) => {
    if (!selectedClient) return;
    
    try {
      setIsSubmitting(true);
      await ClientsService.update(selectedClient.id, data);
      await loadClients();
      closeFormModal();
      toast({
        title: "Succès",
        description: "Le patient a été modifié avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le patient",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    
    try {
      setIsSubmitting(true);
      await ClientsService.delete(selectedClient.id);
      await loadClients();
      closeDeleteModal();
      toast({
        title: "Succès",
        description: "Le patient a été supprim�� avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le patient",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal handlers
  const openCreateModal = () => {
    setSelectedClient(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    // Close any open modals first
    closeModals();
    setTimeout(() => {
      setSelectedClient(client);
      setIsFormModalOpen(true);
    }, 100);
  };

  const openDetailsModal = (client: Client) => {
    closeModals();
    setTimeout(() => {
      setSelectedClient(client);
      setIsDetailsModalOpen(true);
    }, 100);
  };

  const openDeleteModal = (client: Client) => {
    closeModals();
    setTimeout(() => {
      setSelectedClient(client);
      setIsDeleteModalOpen(true);
    }, 100);
  };

  // Force close all modals - can be used as emergency escape
  const forceCloseAllModals = () => {
    setIsFormModalOpen(false);
    setIsDetailsModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedClient(null);
    setIsSubmitting(false);
  };

  const closeModals = () => {
    // Use setTimeout to ensure proper cleanup order
    setTimeout(() => {
      setIsFormModalOpen(false);
      setIsDetailsModalOpen(false);
      setIsDeleteModalOpen(false);
      setSelectedClient(null);
    }, 0);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedClient(null);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedClient(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedClient(null);
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
            <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
            <p className="text-muted-foreground">
              Gestion des dossiers patients et informations médicales
            </p>
          </div>
          <Button className="gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Nouveau Patient
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rechercher et Filtrer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, CIN, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Blood Group Filter */}
              <Select value={bloodGroupFilter} onValueChange={setBloodGroupFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Groupe sanguin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les groupes</SelectItem>
                  {bloodGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
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

              {/* Age Filter */}
              <Select value={ageFilter} onValueChange={setAgeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tranche d'âge" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les âges</SelectItem>
                  <SelectItem value="enfant">Enfants (&lt; 18 ans)</SelectItem>
                  <SelectItem value="adulte">Adultes (18-65 ans)</SelectItem>
                  <SelectItem value="senior">Seniors (&gt; 65 ans)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary and View Toggle */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Chargement..." : `${filteredClients.length} patient(s) trouvé(s)`}
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

        {/* Clients Display - Table or Cards */}
        {viewMode === "table" ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>CIN</TableHead>
                      <TableHead>Âge</TableHead>
                      <TableHead>Groupe sanguin</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Créé par</TableHead>
                      <TableHead>Créé le</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client) => (
                        <TableRow key={client.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {client.prenom} {client.nom}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {client.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {client.CIN}
                          </TableCell>
                          <TableCell>{calculateAge(client.date_naissance)} ans</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="gap-1">
                              <Heart className="h-3 w-3" />
                              {client.groupe_sanguin}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{client.numero_telephone}</div>
                            </div>
                          </TableCell>
                          <TableCell>{client.Cree_par}</TableCell>
                          <TableCell>{formatDate(client.created_at)}</TableCell>
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
                                  onClick={() => openDetailsModal(client)}
                                >
                                  <Eye className="h-4 w-4" />
                                  Voir dossier
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="gap-2"
                                  onClick={() => openEditModal(client)}
                                >
                                  <Edit className="h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="gap-2 text-red-600"
                                  onClick={() => openDeleteModal(client)}
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
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <Users className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">
                              Aucun patient trouvé avec les critères sélectionnés
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
            {filteredClients.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredClients.map((client) => (
                  <Card key={client.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">
                            {client.prenom} {client.nom}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground font-mono">
                            CIN: {client.CIN}
                          </p>
                        </div>
                        <Badge variant="outline" className="gap-1">
                          <Heart className="h-3 w-3" />
                          {client.groupe_sanguin}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Âge:</span>
                          <span>{calculateAge(client.date_naissance)} ans</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Email:</span>
                          <span className="truncate">{client.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Tél:</span>
                          <span>{client.numero_telephone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Créé par:</span>
                          <span>{client.Cree_par}</span>
                        </div>
                      </div>
                      
                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Ajouté le {formatDate(client.created_at)}
                          </p>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                className="gap-2"
                                onClick={() => openDetailsModal(client)}
                              >
                                <Eye className="h-4 w-4" />
                                Voir dossier
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-2"
                                onClick={() => openEditModal(client)}
                              >
                                <Edit className="h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-2 text-red-600"
                                onClick={() => openDeleteModal(client)}
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
                    <Users className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-medium">Aucun patient trouvé</h3>
                      <p className="text-muted-foreground">
                        Aucun patient ne correspond aux critères sélectionnés
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Modals */}
        <ClientFormModal
          isOpen={isFormModalOpen}
          onClose={closeFormModal}
          onSubmit={selectedClient ? handleUpdateClient : handleCreateClient}
          client={selectedClient}
          isLoading={isSubmitting}
        />

        <ClientDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={closeDetailsModal}
          client={selectedClient}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />

        <DeleteClientModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteClient}
          client={selectedClient}
          isLoading={isSubmitting}
        />
      </div>
    </DashboardLayout>
  );
}
