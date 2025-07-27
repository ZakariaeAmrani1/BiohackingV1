import { useState, useMemo } from "react";
import { Calendar, Search, Filter, Plus, Eye, Edit, Trash2, ChevronDown, LayoutGrid, Table as TableIcon, Clock, User, MapPin } from "lucide-react";
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

// Type matching your database structure
interface RendezVous {
  id: number;
  CIN: string;
  sujet: string;
  date_rendez_vous: string;
  created_at: string;
  Cree_par: string;
  status?: "programmé" | "confirmé" | "terminé" | "annulé";
  patient_nom?: string; // Additional field for display
}

// Mock data matching your database structure
const mockAppointments: RendezVous[] = [
  {
    id: 1,
    CIN: "BE123456",
    sujet: "Consultation Biohacking",
    date_rendez_vous: "2024-01-15T09:00:00",
    created_at: "2024-01-10T14:30:00",
    Cree_par: "Dr. Smith",
    status: "confirmé",
    patient_nom: "Jean Dupont",
  },
  {
    id: 2,
    CIN: "BE234567",
    sujet: "Thérapie IV",
    date_rendez_vous: "2024-01-15T10:30:00",
    created_at: "2024-01-12T09:15:00",
    Cree_par: "Dr. Martin",
    status: "programmé",
    patient_nom: "Marie Laurent",
  },
  {
    id: 3,
    CIN: "BE345678",
    sujet: "Séance de Cryothérapie",
    date_rendez_vous: "2024-01-16T14:00:00",
    created_at: "2024-01-11T16:45:00",
    Cree_par: "Dr. Smith",
    status: "confirmé",
    patient_nom: "Pierre Martin",
  },
  {
    id: 4,
    CIN: "BE456789",
    sujet: "Analyse du Bilan Sanguin",
    date_rendez_vous: "2024-01-14T11:00:00",
    created_at: "2024-01-08T10:20:00",
    Cree_par: "Dr. Dubois",
    status: "terminé",
    patient_nom: "Sophie Wilson",
  },
  {
    id: 5,
    CIN: "BE567890",
    sujet: "Consultation Bien-être",
    date_rendez_vous: "2024-01-17T15:00:00",
    created_at: "2024-01-13T11:30:00",
    Cree_par: "Dr. Martin",
    status: "programmé",
    patient_nom: "Luc Chen",
  },
  {
    id: 6,
    CIN: "BE678901",
    sujet: "Suivi Post-Traitement",
    date_rendez_vous: "2024-01-12T13:30:00",
    created_at: "2024-01-05T15:10:00",
    Cree_par: "Dr. Smith",
    status: "annulé",
    patient_nom: "Alice Brown",
  },
  {
    id: 7,
    CIN: "BE789012",
    sujet: "Thérapie par Ondes de Choc",
    date_rendez_vous: "2024-01-18T16:30:00",
    created_at: "2024-01-14T08:45:00",
    Cree_par: "Dr. Dubois",
    status: "confirmé",
    patient_nom: "David Garcia",
  },
  {
    id: 8,
    CIN: "BE890123",
    sujet: "Consultation Nutritionnelle",
    date_rendez_vous: "2024-01-19T10:00:00",
    created_at: "2024-01-15T12:20:00",
    Cree_par: "Dr. Martin",
    status: "programmé",
    patient_nom: "Emma Rodriguez",
  },
];

const statusColors = {
  programmé: "bg-blue-100 text-blue-700 border-blue-200",
  confirmé: "bg-green-100 text-green-700 border-green-200",
  terminé: "bg-gray-100 text-gray-700 border-gray-200",
  annulé: "bg-red-100 text-red-700 border-red-200",
};

export default function Appointments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("tous");
  const [creatorFilter, setCreatorFilter] = useState<string>("tous");
  const [dateFilter, setDateFilter] = useState<string>("tous");

  // Get unique creators for filter dropdown
  const creators = Array.from(new Set(mockAppointments.map(apt => apt.Cree_par)));

  // Filter and search logic
  const filteredAppointments = useMemo(() => {
    return mockAppointments.filter((appointment) => {
      const matchesSearch = 
        appointment.patient_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.CIN.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.sujet.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "tous" || appointment.status === statusFilter;
      
      const matchesCreator = creatorFilter === "tous" || appointment.Cree_par === creatorFilter;
      
      let matchesDate = true;
      if (dateFilter !== "tous") {
        const appointmentDate = new Date(appointment.date_rendez_vous);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const thisWeek = new Date(today);
        thisWeek.setDate(thisWeek.getDate() + 7);

        switch (dateFilter) {
          case "aujourd'hui":
            matchesDate = appointmentDate.toDateString() === today.toDateString();
            break;
          case "demain":
            matchesDate = appointmentDate.toDateString() === tomorrow.toDateString();
            break;
          case "cette-semaine":
            matchesDate = appointmentDate >= today && appointmentDate <= thisWeek;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesCreator && matchesDate;
    });
  }, [searchTerm, statusFilter, creatorFilter, dateFilter]);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rendez-vous</h1>
            <p className="text-muted-foreground">
              Gestion et planification des rendez-vous patients
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau Rendez-vous
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
                  placeholder="Rechercher par nom, CIN ou sujet..."
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
                  <SelectItem value="programmé">Programmé</SelectItem>
                  <SelectItem value="confirmé">Confirmé</SelectItem>
                  <SelectItem value="terminé">Terminé</SelectItem>
                  <SelectItem value="annulé">Annulé</SelectItem>
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

              {/* Date Filter */}
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Toutes les dates</SelectItem>
                  <SelectItem value="aujourd'hui">Aujourd'hui</SelectItem>
                  <SelectItem value="demain">Demain</SelectItem>
                  <SelectItem value="cette-semaine">Cette semaine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredAppointments.length} rendez-vous trouvé(s)
          </p>
        </div>

        {/* Appointments Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>CIN</TableHead>
                    <TableHead>Sujet</TableHead>
                    <TableHead>Date & Heure</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Créé par</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((appointment) => (
                      <TableRow key={appointment.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {appointment.patient_nom}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {appointment.CIN}
                        </TableCell>
                        <TableCell>{appointment.sujet}</TableCell>
                        <TableCell>{formatDateTime(appointment.date_rendez_vous)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={statusColors[appointment.status as keyof typeof statusColors]}
                          >
                            {appointment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{appointment.Cree_par}</TableCell>
                        <TableCell>{formatDate(appointment.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2">
                                <Eye className="h-4 w-4" />
                                Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Edit className="h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-red-600">
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
                          <Calendar className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            Aucun rendez-vous trouvé avec les critères sélectionnés
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
      </div>
    </DashboardLayout>
  );
}
