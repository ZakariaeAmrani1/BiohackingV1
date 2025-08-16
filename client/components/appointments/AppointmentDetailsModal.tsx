import {
  CalendarDays,
  User,
  Clock,
  Stethoscope,
  Edit,
  Trash2,
  CheckCircle,
  PlayCircle,
  XCircle,
  CircleDot,
  Phone,
  Mail,
  IdCard,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RendezVous, AppointmentsService } from "@/services/appointmentsService";
import { ClientsService, Client } from "@/services/clientsService";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: RendezVous | null;
  onEdit?: (appointment: RendezVous) => void;
  onDelete?: (appointment: RendezVous) => void;
  onStatusUpdate?: () => void;
}

const statusColors = {
  programmé: "bg-blue-100 text-blue-700 border-blue-200",
  confirmé: "bg-green-100 text-green-700 border-green-200",
  terminé: "bg-gray-100 text-gray-700 border-gray-200",
  annulé: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels = {
  programmé: "Programmé",
  confirmé: "Confirmé",
  terminé: "Terminé",
  annulé: "Annulé",
};

export default function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointment,
  onEdit,
  onDelete,
  onStatusUpdate,
}: AppointmentDetailsModalProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [clientData, setClientData] = useState<Client | null>(null);
  const [isLoadingClient, setIsLoadingClient] = useState(false);
  const { toast } = useToast();

  // Load client data when appointment changes
  useEffect(() => {
    if (appointment && appointment.client_id) {
      loadClientData(appointment.client_id);
    }
  }, [appointment]);

  const loadClientData = async (clientId: number) => {
    try {
      setIsLoadingClient(true);
      const client = await ClientsService.getById(clientId);
      setClientData(client);
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setIsLoadingClient(false);
    }
  };

  if (!appointment) return null;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(appointment);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(appointment);
    }
  };

  const handleStatusUpdate = async (newStatus: "programmé" | "confirmé" | "terminé" | "annulé") => {
    if (!appointment || !appointment.client_id) {
      toast({
        title: "Erreur",
        description: "Informations manquantes pour mettre à jour le statut",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdatingStatus(true);

      // Create updated appointment data with all required fields
      const updateData = {
        client_id: appointment.client_id,
        sujet: appointment.sujet,
        date_rendez_vous: appointment.date_rendez_vous,
        Cree_par: appointment.Cree_par,
        status: newStatus,
      };

      console.log('Updating appointment with data:', updateData);

      await AppointmentsService.update(appointment.id, updateData);

      toast({
        title: "Succès",
        description: `Le statut du rendez-vous a été mis à jour: ${statusLabels[newStatus]}`,
      });

      // Call parent callback to refresh data
      if (onStatusUpdate) {
        onStatusUpdate();
      }

      onClose();
    } catch (error) {
      console.error('Status update error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du rendez-vous",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "programmé":
        return <CircleDot className="h-4 w-4" />;
      case "confirmé":
        return <PlayCircle className="h-4 w-4" />;
      case "terminé":
        return <CheckCircle className="h-4 w-4" />;
      case "annulé":
        return <XCircle className="h-4 w-4" />;
      default:
        return <CircleDot className="h-4 w-4" />;
    }
  };

  const getAvailableStatusUpdates = () => {
    const currentStatus = appointment.status;
    const allStatuses = ["programmé", "confirmé", "terminé", "annulé"] as const;
    return allStatuses.filter(status => status !== currentStatus);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Détails du rendez-vous
          </DialogTitle>
          <DialogDescription>
            {formatDate(appointment.date_rendez_vous)} à {formatTime(appointment.date_rendez_vous)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge
              variant="secondary"
              className={`text-sm px-4 py-2 ${
                statusColors[appointment.status as keyof typeof statusColors]
              }`}
            >
              {statusLabels[appointment.status as keyof typeof statusLabels]}
            </Badge>
          </div>

          <Separator />

          {/* Patient Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations Patient
            </h3>

            <div className="space-y-3 pl-7">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{appointment.patient_nom}</div>
                  <div className="text-sm text-muted-foreground">Patient</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <IdCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium font-mono">{appointment.CIN}</div>
                  <div className="text-sm text-muted-foreground">Numéro CIN</div>
                </div>
              </div>

              {clientData && clientData.numero_telephone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{clientData.numero_telephone}</div>
                    <div className="text-sm text-muted-foreground">Téléphone</div>
                  </div>
                </div>
              )}

              {clientData && clientData.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{clientData.email}</div>
                    <div className="text-sm text-muted-foreground">Email</div>
                  </div>
                </div>
              )}

              {isLoadingClient && (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <div className="text-sm text-muted-foreground">Chargement des informations...</div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Appointment Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Détails du Rendez-vous
            </h3>

            <div className="space-y-3 pl-7">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium text-primary">
                    {formatDateTime(appointment.date_rendez_vous)}
                  </div>
                  <div className="text-sm text-muted-foreground">Date et heure</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{appointment.sujet}</div>
                  <div className="text-sm text-muted-foreground">Type de consultation</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{appointment.Cree_par}</div>
                  <div className="text-sm text-muted-foreground">Médecin responsable</div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Quick Status Update */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Mise à jour du statut
            </h3>
            
            <div className="grid grid-cols-2 gap-2 pl-7">
              {getAvailableStatusUpdates().map((status) => (
                <Button
                  key={status}
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusUpdate(status)}
                  disabled={isUpdatingStatus}
                  className={`gap-2 ${statusColors[status]} hover:opacity-80 transition-opacity`}
                >
                  {getStatusIcon(status)}
                  {statusLabels[status]}
                </Button>
              ))}
            </div>
            
            {isUpdatingStatus && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pl-7">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Mise à jour en cours...
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isUpdatingStatus}>
            Fermer
          </Button>

          {onEdit && (
            <Button 
              variant="outline" 
              onClick={handleEdit} 
              className="gap-2"
              disabled={isUpdatingStatus}
            >
              <Edit className="h-4 w-4" />
              Modifier
            </Button>
          )}

          {onDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="gap-2"
              disabled={isUpdatingStatus}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
